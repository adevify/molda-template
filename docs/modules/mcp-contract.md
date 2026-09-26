# Module MCP declaration contract

## Status

Target declaration migration required before runtime module implementation.

The currently published `@molda-org/module-contracts` declaration defines ten reusable surfaces but does not yet contain
an `mcp` property. That absence must not be interpreted as permission to infer tools from API routes. The next compatible
contract revision must add the explicit surface below, update every module declaration, republish the `next` catalog, and
update template tests before module runtimes are implemented.

## Target declarations

```ts
export interface ModuleMcpToolContract {
  readonly id: string;
  readonly operationId: string;
  readonly description: string;
  readonly inputSchemaId: string;
  readonly outputSchemaId: string;
  readonly permissionScopes: readonly string[];
  readonly effect: "read" | "write";
  readonly confirmation: "never" | "policy" | "always";
  readonly idempotency: "not-applicable" | "optional" | "required";
  readonly receipt: "none" | "summary" | "reversible-when-safe" | "compensation-only";
}

export interface ModuleMcpContract {
  readonly tools: readonly ModuleMcpToolContract[];
}

export type MoldaModuleDefinition<TShape extends MoldaModuleShape> = {
  // Existing ten surfaces remain unchanged.
  readonly mcp: ModuleMcpContract;
};
```

Tool IDs are globally stable and namespaced: `module.<module-id>.<tool-id>`. `operationId` refers to an owned module
service operation; it is not an arbitrary router path or function name. Input/output schema IDs refer to exported module
schemas. The common MCP runtime injects project, actor, session, services, audit, and receipt context outside tool input.

## Exposure and discovery

- `startProject.modules` selects module definitions; selection alone does not bypass project/actor authorization.
- Common MCP `tools/list` includes only tools explicitly present in selected modules' `mcp.tools`, enabled by project
  configuration, and permitted for the current session.
- An ordinary module/project tRPC router is never reflected into MCP.
- Composer queries/mutations retain their own `composer.*` tool identity. Generic structural data operations retain their
  own `projectData.*` identity.
- If a Composer definition intentionally wraps a module operation, metadata should link the shared `operationId` so
  Studio can prefer the reusable project-specific capability without treating the two registrations as unrelated work.

## Mutation requirements

Every write tool validates input, authorizes execution, requires the declared idempotency/confirmation policy, and emits
an operation receipt. `reversible-when-safe` means conditional revert only while affected records still match the
receipt's post-change versions. Externally observed effects such as payment capture, notification delivery, ticket scan,
or file download use `compensation-only` or non-reversible evidence; they are never falsely described as reversible.

## Empty MCP configuration

A module may declare `tools: []` only when its specification explains why its capabilities remain API/Composer-only.
The field is still required so absence cannot mean “reflect all routes” or “not reviewed.”

## Validation and tests

Contract tests must reject duplicate/global tool IDs, unknown operation/schema/permission references, write tools without
receipt/idempotency policy, invalid confirmation/effect combinations, and any declaration/runtime mismatch. Discovery
tests cover selected/unselected modules, project/actor permissions, disabled tools, session expiry, and ordinary-router
absence.
