# MongoDB repository

MongoDB is an external persistence service. Repository methods are owned by the data
model or service boundary, validate identifiers and scope, and return domain-level
results. The exact collection and indexes belong to the approved architecture.

## Correct

```ts
class RecordRepository {
  constructor(
    private readonly projectId: ProjectId,
    private readonly collection: Collection<RecordDocument>,
  ) {}

  async findById(input: { recordId: string }) {
    const recordId = parseRecordId(input.recordId);
    return this.collection.findOne({ _id: recordId, projectId: this.projectId });
  }
}
```

The snippet is schematic. Reuse the shared contract/schema for the record shape,
compose only persistence-specific fields locally, keep collection/index configuration
in persistence, and construct the repository with project scope resolved from trusted
server context. Apply actor authorization before exposing a result.

## Avoid

```ts
async function loadRecord(id: string) {
  return db.collection("records").findOne({ _id: id });
}
```

This has no validation, no project boundary, and a global database dependency. A
repository does not replace authorization, service rules, or an agreed data model.
