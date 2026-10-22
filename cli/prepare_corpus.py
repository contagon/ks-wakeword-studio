#!/usr/bin/env python3
"""Download one augmentation corpus and convert it to 16 kHz mono WAV.

Run with the training venv's python. Output lands in
<data-dir>/training_datasets/<corpus>; a re-run reuses converted output whose
file count matches the count recorded after the last successful conversion.
"""
import argparse
import http.client
import os
import shutil
import sys
import tarfile
import time
import urllib.request
import zipfile
from pathlib import Path

HEADERS = {'User-Agent': 'WakeWordTrainer/1.0'}
FMA_URLS = ('https://os.unil.cloud.switch.ch/fma/fma_small.zip',
            'https://huggingface.co/datasets/mchl914/fma_xsmall/resolve/main/fma_xs.zip')
CHIME_URL = 'https://archive.org/download/chime-home/chime_home.tar.gz'
MIT_REPO = 'TaterTotterson/MIT_environmental_impulse_responses'
AUDIOSET_REPO = 'agkphysics/AudioSet'
AUDIOSET_REVISIONS = ('6762f044d1c88619c7f2006486036192128fb07e', '0049167e89f259a010c3f070fe3666d9e5242836',
                      'ceb9eaaa7844c9ad7351e659c84a572e376ad06d', 'main')
AUDIOSET_PATTERNS = ('data/bal_train0', 'data/bal_train/bal_train0')


def download(url, target, *, attempts, valid=lambda path: path.stat().st_size > 0):
    """Fetch url to target via a partial file; never leave a partial looking complete."""
    partial = target.with_name(target.name + '.incomplete')
    try:
        for attempt in range(1, attempts + 1):
            try:
                request = urllib.request.Request(url, headers=HEADERS)
                with urllib.request.urlopen(request, timeout=60) as response, partial.open('wb') as output:
                    shutil.copyfileobj(response, output, 1024 * 1024)
                if valid(partial):
                    partial.replace(target)
                    return True
                print('   Downloaded file is invalid', file=sys.stderr)
            except (OSError, http.client.HTTPException) as exc:
                print(f'   Download attempt {attempt}/{attempts} failed: {exc}', file=sys.stderr)
            partial.unlink(missing_ok=True)
            if attempt < attempts:
                time.sleep(attempt * 2)
        return False
    finally:
        partial.unlink(missing_ok=True)


def valid_tar(path):
    try:
        with tarfile.open(path) as archive:
            archive.getmembers()
        return True
    except (OSError, tarfile.TarError, EOFError):
        return False


def extract_tar(archive, destination):
    with tarfile.open(archive) as source:
        source.extractall(destination, filter='data')


def write_wav(target, audio):
    import numpy as np
    import scipy.io.wavfile
    target.parent.mkdir(parents=True, exist_ok=True)
    scipy.io.wavfile.write(target, 16000, (np.clip(audio, -1.0, 1.0) * 32767).astype(np.int16))


def load_mono(path):
    import librosa
    audio, _ = librosa.load(path, sr=16000, mono=True)
    return audio


def load_first_channel(path):
    """MIT impulse responses keep their first channel unless they need resampling."""
    import soundfile
    audio, rate = soundfile.read(path, always_2d=False)
    if audio.ndim > 1:
        audio = audio[:, 0]
    return audio if rate == 16000 else load_mono(path)


def convert(sources, output, name, *, label, log=None, load=load_mono, heartbeat=None):
    """Convert sources into output; failures go to log, or abort when there is no log."""
    if log:
        (output / log).unlink(missing_ok=True)
    print(f'   {label}: converting {len(sources)} files to 16k mono WAV')
    failed, ok, skipped = [], 0, 0
    for index, path in enumerate(sources, 1):
        target = output / name(path)
        try:
            if target.exists():
                skipped += 1
            else:
                audio = load(path)
                if audio.size == 0:
                    raise ValueError('empty audio')
                write_wav(target, audio)
                ok += 1
        except Exception as exc:
            if not log:
                raise
            failed.append(f'{path}:{exc}')
        if heartbeat and (index == 1 or index % heartbeat == 0 or index == len(sources)):
            print(f'   Progress: {index}/{len(sources)}  (ok={ok}, skipped={skipped}, failed={len(failed)})', flush=True)
    if failed:
        (output / log).write_text('\n'.join(failed))
    print(f'   {label} complete ({ok} ok, {skipped} skipped, {len(failed)} failed)')


