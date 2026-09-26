# Examples

These references show boundaries between the preview presentation, application adapters,
shared modules, external services, and the Composer. The examples use neutral names and
types; they do not describe a real project or provide fixture data. Snippets are
illustrative contracts, not drop-in implementations. Apply them only at the workflow
phase where the corresponding work is allowed by [`CODER.md`](../../CODER.md).

## By task

- [Start a project](./start-project.md): bootstrap from an evidence-backed brief.
- [React page and bindings](./react-page-and-bindings.md): keep presentation transport-free.
- [tRPC and Zod](./trpc-and-zod.md): validate an application API boundary.
- [Composer and MCP](./composer-and-mcp.md): distinguish queries, mutations, and tools.
- [MongoDB repository](./mongo-repository.md): validate scope before persistence access.
- [Structural project-data tools](./structural-data-tools.md): use a bounded AST instead of raw database access.
- [Events](./events.md): publish versioned domain facts after successful work.
- [Multiple static UIs](./multi-ui-static.md): share one API and build static UI assets.
- [Module definition](./module-definition.md): define a reusable, declaration-first contract.

Related handbook routes: [`docs/README.md`](../README.md), [module catalog](../modules/catalog.md).
