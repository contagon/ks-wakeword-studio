"""Exercise adaptive weights through the real lightweight config CLI."""

import json
import subprocess
import sys
from pathlib import Path

import pytest
import yaml


REPO = Path(__file__).resolve().parents[1]


def configure(root, count=200, downloaded=('speech', 'dinner_party', 'no_speech', 'dinner_party_eval'),
              reviewed=('training', 'validation', 'testing')):
    manifest = root / 'datasets.json'
    manifest.write_text(json.dumps({'schema_version': 1, 'datasets': [
        dict(id=name, path=str(root / name), representation='features', adapter='mww_mmap',
             fingerprint='a' * 64, split='evaluation' if name.endswith('_eval') else 'train')
        for name in downloaded]}))
    command = [sys.executable, str(REPO / 'cli/dataset_config.py'), f'--output={root / "config.yaml"}',
               f'--work-dir={root}', '--training-steps=100', '--eval-step-interval=50',
               f'--generated-dir={root / "generated"}', f'--personal-dir={root / "personal"}',
               f'--dataset-manifest={manifest}']
    if reviewed:
        for split in reviewed:
            path = root / 'reviewed' / split / 'wakeword_mmap/data.ninja'
            path.parent.mkdir(parents=True)
            path.write_bytes(b'features')
        command.append(f'--reviewed-negative-dir={root / "reviewed"}')
    if count is not None:
        command.append(f'--reviewed-negative-families={count}')
    result = subprocess.run(command, capture_output=True, text=True)
    output = root / 'config.yaml'
    return result, yaml.safe_load(output.read_text()) if output.exists() else None


@pytest.mark.parametrize(('count', 'share'), [(29, .13799126637554585), (200, .25),
                                            (276, .2739495798319328)])
def test_personal_share_adapts_without_changing_class_balance(tmp_path, count, share):
    result, config = configure(tmp_path, count)
    assert result.returncode == 0, result.stderr
    rows = {Path(row['features_dir']).name: row for row in config['features']}
    assert rows['reviewed']['sampling_weight'] == pytest.approx(37 * share)
    assert rows['reviewed']['penalty_weight'] == 1.25
    assert rows['speech']['sampling_weight'] == pytest.approx(37 * (1 - share) * 12 / 29)
    assert rows['dinner_party']['sampling_weight'] == rows['speech']['sampling_weight']
    assert rows['no_speech']['sampling_weight'] == pytest.approx(37 * (1 - share) * 5 / 29)
    assert rows['dinner_party_eval']['sampling_weight'] == 0
    assert rows['generated']['sampling_weight'] == 2
    assert rows['personal']['sampling_weight'] == 3
    assert sum(row['sampling_weight'] for row in rows.values() if not row['truth']) == pytest.approx(37)
    assert config['negative_class_weight'] == [20]
    assert config['positive_class_weight'] == [1]
    assert all(row['penalty_weight'] == 1 for name, row in rows.items() if name != 'reviewed')
    assert config['negative_sampling'] == {
        'training_families': count, 'target_personal_share': pytest.approx(share),
        'effective_personal_share': pytest.approx(share), 'total_weight': pytest.approx(37)}
    assert f'{count} training families' in result.stdout
    assert 'personal' in result.stdout


def test_share_increases_smoothly_and_stays_bounded(tmp_path):
    shares = []
    for count in (1, 29, 200, 276, 1_000_000):
        root = tmp_path / str(count)
        root.mkdir()
        result, config = configure(root, count)
        assert result.returncode == 0, result.stderr
        shares.append(config['negative_sampling']['target_personal_share'])
    assert all(.1 < share < .4 for share in shares)
    assert all(left < right for left, right in zip(shares, shares[1:]))
    assert shares[-1] == pytest.approx(.3999400119976005)


@pytest.mark.parametrize('reviewed', [(), ('validation', 'testing')])
def test_zero_training_families_allocate_all_weight_to_downloaded(tmp_path, reviewed):
    result, config = configure(tmp_path, 0, reviewed=reviewed)
    assert result.returncode == 0, result.stderr
    negatives = [row for row in config['features'] if not row['truth']]
    assert sum(row['sampling_weight'] for row in negatives) == pytest.approx(37)
    assert all(row['sampling_weight'] == 0 for row in negatives
               if Path(row['features_dir']).name in ('reviewed', 'dinner_party_eval'))
    assert config['negative_sampling']['effective_personal_share'] == 0
    if reviewed:
        assert any(Path(row['features_dir']).name == 'reviewed' for row in negatives)


@pytest.mark.parametrize('downloaded', [('speech',), ('speech', 'no_speech', 'dinner_party_eval')])
def test_selected_downloaded_subsets_are_renormalized_without_stock_fallback(tmp_path, downloaded):
    result, config = configure(tmp_path, downloaded=downloaded)
    assert result.returncode == 0, result.stderr
    negatives = {Path(row['features_dir']).name: row for row in config['features'] if not row['truth']}
    assert set(negatives) == {'reviewed', *downloaded}
    assert negatives['reviewed']['sampling_weight'] == pytest.approx(9.25)
    assert sum(row['sampling_weight'] for name, row in negatives.items() if name != 'reviewed') == pytest.approx(27.75)
    if 'no_speech' in downloaded:
        assert negatives['speech']['sampling_weight'] / negatives['no_speech']['sampling_weight'] == pytest.approx(12 / 5)
        assert negatives['dinner_party_eval']['sampling_weight'] == 0


@pytest.mark.parametrize('downloaded', [(), ('dinner_party_eval',)])
def test_personal_only_training_uses_all_negative_weight(tmp_path, downloaded):
    result, config = configure(tmp_path, downloaded=downloaded)
    assert result.returncode == 0, result.stderr
    personal = next(row for row in config['features'] if Path(row['features_dir']).name == 'reviewed')
    assert personal['sampling_weight'] == 37
    assert config['negative_sampling']['target_personal_share'] == .25
    assert config['negative_sampling']['effective_personal_share'] == 1


def test_empty_selection_does_not_create_training_providers(tmp_path):
    result, config = configure(tmp_path, 0, downloaded=(), reviewed=())
    assert result.returncode == 0, result.stderr
    assert all(row['truth'] for row in config['features'])
    assert config['negative_sampling']['total_weight'] == 0


@pytest.mark.parametrize(('count', 'reviewed', 'message'), [
    (None, ('training',), 'require a positive training-family count'),
    (0, ('training',), 'require a positive training-family count'),
    (-1, ('training',), 'must be a non-negative integer'),
    (200, (), 'family count requires personal training features'),
    (200, ('validation',), 'family count requires personal training features')])
def test_inconsistent_or_missing_counts_fail_before_writing_config(tmp_path, count, reviewed, message):
    result, config = configure(tmp_path, count, reviewed=reviewed)
    assert result.returncode != 0
    assert message in result.stderr
    assert config is None