def mit(root, source, output, args):
    from huggingface_hub import snapshot_download
    print('   Downloading MIT environmental impulse responses from Hugging Face mirror')
    snapshot_download(MIT_REPO, repo_type='dataset', allow_patterns='16khz/*.wav', local_dir=source)
    convert(sorted(source.rglob('*.wav')), output, lambda path: path.name, label='MIT environmental RIR',
            load=load_first_channel)


def fma(root, source, output, args):
    archive = root / 'downloads/fma_small.zip'
    if not archive.exists():
        for index, url in enumerate(FMA_URLS):
            if index:
                print(f'   Primary source failed; using fallback {url} (a smaller FMA subset)', file=sys.stderr)
            print(f'   Downloading {url}')
            if download(url, archive, attempts=4):
                break
        else:
            sys.exit(f'   Failed to download {archive.name} from all configured sources.')
    reset(source)
    print(f'   Extracting {archive.name}')
    with zipfile.ZipFile(archive) as zipped:
        zipped.extractall(source)
    if args.cleanup_archives:
        archive.unlink()
    convert(sorted(source.rglob('*.mp3')), output, lambda path: path.stem + '.wav', label='FMA',
            log='fma_corrupted_files.log')


def chime(root, source, output, args):
    archive = root / 'downloads/chime_home.tar.gz'
    if archive.exists() and not valid_tar(archive):
        print(f'   Removing incomplete or corrupt cached {archive.name}', file=sys.stderr)
        archive.unlink()
    if not archive.exists():
        print(f'   Downloading {archive.name}')
        if not download(os.environ.get('CHIME_AUDIO_URL') or CHIME_URL, archive, attempts=3, valid=valid_tar):
            sys.exit(f'   Failed to download a valid {archive.name}. Check network/source availability, '
                     'or set CHIME_AUDIO_URL to a trusted mirror.')
    reset(source)
    print(f'   Untarring {archive.name}')
    extract_tar(archive, source)
    if args.cleanup_archives:
        archive.unlink()
    convert(sorted(source.rglob('*.48kHz.wav')), output, lambda path: '__'.join(path.relative_to(source).parts),
            label='CHiME', log='chime_corrupted_files.log')


def audioset(root, source, output, args):
    from huggingface_hub import file_exists
    found = next(((revision, pattern) for revision in AUDIOSET_REVISIONS for pattern in AUDIOSET_PATTERNS
                  if file_exists(AUDIOSET_REPO, f'{pattern}0.tar', repo_type='dataset', revision=revision)), None)
    if found is None:
        audioset_from_datasets_api(output)
        return
    revision, pattern = found
    expected = 0
    for index in range(10):
        archive = root / f'downloads/bal_train0{index}.tar'
        if not archive.exists():
            print(f'   Downloading {archive.name}')
            url = f'https://huggingface.co/datasets/{AUDIOSET_REPO}/resolve/{revision}/{pattern}{index}.tar'
            if not download(url, archive, attempts=3, valid=valid_tar):
                sys.exit(f'Could not fetch {archive.name} at rev {revision}; source download incomplete.')
        with tarfile.open(archive) as tar:
            expected += len(tar.getmembers())
        print(f'   Untarring {archive.name}')
        extract_tar(archive, source)
        if args.cleanup_archives:
            archive.unlink()
    convert(sorted(source.rglob('*.flac')), output, lambda path: path.stem + '.wav', label='AudioSet',
            log='audioset_corrupted_files.log', heartbeat=500)
    converted = len(list(output.rglob('*.wav')))
    if converted != expected:
        print(f'   Converted file count({converted}) != expected file count({expected})\n'
              '   WARNING: mismatch is expected if some AudioSet files are corrupted; continuing.', file=sys.stderr)


