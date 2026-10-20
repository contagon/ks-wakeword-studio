# OmniVoice short-phrase decoder investigation

## Reproduction

On the RTX 3090, the 20,000-sample `Hey Doof.` job had accepted 19,001
of 80,761 QA-checked candidates before being paused. The seven completed
generation/QA rounds consistently accepted about 23.5%. Rejection reasons were:

| Reason | Candidates |
| --- | ---: |
| DC offset | 41,242 |
| No speech detected | 19,121 |
| Static/broadband noise | 1,214 |
| Too short | 176 |
| Other | 7 |

DC offset was a symptom, not a useful repair target: in a 150-clip scratch
sample, centering the waveform left only two clips passing acoustic QA.
The attempted DC correction was removed entirely; QA remains unchanged.
High RMS alone does not establish that a clip contains speech.

## Cause and controlled experiments

The direct generator asks OmniVoice for reference-free speech lasting
1.238–1.782 seconds. The pinned upstream revision explicitly warns that
[1–2 second generation without reference audio is unreliable](https://github.com/k2-fsa/OmniVoice/blob/28bc0889d92110491d726a9c79f26a895db5a074/docs/tips.md).
Its default decoding combines random mask-position selection
(`position_temperature=5`) with greedy token classes (`class_temperature=0`).
This combination reproduced the high non-speech rejection rate.

Scratch experiments used the installed pinned model and PyTorch environment,
batch size 8, the same five durations, 32 decoding steps unless noted, and the
unchanged production `--speech-only --profile omnivoice` QA command. Each
condition used 80 takes and matched per-batch random seeds.

| Change from baseline | Acoustic QA accepts | Unique accepted WAVs |
| --- | ---: | ---: |
| Baseline (position 5, class 0) | 13/80 | 13 |
| Position 0, class 0 | 64/80 | **4** |
| Class 1 only | 33/80 | Not measured |
| 64 decoding steps | 29/80 | Not measured |
| Position 0.5, class 0 | 11/80 | 11 |
| Position 1, class 0 | 8/80 | 8 |
| Position 2, class 0 | 7/80 | 7 |
| **Position 0, class 1** | **58/80** | **58** |
| Automatic duration | 22/80 | 22 |
| BF16 language model, otherwise baseline | 13/80 | 13 |

The audio codec was FP32 in both the FP16 and BF16 language-model tests.
Disabling classifier-free guidance caused an empty-output post-processing
exception; that experiment was not a successful alternative.

The useful intervention is confidence-ordered unmasking **with stochastic
token classes**, not making both stages deterministic. The latter mostly
repeats the same few outputs and would be rejected by corpus deduplication.

An independent seed set gave `Hey Doof.` 40/160 baseline accepts versus
116/160 with position 0/class 1; all 116 were byte-distinct. Generation took
19.6 versus 19.8 seconds; acoustic QA about 2 seconds in either case. This
improves usable yield, not raw decoder speed. These measurements exclude
model loading and final FFmpeg normalization.

### Independent-seed, three-phrase confirmation

Each row used 160 takes per configuration. All acoustic accepts were
byte-distinct within their respective configuration and phrase.

| Phrase | Baseline accepts | Position 0/class 1 accepts | ASR matches in 24 sampled accepts (old/new) |
| --- | ---: | ---: | ---: |
| Hey Doof. | 40/160 | 116/160 | 24/24, 24/24 |
| Hey Jarvis. | 60/160 | 112/160 | 24/24, 23/24 |
| Hey Tater. | 53/160 | 143/160 | 22/24, 24/24 |

ASR spot-checks used the existing local Whisper `small.en` model on CPU,
passing resampled numpy audio directly to avoid the unrelated installed
PyAV/Whisper filename-decoding incompatibility. These checks do not establish
equal speaker coverage or downstream detector accuracy.

### Production CLI and final normalization check

A separate check ran the actual `omnivoice-infer-batch` CLI at batch size 8
over 160 original input descriptions (`Hey Doof.`), with production duration
sorting, unchanged QA, and one production-equivalent FFmpeg conversion per
accepted clip. These are fresh random generations, not matched-seed takes.

| Stage | Baseline | Position 0/class 1 |
| --- | ---: | ---: |
| Generated WAVs | 160 | 160 |
| Generation including process/model initialization | 27.384 s | 27.913 s |
| Acoustic QA | 1.980 s | 1.902 s |
| FFmpeg normalization of accepts | 1.029 s | 3.855 s |
| Accepted and unique after normalization | 33 | 122 |
| Unique accepts per second across these stages | 1.09 | 3.62 |

This is about **3.3x higher usable throughput on this slice**, not a guaranteed
full-run speedup. It also corrects the initial assumption about stage weights:
generation dominates this workload, with acoustic QA and FFmpeg much smaller.
No Whisper transcription occurs in the production corpus QA command.

Together these tests identify a short, reference-free **decoder sampling
configuration** problem. They do not establish an independent defect in the
vocoder weights; changing language-model precision alone did not help.

## Scope and limitations

- Preserve 32 steps, duration limits, all QA thresholds, DC rejection, and
  final deduplication. No audio centering or denoising workaround is applied.
- Apply the change only to English direct generation, where it was measured.
  Preserve upstream defaults for other languages and the separate
  carrier/voice-cloning paths.
- Invalidate cached corpora with the generator-version change.
- Corpus QA here uses VAD/acoustic metrics, **not Whisper transcription**.
  Semantic spot-checks are a separate experiment, not a new production gate.
- Different bytes establish absence of exact duplicates, not independent
  speaker identities or equivalent training accuracy. Downstream wake-word
  training and held-out evaluation remain necessary.
- Existing running Python generators retain their loaded code. Updating the
  image affects newly started jobs; do not restart an active job just to deploy
  this change without deciding what to do with its existing progress.

Scratch scripts, logs and WAVs are under `/tmp/opencode/decoder_*` on the host
and `/tmp/omni_bench/` in the Studio container. They never modify the paused
job's candidates or QA results.
