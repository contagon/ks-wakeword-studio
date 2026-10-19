"""Lazy local speech recognition; no legacy trainer state or background work."""
from difflib import SequenceMatcher
from pathlib import Path
import re
import unicodedata

GUIDANCE_SIMILARITY = 0.68


def normalize(text):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w]+', ' ', unicodedata.normalize('NFKC', text).casefold().replace('_', ' '))).strip()


def contains_phrase(text, phrase):
    phrase = normalize(phrase)
    return bool(phrase) and f' {phrase} ' in f' {normalize(text)} '


def phrase_similarity(text, phrase):
    words, target = normalize(text).split(), normalize(phrase).split()
    if not words or not target:
        return 0
    return max((SequenceMatcher(None, ''.join(target), ''.join(words[i:i+n])).ratio()
                for n in range(max(1, len(target)-1), min(len(words), len(target)+1)+1)
                for i in range(len(words)-n+1)), default=0)


def classify_transcript(text, phrase, *, near_miss=False, promote=False, auto_negatives=True, guided=''):
    if len(normalize(text)) < 2:
        return 'pending'
    detected = contains_phrase(text, phrase)
    similarity = phrase_similarity(text, phrase)
    if not detected and similarity >= GUIDANCE_SIMILARITY:
        detected = contains_phrase(guided, phrase)
        if not detected:
            return 'pending'
    if detected:
        return 'positive' if near_miss and promote else 'pending'
    return 'negative' if not near_miss and auto_negatives else 'pending'


class SpeechTranscriber:
    def __init__(self, cache_dir: Path):
        self.cache_dir = Path(cache_dir)
        self.models = {}

    def transcribe(self, audio_path: Path, *, engine: str, language: str, phrase: str) -> dict:
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        if engine == 'faster_whisper':
            import ctranslate2
            from faster_whisper import WhisperModel
            model_name = 'small.en' if language == 'en' else 'small'
            if engine not in self.models:
                device = 'cuda' if ctranslate2.get_cuda_device_count() else 'cpu'
                self.models[engine] = WhisperModel(model_name, device=device,
                    compute_type='float16' if device == 'cuda' else 'int8', download_root=str(self.cache_dir))
            model = self.models[engine]
            def decode(**kwargs):
                segments, _ = model.transcribe(str(audio_path), language=language or None,
                    condition_on_previous_text=False, **kwargs)
                return ' '.join(str(s.text).strip() for s in segments).strip()[:16000]
            text = decode(beam_size=1)
            guided = ''
            if not contains_phrase(text, phrase) and phrase_similarity(text, phrase) >= GUIDANCE_SIMILARITY:
                guided = decode(beam_size=5, best_of=5, temperature=0.0,
                                initial_prompt=f'The wake phrase is "{normalize(phrase)}".', hotwords=normalize(phrase))
        elif engine == 'parakeet_onnx':
            import onnxruntime as ort
            import onnx_asr
            from huggingface_hub import snapshot_download
            model_name = 'nemo-parakeet-tdt-0.6b-v3'
            if engine not in self.models:
                directory = self.cache_dir / 'parakeet-int8'
                required = ('config.json', 'vocab.txt', 'encoder-model.int8.onnx', 'decoder_joint-model.int8.onnx')
                if not all((directory / name).is_file() for name in required):
                    snapshot_download(repo_id='istupakov/parakeet-tdt-0.6b-v3-onnx', local_dir=str(directory),
                                      allow_patterns=[*required, '*.int8.onnx.data'])
                providers = [p for p in ('CUDAExecutionProvider', 'CPUExecutionProvider') if p in ort.get_available_providers()]
                if not providers:
                    raise RuntimeError('No speech runtime available')
                self.models[engine] = onnx_asr.load_model(model_name, str(directory), quantization='int8', providers=providers)
            text = str(self.models[engine].recognize(str(audio_path), **({'language': language} if language else {})))[:16000]
            guided = ''
        else:
            raise ValueError('Unsupported speech engine')
        return {'transcript': text, 'guided_transcript': guided, 'engine': engine, 'model': model_name}
