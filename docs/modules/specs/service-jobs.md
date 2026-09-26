# Service jobs module specification

## Identity

- Package and ID: `@molda-org/service-jobs` / `service-jobs`.
- Stage: `phase-two`.
- Category: `operations`.
- Purpose (declaration exact): “Intake, diagnosis, approval, work execution, readiness, and delivery.”
- Declared actions: `createServiceJob`, `recordDiagnosis`, `approveServiceJob`, `completeServiceJob`.
- Declared views: `serviceQueue`, `jobsByStatus`, `readyForDelivery`.
- Declared React hooks: `useServiceJobs`, `useServiceJob`.

## Responsibility

Owns a service job's intake record, diagnosis, approval state, work progression, completion evidence, and readiness/delivery status contract.

## Non-responsibility

Does not own service catalog/pricing, employee identity, appointment scheduling, general workflow engine, or dispatch optimization. A job is not a reservation or a customer master record.

## Dependencies and ownership

Depends on core. Customer, scheduling, forms, notifications, catalog, and asset references are explicit integrations only. Service-jobs owns job state and its transitions; customer and identity data stay with their owners. No direct cross-module repository access.

## Data model

Target entities: `ServiceJob`, `DiagnosisRecord`, `JobApproval`, `JobTask`, and `CompletionEvidenceRef`. Job contains project-scoped ID, optional customer/source reference, intake summary under data policy, status, revision, assigned actor references, timestamps, and external idempotency key. Diagnosis records actor/time, structured findings/codes and revision. Tasks/checklists have stable IDs and status. Approval binds an authorized approver to a specific job revision and decision. Completion evidence references protected artifacts without copying their binary payload.

## API

Versioned operations: `serviceJobs.create({ projectId, customerRef?, sourceRef?, intake, idempotencyKey }) -> { job, receipt }`; `recordDiagnosis({ projectId, jobId, expectedRevision, diagnosis })`; `approve({ projectId, jobId, expectedRevision, decision, reasonCode })`; `complete({ projectId, jobId, expectedRevision, completionEvidence, idempotencyKey })`. Queries support queue, status, and readiness with typed filter/cursor inputs. Mutations return updated job and receipt or typed validation/conflict/permission failure.

## Validation and invariants

Validate intake and structured diagnosis schemas, legal state transitions, assignment references, approval authority, and expected revisions. Approval applies to the exact revision reviewed; changes invalidate stale approvals where policy dictates. Completion requires all required tasks/evidence and an allowed status. Idempotency prevents duplicate intake/completion from retries.

## Permissions

Define separate intake, diagnosis, assignment, approval, completion, and queue-read scopes. Approval authority must be independent where separation of duties is required. Protect customer/location and diagnostic data by field and role; derive actor/project from trusted context and reauthorize every request.

## Events

Emit versioned facts after accepted transitions, such as `service-jobs.created.v1`, `service-jobs.diagnosis-recorded.v1`, `service-jobs.approved.v1`, and `service-jobs.completed.v1`, carrying job ID, revision, and minimal state references. Consumers handle duplicate delivery and recheck current permissions before protected side effects.

## Journal actions and views

Actions are exactly `createServiceJob`, `recordDiagnosis`, `approveServiceJob`, and `completeServiceJob`. Approval/completion require explicit confirmation and revision-bound receipts; revert is a compensating action only where the current state allows it. Views are exactly `serviceQueue`, `jobsByStatus`, and `readyForDelivery`, with project, role, and field filtering applied before return.

## Composer and MCP

Composer queries expose authorized queues/details; mutations require schema-valid inputs and confirmation for approval/completion. API endpoints are not automatically MCP tools. Explicit module MCP capabilities require allowlisted operation schemas, required scopes, idempotency policy, and project enablement. Generic structural data tools can read registered fields under this module's policy but cannot make arbitrary status changes or execute workflow code.

## Migrations

Version status, diagnosis, approval, tasks, and completion evidence references. Preserve audit history and approval-to-revision binding. Checkpoint before irreversible status mapping; downgrade only without erasing accepted evidence or decisions.

## Tests and fixtures

Use synthetic jobs and actors with named roles, not customer-specific narratives. Test exact declared unions, intake validation, invalid transitions, stale approvals, role separation, project/field authorization, idempotent retries, completion prerequisites, duplicate event delivery, migration history, and redaction.

## React SDK

Export `useServiceJobs` and `useServiceJob` with typed queue/detail state and mutation-facing contract types. Invalidate affected queue/status views by project and revision. Diagnosis and approval forms derive from validators; UI gating is not server authorization.

## Limitations

Workforce credentialing, route optimization, appointment booking, external notifications, parts inventory, and delivery logistics require explicit modules/adapters. Readiness is a declared job state, not proof of physical handoff.

## Correct example

```ts
await serviceJobs.approve({
  projectId: context.project.id,
  jobId: input.jobId,
  expectedRevision: input.expectedRevision,
  decision: input.decision,
  reasonCode: input.reasonCode,
});
```

## Avoid

Do not approve stale revisions, resolve employee identity from untrusted text, mark work complete without required evidence, or use a general workflow engine as the owner of job state.

## Readiness evidence

Runtime metadata matches declaration; all ten surfaces are implemented and tested for transition, approval, evidence, permissions, idempotency, event, migration, and React contract behavior.
