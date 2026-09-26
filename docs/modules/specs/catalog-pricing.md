# Catalog Pricing Module Specification

## Identity

- Package: `@molda-org/catalog-pricing`
- ID: `catalog-pricing`
- Stage: `initial`
- Category: `commerce`
- Purpose: `Services, products, menus, packages, variants, options, availability, prices, and pricing rules.`
- Declared actions: `createCatalogItem`, `updateCatalogItem`, `updatePrice`
- Declared views: `catalog`, `priceList`, `availabilityRules`
- Declared React hooks: `useCatalog`, `useCatalogItem`, `usePrice`

These identity values are declaration-owned and must remain exact. The shapes below are specification targets, not exported runtime types in the declaration package.

## Responsibility

Own project-scoped sellable catalog definitions and the current published pricing and availability rules needed to describe them. Keep stable item and variant identifiers so orders, quotes, reservations, and rentals can reference an item without taking ownership of catalog state.

## Non-responsibility

Does not own orders, payment authorization/capture/refunds, inventory or fulfillment execution, promotion/loyalty evaluation, or tax calculation. Price calculation must not silently apply promotions or taxes. A consumer's committed price is its own immutable snapshot, not a live catalog lookup.

## Dependencies and ownership

- Depends on `core` project scope.
- Owns catalog items, variants/options, price records and availability rules.
- Other modules store stable catalog references and the relevant accepted snapshot; they never read or write this module's persistence directly.
- A catalog update does not rewrite any quote or order already accepted. No cross-module transaction is implied.

## Data model

Target entities and schemas:

- `CatalogItem` / `catalog-pricing.catalog-item.v1`: `{ id, projectId, kind, title, description?, status, variantIds[], revision, createdAt, updatedAt }`.
- `CatalogVariant` / `catalog-pricing.variant.v1`: `{ id, projectId, itemId, sku?, optionValues, status, revision }`.
- `Price` / `catalog-pricing.price.v1`: `{ id, projectId, itemId, variantId?, amountMinor, currency, validFrom?, validUntil?, revision }`.
- `AvailabilityRule` / `catalog-pricing.availability-rule.v1`: `{ id, projectId, itemId, variantId?, rule, timezone?, revision }`.
- Money uses integer `amountMinor` and an ISO 4217 currency code. Persist no floating-point amount. A price record is current catalog truth; downstream commitments copy amount, currency, source price ID/revision, and snapshot time.

Persistence-only fields and indexes belong to the persistence adapter. Enforce project-scoped unique IDs; enforce currency and date validity in shared input validation.

## API

Project API operations, separately versioned and schema-validated:

- `catalogPricing.createCatalogItem(input) -> CatalogItem`.
- `catalogPricing.updateCatalogItem(input) -> { item, revision }` with `expectedRevision`.
- `catalogPricing.updatePrice(input) -> { price, revision }` with integer amount, currency, and optional `expectedRevision`.
- Read operations for catalog item, catalog listing, price list, and availability rules return bounded owner-authorized projections.

These are API operation targets, not declarations of endpoint or router names. They do not become Composer entries or MCP tools through API registration.

## Validation and invariants

- Validate all inputs at the boundary; reject unknown currency syntax, non-integer/negative amounts where the price policy disallows them, invalid validity intervals, duplicate variant identities, and references to another project's item.
- Use optimistic revision checks for edits; stale edits return a conflict without overwriting later work.
- Keep one unambiguous effective price for a given item/variant and instant under the configured price-list policy.
- Retryable create/update calls require a project- and actor-scoped idempotency key. Same key and equivalent normalized request returns the original result; same key with different request is a conflict.
- Any receipt/revert of a price edit is conditional on the written revision still being current.

## Permissions

Read catalog only within the authenticated project and permitted visibility. Require a catalog-management permission for item, variant, price, and availability writes. Derive project and actor from trusted request context; never accept them as authority from input. Restrict price changes and audit actor, prior/new revision, and affected item without leaking private configuration.

## Events

Publish versioned project-scoped facts only after the catalog change is accepted, such as `catalog.item-created.v1`, `catalog.item-updated.v1`, and `catalog.price-updated.v1`. Payloads carry event ID, project scope, item/price IDs, revisions, and occurrence time, not whole request documents. Consumers tolerate duplicate delivery. Events notify downstream readers; they do not mutate existing order or quote snapshots.

## Journal actions and views

- Actions, exactly as declared: `createCatalogItem`, `updateCatalogItem`, `updatePrice`.
- Views, exactly as declared: `catalog`, `priceList`, `availabilityRules`.
- A create, item edit, or price change requires confirmation when performed through an interactive journal. Mutations return an auditable receipt with affected IDs and revisions; any revert is conditional on the current revision.

## Composer and MCP

Composer may explicitly register bounded read-only queries for catalog, price list, and availability, plus authorized mutations corresponding to the declared actions. Composer mutations require typed inputs, invocation-time authorization, idempotency where retryable, and receipts. The project API remains separate.

Module MCP tools may be exposed only through a separate explicit module MCP contract and project enablement; this declaration names none, so this specification does not authorize any module-specific MCP tool. Generic structural data tools may inspect catalog resources only when registered in the project data catalog and authorized; structural writes must not bypass item/price validation, revision checks, or receipts. Ordinary API routes are never implied MCP tools.

## Migrations

Use ordered schema versions and resumable upgrades. Preserve stable IDs and price currency/amount meaning. Before irreversible removal or conversion, require a checkpoint and verify no dependent references would be invalidated. Downgrade only when lossless and safe; otherwise report unsupported downgrade. Never migrate another module's snapshots as a side effect.

## Tests and fixtures

Use synthetic, explicitly labeled fixtures such as `catalog-item-basic` and `price-revision-conflict`; do not add customer-specific catalog facts. Contract tests cover exact schemas, project isolation, currency/integer money validation, validity boundaries, duplicate/idempotent retries, revision conflicts, safe conditional revert, event versioning/deduplication, and preservation of downstream price snapshots.

## React SDK

Expose typed API-client, validator, form, and headless component contracts for the declared hooks `useCatalog`, `useCatalogItem`, and `usePrice`. Hooks consume injected clients and project context; they do not fetch directly, infer permissions, or mutate prices outside the declared actions. Keep transport and UI concerns separate.

## Limitations

This specification does not define a tax engine, promotion stacking, inventory reservation, provider integrations, or exact runtime implementation. Catalog availability rules are descriptive and do not guarantee stock, a reservation, or fulfillment.

## Correct example

```ts
const snapshot = {
  catalogItemId,
  variantId,
  sourcePriceId,
  sourceRevision,
  amountMinor,
  currency,
  capturedAt,
};
```

The consuming order or quote owns this immutable snapshot and validates its own commitment transition.

## Avoid

```ts
const orderTotal = Number(price.amount) * quantity; // float math and live catalog dependency
```

Do not use floating-point money, silently rewrite accepted snapshots, place payments/orders in catalog persistence, or treat availability rules as inventory truth.

## Readiness evidence

Ready only when the runtime agrees with this contract, all ten module surfaces are implemented or explicitly empty by contract, dependencies/configuration are validated, project and actor checks run at invocation, and deterministic contract tests prove money precision, revision/idempotency behavior, snapshot stability, events, migrations, and React SDK exports.
