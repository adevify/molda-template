# Common MCP context and exposure

## Responsibility

Defines project-scoped tool discovery and invocation for the Studio LLM through one common MCP service.

## Non-responsibility

Common MCP is not a raw database console, a mirror of project API routers, or the Studio's saved Composer UI catalog.

## Required rules

All project MCP invocations resolve one common context containing the project, actor, and session:

```ts
type McpContext = {
  project: ProjectScope;
  actor: ActorScope;
  session: SessionScope;
};
```

The runtime derives these values from authenticated transport/session state. Tool input must not be allowed to substitute a different project, actor, or session. Reject missing, expired, mismatched, or unauthorized context before performing work.

Studio mints a new short-lived operation session for each owner LLM turn or direct Composer invocation. The session is
bound to the authenticated owner/actor, one project, allowed capabilities, issuance/expiry, and a trace identifier.
Reusing a transport connection must not reuse authority from a previous turn. Direct Composer API calls carry the same
operation session identifier so their receipts, evidence, and revert operations join the same auditable interaction.

### Exposure rules

- API routes remain API routes and are never automatically exposed as MCP tools.
- A selected module may contribute a tool only when its MCP contract explicitly declares it for exposure and the project configuration enables it.
- `tools/list` returns the authorized union of project Composer queries/mutations, explicitly exposed MCP tools from
  selected modules, and generic project-scoped structural data tools. Preserve each tool's source metadata.
- `resources/list` is reserved for real project resources exposed by explicit contracts; it does not mirror Composer
  queries.
- `prompts/list` is reserved for deliberately authored reusable prompt templates; it does not mirror Composer queries or
  mutations.
- Generic data tools obey [`structural-data-tools.md`](./structural-data-tools.md); their apparent generality never permits
  a caller-selected database, collection, raw operator, pipeline, or command.
- Tool discovery is not authorization. Recheck actor permissions and resource scope on every call.

### Tool contract

Every exposed tool declares a stable name, purpose, input and output schemas, required permissions, side-effect classification, and error behavior. Mutations also declare idempotency requirements and produce a mutation receipt. Errors must not reveal other projects' existence or private data.

Never accept raw database selectors, collection names, filesystem paths, credentials, or caller-asserted identity as a substitute for validated scoped parameters. Apply rate/size limits and audit consequential operations. MCP transport/session tokens are secrets: do not log them or return them in tool results.

## Limitations

The generic data surface supports only allowlisted structural operations and schemas. Tool discovery does not grant
authorization, and a session cannot outlive or widen the identity/project grant from which it was issued.

## Correct example

```text
tools/list(session)
  = authorized composer queries/mutations
  + explicit MCP tools from selected modules
  + generic scoped structural data tools
```

Every listed tool retains source, permissions, side-effect classification, and input/output schemas.

## Avoid

- Returning all tools for every project or trusting a project identifier in tool arguments.
- Mirroring Composer operations into `prompts/list` or query definitions into `resources/list`.
- Offering raw MongoDB filters, aggregation source, collection selection, or commands.

## Verification

Test token expiry/signature/audience, project and actor isolation, per-call authorization, tool-source filtering,
schema validation, bounded work, mutation receipts/revert, and the absence of registered ordinary routers from
`tools/list`.
