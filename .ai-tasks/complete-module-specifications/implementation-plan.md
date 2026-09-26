# Implementation Plan: Complete Module Specifications

## Architecture

- `docs/modules/manifest.json`: exact declaration metadata and spec routing.
- `docs/modules/specs/<module>.md`: normative per-module contract.
- `docs/code-rules/*.md`: remaining shared implementation disciplines.
- `tests/specification.test.mjs`: presence, section, manifest, declaration, and link validation.

## Per-module contract

Each document defines identity, responsibility/non-responsibility, dependencies, data model/schema targets, API,
validation/invariants, permissions, events, declared journal actions/views, Composer/MCP exposure policy, migrations,
tests/fixtures, React SDK, limitations, correct/avoid examples, and readiness evidence.

## Tests

- Manifest contains exactly the 20 installed domain packages.
- Manifest declarations match installed `.d.ts` unions and metadata.
- Each manifest entry resolves one specification document.
- Every module specification contains all required headings and declared surface names.
- Existing handbook/link tests, typecheck, and preview-boundary checks continue to pass.

## Progress

- [x] Cross-cutting rules
- [x] Platform-core module specs
- [x] Commerce module specs
- [x] Operations module specs
- [x] Manifest/tests/navigation
- [x] Verification/commit/push
