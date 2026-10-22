from __future__ import annotations

import argparse
import ast
import importlib.util
import json
import math
import shutil
import signal
import subprocess
import tempfile
import unittest
import wave
from array import array
from pathlib import Path
from unittest.mock import patch

from tts_config import parse_omnivoice_catalog


REPO_ROOT = Path(__file__).resolve().parents[1]
GENERATOR_PATH = REPO_ROOT / "cli" / "tts_generate_samples.py"
SPEC = importlib.util.spec_from_file_location("tts_generate_samples", GENERATOR_PATH)
assert SPEC is not None and SPEC.loader is not None
generator_module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(generator_module)
QA_PATH = REPO_ROOT / "cli" / "tts_reference_qa.py"
QA_SPEC = importlib.util.spec_from_file_location("tts_reference_qa", QA_PATH)
assert QA_SPEC is not None and QA_SPEC.loader is not None
qa_module = importlib.util.module_from_spec(QA_SPEC)
QA_SPEC.loader.exec_module(qa_module)


def write_tone(
    path: Path,
    *,
    duration: float = 0.8,
    amplitude: int = 4000,
    frequency: float = 220.0,
) -> None:
    rate = 16000
    samples = array(
        "h",
        (
            int(amplitude * math.sin(2 * math.pi * frequency * index / rate))
            for index in range(int(rate * duration))
        ),
    )
    with wave.open(str(path), "wb") as stream:
        stream.setnchannels(1)
        stream.setsampwidth(2)
        stream.setframerate(rate)
        stream.writeframes(samples.tobytes())


