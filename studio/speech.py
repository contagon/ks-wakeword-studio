"""Lazy local speech recognition; no legacy trainer state or background work."""
from pathlib import Path
import re
import unicodedata
import wave


def normalize(text):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w]+', ' ', unicodedata.normalize('NFKC', text).casefold().replace('_', ' '))).strip()


def contains_phrase(text, phrase):
    phrase = normalize(phrase)
    return bool(phrase) and f' {phrase} ' in f' {normalize(text)} '


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
        result = {'speech': bool(detect_speech(Path(audio_path).read_bytes())),
                  'transcript': '', 'guided_transcript': '', 'model': model_name}
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
            return ' '.join(str(s.text).strip() for s in segments).strip()[:16000]
        result['transcript'] = decode(beam_size=1)
        if not contains_phrase(result['transcript'], phrase):
            result['guided_transcript'] = decode(beam_size=5, best_of=5, temperature=0.0,
                initial_prompt=f'The wake phrase is "{normalize(phrase)}".', hotwords=normalize(phrase))
        return result
