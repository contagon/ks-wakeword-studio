"""Corpus download/cache flow without network or audio dependencies."""
import importlib.util
import io
import os
import sys
import tarfile
import tempfile
import types
import unittest
import urllib.error
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('prepare_corpus', Path(__file__).resolve().parents[1] / 'cli/prepare_corpus.py')
corpus = importlib.util.module_from_spec(spec)
spec.loader.exec_module(corpus)
convert = corpus.convert  # setUp stubs the module's copy


def tar_bytes(name, mode='w:gz'):
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode=mode) as archive:
        member = tarfile.TarInfo(name)
        member.size = 4
        archive.addfile(member, io.BytesIO(b'wave'))
    return buffer.getvalue()


def fake_convert(sources, output, name, **kwargs):
    for source in sources:
        (output / name(source)).write_bytes(b'wav')


class PrepareCorpusTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.data = Path(temp.name) / 'data with spaces'
        self.cache = self.data / 'training_datasets/downloads/chime_home.tar.gz'
        self.cache.parent.mkdir(parents=True)
        self.archive = tar_bytes('chime_home/chunks/example.48kHz.wav')
        self.urls = []
        self.responses = []
        for patcher in (patch('time.sleep'), patch.object(corpus, 'convert', fake_convert),
                        patch('urllib.request.urlopen', side_effect=self.urlopen)):
            patcher.start()
            self.addCleanup(patcher.stop)

    def urlopen(self, request, timeout):
        self.urls.append(request.full_url)
        response = self.responses.pop(0) if len(self.responses) > 1 else self.responses[0]
        if isinstance(response, Exception):
            raise response
        return io.BytesIO(response)

    def run_chime(self, **env):
        with patch.dict(os.environ, env):
            corpus.prepare('chime_16k', self.data, Namespace(cleanup_archives=False, cleanup_intermediate_files=False))

    def test_failed_download_does_not_poison_cache(self):
        self.responses = [urllib.error.URLError('timed out')]
        with self.assertRaisesRegex(SystemExit, 'Failed to download'):
            self.run_chime()
        self.assertEqual(len(self.urls), 3)
        self.assertEqual(list(self.cache.parent.iterdir()), [])

    def test_transient_download_failure_is_retried(self):
        self.responses = [urllib.error.URLError('reset'), self.archive]
        self.run_chime()
        self.assertEqual(self.cache.read_bytes(), self.archive)
        self.assertTrue((self.data / 'training_datasets/chime_16k/chime_home__chunks__example.48kHz.wav').exists())

    def test_http_success_with_invalid_archive_is_not_cached(self):
        self.responses = [b'<html>Unavailable</html>']
        with self.assertRaisesRegex(SystemExit, 'Failed to download'):
            self.run_chime()
        self.assertFalse(self.cache.exists())

    def test_corrupt_cached_archive_is_replaced(self):
        self.cache.write_bytes(b'partial previous download')
        self.responses = [self.archive]
        self.run_chime()
        self.assertEqual(self.cache.read_bytes(), self.archive)

    def test_valid_cached_archive_needs_no_network(self):
        self.cache.write_bytes(self.archive)
        self.run_chime()
        self.assertEqual(self.urls, [])

    def test_trusted_mirror_can_override_unavailable_source(self):
        self.responses = [self.archive]
        self.run_chime(CHIME_AUDIO_URL='https://mirror.example/chime_home.tar.gz')
        self.assertEqual(self.urls, ['https://mirror.example/chime_home.tar.gz'])

    def test_recorded_output_is_reused(self):
        output = self.data / 'training_datasets/chime_16k'
        output.mkdir(parents=True)
        (output / 'clip.wav').write_bytes(b'wav')
        (self.cache.parent / 'chime_filecount').write_text('chime_home.tar.gz:1\n')
        self.run_chime()
        self.assertEqual(self.urls, [])

    def test_convert_logs_failures_or_aborts_without_a_log(self):
        import numpy as np
        output = self.data / 'out'
        output.mkdir()
        (output / 'done.wav').write_bytes(b'kept')
        sources = [Path('done.flac'), Path('good.flac'), Path('empty.flac')]
        load = lambda path: np.zeros(0 if path.stem == 'empty' else 4)
        with patch.object(corpus, 'write_wav', lambda target, audio: target.write_bytes(b'new')):
            convert(sources, output, lambda path: path.stem + '.wav', label='Test', log='bad.log', load=load)
            self.assertEqual((output / 'done.wav').read_bytes(), b'kept')
            self.assertEqual((output / 'good.wav').read_bytes(), b'new')
            self.assertEqual((output / 'bad.log').read_text(), 'empty.flac:empty audio')
            with self.assertRaisesRegex(ValueError, 'empty audio'):
                convert([Path('empty.flac')], output, lambda path: path.stem + '.wav', label='Test', load=load)

    def test_audioset_missing_source_tarball_is_not_a_successful_setup(self):
        self.responses = [tar_bytes('fixture.flac', 'w'), urllib.error.HTTPError('url', 404, 'missing', {}, None)]
        hub = types.SimpleNamespace(file_exists=lambda *args, **kwargs: True)
        with patch.dict(sys.modules, {'huggingface_hub': hub}), self.assertRaisesRegex(SystemExit, 'bal_train01.tar'):
            corpus.prepare('audioset_16k', self.data, Namespace(cleanup_archives=False, cleanup_intermediate_files=False))
        self.assertEqual(list((self.data / 'training_datasets/audioset_16k').iterdir()), [])


if __name__ == '__main__':
    unittest.main()
