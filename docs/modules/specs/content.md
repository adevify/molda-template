# Content module specification

## Identity

- Package: `@molda-org/content`; id: `content`; stage: `initial`; category: `platform-core`.
- Purpose: Business profile, locations, hours, pages, SEO, and legal content.
- Declared actions: `updateBusinessProfile`, `publishContent`.
- Declared views: `businessProfile`, `publishedPages`.
- Declared hooks: `useBusinessProfile`, `useContentPage`.

## Responsibility

Own structured project-managed business profile and editorial content, including locations, hours, pages, SEO/legal fields and publication state.

## Non-responsibility

Does not own media binaries, page rendering, arbitrary application configuration, or public hosting/routing.

## Dependencies and ownership

Depends on `core` for project scope; may reference `media` asset IDs through its public contract. Media owns file metadata/binary adapters. Consuming application owns rendering and route composition.

## Data model

Target entities: `BusinessProfile`, `BusinessLocation`, `ContentPage`, `ContentRevision`, `PublicationRecord`. Localized content and SEO metadata are structured and versioned; media references are opaque owner IDs. Schema IDs: `content.business-profile.v1`, `content.page.v1`, `content.revision.v1`, `content.publication.v1`.

## API

Ordinary API operations: `getBusinessProfile`, `updateBusinessProfile`, `getContentPage`, `listPublishedPages`, `publishContent`. Updates/publish require expected revision; publish supports idempotency key and returns a receipt containing revision and publication operation identifier. Unpublish is a permitted state transition only if represented by the API contract.

## Validation and invariants

Validate content schema/version, locale fields, SEO limits, references and allowed publication transitions. Draft revisions are immutable snapshots; stale publication attempts conflict. Accepted updates only emit events. Project scope is derived from context.

## Permissions

Scopes: `content.profile.read`, `content.profile.update`, `content.pages.read`, `content.pages.edit`, `content.publish`. Actor types: `user`, `service`, `system`. Editorial role required for edits and publication; public reads are limited to published content only.

## Events

Target events: `content.business-profile.updated.v1`, `content.page.revised.v1`, `content.page.published.v1`. Include project, content ID, revision, locale and operation ID; no rendered HTML or media bytes. Duplicate consumers must be safe.

## Journal actions and views

Actions exactly `updateBusinessProfile`, `publishContent`; views exactly `businessProfile`, `publishedPages`. Publication requires confirmation showing the target page/revision and visibility effect. Journal drafts and published state distinctly.

## Composer and MCP

Composer may edit profile/content through owner mutations and query owner views. Publishing requires a diff/preview and confirmation. No explicit module MCP tools are declared. Generic structural tools handle application structure and cannot publish or mutate content records implicitly.

## Migrations

Target schema version `1`; upgrade supported; downgrade only when safe; checkpoint before irreversible schema/content transformations. Retain revision history and avoid silently dropping localized fields or publication state.

## Tests and fixtures

Fixture IDs: `content.business-profile`, `content.pages`. Cover validation/versioning, project isolation, stale revision conflict, publication authorization/idempotency, receipt, event deduplication and unpublished-read denial. Content examples must be clearly synthetic and avoid fabricated customer/business claims.

## React SDK

Hooks exactly `useBusinessProfile`, `useContentPage`. Target types: `ContentApiClient`, `ContentValidators`, `BusinessProfileForm`, `ContentPageForm`, `ContentPageEditor`. SDK separates draft from published reads and surfaces revision conflicts.

## Limitations

Rendering, hosting, SEO execution, media storage and preview infrastructure are not provided by declarations.

## Correct example

An editor revises a page with expected revision, reviews the draft, then confirms `publishContent`; the accepted publication emits one event for that revision.

## Avoid

Do not treat content as arbitrary configuration, store media binary data here, or let rendering consumers read drafts without owner authorization.

## Readiness evidence

Check declaration alignment, structured schema contracts, editorial/public access boundaries, revision/idempotency receipts, publication events, migrations and SDK behavior.
