# MongoDB rules

## Responsibility

MongoDB is the external shared project database. Server-side repositories own persistence mapping and enforce project scope for every read and write.

## Non-responsibility

MongoDB is not embedded in UI bundles or the project image, and its driver is not a client-facing API contract.

## Required rules

- Connect only from server applications using validated secrets/configuration; never expose credentials or connection strings to browsers, logs, or errors.
- Include project/tenant scope in repository operations and indexes where records are project-owned. Derive scope from trusted authenticated context rather than a free caller field.
- Validate inputs before constructing queries; use explicit projections and update allowlists to prevent operator injection and mass assignment.
- Define indexes and uniqueness constraints as reviewed architecture/migration decisions. Handle duplicate-key and transient failures safely.
- Share the external MongoDB service across a project's apps through controlled server access; do not create an isolated database per UI bundle.
- Keep a model's repository contract with that model's dedicated source file. Barrel files may re-export model files but
  must not become a second centralized home for unrelated repository declarations.
- Reuse the owning shared schema. Compose only persistence-specific fields, collection names, and indexes in the adapter.
- When transport output schemas already strip undeclared fields and names align, return the domain object; do not create
  hand-written remapping solely to remove properties.

## Limitations

Transactions, consistency, index behavior, and operational backup policy depend on the managed MongoDB deployment. No database implementation or entity creation is permitted before design approval and architecture recording.

## Correct example

```ts
interface RecordRepository {
  findById(projectId: string, id: string): Promise<RecordDocument | null>;
}

const record = await collection.findOne(
  { projectId, _id: recordId },
  { projection: { title: 1, status: 1 } },
);
```

The repository receives `projectId` from a trusted service context and includes it in the query.

## Avoid

- `collection.findOne({ _id: recordId })` for project-owned data without scope enforcement.
- Passing raw request objects into MongoDB filters or update operators.
- Creating database clients in React, exposing `MONGODB_URI`, or persisting authoritative state in container-local files.

## Verification

Use deterministic repository/service tests with an injected database boundary or controlled test database. Cover cross-project denial, allowed fields, index/duplicate behavior, and credential redaction; do not require a live shared production database.
