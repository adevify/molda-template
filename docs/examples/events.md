# Events

An event records a fact that has already occurred. Publish it after the owning service
successfully commits the change, with a stable name, version, identifier, and the
minimum payload needed by subscribers. Events are not commands and do not authorize
the action that produced them.

## Correct

```ts
type RecordUpdatedV1 = {
  readonly type: "record.updated.v1";
  readonly eventId: string;
  readonly occurredAt: string;
  readonly recordId: string;
};

async function updateRecord(input: UpdateRecordInput) {
  return unitOfWork.commit(async ({ records, outbox }) => {
    const record = await records.update(input);
    await outbox.add({
      type: "record.updated.v1",
      eventId: input.operationId,
      occurredAt: clock.now().toISOString(),
      recordId: record.id,
    } satisfies RecordUpdatedV1);
    return record;
  });
}
```

The platform queue later drains the durable outbox and may deliver more than once, so
the handler remains idempotent. If the selected database cannot make the domain change
and outbox record atomic, the architecture must define an equivalent recovery protocol.

## Avoid

```ts
await eventPublisher.publish({ type: "update", payload: request.body });
```

This vague, unversioned payload can contain unvalidated input rather than a committed
fact. Do not emit success events before the operation has succeeded, and do not include
secrets or unnecessary personal data.
