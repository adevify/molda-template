# Media module specification

## Identity

- Package: `@molda-org/media`; id: `media`; stage: `initial`; category: `platform-core`.
- Purpose: Images, documents, upload, transformation, access, and storage.
- Declared actions: `createUpload`, `updateMediaAccess`, `deleteMedia`.
- Declared views: `mediaLibrary`, `mediaUsage`.
- Declared hooks: `useMediaLibrary`, `useUploadMedia`.

## Responsibility

Own media asset metadata and the contracts for upload, transformation state, access policy and storage adapter references.

## Non-responsibility

Does not own content publication, arbitrary file storage infrastructure, application rendering, or malware scanning service implementation.

## Dependencies and ownership

Depends on `core` project scope and an explicit binary-storage adapter. `content` and `forms` may reference media IDs; media owns asset metadata and access decisions. Consumers must not mutate media storage directly.

## Data model

Target entities: `MediaAsset`, `UploadRequest`, `MediaAccessGrant`, `MediaUsageReference`. Store asset ID, project, MIME/size metadata, opaque storage reference, processing state, revision and access policy; binary bytes remain with adapter. Schema IDs: `media.asset.v1`, `media.upload.v1`, `media.access.v1`.

## API

Ordinary API operations: `createUpload`, `updateMediaAccess`, `deleteMedia`, `getMedia`, `listMedia`, `getMediaUsage`. Upload creation is idempotent by request key and returns scoped upload instructions from adapter. Access updates are revisioned with conditional-revert receipts. Delete is safe/retryable and may be soft deletion pending reference checks.

## Validation and invariants

Validate declared MIME/size limits, project scope, state transitions and adapter references; do not trust client MIME alone. Upload grants are narrow and expire. Prevent cross-project access. Retried registration/deletion returns stable outcome; events occur on accepted state changes only.

## Permissions

Scopes: `media.read`, `media.upload`, `media.access.update`, `media.delete`, `media.usage.read`. Actor types: `user`, `service`, `system`. Default private; issue short-lived scoped access only after authorization.

## Events

Target events: `media.upload.created.v1`, `media.asset.processed.v1`, `media.access.changed.v1`, `media.asset.deleted.v1`. Carry project, asset reference, revision/status and operation ID; never binary data or bearer URLs. Consumers deduplicate delivery.

## Journal actions and views

Actions exactly `createUpload`, `updateMediaAccess`, `deleteMedia`; views exactly `mediaLibrary`, `mediaUsage`. Require confirmation for public access expansion and deletion. Display usage references before deletion; journal project/actor.

## Composer and MCP

Composer may create uploads, modify access and delete through owner operations, with confirmation for access expansion/deletion. No explicit module MCP tools are declared. Generic structural tools may update structural references only through approved integration contracts and cannot bypass media access controls.

## Migrations

Target schema version `1`; upgrade supported; safe downgrade only; checkpoint before irreversible changes. Never migrate binary payloads within metadata migrations; preserve opaque adapter references or provide explicit adapter migration.

## Tests and fixtures

Fixture IDs: `media.asset-states`, `media.access-policies`, `media.usage`. Cover metadata validation, project isolation, expired/scope-limited grants, idempotent retries, conditional receipts, deletion references, events and adapter failures. No real files or customer details in fixtures.

## React SDK

Hooks exactly `useMediaLibrary`, `useUploadMedia`. Target types: `MediaApiClient`, `MediaValidators`, `MediaUploadForm`, `MediaAccessForm`, `MediaLibraryPanel`. Do not retain bearer upload/download URLs beyond their expiry.

## Limitations

Declarations do not provision storage, process images, scan malware, or guarantee durable external-adapter behavior.

## Correct example

An authorized editor requests an upload for a validated file, receives a short-lived project-scoped adapter instruction, then sees the registered asset state in `mediaLibrary`.

## Avoid

Do not embed binary content in domain events, assume client-provided MIME is trustworthy, or mark private assets public through generic structure edits.

## Readiness evidence

Confirm adapter boundary, project-safe access, metadata validation, idempotency/receipts, safe deletion, versioned events, migrations and SDK exports.
