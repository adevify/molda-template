# Workflow actions and audit module specification

## Identity

- Package and ID: `@molda-org/workflow-actions-audit` / `workflow-actions-audit`.
- Stage: `initial`.
- Category: `platform-core`.
- Purpose (declaration exact): “State transitions, deterministic actions, approvals, idempotency, audit, and compensation.”
- Declared actions: `executeWorkflowAction`, `approveWorkflowAction`, `compensateWorkflowAction`.
- Declared views: `workflowHistory`, `actionAuditLog`, `pendingApprovals`.
- Declared React hooks: `useExecuteAction`, `useActionAudit`.

## Responsibility

Owns explicit allowlisted action registration/dispatch metadata, approval records, execution outcomes, idempotency records, and append-only audit history. Domain modules retain authority over their own state transitions and expose typed actions through contracts.

## Non-responsibility

Does not own domain records or transitions, arbitrary code execution, dynamic scripts/evaluation, or platform queue delivery guarantees. It is not a mechanism for bypassing module services or permissions.

## Dependencies and ownership

Depends on core project scope and explicit action contracts published by participating domain modules. Domain module services perform and authorize the state change; this module records orchestration/audit metadata and calls only registered operations. The platform event/delayed queue is a separate delivery service. No direct repository access to domain modules.

## Data model

Target entities: `WorkflowActionDefinitionRef`, `WorkflowExecution`, `WorkflowApproval`, `WorkflowAuditRecord`, and `CompensationAttempt`. Definitions are stable registered IDs plus schema/version and policy reference, not executable user source. Execution stores project, operation/idempotency key, action ID/version, validated input digest or minimized safe input, actor, status, result reference, timestamps, and domain receipt. Approval binds approver, decision, reason code, and exact execution/action version. Audit records are append-only, ordered by occurrence and sequence, with redacted evidence. Compensation references the original execution and its conditional domain receipt.

## API

Versioned operations: `workflowActions.execute({ projectId, actionId, actionVersion, input, idempotencyKey }) -> { execution, receipt }`; `approve({ projectId, executionId, expectedRevision, decision, reasonCode, idempotencyKey })`; `compensate({ projectId, executionId, expectedRevision, reasonCode, idempotencyKey })`. Queries `getWorkflowHistory`, `getActionAuditLog`, and `getPendingApprovals` require typed filters/cursors. Dispatch resolves only a registered contract and calls the owning module service; no caller-selected code or arbitrary handler path.

## Validation and invariants

Allowlist action ID/version and validate against its published input schema. Recheck project/actor/action permission at execution and approval time. Idempotency key binds to action version and normalized input; same key with different input is a conflict. Approval satisfies configured separation-of-duties and binds to exact execution revision. Audit is append-only and redacts secrets. Compensation is conditional on the domain receipt and current state; record failure if it cannot safely reverse. No arbitrary code, eval, shell, or unrestricted HTTP dispatch.

## Permissions

Separate action invocation, approval, compensation, history read, and audit read scopes. Enforce project and action-specific authorization in the domain owner on every dispatch, in addition to orchestration permission. Prevent self-approval where policy requires it. Minimize input/output retained in audit; do not leak secrets or other projects' existence.

## Events

Publish versioned facts after accepted orchestration changes, such as `workflow-actions.execution-started.v1`, `workflow-actions.execution-completed.v1`, `workflow-actions.approved.v1`, `workflow-actions.compensation-recorded.v1`, and `workflow-actions.audit-appended.v1`. Queueing/delayed retries are delegated to platform event infrastructure with at-least-once-safe handlers. Event payloads use IDs/status/version and safe references, not credentials or raw sensitive inputs.

## Journal actions and views

Actions are exactly `executeWorkflowAction`, `approveWorkflowAction`, and `compensateWorkflowAction`; execution/compensation require idempotency and receipts, approval binds a decision to a revision, and all consequential changes are auditable. Revert means a new conditional compensation, never deletion of audit history. Views are exactly `workflowHistory`, `actionAuditLog`, and `pendingApprovals`, subject to actor/project/action scopes and redaction.

## Composer and MCP

Composer may list available registered actions and request typed execution/approval/compensation mutations; execution requires validation, authorization, policy confirmation, and receipt. Ordinary APIs are not automatically tools. Explicit module MCP actions require a separate allowlist, narrow schemas, permissions, bounded side-effect classification, idempotency, and project configuration. Generic structural tools cannot execute actions by modifying records and cannot be used as arbitrary code dispatch. Platform queue tools, if any, remain separately governed.

## Migrations

Version action definitions/references, execution, approval, audit, and receipt schemas. Preserve append-only audit ordering and action version identity. Checkpoint before irreversible retention or schema transformations; downgrade only if approval and receipt bindings remain verifiable.

## Tests and fixtures

Use synthetic registered action contracts. Test exact declaration unions, unknown action rejection, schema mismatch, actor/project authorization at call time, idempotency and conflicting replay, approval separation/revision binding, conditional compensation, immutable/redacted audit, duplicate queue delivery, and migration preservation. Assert there is no dynamic evaluation or arbitrary dispatch path.

## React SDK

Export `useExecuteAction` and `useActionAudit` with typed registered action inputs, execution receipts, pending approval state, and redacted audit results. Keep action selection schema-driven and project-scoped; never expose client-side execution credentials or treat UI approval as authorization.

## Limitations

Does not provide exactly-once queue semantics, arbitrary workflow authoring/code execution, distributed transactions, or automatic compensation. Each participating domain must expose a safe operation and conditional receipt; queue/retry policy belongs to platform infrastructure.

## Correct example

```ts
await workflowActions.execute({
  projectId: context.project.id,
  actionId: input.actionId,
  actionVersion: input.actionVersion,
  input: input.payload,
  idempotencyKey: context.operationId,
});
```

## Avoid

Do not evaluate user-provided code, dynamically invoke arbitrary function names/URLs, mutate domain storage directly, trust approval asserted by a prompt, or delete audit records to simulate revert.

## Readiness evidence

Runtime metadata exactly matches the declaration and all ten surfaces exist. Contract tests prove allowlisted dispatch only, domain-owner authorization, approval/idempotency/compensation safety, immutable redacted audit, queue retry tolerance, migrations, and exact React exports.
