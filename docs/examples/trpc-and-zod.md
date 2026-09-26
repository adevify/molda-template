# tRPC and Zod

Use Zod at the application boundary to validate untrusted input, and expose the typed
procedure through the project's approved tRPC router. API details and schemas must
come from accepted requirements and shared contracts where available.

## Correct

```ts
const lookupInput = z.object({
  recordId: z.string().min(1),
});

const recordRouter = router({
  lookup: protectedProcedure
    .input(lookupInput)
    .query(({ input, ctx }) =>
      ctx.recordService.lookup({
        actor: ctx.actor,
        recordId: input.recordId,
      }),
    ),
});
```

This is a shape example: use the repository's actual tRPC initialization, auth
middleware, shared schema, and service contracts. Input validation does not replace
authorization or project/tenant scoping. Keep business behavior in an owned service;
do not access MongoDB directly in the procedure.

## Avoid

```ts
lookup: publicProcedure.query(({ input }) =>
  collection.findOne({ _id: input.recordId }),
)
```

The input is unvalidated, the caller is unauthenticated, the query has no scope, and
the route bypasses service and repository boundaries. Ordinary tRPC procedures are API
operations; they do not become MCP tools automatically.
