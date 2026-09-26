# Quotes Custom Orders Module Specification

## Identity

- Package: `@molda-org/quotes-custom-orders`
- ID: `quotes-custom-orders`
- Stage: `phase-two`
- Category: `operations`
- Purpose: `Requests, requirements, estimates, quotes, revisions, approval, deposits, and delivery.`
- Declared actions: `requestQuote`, `reviseQuote`, `acceptQuote`, `approveDeliverable`
- Declared views: `quoteRequests`, `activeCustomOrders`, `awaitingApproval`
- Declared React hooks: `useQuoteRequest`, `useCustomOrder`

These metadata values match the declaration. The contracts below specify deterministic target shapes without asserting runtime package contents.

## Responsibility

Own quote requests and requirements, estimates and immutable quote revisions, customer acceptance, custom-order specification, and deliverable approval records. Provide an explicit conversion seam for an accepted quote to an order when both modules are selected.

## Non-responsibility

Does not own the canonical catalog, order fulfillment lifecycle, payment execution, or job scheduling. Quote acceptance alone does not charge a deposit, place an order, or schedule delivery. It does not modify a previously accepted revision when a later revision is made.

## Dependencies and ownership

- Depends on `core`, customer references, and `catalog-pricing` per the module catalog.
- `orders-fulfillment` and `payments` are explicit collaborators if selected; this package owns quote/custom-order state, not their order/payment records.
- Owns `QuoteRequest`, append-only `QuoteRevision`, `CustomOrder`, and `DeliverableApproval`.
- Accepted-quote conversion to order is a cross-module boundary: use accepted revision ID plus a stable conversion idempotency key, retain a conversion receipt, and recover/reconcile partial failure. No automatic transaction or payment is implied.

## Data model

Target entities and schemas:

- `QuoteRequest` / `quotes.request.v1`: `{ id, projectId, customerId?, requirements, status, currentRevision, revision, createdAt }`.
- `QuoteRevision` / `quotes.revision.v1`: `{ id, projectId, requestId, revisionNumber, lines[], totals, currency, validity, terms, status, createdAt, authoredBy }`.
- Quote line: `{ lineId, catalogItemId?, titleSnapshot, specificationSnapshot, quantity, unitAmountMinor, lineAmountMinor, currency, sourcePriceId?, sourcePriceRevision? }`.
- `CustomOrder` / `quotes.custom-order.v1`: `{ id, projectId, requestId, acceptedRevisionId, status, orderReference?, deliveryReferences[], revision }`.
- `DeliverableApproval` / `quotes.deliverable-approval.v1`: `{ id, projectId, customOrderId, deliverableReference, status, actorReference, decisionAt, revision }`.
- All committed money uses integer minor units and explicit ISO currency; a quote revision has one currency and immutable line/total snapshots, expiry/validity, and terms. A changed estimate creates a new revision. No floating-point money.

## API

Target versioned operations:

- `quotes.requestQuote(input) -> { request, receipt }`, using requirements and customer reference with idempotency key.
- `quotes.reviseQuote(input) -> { revision, receipt }`, creating a new immutable revision rather than editing an accepted revision.
- `quotes.acceptQuote(input) -> { acceptedRevision, customOrder, receipt }`, checking revision identity, validity, customer authority, and duplicate conversion identity.
- `quotes.approveDeliverable(input) -> { approval, receipt }`, tied to an owned custom order/deliverable reference and expected revision.
- Bounded read operations back `quoteRequests`, `activeCustomOrders`, and `awaitingApproval`.

Names define target API semantics, not router names or additional declared actions. Order conversion and deposits use separately selected collaborator contracts.

## Validation and invariants

- Validate requirements and revision schemas, positive bounded quantities, line/totals arithmetic, one currency, quote validity, and project-owned references.
- Acceptance is conditional on the exact current revision and unexpired validity. Stale or expired acceptance fails without creating an order.
- Revisions are append-only; accepted revision and price snapshots do not change on later edits. Acceptance retries with the same idempotency key and revision return the original result; conflicting reuse fails.
- Prevent duplicate custom-order/order conversion for an accepted revision. Cross-module conversion records pending/succeeded/failed status and supports safe retry/reconciliation through stable identity.
- Deliverable approval is scoped to the custom order and expected revision, recorded with actor/time, and idempotent on decision identity.
- A deposit is a payment operation owned by `payments`, not proof of quote acceptance or fulfillment. Cross-module payment/order changes require explicit orchestration and compensation.

