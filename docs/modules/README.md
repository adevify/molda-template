# Module documentation

Modules are optional, explicitly selected domain capabilities. The declarations installed from `@molda-org/*` are type information; they do not provide runnable implementations. Select modules only in the approved architecture phase.

Read [the catalog](catalog.md) to compare responsibilities and constraints, then load only the selected modules from the
[individual specification index](./specs/README.md). [`manifest.json`](./manifest.json) binds exact declaration metadata
to those specifications. For shared runtime implementation requirements, use
[module authoring](../code-rules/module-authoring.md). Project composition, Composer discovery, MCP exposure, and events
are specified in their respective code rules.

The published shared declaration currently lacks an explicit MCP field. The required versioned evolution is specified in
[`mcp-contract.md`](./mcp-contract.md); do not infer module tools from API routers while that migration is pending.
The explicit candidate operations and token-conscious discovery policy are fixed in
[`mcp-tool-plan.md`](./mcp-tool-plan.md).

## Selection rules

- Select only capabilities supported by the accepted project requirements.
- Include declared dependencies and validate dependency versions/configuration as part of composition.
- A module owns its entities and behavior. Cross-module collaboration uses published contracts.
- Module selection does not automatically expose APIs as MCP tools, grant permissions, or create a UI.
- Do not implement or configure modules before design approval and the architecture gate in `CODER.md`.

The catalog summarizes the 20 domain declaration packages in this template. `@molda-org/module-contracts` is the shared contract foundation and is not counted as a domain module.
