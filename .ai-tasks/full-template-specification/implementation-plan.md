# Implementation Plan: Full Template Specification

## Architecture

1. `docs/README.md` is the reading router by workflow phase and concern.
2. `docs/code-rules/` contains normative framework and runtime contracts.
3. `docs/examples/` contains small paired examples and composition references.
4. `docs/modules/` defines shared module rules and the complete module catalog.
5. Repository tests enforce presence, document shape, links, and module coverage.

## Documentation contracts

Each normative guide must contain:

- responsibility and non-responsibility;
- required rules;
- limitations;
- correct example or linked reference;
- prohibited example or explicit `avoid` rules;
- verification requirements.

## Test plan

- Assert every required guide exists.
- Assert required guide sections are present.
- Assert all 20 declared module packages appear in the catalog.
- Assert internal Markdown links resolve.
- Preserve the existing preview-boundary and template tests.

## Delivery chunks

- [x] Foundation and reading routes.
- [x] Framework/runtime rules.
- [x] Module specifications.
- [x] Reference examples and validation tests.
- [x] Reconciliation, verification, commit, and push.
