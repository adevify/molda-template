# Views and exports module specification

## Identity

- Package and ID: `@molda-org/views-exports` / `views-exports`.
- Stage: `initial`.
- Category: `platform-core`.
- Purpose (declaration exact): “Lists, filters, search, saved views, and structured exports.”
- Declared actions: `saveView`, `deleteView`, `createExport`.
- Declared views: `savedViews`, `exportHistory`.
- Declared React hooks: `useSavedView`, `useCreateExport`.

## Responsibility

Owns validated saved-view definitions, export-job lifecycle metadata, and generated artifact references. It coordinates reads with source module query contracts while source modules remain authoritative for data and policy.

## Non-responsibility

Does not own source records, authorize access on their behalf, offer unrestricted ad hoc query execution, or act as a general BI engine. It cannot bypass source-module authorization or turn a saved view into a permission grant.

## Dependencies and ownership

Depends on core and explicit source-module query/schema contracts. Source modules own records, field policy, and row policy; views-exports owns definitions and export metadata/artifact lifecycle. Storage and background processing are explicit platform services. No source repository access or copied authorization logic.

## Data model

Target entities: `SavedView`, `ExportJob`, and `ExportArtifactRef`. A saved view records project-scoped ID, owner/visibility scope, registered resource/query identifier, validated structural filter/sort/column selection, schema version, and revision. Export jobs record requester, source view/query, format allowlist, request time, status, safe diagnostics, row/size bounds, and idempotency key. Artifact references contain opaque storage key, expiry, checksum/size metadata, never a public path or long-lived bearer URL.

## API

Versioned operations: `viewsExports.saveView({ projectId, name, source, definition, expectedRevision?, idempotencyKey }) -> { view, receipt }`; `deleteView({ projectId, viewId, expectedRevision, idempotencyKey })`; `createExport({ projectId, source, definition, format, idempotencyKey }) -> { exportJob, receipt }`; queries `listSavedViews({ projectId, cursor })`, `getExportHistory({ projectId, cursor })`, and `getAuthorizedArtifact({ projectId, exportId })`. Every source query is reauthorized by its owner at execution/download time.

## Validation and invariants

Allow only registered resources, fields, operators, sort directions, and export formats. Validate bounded expression depth, page/row/size limits, and definitions against current source schema. Enforce project and saved-view visibility scope; schema changes must not silently widen selection. Export retries dedupe by project and idempotency key. Artifact access checks current actor scope and expiry; creation-time access is not permanent authorization.

## Permissions

Separate private/shared view management, source query, export creation, history read, and artifact download. Delegate row/field authorization to each source module for every query. Audit sensitive export requests; redact private values and internal storage keys from logs/errors. Never treat administrator UI access as source authorization.

## Events

Emit versioned facts such as `views-exports.view-saved.v1`, `views-exports.export-requested.v1`, `views-exports.export-completed.v1`, and `views-exports.export-expired.v1`. Payloads contain identifiers, status, revisions, and safe metadata only. Artifact completion is emitted only after durable artifact registration; consumers tolerate duplicate delivery.

## Journal actions and views

Actions are exactly `saveView`, `deleteView`, and `createExport`. View save/delete return versioned receipts for conditional revert; exports are jobs with idempotent request receipts and generally require confirmation when sensitive or costly. Views are exactly `savedViews` and `exportHistory`, filtered by ownership, project scope, and current permissions.

## Composer and MCP

Composer offers only registered typed queries and authorized save/delete/export mutations. API operations are not automatically exposed. Explicit module MCP tools need separate capability approval, schemas, bounded cost, required source scopes, and project enablement. Generic structural tools are distinct: they may run bounded registered-resource operations under policy, but cannot accept raw selectors/pipelines or bypass source authorization. Preserve tool source metadata.

## Migrations

Version saved-view AST and export status/artifact metadata. Upgrades validate old ASTs against current source schemas and quarantine invalid definitions rather than widening them. Expire or reissue artifact references safely. Checkpoint before irreversible query-language conversion; downgrade only when semantics are preserved.

## Tests and fixtures

Use synthetic registered schemas/rows only. Test exact declaration unions, malformed/deep query rejection, source permission propagation, field/row filtering, stale schema handling, cross-project access, bounded exports, duplicate requests, expiry/download reauthorization, safe errors, and artifact reference redaction. Ensure generic tools cannot bypass this module or source owners.

## React SDK

Export `useSavedView` and `useCreateExport` with typed definitions, job states, stable project-scoped cache keys, and explicit download authorization flow. UI column/filter controls must be derived from authorized schema metadata, not arbitrary field names. Artifact links remain short-lived and server-issued.

## Limitations

Not a warehouse, arbitrary SQL/Mongo interface, long-term artifact store, or permission cache. Large exports, scheduling, format generation, and artifact storage depend on explicit platform services.

## Correct example

```ts
const job = await viewsExports.createExport({
  projectId: context.project.id,
  source: input.source,
  definition: input.definition,
  format: input.format,
  idempotencyKey: context.operationId,
});
```

## Avoid

Do not execute user-supplied query strings, directly query source repositories, reuse stale permissions for artifact download, or return a raw storage location.

## Readiness evidence

All ten surfaces and exact declaration metadata agree. Tests demonstrate delegated source authorization at query and download time, bounded AST/export work, idempotency, artifact expiry, migrations, and SDK typing.
