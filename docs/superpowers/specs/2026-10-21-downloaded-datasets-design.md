# Downloaded datasets

## Requirements

Implement only the six items under “online datasets” in `TODOS.md`.
The user confirmed augmentation selections are **per wakeword**.

- Rename the page/navigation label to **Downloaded**; preserve existing URLs.
- Remove the negative dataset search input; retain installation filtering and pagination.
- Default negative/evaluation and augmentation selections to all enabled.
- Persist augmentation selections per wakeword; downloads remain shared.
- Put the low-space warning directly below the page heading.
- Use matching dataset cards: description/source, license, then GB and sample count.
- Disabled augmentation datasets must be excluded from readiness checks, snapshots,
  and actual augmentation, including when none are enabled.

## Implementation choices

- Keep the existing Vue/FastAPI/SQLite stack, with no new dependencies.
- Use explicit saved-selection state to distinguish an untouched default from a
  deliberately empty selection. Preserve existing nonempty negative selections.
  Legacy empty selections have no saved marker and will receive the new default.
- Keep the existing Save selection interaction for negative datasets; give
  augmentation its own Save selection button and per-wakeword checkboxes.
- Keep installed corpus validation and immutable run inputs. A run's pinned
  selection must not change if the user edits selections later.
- Count actual feature samples from supported mmap metadata, not the number of
  feature shard files. Display unknown counts/sizes honestly when unavailable.
- Keep the global augmentation catalog for shared status; add wakeword-scoped
  catalog/selection endpoints for the page and training prerequisite UI.
- Leave unrelated TODO items, including queue behavior and training layout, alone.

## Verification

Exercise defaults, explicit empty selections, cross-wakeword isolation, reloads,
missing disabled corpora, selected subsets and empty augmentation in the CLI,
workspace switches during requests, warning placement, and card metadata.
Run frontend/backend suites, typechecking/build, and relevant browser tests.
