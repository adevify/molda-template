# Module MCP declaration contract

## Status

Declared in `@molda-org/module-contracts`; runtime module implementation remains intentionally absent.

The source declaration defines eleven reusable surfaces and requires `mcp` on every module definition. The aligned
declaration catalog is published through the `next` workflow. If a local install exposes only ten surfaces, refresh the
locked `next` dependencies; never cast around the mismatch or infer tools from API routes.

## Declaration shape

```ts
export interface ModuleMcpToolBaseContract<TOperation extends string> {
  readonly id: string;
  readonly operationId: TOperation;
  readonly description: string;
  readonly inputSchemaId: string;
  readonly outputSchemaId: string;
  readonly permissionScopes: readonly string[];
}

export interface ModuleMcpReadToolContract<TOperation extends string>
  extends ModuleMcpToolBaseContract<TOperation> {
  readonly effect: "read";
  readonly confirmation: "never";
  readonly idempotency: "not-applicable";
  readonly receipt: "none" | "summary";
}

export interface ModuleMcpWriteToolContract<TOperation extends string>
  extends ModuleMcpToolBaseContract<TOperation> {
  readonly effect: "write";
  readonly confirmation: "never" | "policy" | "always";
  readonly idempotency: "optional" | "required";
  readonly receipt: "summary" | "reversible-when-safe" | "compensation-only";
}

export interface ModuleMcpContract<TOperation extends string> {
  readonly tools: readonly (
    | ModuleMcpReadToolContract<TOperation>
    | ModuleMcpWriteToolContract<TOperation>
  )[];
}

export type MoldaModuleDefinition<TShape extends MoldaModuleShape> = {
  // Existing ten surfaces remain unchanged.
  readonly mcp: ModuleMcpContract<TShape["action"] | TShape["view"]>;
};
```

Tool IDs are globally stable and namespaced: `module.<module-id>.<tool-id>`. `operationId` is constrained to an owned
module action or view; it is not an arbitrary router path or function name. Input/output schema IDs refer to exported
module schemas. The common MCP runtime injects project, actor, session, services, audit, and receipt context outside tool
input.

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
