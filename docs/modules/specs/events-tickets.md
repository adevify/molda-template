# Events and tickets module specification

## Identity

- Package and ID: `@molda-org/events-tickets` / `events-tickets`.
- Stage: `phase-two`.
- Category: `operations`.
- Purpose (declaration exact): “Events, capacity, ticket types, registration, admission, and attendance.”
- Declared actions: `createEvent`, `issueTicket`, `cancelTicket`, `checkInTicket`.
- Declared views: `upcomingEvents`, `ticketSales`, `attendance`.
- Declared React hooks: `useEvents`, `useTickets`.

## Responsibility

Owns event occurrences, ticket types/capacity, issued ticket records, cancellation, admission check-in, and attendance state.

## Non-responsibility

Does not own event discovery content, payment processing, or general appointment scheduling. This domain module is distinct from the platform `EventsModule`, which publishes/consumes typed project events and schedules delayed work; the platform module is not an event catalog or ticket authority.

## Dependencies and ownership

Depends on core. Customer and payment references are optional explicit contracts. This module owns ticket allocation and admission; payment state remains with payments, and content/promotion remain with their respective owners. Do not infer ticket payment or event publication from an event record.

## Data model

Target entities: `EventOccurrence`, `TicketType`, `Ticket`, and `AdmissionRecord`. Occurrences include project-scoped IDs, start/end instants, zone context, status and revision. Ticket types define bounded capacity and sale/issue policy. Tickets have opaque stable identifiers, occurrence/type references, status, issuance idempotency key, and optional customer/payment references. Admission records bind one successful scan/check-in to ticket, time, and authorized actor/device reference.

## API

Versioned operations: `eventsTickets.createEvent({ projectId, occurrence, ticketTypes, idempotencyKey }) -> { event, receipt }`; `issueTicket({ projectId, occurrenceId, ticketTypeId, customerId?, idempotencyKey }) -> { ticket, receipt }`; `cancelTicket({ projectId, ticketId, expectedRevision, reasonCode, idempotencyKey })`; `checkInTicket({ projectId, ticketIdentifier, idempotencyKey }) -> { admission, alreadyCheckedIn }`; and typed queries for upcoming occurrences, capacity, ticket sales, and attendance. Identifier validation and ticket redemption occur server-side.

## Validation and invariants

Validate occurrence interval, ticket type bounds, policy windows, and unique retry keys. Allocate capacity atomically; never issue beyond capacity. Ticket IDs are unguessable/opaque at the transport boundary and not treated as authorization alone. Cancellation and check-in race safely; a ticket may have at most one accepted admission, and retries return stable prior outcomes. Enforce event and ticket status transitions.

## Permissions

Separate event management, ticket issuance/cancellation, sales summary, and admission scopes. Check project scope and actor permission on each operation. Limit personal and payment reference visibility. Check-in clients must authenticate and have event-specific admission authority; possession of a QR/string alone is insufficient.

## Events

Emit domain facts such as `events-tickets.occurrence-created.v1`, `events-tickets.ticket-issued.v1`, `events-tickets.ticket-cancelled.v1`, and `events-tickets.ticket-checked-in.v1`, with IDs, revisions, and minimal references. These are payloads carried by the platform `EventsModule` when configured; do not conflate producer/consumer infrastructure with this domain. Duplicate delivery must be safe.

## Journal actions and views

Actions are exactly `createEvent`, `issueTicket`, `cancelTicket`, and `checkInTicket`. Ticket issuance, cancellation, and admission require explicit authorization, idempotency and receipts; check-in is not reversibly erased without a compensating audited action. Views are exactly `upcomingEvents`, `ticketSales`, and `attendance`, with aggregation and row access governed by policy.

## Composer and MCP

Composer may expose typed event/ticket queries and authorized mutations, with confirmation for issuance/cancellation where policy requires it. Normal API routes remain separate. Explicit module MCP tools are opt-in capabilities with schema, permission, side-effect classification and project enablement; platform event publication is not itself an MCP tool. Generic structural tools stay bounded and cannot mint/check in tickets or access raw identifiers outside policy.

## Migrations

Version occurrence, ticket type, ticket and admission schemas. Preserve unique ticket identity and admission history. Checkpoint before irreversible status transformations; downgrade only if capacity/admission invariants remain intact.

## Tests and fixtures

Use synthetic event occurrences and tickets. Test exact declaration unions; concurrent capacity exhaustion; issue/cancel/check-in idempotency; duplicate scan behavior; unauthorized admission; project isolation; time boundaries; payment-reference redaction; and event schema versioning. Do not generate purported customer or sales facts.

## React SDK

Export `useEvents` and `useTickets` with typed query results and status mutation contracts. Keep ticket identifiers out of logs and unnecessary caches; invalidate attendance and capacity views after accepted changes. No UI or QR format provides security in place of server validation.

## Limitations

Secure QR generation, scanner hardware, payment settlement, ticket transfer, content publication, and external event discovery are not implied. Domain events require the platform event infrastructure contract.

## Correct example

```ts
const issued = await eventsTickets.issueTicket({
  projectId: context.project.id,
  occurrenceId: input.occurrenceId,
  ticketTypeId: input.ticketTypeId,
  idempotencyKey: context.operationId,
});
```

## Avoid

Do not use the platform `EventsModule` as ticket storage, assume payment success from issuance, permit duplicate admission, or expose ticket issuance merely because an API router exists.

## Readiness evidence

Runtime contract matches declaration and all ten surfaces exist. Tests establish distinct platform/domain event roles, capacity safety, unique admission, authorization, retry behavior, migration preservation, and exact SDK exports.