## Permissions

Derive project and actor from trusted context. Customers may submit requests and accept their own valid quotes; staff permissions control authoring/revision and delivery decisions. Enforce customer ownership and field-level access for requirements that may contain personal or confidential details. Record the approving actor and audit changes; do not accept actor identity from input.

## Events

Publish accepted versioned facts such as `quotes.requested.v1`, `quotes.revised.v1`, `quotes.accepted.v1`, and `quotes.deliverable-approved.v1`. Include project/event/operation IDs, request/revision/custom-order IDs, revision numbers, and timestamps; minimize requirements/PII. A `quotes.accepted` event does not itself charge, create a fulfillment order, or guarantee delivery. Consumers dedupe duplicate delivery.

## Journal actions and views

- Actions, exactly as declared: `requestQuote`, `reviseQuote`, `acceptQuote`, `approveDeliverable`.
- Views, exactly as declared: `quoteRequests`, `activeCustomOrders`, `awaitingApproval`.
- Acceptance and deliverable approval require explicit confirmation; show the specific revision, validity, currency, and total before acceptance. Receipts include affected revisions and conversion outcome; revert is conditional and cannot un-send a payment or erase a later decision.

## Composer and MCP

Composer may expose authorized request/quote/order reads and explicit mutations for declared actions. Acceptance must present the immutable revision and total and require confirmation; retries need idempotency. Deliverable approval must expose the target deliverable and decision consequences.

No module MCP tool is authorized by the declaration itself. Add module MCP exposure only through an explicit module contract and project enablement. Generic structural tools can read allowlisted, permission-filtered quote summaries but must not accept quotes, rewrite revisions, or approve deliverables outside this service. Project API routes are not automatically Composer or MCP capabilities.

## Migrations

Version quote/request/revision schemas. Preserve append-only revisions, validity windows, acceptance identity, actor approval records, conversion receipts, and money snapshots. A conversion or revision migration must be resumable and idempotent; checkpoint before irreversible conversion. Downgrade only when terms, money, and revision history remain lossless.

## Tests and fixtures

Use synthetic fixtures, e.g. `quote-stale-acceptance` and `accepted-revision-conversion-retry`; no invented client brief, quote amount, or deliverable facts. Cover requirement validation, revision immutability, integer amount/currency consistency, expiry/stale acceptance, authorization, duplicate/conflicting idempotency, single conversion under retry, partial order/payment integration recovery, approval audit, event dedupe, migration preservation, and React hook contracts.

## React SDK

Provide typed API client, validators, forms, and headless component contracts for `useQuoteRequest` and `useCustomOrder`. The acceptance UI consumes a server-validated revision and explicit confirmation binding; components do not calculate authority, charge deposits, or make transport calls directly.

## Limitations

Quote acceptance does not guarantee payment, inventory, order fulfillment, or delivery. This module does not define external signature capture, tax policy, or atomicity with order/payment providers; those require explicit integration contracts and a recoverable consistency plan.

## Correct example

```ts
await quotes.acceptQuote({
  requestId,
  revisionId,
  expectedRequestRevision,
  idempotencyKey,
});
```

The service accepts only that still-valid revision and records one conversion identity; order creation occurs through a separately owned, idempotent collaborator.

## Avoid

```ts
quote.currentTotal = newCatalogTotal; // mutates the revision the customer accepted
await orders.placeOrder(quote); // implicit cross-module transaction
```

Do not rewrite accepted quote amounts, treat acceptance as payment, or create duplicate orders on retry.

## Readiness evidence

Require exact declaration alignment, project/customer authorization, immutable revision/money snapshots, stale and expired acceptance checks, duplicate conversion prevention, approval audit, recoverable cross-module behavior, versioned migration safety, and deterministic tests across all ten surfaces and React SDK exports.
