# Composer and MCP

Keep three interfaces distinct: Composer queries that retrieve information,
Composer mutations that request an authorized change, and MCP tools that expose
explicit capabilities to an MCP client. MCP tool exposure is an additional adapter;
it is not implied by adding a tRPC route.

## Correct

```ts
const composer = {
  queries: {
    findRecord: (input: FindRecordInput) => recordService.find(input),
  },
  mutations: {
    updateRecord: (input: UpdateRecordInput) => recordService.update(input),
  },
};

const commonMcpTools = composeToolManifest({
  composer,
  selectedModuleTools,
  genericProjectDataTools,
});
```

This is an illustrative split, not a claim about a framework-specific Composer or MCP
API. The owner-facing Composer catalog still contains only `composer.queries` and
`composer.mutations`; the common MCP manifest is the authorized union used by the
Studio LLM. Validate inputs, derive actor/project/session from trusted context, enforce
authorization and scope in the service, and expose only approved capabilities.

## Avoid

```ts
// Treat every API endpoint as an MCP tool and allow arbitrary operation dispatch.
executeTool({ name: request.name, input: request.body });
```

Unrestricted dispatch leaks capabilities and bypasses input, actor, and authorization
checks. Generic structural data tools must be validated and bounded; they must not
accept raw database selectors, commands, or caller-selected databases/collections.
