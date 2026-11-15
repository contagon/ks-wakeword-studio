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
TRIM_POLICY_VERSION = 2


def phrase_interval(phrase, words, duration, speech_segments=None):
    """Select one confidently timed phrase; uncertain recognition needs human review."""
    if (not isinstance(words, list) or len(words) > 4096
            or type(duration) not in (int, float) or not math.isfinite(duration) or duration <= 0):
        return None
    tokens, timed = [], []
    previous_end = 0
    for word in words:
        if not isinstance(word, dict) or not isinstance(word.get('word'), str):
            return None
        start, end, probability = (word.get(key) for key in ('start', 'end', 'probability'))
        if (any(type(v) not in (int, float) or not math.isfinite(v) for v in (start, end, probability))
                or not previous_end <= start < end <= duration or not 0 <= probability <= 1):
            return None
        previous_end = end
        parts = normalize(word['word']).split()
        if len(parts) > 1:
            return None
        for token in parts:
            tokens.append(token)
            timed.append((start, end, probability))
    target = normalize(phrase).split()
    if not target:
        return None
    matches = [i for i in range(len(tokens) - len(target) + 1) if tokens[i:i + len(target)] == target]
    if len(matches) != 1:
        return None
    first, last = matches[0], matches[0] + len(target) - 1
    if any(w[2] < .5 for w in timed[first:last + 1]):
        return None
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
    start, end = timed[first][0], timed[last][1]
    if tokens == target:
        # Short-clip Whisper timings often include seconds of silence or miss the actual speech entirely.
        if len(segments) != 1:
            return None
        start, end = segments[0]
    else:
        if any(not any(a < right and b > left for a, b, _ in timed) for left, right in segments):
            return None
        overlap = [(left, right) for left, right in segments if left < end and right > start]
        if len(overlap) != 1:
            return None
        left, right = overlap[0]
        if any(a < left - .15 or b > right + .15 or b <= left or a >= right for a, b, _ in timed[first:last + 1]):
            return None
        if any(a < left - .15 or b > right + .15 for a, b, _ in timed if a < right and b > left):
            return None
        if first == 0 or timed[first - 1][1] <= left:
            start = left
        if last + 1 == len(timed) or timed[last + 1][0] >= right:
            end = right
    start = max(0, start - .15, timed[first - 1][1] if first else 0)
    end = min(duration, end + .15, timed[last + 1][0] if last + 1 < len(timed) else duration)
    return (start, end) if 0 < end - start <= MAX_PREPARED_SECONDS else None


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

    def transcribe(self, audio_path: Path, *, language: str, phrase: str) -> dict:
        from studio.capture import detect_speech
        model_name = 'small.en' if language == 'en' else 'small'
        segments = detect_speech(Path(audio_path).read_bytes())
        result = {'speech': bool(segments), 'speech_segments': segments,
                  'transcript': '', 'guided_transcript': '', 'model': model_name, 'words': []}
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
            words = [dict(word=w.word, start=w.start, end=w.end, probability=w.probability)
                     for s in segments for w in (s.words or [])]
            return text, words
        result['transcript'], result['words'] = decode(beam_size=1, word_timestamps=True)
        if not contains_phrase(result['transcript'], phrase):
            result['guided_transcript'], _ = decode(beam_size=5, best_of=5, temperature=0.0,
                initial_prompt=f'The wake phrase is "{normalize(phrase)}".', hotwords=normalize(phrase))
        return result
