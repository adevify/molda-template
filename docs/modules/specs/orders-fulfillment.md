# Orders Fulfillment Module Specification

## Identity

- Package: `@molda-org/orders-fulfillment`
- ID: `orders-fulfillment`
- Stage: `initial`
- Category: `commerce`
- Purpose: `Cart, checkout, order lifecycle, pickup, delivery, tracking, and handoff.`
- Declared actions: `placeOrder`, `updateOrderStatus`, `assignFulfillment`, `confirmHandoff`
- Declared views: `orders`, `ordersByStatus`, `fulfillmentQueue`
- Declared React hooks: `useCart`, `useCheckout`, `useCustomerOrders`

These identity values are declaration-owned and must remain exact. Model details below are specification targets, not existing runtime declarations.

## Responsibility

Own cart/checkout commitment, accepted order and line snapshots, order lifecycle, fulfillment assignments, and pickup/delivery handoff records. Preserve what the customer agreed to even when catalog prices later change.

## Non-responsibility

Does not own catalog definitions, payment processing, promotion/loyalty rules, authoritative physical inventory, carrier execution, or shipment tracking provider state. It may reference those capabilities through contracts but does not reach into their repositories.

## Dependencies and ownership

- Depends on `core` and customer references; explicit collaborations may include `catalog-pricing`, `payments`, promotions, and an inventory/fulfillment adapter.
- Owns cart, order, order line snapshots, fulfillment units/assignments, and handoff evidence.
- Catalog and payment modules remain owners of current catalog and payment state respectively. An order stores external IDs and bounded snapshots, not another module's mutable records.
- Cross-module order placement, promotion redemption, stock reservation, and payment creation are not one implicit transaction. Define an orchestration boundary with idempotent steps, durable operation identity, and compensation/reconciliation before enabling a combined flow.

## Data model

Target entities and schemas:

- `Cart` / `orders.cart.v1`: `{ id, projectId, customerId?, lines[], revision, status, updatedAt }`.
- Cart line: `{ lineId, catalogItemId, variantId?, quantity, selectedOptions, priceSnapshot }`.
- `Order` / `orders.order.v1`: `{ id, projectId, customerId?, lines[], totals, currency, status, fulfillmentIds[], paymentReferences[], idempotencyKey, revision, placedAt }`.
- Order line snapshot: `{ lineId, catalogItemId, variantId?, titleSnapshot, optionsSnapshot, quantity, unitAmountMinor, lineAmountMinor, currency, sourcePriceId?, sourcePriceRevision?, taxSnapshot?, promotionReferences[] }`.
- `Fulfillment` / `orders.fulfillment.v1`: `{ id, projectId, orderId, method, status, assignment?, externalReference?, handoffAt?, revision }`.
- All money values are integer minor units with explicit currency. A single order has one currency; totals are recomputed from validated line snapshots under a declared rounding policy. Never calculate commitments from binary floating point or later live catalog reads.

## API

Versioned target operations:

- `orders.placeOrder(input) -> { order, receipt }`, accepting a validated cart/version, committed line and total snapshots, and required idempotency key.
- `orders.updateOrderStatus(input) -> { order, receipt }`, requiring expected revision and an allowed transition.
- `orders.assignFulfillment(input) -> { fulfillment, receipt }`, scoped to the owning order and expected revision.
- `orders.confirmHandoff(input) -> { fulfillment, receipt }`, with idempotent handoff identity and evidence reference.
- Bounded owner/customer queries expose `orders`, `ordersByStatus`, and `fulfillmentQueue` projections.

Names describe a specification-level API and do not establish router names or MCP exposure.

## Validation and invariants

- Validate quantity bounds, project-owned catalog references, required price/title/option snapshots, one order currency, arithmetic totals, and workflow transition rules.
- Require a project/actor-scoped idempotency key for placement and retryable handoff/provider callbacks. Same key plus equivalent normalized payload returns the original order/receipt; different payload conflicts.
- Order and accepted line snapshots are immutable. Corrections use a new audited adjustment or cancellation flow; catalog edits never rewrite them.
- Every mutation checks expected version where concurrent updates matter. A receipt records operation ID, affected IDs, before/after revisions, bounded evidence, and conditional-revert eligibility.
- Do not claim stock, discount, or payment success unless the responsible collaborator has confirmed it. Partial cross-module failure enters an inspectable pending/reconciliation state rather than fabricating atomic success.

