# Core module specification

## Identity

- Package: `@molda-org/core`; id: `core`; stage: `initial`; category: `platform-core`.
- Purpose: Project identity, locale, time zone, currency, configuration, and feature flags.
- Declared actions: `updateProjectConfiguration`, `setFeatureFlag`.
- Declared views: `projectConfiguration`, `featureFlags`.
- Declared hooks: `useProjectConfiguration`, `useFeatureFlags`.

## Responsibility

Own project-scoped shared metadata, configuration, feature-flag definitions and their controlled updates. The authenticated project context is authoritative.

## Non-responsibility

No customer workflow, user authentication/provider integration, UI, transport policy, arbitrary key/value configuration, or generic persistence service.

## Dependencies and ownership

Foundation contract only; other modules may consume core project scope and shared references. Core must not depend on business modules. No module may access core storage directly; use its published contract.

## Data model

Target entities: `ProjectConfiguration`, `FeatureFlag`. Configuration carries project identity, locale, time zone, currency and revision; flags carry stable key, enabled state, optional constrained value, and revision. Target schema IDs: `core.project-configuration.v1`, `core.feature-flag.v1`.

## API

Ordinary API operations: `getProjectConfiguration`, `updateProjectConfiguration`, `listFeatureFlags`, `setFeatureFlag`. Reads and writes derive and enforce project scope from authenticated context. Mutations accept expected revision and idempotency key where retries are possible; reversible changes return a receipt with operation ID, resulting revision and revert token.

## Validation and invariants

Validate locale, IANA time zone, supported currency code, flag key/value shape and revision. Never accept caller-supplied project identity as authority. Idempotent initialization/update retries yield the original result; stale revisions conflict. Emit no change event for rejected/no-op mutations.

## Permissions

Scopes: `core.configuration.read`, `core.configuration.write`, `core.feature-flags.read`, `core.feature-flags.write`. Actor types: authenticated `user`, `service`. Enforce project membership and permission at execution time.

## Events

Target versioned events: `core.project-configuration.updated.v1`, `core.feature-flag.changed.v1`. Include project ID, entity key, revision, actor reference and operation ID; exclude credentials/secrets. Consumers deduplicate by event ID.

## Journal actions and views

Actions are exactly `updateProjectConfiguration` and `setFeatureFlag`; views are exactly `projectConfiguration` and `featureFlags`. Require confirmation for destructive or broad-impact flag changes; ordinary scoped edits need not prompt. Journal scope is the active project.

## Composer and MCP

Composer may invoke the two owner actions and read the two owner views subject to authorization; mutating configuration requires preview of changed fields and revision. No explicit module MCP tool is declared, so expose none. Generic structural tools may inspect/edit supported project structure only; they do not bypass core domain policy or become core MCP tools.

## Migrations

Target schema version `1`; upgrade supported; downgrade only when safe; checkpoint before irreversible changes. Preserve project scope and revisions. Migration failure must not leave mixed configuration state.

## Tests and fixtures

Fixture IDs: `core.project-configuration`, `core.feature-flags`. Contract tests cover schemas, project isolation, permissions, stale revisions, idempotent retry/receipt and event deduplication. Fixtures are synthetic structural values, not customer facts.

## React SDK

Hooks: `useProjectConfiguration`, `useFeatureFlags`. Target types: `ProjectConfigurationApiClient`, `CoreValidators`, `ProjectConfigurationForm`, `FeatureFlagForm`, `ProjectConfigurationPanel`. Hooks accept project context through the client and expose loading/error/revision state; no provider credential data.

## Limitations

Declarations specify contracts only; they do not provide runtime storage, API routes, feature evaluation distribution, locale databases, or UI.

## Correct example

An authorized project administrator reads `projectConfiguration`, submits changed locale with the observed revision through `updateProjectConfiguration`, and receives a revisioned receipt; the accepted update emits one versioned event.

## Avoid

Do not use core as an unrestricted settings bag, trust a request-body project ID, or let core import customer, content, or commerce repositories.

## Readiness evidence

Runtime readiness requires agreement with the declaration, all ten module surfaces, explicit dependency/configuration contracts, scoped authorization, tested revisions/idempotency/events/migrations and exported React SDK types.