def audioset_from_datasets_api(output):
    import librosa
    import numpy as np
    from datasets import load_dataset
    print('   AudioSet FLAC tarballs are unavailable; using Hugging Face datasets API instead.')
    (output / 'audioset_corrupted_files.log').unlink(missing_ok=True)
    failed, ok, skipped = [], 0, 0
    for index, sample in enumerate(load_dataset(AUDIOSET_REPO, 'balanced', split='train', streaming=True), 1):
        try:
            target = output / f"{sample.get('video_id') or f'audioset_{index:06d}'}.wav"
            if target.exists():
                skipped += 1
                continue
            audio = sample.get('audio') or {}
            samples, rate = np.asarray(audio.get('array')), int(audio.get('sampling_rate') or 0)
            if samples.size == 0 or rate <= 0:
                raise ValueError('missing decoded audio')
            if samples.ndim > 1:
                samples = np.mean(samples, axis=-1)
            if rate != 16000:
                samples = librosa.resample(samples.astype(np.float32), orig_sr=rate, target_sr=16000)
            if samples.size == 0:
                raise ValueError('empty audio')
            write_wav(target, samples)
            ok += 1
        except Exception as exc:
            failed.append(f"{sample.get('video_id', index)}:{exc}")
        if index == 1 or index % 250 == 0:
            print(f'   AudioSet API progress: {index} clips processed (ok={ok}, skipped={skipped}, failed={len(failed)})')
    if failed:
        (output / 'audioset_corrupted_files.log').write_text('\n'.join(failed))
    print(f'   AudioSet complete via datasets API ({ok} ok, {skipped} skipped, {len(failed)} failed)')


def reset(directory):
    shutil.rmtree(directory, ignore_errors=True)
    directory.mkdir(parents=True)


# Corpus id -> (extracted source directory, recorded-count file and key, fetch-and-convert step).
CORPORA = {
    'mit_rirs_16k': ('mit_rirs', 'mit_rir_filecount', 'hf_mit_environmental_impulse_responses', mit),
    'fma_16k': ('fma', 'fma_filecount', 'fma_small.zip', fma),
    'chime_16k': ('chime', 'chime_filecount', 'chime_home.tar.gz', chime),
    # AudioSet trusts any existing converted output instead of a recorded count.
    'audioset_16k': ('audioset', None, None, audioset),
}


def recorded_count(path, key):
    try:
        lines = path.read_text().splitlines()
    except FileNotFoundError:
        return 0
    return next((int(line.split(':', 1)[1]) for line in lines if line.split(':', 1)[0] == key), 0)


def prepare(corpus, data_dir, args):
    source_name, count_file, key, fetch = CORPORA[corpus]
    root = data_dir / 'training_datasets'
    source, output = root / source_name, root / corpus
    for directory in (root / 'downloads', source, output):
        directory.mkdir(parents=True, exist_ok=True)
    print(f'***** Checking {corpus} *****')
    existing = len(list(output.rglob('*.wav')))
    if existing and (key is None or existing == recorded_count(root / 'downloads' / count_file, key)):
        print(f'   Existing {output.name} valid ({existing} wav)')
    else:
        fetch(root, source, output, args)
        if key is not None:
            (root / 'downloads' / count_file).write_text(f'{key}:{len(list(output.rglob("*.wav")))}\n')
    if args.cleanup_intermediate_files:
        shutil.rmtree(source, ignore_errors=True)
    print(f'   {corpus} complete')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', choices=CORPORA, required=True)
    default_data_dir = os.environ.get('DATA_DIR') or (os.getcwd() if os.path.exists('.mww-data-dir') else '/data')
    parser.add_argument('--data-dir', type=Path, default=Path(default_data_dir))
    parser.add_argument('--cleanup-archives', action='store_true',
                        help='Delete downloaded archives after extraction.')
    parser.add_argument('--cleanup-intermediate-files', action='store_true',
                        help='Delete extracted source audio after conversion to 16k.')
    args = parser.parse_args(argv)
    prepare(args.corpus, args.data_dir.resolve(), args)


if __name__ == '__main__':
    main()
