# tRPC rules

## Responsibility

tRPC defines typed application request/response procedures between approved clients and the API, with authorization and validated inputs at the server boundary.

## Non-responsibility

tRPC routes are not automatically MCP tools, a persistence layer, or a reason for presentation components/pages to know transport details.

## Required rules

- Define routers and procedures in the API boundary; use Zod schemas for inputs and explicit outputs where the contract benefits from runtime checking.
- Authenticate and authorize in server context/procedure middleware before protected operations; enforce resource/project scope in the service/repository too.
- Delegate business rules to application services and persistence to repositories rather than putting workflows in route resolvers.
- Keep ordinary tRPC router discovery separate from MCP tool registration. An MCP tool may call an authorized service explicitly, with its own input/output contract.
- Generate/use typed clients in application adapters; keep those clients out of shared components and pages.

## Limitations

tRPC type inference does not validate external values by itself and does not define public REST compatibility. The project must choose transport/versioning policy after architecture approval.

## Correct example

```ts
const router = t.router({
  getById: t.procedure
    .input(z.object({ id: z.string().min(1) }))
    .use(requireProjectMember)
    .query(({ input, ctx }) => ctx.services.records.getById(ctx.projectId, input.id)),
});
```

MCP discovery separately registers only deliberately exposed tools backed by the service layer.

## Avoid

- Exposing every router procedure as an MCP tool by reflection.
- Putting database queries, cross-domain workflows, or authorization decisions only in a resolver.
- Accepting caller-supplied project IDs without deriving or checking scope from authenticated context.

## Verification

Test input rejection, authorization failures, project isolation, success output, and service errors using deterministic Node tests. Confirm MCP discovery registers only explicit tools and UI transport usage stays in app adapters.
