"""Lazy local speech recognition; no legacy trainer state or background work."""
from pathlib import Path
import math
import re
import unicodedata
import wave


def normalize(text):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w]+', ' ', unicodedata.normalize('NFKC', text).casefold().replace('_', ' '))).strip()


def contains_phrase(text, phrase):
    phrase = normalize(phrase)
    return bool(phrase) and f' {phrase} ' in f' {normalize(text)} '


# Reserve the augmentation policy's maximum 300 ms trailing jitter.
MAX_PREPARED_SECONDS = 2.9
TRIM_POLICY_VERSION = 3


def phrase_interval(phrase, words, duration, speech_segments=None):
    """Locate an already-positive phrase without rechecking recognition confidence."""
    if (not isinstance(words, list) or len(words) > 4096
            or type(duration) not in (int, float) or not math.isfinite(duration) or duration <= 0):
        return None
    tokens, owners, timed = [], [], []
    for index, word in enumerate(words):
        if not isinstance(word, dict) or not isinstance(word.get('word'), str):
            return None
        start, end = word.get('start'), word.get('end')
        valid = (all(type(v) in (int, float) and math.isfinite(v) for v in (start, end))
                 and 0 <= start < end <= duration)
        timed.append((start, end) if valid else None)
        for token in normalize(word['word']).split():
            tokens.append(token)
            owners.append(index)
    target = normalize(phrase).split()
    if not target:
        return None
    matches = [i for i in range(len(tokens) - len(target) + 1) if tokens[i:i + len(target)] == target]
    if not isinstance(speech_segments, list) or not 0 < len(speech_segments) <= 4096:
        return None
    segments, previous_end = [], 0
    for segment in speech_segments:
        if not isinstance(segment, dict):
            return None
        start, end = segment.get('start'), segment.get('end')
        if (any(type(v) not in (int, float) or not math.isfinite(v) for v in (start, end))
                or not previous_end <= start < end <= duration):
            return None
        segments.append((start, end))
        previous_end = end
    for first in reversed(matches):
        last = first + len(target) - 1
        left_index, right_index = owners[first], owners[last]
        # A whole timestamped word is usable; a boundary inside one is not.
        if ((first and owners[first - 1] == left_index)
                or (last + 1 < len(tokens) and owners[last + 1] == right_index)):
            continue
        selected = timed[left_index:right_index + 1]
        if any(t is None for t in selected) or any(a[1] > b[0] for a, b in zip(selected, selected[1:])):
            continue
        start, end = selected[0][0], selected[-1][1]
        before = timed[left_index - 1] if left_index else None
        after = (timed[right_index + 1] if right_index + 1 < len(timed)
                 and normalize(words[right_index + 1]['word']) else None)
        before_end = before[1] if before and before[1] <= start else 0
        after_start = after[0] if after and after[0] >= end else duration
        if tokens == target and len(target) == 1 and len(segments) == 1:
            # Single-word Whisper timestamps often cover silence rather than the utterance.
            start, end = segments[0]
        else:
            overlap = [(left, right) for left, right in segments if left < end and right > start]
            if overlap:
                left, right = overlap[0][0], overlap[-1][1]
                if not (before and before[0] < start and before[1] > left):
                    start = min(start, left)
                if not (after and after[0] < right and after[1] > end):
                    end = max(end, right)
        start = max(0, start - .15, before_end)
        end = min(duration, end + .15, after_start)
        # A following word may explain remaining speech; otherwise this cuts off the phrase.
        if any(left < end < right and not (after and end <= after[0] < right)
               for left, right in segments):
            continue
        if 0 < end - start <= MAX_PREPARED_SECONDS:
            return start, end
    return None


def hearing(phrase, *, speech, text='', primed=''):
    """What a clip holds: 'phrase', 'other', or 'unclear'.

    No speech cannot be the wake word. Plain Whisper hearing the phrase is trusted. Whisper primed
    with the phrase invents it over noise, so the primed decode can only rule the phrase out.
    """
    if not speech:
        return 'other'
    if contains_phrase(text, phrase):
        return 'phrase'
    return 'unclear' if contains_phrase(primed, phrase) else 'other'


def classify_transcript(phrase, policy, *, near_miss=False, speech, text='', primed=''):
    """Label from the policy cell for (clip kind, what was heard); disabled or unclear stays pending."""
    heard = hearing(phrase, speech=speech, text=text, primed=primed)
    if heard == 'unclear':
        return 'pending'
    enabled = {(False, 'phrase'): policy.confirm_activations, (False, 'other'): policy.auto_negatives,
               (True, 'phrase'): policy.promote_close_misses, (True, 'other'): policy.near_miss_negatives}
    if not enabled[bool(near_miss), heard]:
        return 'pending'
    return 'positive' if heard == 'phrase' else 'negative'


class SpeechTranscriber:
    def __init__(self, cache_dir: Path):
        self.cache_dir = Path(cache_dir)
        self.model = None

    def transcribe(self, audio_path: Path, *, language: str, phrase: str, positive: bool = False) -> dict:
        from studio.capture import detect_speech
        model_name = 'small.en' if language == 'en' else 'small'
        segments = detect_speech(Path(audio_path).read_bytes())
        result = {'speech': bool(segments), 'speech_segments': segments,
                  'transcript': '', 'guided_transcript': '', 'model': model_name, 'words': [], 'prompted_words': []}
        if not result['speech']:
            return result
        if self.model is None:
            import ctranslate2
            from faster_whisper import WhisperModel
            self.cache_dir.mkdir(parents=True, exist_ok=True)
            device = 'cuda' if ctranslate2.get_cuda_device_count() else 'cpu'
            self.model = WhisperModel(model_name, device=device,
                compute_type='float16' if device == 'cuda' else 'int8', download_root=str(self.cache_dir))
        # Blobs are normalized 16 kHz mono PCM16; an array skips PyAV, whose
        # newer releases reject faster-whisper's open() arguments.
        import numpy
        with wave.open(str(audio_path), 'rb') as source:
            audio = numpy.frombuffer(source.readframes(source.getnframes()), '<i2').astype(numpy.float32) / 32768
        def decode(**kwargs):
            segments, _ = self.model.transcribe(audio, language=language or None,
                condition_on_previous_text=False, **kwargs)
            segments = list(segments)
            text = ' '.join(str(s.text).strip() for s in segments).strip()[:16000]
            words = [dict(word=w.word, start=float(w.start), end=float(w.end), probability=w.probability)
                     for s in segments for w in (s.words or [])]
            return text, words
        result['transcript'], result['words'] = decode(beam_size=1, word_timestamps=True)
        heard_phrase = contains_phrase(result['transcript'], phrase)
        if positive or heard_phrase:
            if phrase_interval(phrase, result['words'], len(audio) / 16000, segments) is None:
                # Keep prompted timing separate: it must never establish a positive classification.
                result['guided_transcript'], result['prompted_words'] = decode(beam_size=1, temperature=0.0,
                    word_timestamps=True, initial_prompt=f'The wake phrase is "{normalize(phrase)}".',
                    hotwords=normalize(phrase))
        else:
            result['guided_transcript'], _ = decode(beam_size=5, best_of=5, temperature=0.0,
                initial_prompt=f'The wake phrase is "{normalize(phrase)}".', hotwords=normalize(phrase))
        return result
