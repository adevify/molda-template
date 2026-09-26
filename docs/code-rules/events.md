# Events and delayed work

## Responsibility

`EventsModule` publishes and consumes typed project events and schedules delayed work through the platform delayed queue. It does not require a separate per-project queue implementation.

## Non-responsibility

Events do not replace synchronous domain validation, authorize an actor, or guarantee exactly-once delivery.

## Required rules

### Event contract

Each event has a stable type/version, event identifier, project scope, occurrence time, and schema-validated payload. Producers publish only after the owning domain operation has been accepted. Consumers validate the version and payload and recheck project/actor authority before acting on protected resources.

### Delayed queue behavior

Delayed jobs are durable platform queue entries with a due time, handler key/version, project scope, validated payload, and deduplication identity. Queue delivery is at least once: handlers must be safe under retries. Use bounded retry with backoff for transient failures; terminal failures become inspectable dead-letter records with safe diagnostics. Do not retry permanent validation or authorization failures without a relevant state change.

Deduplicate enqueue requests by stable project-scoped idempotency key. Consumers also guard their side effects against duplicate delivery; queue dedupe alone is insufficient. Rescheduling/cancellation must use ownership checks and preserve auditability.

## Limitations

Events are facts, not arbitrary commands. Do not put secrets or unnecessary personal data in payloads. Do not rely on in-process timers for work that must survive restart. Queue workers must not accept an event's claimed actor as proof of current authorization. Define retention and payload minimization with the project data policy.

## Correct example

```ts
await events.dispatch({
  type: "record.updated.v1",
  payload: RecordUpdatedPayload.parse({ recordId, version }),
  idempotencyKey: operationId,
  availableAt,
});
```

Dispatch occurs through the platform queue after the owning change is accepted, using an outbox/equivalent when the
approved consistency boundary requires atomic persistence and publication.

## Avoid

- In-process timers for durable delayed work.
- Unversioned names such as `updated` or entire request/database documents as payloads.
- Assuming queue deduplication alone makes a non-idempotent handler safe.

## Verification

Test schema/version rejection, immediate and delayed availability, duplicate delivery, handler idempotency, lease
recovery, bounded retries/backoff, dead letters, cancellation/rescheduling authorization, and project isolation.
