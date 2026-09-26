# Task Context: Complete Module Specifications

## Original task

Complete the full specifications in one pass, parallelizing with economical models.

## Refined task

Close the remaining deterministic-specification gap after the engineering handbook: define one normative contract for
each of the 20 installed module packages, add missing cross-cutting code rules, add machine-readable module metadata, and
extend tests so declarations, specifications, links, and required sections cannot silently drift.

## Existing context

- `docs/code-rules/` already defines framework/runtime boundaries.
- `docs/modules/catalog.md` summarizes all 20 modules and exact action/view/hook unions.
- Installed module packages remain declaration-only; runtime implementation is excluded.
- `@molda-org/module-contracts` requires ten surfaces: data model, API, validation, permissions, events, journal actions,
  journal views, migrations, tests/fixtures, and React SDK.

## Accepted scope

- Twenty individual module specification documents.
- One machine-readable module surface manifest derived from current declarations.
- Cross-cutting rules for dependencies, configuration, errors, observability, and consistency.
- Navigation and deterministic documentation/manifest tests.

## Deferred scope

- Runtime module packages, database migrations, routers, providers, or React SDK implementations.
- Project-specific module selection.
- Changes to `/Users/arsenii/code/.ai-workflow`.

## Checkpoints

- [x] Context inspected
- [x] Architecture/contracts/test strategy fixed by the one-shot request
- [x] Cross-cutting rules complete
- [x] Twenty module specifications complete
- [x] Manifest and validation complete
- [x] Tests/typecheck/preview verification pass
- [x] Commits pushed and local checkout synchronized
