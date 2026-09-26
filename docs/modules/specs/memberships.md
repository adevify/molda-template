# Memberships Module Specification

## Identity

- Package: `@molda-org/memberships`
- ID: `memberships`
- Stage: `phase-two`
- Category: `commerce`
- Purpose: `Subscriptions, session packages, validity, consumption, pause, renewal, and recurring payment.`
- Declared actions: `createMembership`, `consumeEntitlement`, `pauseMembership`, `renewMembership`
- Declared views: `activeMemberships`, `membershipUsage`, `renewals`
- Declared React hooks: `useMembership`, `useMembershipUsage`

Identity values are exact declaration metadata. Target entity/schema names in this spec are contract proposals for runtime implementation, not existing exports.

## Responsibility

Own membership plan terms, customer enrollment state, validity and pause periods, entitlement balances/consumption ledger, and renewal state. Publish eligibility/entitlement contracts for a consuming operation to check and consume.

## Non-responsibility

Does not own authentication identity, customer master records, payment processing, loyalty points, or the business action that consumes an entitlement. Payment integration is explicit; a renewal decision does not mean payment succeeded, and payment success does not by itself renew membership.

## Dependencies and ownership

- Depends on `core` and customer references.
- Payment interaction uses `payments` contracts if selected and configured; it is not required implicitly.
- Owns `MembershipPlan`, `Membership`, `EntitlementBalance`, and append-only `EntitlementTransaction` records.
- The consuming module owns its service/order/reservation action. Cross-module consumption and execution require a stable operation ID with idempotent reserve/consume/compensate steps; there is no implicit transaction between membership and the consumer.

## Data model

Target entities and schemas:

- `MembershipPlan` / `memberships.plan.v1`: `{ id, projectId, status, terms, entitlementDefinitions[], revision }`.
- `Membership` / `memberships.membership.v1`: `{ id, projectId, customerId, planId, status, startsAt, validUntil?, pausedIntervals[], renewalState, revision }`.
- Entitlement definition: `{ entitlementType, quantity?, period?, rules }`.
- `EntitlementBalance` / `memberships.entitlement-balance.v1`: `{ id, projectId, membershipId, entitlementType, availableUnits, periodStart?, periodEnd?, revision }`.
- `EntitlementTransaction` / `memberships.entitlement-transaction.v1`: `{ id, projectId, membershipId, entitlementType, deltaUnits, operationId, reason, idempotencyKey, occurredAt, resultingRevision }`.
- Periods are explicit instants with a declared timezone/calendar policy. Quantities use bounded integers or a named unit contract, never ambiguous floating point.

## API

Target versioned operations:

- `memberships.createMembership(input) -> { membership, receipt }`, requiring customer and plan references plus idempotency key.
- `memberships.consumeEntitlement(input) -> { transaction, receipt }`, requiring entitlement type, units, consuming operation reference, expected revision, and idempotency key.
- `memberships.pauseMembership(input) -> { membership, receipt }`, with expected revision and pause interval/reason.
- `memberships.renewMembership(input) -> { membership, renewal, receipt }`, with unique renewal period/operation identity and explicit payment status reference where configured.
- Read queries expose active memberships, usage, and renewal projections within authorization scope.

These target names correspond to, but do not expand, the declaration action set. Payment adapter endpoints/callbacks are a separate concern.

## Validation and invariants

- Validate plan terms, customer/project references, effective/expiry/pause intervals, entitlement units, and allowed lifecycle transitions.
- Consumption requires active and currently valid membership, non-paused applicable interval, sufficient entitlement, expected revision, and a consuming operation reference. Enforce balance decrement atomically.
- Make creation, consumption, pause, and renewal retry-safe with project-scoped idempotency. Equivalent retries return original receipts; conflicting key reuse fails.
- Derive usage from an append-only transaction ledger; never edit balances without recording a transaction. Prevent duplicate consumption for the same operation and entitlement unless policy explicitly permits multiples.
- Renewal periods cannot overlap or be renewed twice. A required recurring charge must be confirmed by the payment owner before representing paid renewal; asynchronous failure leaves renewal pending/failed and does not grant paid-period entitlements.
- Cross-module work must be recoverable; compensation is a separate audited operation and must not erase an already-consumed entitlement without explicit policy.

