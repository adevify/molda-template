# Decision Log: Complete Module Specifications

## One specification per domain module

Each installed domain module receives its own document instead of expanding the summary catalog further. Every document
uses the same headings and ten-surface checklist so implementation agents can load only selected modules.

## Declaration authority

Package ID, stage, category, purpose, journal actions/views, and React hooks must match the current declaration packages.
The specification may add target entities, schemas, permissions, events, invariants, tests, and limitations but must not
silently rename declared unions.

## Machine-readable manifest

A checked-in JSON manifest records exact declared metadata and spec path. Tests compare it with package dependencies and
the published declaration files when installed, preventing prose-only drift.

## No runtime implementation

This task writes contracts and validation only. It does not make declaration packages executable or authorize their use
before the architecture gate.