## Permissions

Enforce project scope and actor permissions at invocation. Customers may read only their permitted orders; staff roles may manage lifecycle and fulfillment according to explicit policy. Require elevated authority for status overrides, cancellations, refunds (owned by payments), and handoff corrections. Do not trust customer/project IDs or role assertions from input.

## Events

Emit versioned facts after accepted local state changes, such as `orders.order-placed.v1`, `orders.status-updated.v1`, `orders.fulfillment-assigned.v1`, and `orders.handoff-confirmed.v1`. Include event ID, order/fulfillment IDs, revisions, project scope, and occurrence time; minimize personal data. Publish through an outbox or equivalent when atomic state/event acceptance is required. Consumers and workflow retries must deduplicate by stable operation/event identity.

## Journal actions and views

- Actions, exactly as declared: `placeOrder`, `updateOrderStatus`, `assignFulfillment`, `confirmHandoff`.
- Views, exactly as declared: `orders`, `ordersByStatus`, `fulfillmentQueue`.
- Require confirmation for placing an order, consequential status transitions, fulfillment assignment, and handoff. Return receipts suitable for inspection and only conditional revert; never erase audit history.

## Composer and MCP

Composer may expose authorized read-only order/queue queries and explicit mutations for the declared actions. Checkout/place-order mutations show the validated currency and total snapshot before confirmation; any retryable operation requires idempotency. API registration alone does not create a Composer entry.

No module-specific MCP tool is authorized by this declaration. Add one only in an explicit module MCP contract and enablement. Generic structural tools may read allowlisted order projections subject to row/field policy; they must not place orders, change lifecycle, or bypass snapshots and transition rules. Keep API, Composer, explicit module MCP, and generic structural tools as separate exposure channels.

## Migrations

Version cart, order, and fulfillment schemas independently as needed. Preserve accepted snapshots, operation keys, and lifecycle/audit history through upgrades. Reconcile or checkpoint before any irreversible transformation. Downgrade only if it preserves money amounts, currency, snapshot provenance, and state; never silently synthesize missing values.

## Tests and fixtures

Fixtures are synthetic contract fixtures, e.g. `order-placement-idempotency` and `fulfillment-stale-revision`; no invented shop, customer, product, or delivery details. Cover schemas and arithmetic/rounding, project/customer isolation, duplicate placement, conflicting key reuse, transition guards, immutable snapshots, receipt and conditional-revert conflict, duplicate callbacks/events, and cross-module partial-failure recovery.

## React SDK

Provide typed client, validators, forms, and headless component contracts for `useCart`, `useCheckout`, and `useCustomerOrders`. Checkout presentation receives validated totals and explicit action bindings; hooks do not perform direct network calls or infer fulfillment/payment authority.

## Limitations

The module does not guarantee provider payment settlement, physical stock, carrier delivery, tax compliance, promotion atomicity, or exactly-once event delivery. Those require explicit collaborator contracts and an approved consistency/reconciliation design.

## Correct example

```ts
await orders.placeOrder({
  cartId,
  expectedCartRevision,
  lines: validatedSnapshotLines,
  totals: { amountMinor, currency },
  idempotencyKey,
});
```

The service validates and stores the supplied commitment snapshot, then returns the same accepted result on an equivalent retry.

## Avoid

```ts
const total = await catalog.currentTotal(cartId); // changes accepted price on retry
await payments.capture(total); // no operation identity or consistency boundary
```

Do not recompute an accepted order from current catalog state, capture payment inside an untracked order write, or let a structural update skip lifecycle invariants.

## Readiness evidence

Require agreement between declaration and runtime across ten surfaces; deterministic tests must demonstrate snapshot immutability, exact minor-unit arithmetic, idempotent placement/callbacks, project/customer authorization, transition rules, event/outbox recovery, migration preservation, bounded views, and React SDK exports.