## Permissions

Derive project and actor from trusted context. Customers may view their own permitted plan/enrollment/usage; authorized staff manage plans, enrollment, pause, and adjustments. Protect member-only details and require explicit permission for manual entitlement correction. Consumers receive only the minimum eligibility result needed to perform their own operation.

## Events

Publish accepted, versioned events such as `memberships.created.v1`, `memberships.entitlement-consumed.v1`, `memberships.paused.v1`, and `memberships.renewed.v1`. Events carry event/operation IDs, project scope, membership/entitlement IDs, revisions, and occurrence time; do not include unnecessary customer data. Payment events are consumed as verified collaborator facts, with duplicate delivery handling; membership lifecycle remains owned here.

## Journal actions and views

- Actions, exactly as declared: `createMembership`, `consumeEntitlement`, `pauseMembership`, `renewMembership`.
- Views, exactly as declared: `activeMemberships`, `membershipUsage`, `renewals`.
- Require confirmation for enrollment, entitlement consumption, pause, and renewal. Receipts carry membership/ledger IDs and revisions. A consumed entitlement can only be compensated under policy, by an audited inverse transaction.

## Composer and MCP

Composer may register authorized membership/usage/renewal queries and explicit mutations matching the declared actions. Consumption and renewal require confirmation, idempotency identity, and clear result status, including pending payment when applicable.

This declaration supplies no module-specific MCP tools. Exposure needs an explicit module MCP contract and project enablement. Generic structural tools may read allowlisted membership summaries with field-level policy but must not consume entitlements, change membership state, or bypass ledger/lifecycle invariants. API routes are never automatically MCP tools.

## Migrations

Version plan terms and entitlement definitions. Preserve membership periods, pause intervals, idempotency records, and append-only consumption/renewal history. Any change in entitlement meaning requires a checkpoint and explicit conversion; do not silently inflate/erase balances. Downgrade only when no period or unit meaning is lost.

## Tests and fixtures

Use synthetic fixtures such as `membership-entitlement-duplicate-consume` and `renewal-payment-pending`; do not invent a real member, plan price, or renewal cadence. Cover lifecycle/date boundaries, pause semantics, entitlement atomicity and ledger derivation, idempotent duplicate/conflicting operations, duplicate renewal, payment pending/failure/success boundaries, project/customer authorization, event replay, migration preservation, and compensation policy.

## React SDK

Provide typed client, validator, form, and headless component contracts for `useMembership` and `useMembershipUsage`. Views show server-authorized validity and usage; action bindings receive explicit confirmation and pending/error states. Hooks do not charge payments or infer entitlement rights on the client.

## Limitations

This module does not execute payments or the service/order being consumed, define tax/subscription regulations, or guarantee cross-module atomicity. Recurring payment scheduling and provider retry policy require explicit collaborators and operational configuration.

## Correct example

```ts
await memberships.consumeEntitlement({
  membershipId,
  entitlementType,
  units,
  consumingOperationId,
  expectedRevision,
  idempotencyKey,
});
```

The consumer performs its own operation under the same orchestration identity and compensates according to an explicit recoverable policy if the sequence fails.

## Avoid

```ts
membership.remainingSessions -= 1; // bypasses ledger and concurrent revision check
```

Do not mutate entitlement counts directly, infer paid renewal from a requested charge, or let client state make the final eligibility decision.

## Readiness evidence

Require agreement with declarations and ten runtime surfaces, tested project/customer authorization, membership transition and time rules, ledger-derived integer entitlements, concurrency/idempotency behavior, payment separation, recoverable cross-module consumption, versioned migrations, and typed React SDK hooks.
