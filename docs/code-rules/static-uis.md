# Static UI rules

## Responsibility

Static UI bundles deliver React presentation assets without owning trusted state. They call the approved API through an application adapter.

## Non-responsibility

A static bundle is not an API server, authorization boundary, persistence layer, or place for secrets.

## Required rules

- Package each approved UI as a bundle inside the single project image; multiple UI bundles are allowed when each has a distinct approved audience or workflow.
- Reuse `packages/components` and `packages/pages` across UIs. Supply app-specific route shells, API clients, and bindings at the UI adapter boundary.
- Keep all authorization and validation on the server. A hidden control or static route is not access control.
- Use only public configuration in client output; keep secrets and database access on the server.
- Ensure each UI serves explicit loading, empty, error, responsive, and keyboard-accessible states.
- Configure the default HTML entry with `static.root`, shared immutable assets with `static.assets`, and named UI path
  entries with the accepted `static.overides` spelling. Reserved API, Composer, MCP, health, and asset prefixes must win
  before any UI fallback.
- Treat an `overides` key as a stable first URL segment, not a filesystem path or arbitrary rewrite expression. Fall
  back to that entry only for non-reserved routes below its segment.

## Limitations

Static hosting constraints, routing fallback behavior, asset path, and authentication flow depend on the approved deployment design. Shared UI packages cannot assume a single application shell.

## Correct example

```ts
const bindings: PageBindings = {
  save: (input) => typedApi.records.save.mutate(input),
};

const staticConfig = {
  root: "./ui/customer/index.html",
  assets: { basePath: "/assets", directory: "./assets" },
  overides: { operator: "./ui/operator/index.html" },
} as const;
```

The UI wrapper creates the typed API client; the page receives only the `save` action and render data through props.

## Avoid

- Shipping MongoDB credentials, signing keys, or private API secrets in a bundle.
- Calling APIs from components/pages or duplicating shared presentation per UI.
- Treating separate UI bundles as separate mutable release artifacts when the project image is immutable and versioned as a whole.
- Letting a request choose a disk path, shadow a reserved server prefix, or escape a configured build directory.

## Verification

Inspect built assets for secrets and server-only dependencies; verify each bundle is included in the accepted image and
uses the shared page/component contracts. Contract-test root fallback, each named `overides` fallback, assets, reserved
prefix precedence, traversal rejection, and unknown paths. Run typecheck, deterministic Node tests, and preview
verification for shared presentation changes; no browser testing is required.
