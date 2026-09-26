# Framework and runtime matrix

This matrix states the default Molda stack and where its exact rules live. A customer project may diverge only after
architecture approval records the reason, replacement contract, migration impact, and equivalent validation/security
evidence. Preview dependencies and versions must not be changed by a Coder run.

| Concern | Default | Phase | Normative rules |
| --- | --- | --- | --- |
| Language | TypeScript, strict project configuration | preview onward | [`typescript.md`](./code-rules/typescript.md) |
| Presentation | React with Material UI, shared components/pages | preview onward | [`react-mui.md`](./code-rules/react-mui.md) |
| Server | Node.js, version pinned by the approved build | build | [`node-runtime.md`](./code-rules/node-runtime.md) |
| Project API | tRPC with authenticated server context | build | [`trpc.md`](./code-rules/trpc.md) |
| Runtime schemas | Zod, with TypeScript types derived where practical | preview/build | [`zod-contracts.md`](./code-rules/zod-contracts.md) |
| Mutable records | External project-scoped MongoDB | build | [`mongodb.md`](./code-rules/mongodb.md) |
| Mutable files | External S3-compatible object storage | build | [`external-files.md`](./code-rules/external-files.md) |
| LLM operations | Common project/actor/session-scoped MCP | build/platform | [`common-mcp.md`](./code-rules/common-mcp.md) |
| Async work | `EventsModule` plus platform delayed queue | build/platform | [`events.md`](./code-rules/events.md) |
| Packaging | One immutable OCI/Docker image per accepted revision | release | [`docker.md`](./code-rules/docker.md) |
| Tests | TypeScript and deterministic Node contract/unit tests | every permitted phase | [`testing.md`](./code-rules/testing.md) |

Package versions must be exact and consistent across the workspace. The template lockfile is authoritative for installed
preview dependencies. Build-phase additions require an approved architecture decision, one workspace-wide version, a
lockfile update, TypeScript validation, and relevant contract tests. Do not add competing frameworks merely because a
generated example uses them elsewhere.
