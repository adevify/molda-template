# Payments Module Specification

## Identity

- Package: `@molda-org/payments`
- ID: `payments`
- Stage: `initial`
- Category: `commerce`
- Purpose: `Charges, deposits, cash on delivery, refunds, reconciliation, webhooks, and receipts.`
- Declared actions: `createPayment`, `capturePayment`, `refundPayment`, `reconcilePayment`
- Declared views: `payments`, `refunds`, `reconciliation`
- Declared React hooks: `useCreatePayment`, `usePaymentStatus`, `useRefundPayment`

The identity values above match the declaration. Data/API shapes below are normative targets for a future runtime, not existing declaration exports.

## Responsibility

Own payment intents/attempts, provider references, captures, refunds, reconciliation state, and payment receipts. Provide an adapter seam for provider-specific calls and authenticated provider callbacks while keeping provider facts distinct from order policy.

## Non-responsibility

Does not own order lifecycle, accounting ledger truth, customer identity, raw card credentials, or guarantee settlement. It does not decide whether an order should be fulfilled. Provider webhooks alone do not authorize unrelated order transitions.

## Dependencies and ownership

- Depends on `core`; orders and quotes may integrate through explicit contracts.
- Owns `PaymentIntent`, `PaymentAttempt`, `Refund`, provider callback dedupe records, and reconciliation entries.
- Provider adapters own communication details; this module owns validated normalized payment state. Orders/quotes own their state and retain payment references, not payment records.
- Order creation and payment execution cross transaction boundaries. Use a durable operation/saga identity, independently idempotent provider calls, explicit pending/failure states, and reconciliation/compensation. Never promise a distributed atomic transaction.

## Data model

Target entities and schemas:

- `PaymentIntent` / `payments.intent.v1`: `{ id, projectId, subjectType, subjectId, purpose, amountMinor, currency, status, provider, providerIntentId?, idempotencyKey, revision, createdAt }`.
- `PaymentAttempt` / `payments.attempt.v1`: `{ id, projectId, intentId, providerReference?, amountMinor, currency, status, requestedAt, settledAt?, providerEventIds[] }`.
- `Refund` / `payments.refund.v1`: `{ id, projectId, intentId, providerRefundId?, amountMinor, currency, reasonCode?, idempotencyKey, status, revision, createdAt }`.
- `ReconciliationEntry` / `payments.reconciliation.v1`: `{ id, projectId, provider, externalReference, observedStatus, matchedPaymentId?, outcome, observedAt, resolvedAt? }`.
- Money is integer minor units plus ISO 4217 currency; amount and currency are immutable per intent/refund. A refund cannot exceed captured, unrefunded amount in the same currency.
- Never persist PAN, CVV, track data, provider secret, or raw payment credential. Store only approved opaque token/reference and minimized provider metadata.

## API

Versioned target operations:

- `payments.createPayment(input) -> { intent, receipt }`, requiring subject reference, amount, currency, provider selection permitted by server policy, and idempotency key.
- `payments.capturePayment(input) -> { attempt, receipt }`, with intent/revision and capture idempotency identity.
- `payments.refundPayment(input) -> { refund, receipt }`, with amount/currency, reason code, and required idempotency key.
- `payments.reconcilePayment(input) -> { entry, receipt }`, using an authorized provider observation/reference; this does not accept caller-asserted settlement as truth.
- Queries return authorized projections for `payments`, `refunds`, and `reconciliation`.

API routes do not imply Composer or MCP exposure. Provider callbacks enter through an authenticated adapter boundary, not a public generic mutation operation.

## Validation and invariants

- Validate supported currencies, positive integer minor-unit amounts, same-currency capture/refund, amount limits, valid transitions, and owner/project references.
- Require idempotency keys for all retryable money-moving provider calls. Key scope includes project, actor or trusted system identity, and operation; equivalent retries return the original operation result, differing request reuse conflicts.
- Authenticate and verify provider callback signatures, audience/endpoint binding, timestamp/replay policy, and payload schema before processing. Dedupe stable provider event IDs and make callback processing safe for out-of-order/repeated delivery.
- Provider callback content is evidence, not authority for a different project or payment; match against server-owned provider and intent references. Do not mark captured/settled from unverified input.
- Record immutable amount/currency, provider references and status history. Reconcile mismatches explicitly; do not silently overwrite a terminal state.
- Payment success and order fulfillment are separate facts. Notify the order owner through an event/contract and let it authorize its own transition.

