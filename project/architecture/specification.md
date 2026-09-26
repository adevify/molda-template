# Architecture specification

Status: blocked-by-design-approval

Do not replace the status or complete this document until design is approved and the
business-flow survey is accepted. Then record every decision below before application
implementation. Cite accepted survey answers rather than inventing requirements.

## Requirement traceability

- Accepted requirement identifiers:
- Explicitly deferred requirements:
- Assumptions requiring owner confirmation:

## Applications and UI paths

- API application:
- Root UI and source entry:
- Named UI `overides` keys and source entries:
- Shared assets:
- Presentation pages/components reused from preview:
- Application binding adapters:

## Project composition

- `startProject` entry:
- Selected modules and reasons:
- Project routers:
- Composer queries:
- Composer mutations:
- Static `root`, `assets`, and `overides`:
- Events and handlers:

## API and validation

- API version:
- tRPC routers and ownership:
- Shared Zod input/output schemas:
- Typed domain errors:
- Authentication and authorization policy:
- Rate and resource limits:

## Data and external services

- Project-scoped MongoDB collections:
- Indexes and uniqueness constraints:
- Migration/version strategy:
- External file/media storage:
- Transaction and consistency boundaries:
- Backup and recovery requirements:

## Composer and common MCP

- Owner-facing reusable operations:
- Explicit selected-module MCP tools:
- Required generic structural data operations:
- Session scopes:
- Mutation receipt and conditional-revert requirements:

## Events

- Event names and versions:
- Producers and handlers:
- Idempotency keys:
- Retry/backoff and dead-letter policy:
- Scheduling requirements:

## Security and isolation

- Project/actor/role authorization rules:
- Secret sources and rotation:
- Sensitive data classification:
- Audit evidence:
- Cross-project isolation tests:

## Build and release

- One-image entrypoint:
- External runtime configuration:
- Health/readiness checks:
- Immutable artifact inputs:
- Required tests and release gates:
- Rollback and data-compatibility constraints:

## Contract deviations

List any justified deviation from [`../../docs/README.md`](../../docs/README.md). A
deviation must not weaken phase gates, validation, authorization, project isolation,
auditability, or immutable-release rules.