class ModernTtsTests(unittest.TestCase):
    def _external_moss_corpus(self, reference_count):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            references = []
            for index in range(reference_count):
                path = root / f'reference-{index}.wav'
                write_tone(path, frequency=220 + index * 40)
                import hashlib
                digest = hashlib.sha256(path.read_bytes()).hexdigest()
                references.append({'audio_id': chr(97 + index) * 32, 'path': str(path),
                                   'normalized_hash': digest, 'family_id': digest})
            reference_manifest = root / 'references.jsonl'
            reference_manifest.write_text(''.join(json.dumps(r) + '\n' for r in references))
            args = generator_module.parser().parse_args([
                f'--data-dir={root}', f'--output-dir={root}/samples', '--engines=moss',
                '--samples=2', '--batch-size=1', f'--reference-manifest={reference_manifest}', '--', 'hey tater',
            ])
            instance = generator_module.Generator(args)
            model_entries = []
            def external(command, **kwargs):
                source = Path(command[command.index('--input-jsonl') + 1])
                rows = [json.loads(line) for line in source.read_text().splitlines()]
                if '--output-dir' in command:
                    destination = Path(command[command.index('--output-dir') + 1])
                    for row in rows:
                        model_entries.append(row)
                        write_tone(destination / f"{row['id']}.wav", frequency=220 + 30 * len(model_entries))
                else:
                    destination = Path(command[command.index('--output-jsonl') + 1])
                    destination.write_text(''.join(json.dumps({'id': row['id'], 'accepted': not row['id'].endswith('0000000')}) + '\n' for row in rows))
            with patch.object(instance, 'ensure_environment', return_value=root / 'moss-python'), \
                 patch.object(instance, '_reference_qa_python', return_value=root / 'qa-python'), \
                 patch.object(generator_module, 'run', side_effect=external):
                instance.generate()
            manifest = json.loads((root / 'samples/.generation_manifest.json').read_text())
            self.assertEqual(len(list((root / 'samples').glob('*.wav'))), 2)
            self.assertTrue(all(row['ref_audio'] in {r['path'] for r in references} for row in model_entries))
            self.assertEqual(set(manifest['actual_counts']), {'moss'})
            return model_entries, manifest

    @unittest.skipUnless(shutil.which('ffmpeg'), 'ffmpeg not installed')
    def test_moss_external_reference_mapping_survives_qa_rejection_and_numeric_renaming(self):
        entries, manifest = self._external_moss_corpus(3)
        self.assertEqual(len(entries), 3)
        self.assertEqual(manifest['source_audio_ids'], {'0.wav': 'b' * 32, '1.wav': 'c' * 32})

    @unittest.skipUnless(shutil.which('ffmpeg'), 'ffmpeg not installed')
    def test_moss_refills_reuse_external_sources_not_accepted_moss_outputs(self):
        entries, manifest = self._external_moss_corpus(2)
        self.assertGreater(len(entries), 2)
        self.assertEqual(manifest['source_audio_ids'], {'0.wav': 'b' * 32, '1.wav': 'a' * 32})

    def test_explicit_moss_reference_manifest_rejects_wrong_engine_or_missing_pool(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'references.jsonl'
            source.write_text('')
            for engine in ('qwen3', 'moss'):
                args = argparse.Namespace(phrase='hey tater', language='en', tts_mode='modern',
                    samples=2, batch_size=1, data_dir=root, output_dir=root / 'samples',
                    engines=engine, reference_manifest=source)
                with self.subTest(engine=engine), self.assertRaises(ValueError):
                    generator_module.Generator(args)

    def test_direct_omnivoice_uses_random_tokens_not_random_unmask_order(self):
        # Regression: random mask positions with greedy token classes cause
        # short, reference-free wake phrases to collapse into non-speech.
        for prefix in ('', 'fallback0_'):
            with self.subTest(prefix=prefix), tempfile.TemporaryDirectory() as temp_dir:
                root = Path(temp_dir)
                args = argparse.Namespace(phrase='hey tater', language='en', tts_mode='modern',
                                          samples=2, batch_size=8, data_dir=root,
                                          output_dir=root / 'samples', ffmpeg='ffmpeg', dry_run=False)
                instance = generator_module.Generator(args)
                with patch.object(instance, 'ensure_environment', return_value=Path('/unused/python')), \
                     patch.object(generator_module.subprocess, 'run') as process:
                    instance._generate_direct_engine('omnivoice', 2, [], prefix=prefix)
                command = process.call_args.args[0]
                self.assertEqual(command[command.index('--position_temperature') + 1], '0.0')
                self.assertEqual(command[command.index('--class_temperature') + 1], '1.0')
                self.assertEqual(command[command.index('--num_step') + 1], '32')

    def test_direct_generation_progress_counts_candidates_and_announces_qualification(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            args = argparse.Namespace(phrase='hey tater', language='en', tts_mode='modern', samples=2,
                                      batch_size=1, data_dir=root, output_dir=root / 'samples',
                                      ffmpeg='ffmpeg', dry_run=False)
            instance = generator_module.Generator(args)
            instance.build_dir.mkdir(parents=True, exist_ok=True)
            events = []
            def emit(stage, **fields):
                events.append({'stage': stage, **fields})
            def provider(command, *args, **kwargs):
                inputs = next(Path(value) for index, value in enumerate(command) if index and command[index - 1] == '--test_list')
                entries = [json.loads(line) for line in inputs.read_text().splitlines()]
                destination = Path(command[command.index('--res_dir') + 1])
                for entry in entries:
                    write_tone(destination / f"{entry['id']}.wav")
            def qa(command, **kwargs):
                source = Path(command[command.index('--input-jsonl') + 1])
                target = Path(command[command.index('--output-jsonl') + 1])
                target.write_text('\n'.join(json.dumps({'id': json.loads(line)['id'], 'accepted': True}) for line in source.read_text().splitlines()))
            with patch.object(instance, 'ensure_environment', return_value=Path('/unused/python')), \
                 patch.object(instance, '_reference_qa_python', return_value=Path('/unused/python')), \
                 patch.object(generator_module, 'run_with_batch_retry', side_effect=provider), \
                 patch.object(generator_module, 'run', side_effect=qa), \
                 patch.object(generator_module, 'studio_progress', side_effect=emit):
                entries, paths = instance.generate_direct_engine('omnivoice', 2, [])
                qualified = instance.qualify_direct_candidates('omnivoice', entries, paths)
            self.assertEqual(len(paths), 3)  # OmniVoice intentionally over-generates.
            self.assertIn({'stage': 'generating', 'engine': 'omnivoice', 'completed': 0, 'total': 3}, events)
            self.assertIn({'stage': 'generating', 'engine': 'omnivoice', 'completed': 3, 'total': 3}, events)
            self.assertIn({'stage': 'qualifying', 'engine': 'omnivoice', 'completed': 0, 'total': 3}, events)
            self.assertIn({'stage': 'qualified', 'engine': 'omnivoice', 'completed': 3, 'total': 3}, events)
            self.assertEqual(len(qualified), 3)

    def test_direct_omnivoice_keeps_upstream_sampling_for_unvalidated_languages(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            args = argparse.Namespace(phrase='hallo tater', language='de', tts_mode='modern',
                                      samples=2, batch_size=8, data_dir=root,
                                      output_dir=root / 'samples', ffmpeg='ffmpeg', dry_run=False)
            instance = generator_module.Generator(args)
            with patch.object(instance, 'ensure_environment', return_value=Path('/unused/python')), \
                 patch.object(generator_module.subprocess, 'run') as process:
                instance._generate_direct_engine('omnivoice', 2, [])
            command = process.call_args.args[0]
            self.assertEqual(command[command.index('--position_temperature') + 1], '5.0')
            self.assertEqual(command[command.index('--class_temperature') + 1], '0.0')

    def test_direct_generator_uses_one_wake_phrase(self) -> None:
        self.assertEqual(generator_module.reference_text("hey tater"), "hey tater.")
        self.assertEqual(generator_module.reference_text("hey tater!"), "hey tater.")
        self.assertIn("four-provider-direct-corpus", generator_module.GENERATOR_VERSION)
        self.assertIn("safe-limits", generator_module.GENERATOR_VERSION)

    def test_omnivoice_uses_upstream_sampling_defaults(self) -> None:
        self.assertEqual(
            generator_module.omnivoice_stability_args(),
            ["--position_temperature", "5.0", "--class_temperature", "0.0"],
        )

    def test_qwen_accent_emphasis_supports_specific_and_mixed_english(self) -> None:
        australian = generator_module.qwen_descriptions("English", 4, "australian")
        self.assertTrue(all("natural Australian accent" in row for row in australian))

        mixed = generator_module.qwen_descriptions("English", 9, "mixed")
        for label in (
            "Australian",
            "American",
            "British",
            "Canadian",
            "Irish",
            "Scottish",
            "New Zealand",
            "Indian",
            "South African",
        ):
            self.assertTrue(any(f"natural {label} accent" in row for row in mixed))

        german = generator_module.qwen_descriptions("German", 1, "australian")
        self.assertIn("speaking native German", german[0])
        self.assertNotIn("accent", german[0])

    def test_moss_voice_clone_uses_audio_without_disallowed_prompt_text(self) -> None:
        worker_path = REPO_ROOT / "cli" / "tts_moss_worker.py"
        tree = ast.parse(worker_path.read_text(encoding="utf-8"))
        inference_calls = [
            node
            for node in ast.walk(tree)
            if isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "inference"
        ]

        self.assertEqual(len(inference_calls), 1)
        keywords = {keyword.arg for keyword in inference_calls[0].keywords}
        self.assertIn("prompt_audio_path", keywords)
        self.assertNotIn("prompt_text", keywords)

    def test_omnivoice_markdown_catalog_parser(self) -> None:
        markdown = """
| # | Language | OmniVoice ID | ISO 639-3 | Duration (h) |
|--:|----------|:------------:|:---------:|:------------:|
| 1 | English | en | eng | 100000.5 |
| 2 | Amdo Tibetan | adx | adx | 56.94 |
"""
        parsed = parse_omnivoice_catalog(markdown)
        self.assertEqual(parsed["en"]["name"], "English")
        self.assertEqual(parsed["adx"]["iso_639_3"], "adx")
        self.assertEqual(parsed["adx"]["duration_hours"], 56.94)

    def test_generator_plan_and_piper_discovery_do_not_load_models(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            output_dir = data_dir / "work" / "wake_word_samples"
            args = argparse.Namespace(
                phrase="hey_tater",
                language="en",
                tts_mode="modern",
                samples=101,
                batch_size=8,
                voice_count=128,
                data_dir=data_dir,
                output_dir=output_dir,
                ffmpeg="ffmpeg",
                dry_run=True,
            )
            instance = generator_module.Generator(args)
            self.assertEqual(instance.spoken_phrase, "hey tater")
            self.assertEqual(instance.reference_text, "hey tater.")
            self.assertEqual(instance.engines(), ["omnivoice", "qwen3", "moss"])
            self.assertEqual(sum(generator_module.distribute_samples(101, instance.engines()).values()), 101)

            model = data_dir / "tools" / "piper-sample-generator" / "models" / "en_US-libritts_r-medium.pt"
            model.parent.mkdir(parents=True)
            model.touch()
            args.tts_mode = "hybrid"
            self.assertEqual(instance.engines()[-1], "piper")

            args.engines = 'moss,qwen3'
            self.assertEqual(instance.engines(), ['moss', 'qwen3'])
            for invalid in ('', 'qwen3,qwen3', 'unrecognized'):
                args.engines = invalid
                with self.subTest(engines=invalid), self.assertRaises(ValueError):
                    instance.engines()
            args.language = 'fi'
            args.engines = 'qwen3'
            with self.assertRaises(ValueError):
                instance.engines()

    def test_voice_descriptions_are_distinct_for_default_bank(self) -> None:
        descriptions = generator_module.qwen_descriptions("English", 128)
        self.assertEqual(len(descriptions), 128)
        self.assertEqual(len(set(descriptions)), 128)

        first_bank = descriptions[:64]
        self.assertEqual(sum(" female speaker " in item for item in first_bank), 32)
        self.assertEqual(sum(" male speaker " in item for item in first_bank), 32)
        for trait in (
            "child",
            "teenager",
            "young adult",
            "middle-aged adult",
            "elderly adult",
            "low pitch",
            "medium pitch",
            "high pitch",
            "calm neutral delivery",
            "bright energetic delivery",
            "soft careful delivery",
            "confident resonant delivery",
            "casual conversational delivery",
            "clear timbre",
            "warm timbre",
            "slightly breathy timbre",
            "crisp timbre",
            "gently rough timbre",
        ):
            self.assertGreaterEqual(sum(trait in item for item in first_bank), 10, trait)

    def test_failed_model_batch_retries_one_item_at_a_time(self) -> None:
        command = ["worker", "--batch-size", "4"]
        with patch.object(
            generator_module,
            "run",
            side_effect=(subprocess.CalledProcessError(1, command), None),
        ) as mocked_run:
            generator_module.run_with_batch_retry(command, "--batch-size")

        self.assertEqual(mocked_run.call_count, 2)
        self.assertEqual(mocked_run.call_args_list[1].args[0], ["worker", "--batch-size", "1"])

    def test_acoustic_qa_accepts_speech_like_pcm_and_rejects_silence(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            tone = root / "tone.wav"
            silence = root / "silence.wav"
            write_tone(tone)
            write_tone(silence, amplitude=0)
            self.assertTrue(generator_module.valid_sample(tone))
            self.assertFalse(generator_module.valid_sample(silence))

    def test_provider_safety_gate_rejects_static_and_rambling(self) -> None:
        clean = {
            "duration": 1.2,
            "rms": 0.08,
            "peak": 0.5,
            "clipped_ratio": 0.0,
            "dc_offset": 0.0,
            "spectral_flatness": 0.05,
            "high_frequency_ratio": 0.04,
            "zero_crossing_rate": 0.08,
        }
        self.assertEqual(
            qa_module.acoustic_rejection_reason(clean, 0.7, "omnivoice", 0.4, 2.7),
            "accepted",
        )
        self.assertEqual(
            qa_module.acoustic_rejection_reason(
                {**clean, "spectral_flatness": 0.8}, 0.8, "omnivoice", 0.4, 2.7
            ),
            "static_or_broadband_noise",
        )
        self.assertEqual(
            qa_module.acoustic_rejection_reason(
                {**clean, "duration": 3.5}, 0.8, "qwen3", 0.4, 2.7
            ),
            "too_long_or_rambling",
        )

    def test_direct_entries_do_not_clone_the_old_voice_bank(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            args = argparse.Namespace(
                phrase="hey_tater",
                language="en",
                tts_mode="hybrid",
                samples=12,
                batch_size=4,
                voice_count=128,
                data_dir=data_dir,
                output_dir=data_dir / "work" / "samples",
                ffmpeg="ffmpeg",
                dry_run=False,
            )
            instance = generator_module.Generator(args)
            qwen = instance.make_direct_entries("qwen3", 4, data_dir, [])
            omni = instance.make_direct_entries("omnivoice", 4, data_dir, [])
            refs = [data_dir / f"accepted-{index}.wav" for index in range(4)]
            moss = instance.make_direct_entries("moss", 4, data_dir, refs)

        self.assertTrue(all("ref_audio" not in item for item in qwen + omni))
        self.assertEqual(len({item["instruct"] for item in qwen}), 4)
        self.assertEqual([item["ref_audio"] for item in moss], [str(path) for path in refs])

    @unittest.skipUnless(shutil.which("ffmpeg"), "ffmpeg is required for normalization")
    def test_orchestrator_produces_exact_normalized_corpus_and_manifest(self) -> None:
        class FakeGenerator(generator_module.Generator):
            generated = 0

            def generate_direct_engine(self, engine, count, reference_paths, prefix=""):
                destination = self.raw_dir / f"{engine}_{prefix or 'main'}"
                destination.mkdir(parents=True, exist_ok=True)
                paths = []
                for index in range(count):
                    path = destination / f"{engine}_{prefix}{index}.wav"
                    write_tone(path, frequency=180 + self.generated)
                    self.generated += 1
                    self.speed_by_path[path.resolve()] = 1.0
                    paths.append(path)
                entries = [
                    {
                        "id": path.stem,
                        "minimum_duration": self.minimum_duration,
                        "maximum_duration": self.maximum_duration,
                    }
                    for path in paths
                ]
                return entries, paths

            def qualify_direct_candidates(self, engine, entries, paths, prefix=""):
                return paths

        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            output_dir = data_dir / "work" / "wake_word_samples"
            args = argparse.Namespace(
                phrase="hey tater",
                language="en",
                tts_mode="modern",
                samples=13,
                batch_size=4,
                voice_count=8,
                data_dir=data_dir,
                output_dir=output_dir,
                ffmpeg=shutil.which("ffmpeg"),
                dry_run=False,
            )
            instance = FakeGenerator(args)
            instance.generate()

            self.assertEqual(len(list(output_dir.glob("*.wav"))), 13)
            self.assertTrue((output_dir / ".generation_manifest.json").is_file())
            self.assertTrue(instance.cache_hit())

    def test_final_recovery_avoids_moss_and_reaches_exact_sample_count(self) -> None:
        class RecoveryGenerator(generator_module.Generator):
            def __init__(self, args):
                super().__init__(args)
                self.generation_calls = []

            def engines(self):
                return [generator_module.ENGINE_QWEN3, generator_module.ENGINE_MOSS]

            def generate_direct_engine(self, engine, count, reference_paths, prefix=""):
                self.generation_calls.append((engine, prefix, count))
                destination = self.raw_dir / f"{engine}_{prefix or 'main'}"
                destination.mkdir(parents=True, exist_ok=True)
                paths = [destination / f"{engine}_{prefix}{index}.wav" for index in range(count)]
                entries = [{"id": path.stem} for path in paths]
                return entries, paths

            def qualify_direct_candidates(self, engine, entries, paths, prefix=""):
                return paths

            def normalize(self, paths, start_index, limit):
                source = paths[0].parent.name if paths else ""
                if source == "qwen3_main":
                    accepted_count = limit
                elif source == "moss_main":
                    accepted_count = max(0, limit - 1)
                elif "recovery" in source:
                    accepted_count = limit
                else:
                    accepted_count = 0

                self.final_dir.mkdir(parents=True, exist_ok=True)
                accepted = []
                for index in range(accepted_count):
                    path = self.final_dir / f"{start_index + index}.wav"
                    path.write_bytes(f"sample-{start_index + index}".encode())
                    accepted.append(path)
                return accepted

        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            output_dir = data_dir / "work" / "wake_word_samples"
            args = argparse.Namespace(
                phrase="hey_tater",
                language="en",
                tts_mode="modern",
                samples=8,
                batch_size=4,
                voice_count=8,
                data_dir=data_dir,
                output_dir=output_dir,
                ffmpeg="ffmpeg",
                dry_run=False,
            )
            instance = RecoveryGenerator(args)
            instance.generate()

            fallback_calls = [
                call for call in instance.generation_calls if call[1].startswith("fallback")
            ]
            recovery_calls = [
                call for call in instance.generation_calls if call[1].startswith("recovery")
            ]
            self.assertEqual(len(fallback_calls), 6)
            self.assertEqual(recovery_calls, [(generator_module.ENGINE_QWEN3, "recovery0_", 1)])
            self.assertEqual(len(list(output_dir.glob("*.wav"))), 8)
            self.assertTrue((output_dir / ".generation_manifest.json").is_file())

    def test_normalization_skips_only_unity_tempo_filter(self) -> None:
        for speed, expected_filter in (
            (None, None),  # Missing per-file speed defaults to unchanged speed.
            (1.0, None),
            (0.85, 'atempo=0.85'),
            (1.15, 'atempo=1.15'),
            (1.0001, 'atempo=1.0001'),  # Do not approximate real speed changes.
        ):
            with self.subTest(speed=speed), tempfile.TemporaryDirectory() as temp_dir:
                root = Path(temp_dir)
                args = argparse.Namespace(phrase='hey tater', language='en', tts_mode='modern',
                                          samples=1, batch_size=1, data_dir=root,
                                          output_dir=root / 'samples', ffmpeg='ffmpeg', dry_run=False)
                instance = generator_module.Generator(args)
                source = root / 'source.wav'
                write_tone(source)
                if speed is not None:
                    instance.speed_by_path[source.resolve()] = speed

                def convert(command, *, timeout):
                    write_tone(Path(command[-1]))
                    return 0

                with patch.object(generator_module, 'run_normalization_ffmpeg', side_effect=convert) as process:
                    accepted = instance.normalize([source], 0, 1)
                command = process.call_args.args[0]
                if expected_filter is None:
                    self.assertNotIn('-af', command)
                else:
                    self.assertEqual(command[command.index('-af') + 1], expected_filter)
                self.assertEqual(command[command.index('-ac') + 1], '1')
                self.assertEqual(command[command.index('-ar') + 1], '16000')
                self.assertEqual(command[command.index('-c:a') + 1], 'pcm_s16le')
                self.assertEqual(process.call_args.kwargs['timeout'], 30.0)
                self.assertEqual(accepted, [instance.final_dir / '0.wav'])

    def test_normalization_times_out_bad_clip_and_continues(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            output_dir = data_dir / "work" / "wake_word_samples"
            args = argparse.Namespace(
                phrase="hey tater",
                language="en",
                tts_mode="modern",
                samples=2,
                batch_size=1,
                voice_count=2,
                data_dir=data_dir,
                output_dir=output_dir,
                ffmpeg="ffmpeg",
                dry_run=False,
            )
            instance = generator_module.Generator(args)
            raw_dir = instance.raw_dir / "qwen3"
            raw_dir.mkdir(parents=True)
            paths = [raw_dir / "bad.wav", raw_dir / "good.wav"]
            for path in paths:
                write_tone(path)
                instance.speed_by_path[path.resolve()] = 1.0

            calls = []

            class FakeProcess:
                def __init__(self, *, pid, timed_out):
                    self.pid = pid
                    self.timed_out = timed_out
                    self.wait_calls = []

                def wait(self, timeout=None):
                    self.wait_calls.append(timeout)
                    if self.timed_out and len(self.wait_calls) == 1:
                        raise subprocess.TimeoutExpired(
                            calls[0][0],
                            generator_module.NORMALIZATION_TIMEOUT_SECONDS,
                        )
                    return -signal.SIGKILL if self.timed_out else 0

                def kill(self):
                    return None

            processes = []

            def fake_ffmpeg(command, **kwargs):
                calls.append((command, kwargs))
                temp_path = Path(command[-1])
                if len(calls) == 1:
                    temp_path.touch()
                    process = FakeProcess(pid=12345, timed_out=True)
                else:
                    write_tone(temp_path)
                    process = FakeProcess(pid=12346, timed_out=False)
                processes.append(process)
                return process

            messages = []
            with (
                patch.object(generator_module.subprocess, "Popen", side_effect=fake_ffmpeg),
                patch.object(generator_module.os, "killpg") as killpg,
                patch.object(generator_module, "log", side_effect=messages.append),
            ):
                accepted = instance.normalize(paths, 0, 2)

            self.assertEqual(len(calls), 2)
            self.assertEqual(len(accepted), 1)
            self.assertTrue((instance.final_dir / "0.wav").is_file())
            self.assertFalse((instance.final_dir / "0.tmp.wav").exists())
            self.assertIn("-nostdin", calls[0][0])
            self.assertIs(calls[0][1]["stdin"], subprocess.DEVNULL)
            self.assertTrue(calls[0][1]["start_new_session"])
            self.assertEqual(
                processes[0].wait_calls,
                [generator_module.NORMALIZATION_TIMEOUT_SECONDS, 2.0],
            )
            killpg.assert_called_once_with(12345, signal.SIGKILL)
            self.assertTrue(any("timed out" in message for message in messages))
            self.assertTrue(any("1/2 accepted" in message for message in messages))

    def test_docker_images_are_wired_for_modern_tts(self) -> None:
        source = (REPO_ROOT / "dockerfile").read_text(encoding="utf-8")
        self.assertEqual(source.count("ffmpeg"), 2)  # Both system stages.
        self.assertIn("tts_config.py", source)


if __name__ == "__main__":
    unittest.main()