## Permissions

Derive project, actor, provider configuration, and callback trust from authenticated runtime context. Authorize payment creation/capture/refund/reconciliation per role and associated subject. Restrict refund limits and require stronger permission or confirmation for consequential refunds. Redact credentials and sensitive provider payloads in logs, receipts, events, and views.

## Events

Emit versioned project-scoped events only for verified accepted state transitions, for example `payments.intent-created.v1`, `payments.captured.v1`, `payments.refunded.v1`, and `payments.reconciliation-needed.v1`. Include operation/event IDs, payment/refund IDs, amountMinor/currency, normalized status, and occurrence time; omit secrets and raw callback bodies. Outbox publication should align with accepted local state. Consumers are at-least-once and deduplicate. A payment event is not an order mutation.

## Journal actions and views

- Actions, exactly as declared: `createPayment`, `capturePayment`, `refundPayment`, `reconcilePayment`.
- Views, exactly as declared: `payments`, `refunds`, `reconciliation`.
- Always require explicit confirmation for capture/refund when invoked interactively. Use receipts with operation identity, amount/currency, affected IDs, provider status, and safe evidence reference; conditional revert cannot reverse provider settlement, so it must be modeled as a compensating refund or correction.

## Composer and MCP

Composer may expose bounded authorized payment/refund/reconciliation queries and explicitly configured mutations. Money-moving operations require confirmation, idempotency, narrow input/output schemas, and a receipt; never expose secret provider configuration or raw callbacks.

The declaration does not authorize module-specific MCP tools. Such tools require a separate explicit MCP contract and project enablement, with the same permission and idempotency rules. Generic structural tools may read allowlisted redacted projections only. They must not create/capture/refund/reconcile payment state by bypassing the payment service. Registered API routes never become MCP automatically.

## Migrations

Preserve immutable amount/currency and provider references, idempotency records, callback dedupe history, and refund totals. Schema upgrades must be replay-safe and resumable. Checkpoint before irreversible transformations. Downgrades are safe only if no money precision/status evidence is lost; never drop dedupe records while provider retries remain possible.

## Tests and fixtures

Use synthetic provider adapter fixtures with no live credentials or invented customer/payment facts. Cover money precision/currency, partial and excessive refunds, same-key retry and conflicting reuse, provider signature/replay rejection, duplicate/out-of-order callbacks, redaction, provider timeouts, reconciliation mismatch, event deduplication, authorization, and the payment/order separation boundary.

## React SDK

Provide typed clients, validators, forms, and headless component contracts for `useCreatePayment`, `usePaymentStatus`, and `useRefundPayment`. Never collect raw card data in these hooks unless a separately approved provider-hosted/tokenized field contract requires it; use injected provider-safe UI bindings. Keep secrets and provider callback handling server-side.

## Limitations

Declarations and this specification do not provide PCI compliance, provider availability, chargeback handling, settlement guarantees, or distributed atomicity. Provider-specific capabilities and regulatory obligations require explicit adapter and deployment review.

## Correct example

```ts
await payments.refundPayment({
  intentId,
  amountMinor,
  currency,
  reasonCode,
  idempotencyKey,
});
```

The service checks captured refundable balance and provider policy, invokes the provider idempotently, and records a receipt before notifying other owners.

## Avoid

```ts
await payments.refundPayment({ intentId, amount: 12.5, cardNumber, projectId });
```

Do not use floating-point amounts, accept card credentials or caller-selected project authority, trust unsigned callbacks, or interpret a payment event as proof an order may be fulfilled.

## Readiness evidence

Require runtime/declaration agreement, explicit provider configuration failure, project/actor authorization, redaction, authenticated callback verification and dedupe, idempotent money-moving calls, correct integer currency arithmetic, safe migrations, reconciliation evidence, and contract tests for all ten surfaces and React SDK exports.
