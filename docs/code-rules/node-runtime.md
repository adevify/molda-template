# Node.js runtime rules

## Responsibility

Node.js owns server-side application startup, request handling, composition of validated services, and controlled access to external infrastructure.

## Non-responsibility

The runtime is not a place to bypass API contracts, embed UI behavior, or turn external MongoDB/media systems into container-local state.

## Required rules

- Keep server code in approved application packages and keep startup composition separate from domain/service logic.
- Read configuration from environment at the application boundary, validate required values at startup, and fail clearly when configuration is missing or malformed.
- Keep asynchronous errors explicit; do not silently swallow rejected promises or leak internal error details to clients.
- Bind listeners and external clients through a lifecycle that can be closed cleanly; avoid starting side effects merely by importing a module.
- Keep API and UI bundles in the one accepted project image; stateful infrastructure stays external.
- Apply explicit request body, response, timeout, concurrency, and shutdown bounds at the server boundary. Long-running
  durable work belongs on the platform event queue rather than holding an HTTP request open.
- Compose PascalCase domain services with injected repositories/providers. Keep transport, service, and persistence
  responsibilities separate.

## Limitations

Node APIs and dependencies may differ by deployment target. No runtime implementation is authorized by preview-stage work. Choose Node version and module settings only through the approved project build specification.

## Correct example

```ts
export function readApiConfig(env: NodeJS.ProcessEnv) {
  const port = Number(env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer from 1 to 65535");
  }
  return { port } as const;
}
```

Validate configuration before opening listeners or connecting external services.

## Avoid

- Starting servers or database connections at module import time.
- Defaulting missing credentials or external endpoints to invented production values.
- Returning stack traces, raw driver errors, or secrets in API responses/logs.

## Verification

Run the package typecheck and deterministic Node tests; verify startup configuration failure cases, clean shutdown, and absence of import-time side effects. Review logs and responses for secret/error disclosure.
