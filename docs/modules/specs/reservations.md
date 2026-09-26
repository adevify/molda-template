# Reservations module specification

## Identity

- Package and ID: `@molda-org/reservations` / `reservations`.
- Stage: `initial`.
- Category: `operations`.
- Purpose (declaration exact): “Reservation lifecycle, recurrence, capacity, waitlists, deposits, and reminders.”
- Declared actions: `createReservation`, `confirmReservation`, `rescheduleReservation`, `cancelReservation`, `markNoShow`.
- Declared views: `todaysReservations`, `availableSlots`, `cancelledReservations`, `customerReservationHistory`.
- Declared React hooks: `useReservations`, `useCreateReservation`, `useCancelReservation`.

## Responsibility

Owns reservation lifecycle records, party or quantity, reserved interval, capacity commitment, and reservation status transitions. It may coordinate with availability and notification services only through explicit contracts.

## Non-responsibility

Does not own general calendar rules, ticket issuance/admission, rental agreements, payment execution, or service-job state. It is distinct from scheduling: this module owns confirmed commitments; scheduling calculates availability and does not own reservations.

## Dependencies and ownership

Depends on core project scope; customer references are optional typed references, not copied customer profiles. Availability/capacity providers are explicit collaborators. A single approved owner must be authoritative for each capacity dimension; do not maintain independently authoritative copies in scheduling and reservations. Payments, reminders, and waitlist delivery require explicit integrations.

## Data model

Target entities: `Reservation`, `ReservationOccurrence`, `ReservationCapacityAllocation`, and `ReservationIdempotencyRecord`. Reservation fields include project-scoped ID, optional customer reference, resource/experience reference, party size, start/end instants, status, revision, and timestamps. Recurrence stores a bounded rule plus zone and exception dates; occurrences are materialized/queried deterministically. Allocation records identify the capacity owner and commitment reference. Deposits are references to payment contracts, never payment credentials.

## API

Versioned service operations: `reservations.create({ projectId, customerId?, resourceRef, startAt, endAt, partySize, idempotencyKey }) -> { reservation, receipt }`; `confirm({ projectId, reservationId, expectedRevision, idempotencyKey })`; `reschedule({ projectId, reservationId, expectedRevision, startAt, endAt, idempotencyKey })`; `cancel({ projectId, reservationId, expectedRevision, reasonCode, idempotencyKey })`; `markNoShow({ projectId, reservationId, expectedRevision, idempotencyKey })`. Each mutation returns the updated reservation and receipt or a stable typed conflict/not-found/invalid/forbidden result. Availability lookup is a query through the selected capacity/availability owner, not an undeclared alternate write path.

## Validation and invariants

Require valid ordered intervals, positive party size, allowed recurrence bounds, and a unique project-scoped idempotency key for retryable creation. Capacity check plus commitment must use an atomic owner contract. Enforce configured confirmation, cancellation, reschedule, deposit, and no-show transition rules. Reject stale revisions and impossible transitions. Retries return the original result; do not create duplicate reservations or allocations.

## Permissions

Authorize project-scoped create/read/update/cancel and staff-only confirmation/no-show according to policy. Customer self-service must bind the reservation to the authenticated customer identity from trusted context. Field-level limits protect guest/contact and deposit details. Recheck authorization on every API, Composer, or MCP invocation.

## Events

Emit versioned facts after accepted changes, including `reservations.created.v1`, `reservations.confirmed.v1`, `reservations.rescheduled.v1`, `reservations.cancelled.v1`, and `reservations.no-show-marked.v1`. Include reservation ID, revision, project scope, and necessary references only. Consumers are idempotent; reminders are delayed work owned by an explicit notification/queue integration, not event semantics by themselves.

## Journal actions and views

Actions are exactly `createReservation`, `confirmReservation`, `rescheduleReservation`, `cancelReservation`, and `markNoShow`. Creation, confirmation, rescheduling, and cancellation require appropriate confirmation/idempotency policy and receipts; conditional revert must recheck current revision and capacity feasibility. Views are exactly `todaysReservations`, `availableSlots`, `cancelledReservations`, and `customerReservationHistory`; every view applies source authorization and field scope.

## Composer and MCP

Composer can offer typed reservation queries and mutations with confirmation for consequential changes. HTTP/API operations do not become MCP tools automatically. Explicit module MCP tools need approved schemas, permissions, side-effect classification, idempotency, and project enablement. Generic structural tools may inspect registered reservation data within owner policy but cannot bypass capacity services, issue raw writes, or expose unrestricted personal fields.

## Migrations

Version reservation status, interval, recurrence, and allocation schemas. Upgrades preserve occurrence identity and commitment references; checkpoint before irreversible recurrence expansion or status remapping. Downgrade only where lossless, with explicit unsupported result otherwise.

## Tests and fixtures

Use synthetic reservations and capacities. Test exact declared unions; valid transition paths; unauthorized and cross-project access; atomic capacity races via a controlled owner contract; recurrence/time-zone boundaries; idempotent retries; stale revisions; cancellation policy; and conditional revert refusal after later changes. Do not assert fabricated real-world customer details.

## React SDK

Export `useReservations`, `useCreateReservation`, and `useCancelReservation` with typed schemas, receipts, pending/error states, project-scoped cache keys, and invalidation after accepted mutations. Forms expose recurrence and time-zone constraints; no client-side check substitutes for server capacity authorization.

## Limitations

External calendar holds, deposit collection, reminders, waitlist fulfillment, and atomicity across independent providers require explicit contracts and reconciliation. A scheduling availability result alone is not a reservation.

## Correct example

```ts
await reservations.create({
  projectId: context.project.id,
  resourceRef: input.resourceRef,
  startAt: input.startAt,
  endAt: input.endAt,
  partySize: input.partySize,
  idempotencyKey: context.operationId,
});
```

## Avoid

Do not reserve by writing a scheduling block directly, duplicate capacity authority, accept client-asserted customer/project identity, or treat notification delivery as proof of confirmation.

## Readiness evidence

Runtime definition matches the declaration and includes all ten surfaces. Contract tests demonstrate transition, authorization, atomic capacity coordination, idempotency, event, migration, fixture, and SDK guarantees without owning scheduling rules.
