# Module authoring

## Responsibility

This contract applies to future runtime implementations of the declaration packages. During preview, module selection and implementation remain prohibited by `CODER.md`; declarations may be inspected and reused as types.

## Non-responsibility

This guide does not select modules for a project, authorize preview-phase runtime work, or allow project-local copies of
module-owned types and behavior.

## Required rules

### Required package contributions

Each implemented module supplies the contracts it owns, with schemas as the validation source of truth, and the following pieces where applicable:

- input/output schemas and stable exported types;
- repositories and persistence/index declarations for module-owned data;
- API routers for ordinary HTTP/API behavior;
- explicit MCP tool declarations only for capabilities approved for MCP exposure;
- Composer queries/mutations where relevant;
- typed event producers/consumers and delayed-job handlers where relevant;
- authorization policies and project/actor/session scope checks;
- tests for schemas, domain behavior, security boundaries, idempotency/retries, and integration seams.

Repositories stay behind module services. A module does not reach into another module's repository; it depends on that module's published service/contract and declares the dependency. Persistence-only fields and indexes remain in persistence declarations. Do not duplicate a schema already provided by the shared contract or domain package.

### Cross-cutting requirements

- Validate at trust boundaries; infer TypeScript types from shared schemas where supported.
- Scope every read/write by project and authorize actor access at execution time.
- Make retryable mutations idempotent and return mutation receipts suitable for conditional revert when the operation is reversible.
- Emit events only for accepted domain changes and make consumers safe for duplicate delivery.
- Keep API, Composer, and MCP exposure distinct; no implicit route export.
- Avoid hidden startup registration, global mutable state, arbitrary query execution, and undocumented cross-module coupling.

### Package readiness

Before a module is considered runnable, its declaration contract and runtime implementation must agree, dependencies must be explicit, configuration must fail clearly when incomplete, and tests must exercise its public contracts. This document does not authorize implementation during an earlier project workflow phase.

Every runtime module must implement all ten shared contract surfaces: data model, API, validation, permissions, events,
journal actions, journal views, migrations, tests/fixtures, and React SDK. A surface may be intentionally empty only when
the declaration makes that explicit and contract tests preserve the decision. Module reuse is measured by functional
coverage and effort; the current target is 60–75% reusable module behavior, with the remainder justified as design,
configuration/glue, or unique project requirements.

## Limitations

Declaration packages contain contracts, not working persistence, routes, providers, migrations, or UI. Cross-module
transactions require an explicitly designed consistency boundary; selecting two modules does not create one.

## Correct example

```ts
export const RecordsModule = defineModule({
  id: "records",
  dependencies: [],
  dataModel,
  api,
  validation,
  permissions,
  events,
  journal,
  migrations,
  testing,
  reactSdk,
});
```

This is a structural illustration, not permission to add a new catalog module. Actual definitions must satisfy the
installed `MoldaModuleDefinition` contract and use a registered module ID.

## Avoid

- Shipping a declaration as though it were a runtime implementation.
- Omitting permissions, migrations, events, fixtures, or React SDK because the first caller does not use them.
- Letting modules import another module's persistence internals or register MCP tools implicitly from API routes.

## Verification

Contract tests must compare the runtime definition with its declaration, validate all ten surfaces, dependencies,
schemas, authorization, project isolation, migrations, idempotency/retry behavior, events, fixtures, and React SDK
exports. Run TypeScript and deterministic Node tests before publishing the package.
