# Transaction and consistency rules

## Responsibility

Defines atomic boundaries, optimistic concurrency, cross-service recovery, idempotency, event publication, and reversible
data-operation evidence.

## Non-responsibility

This guide does not promise distributed ACID transactions across MongoDB, object storage, payment/notification providers,
the platform queue, or the control plane.

## Required rules

- Define one authoritative owner and version for every mutable record. Use expected-version conditions for updates that
  may race.
- Commit related records atomically within one supported database transaction when required by a domain invariant.
- Persist mutation receipt/evidence in the same transaction as project-data changes in production; if the selected store
  cannot do so, architecture must define a durable recoverable protocol before implementation.
- Publish durable events through an outbox/equivalent tied to the owning commit. Consumers remain idempotent because
  delivery is at least once.
- For cross-provider workflows, use explicit state machines, idempotency keys, reconciliation, and compensating actions;
  never hide partial success.
- Create-before-destroy for releases/placements: verify destination, switch authority/routing, drain, then remove source.
- Conditional revert checks the current post-change version/value and reports conflicts without overwriting later work.

## Limitations

Compensation is not time reversal: external messages, payments, downloads, or observed effects may be irreversible.
Architecture must identify irreversible boundaries and confirmation policy.

## Correct example

```text
validate + authorize
  -> begin transaction
  -> conditional domain writes
  -> encrypted receipt/evidence + outbox record
  -> commit
  -> asynchronous at-least-once delivery
```

External provider calls use an explicit pending state and idempotent reconciliation rather than running inside an
unbounded database transaction.

## Avoid

- Updating project data and writing revert evidence in unrelated commits with no recovery protocol.
- Publishing an event before its domain change commits.
- Retrying money/provider operations without a stable idempotency key.
- Force-reverting records changed by a later operation.

## Verification

Test transaction rollback, expected-version conflicts, duplicate requests/delivery, crash boundaries, outbox recovery,
provider partial success/reconciliation, conditional revert conflicts, and create-before-destroy migration failure.
