# Configuration rules

## Responsibility

Configuration supplies validated, environment-specific values to one immutable project image without changing source or
the verified artifact.

## Non-responsibility

Configuration does not define project requirements, authorize callers, store business records, or replace versioned
schema/module selection.

## Required rules

- Define one strict startup schema for environment/configuration values, with explicit names, types, bounds, defaults,
  sensitivity, and required deployment scope.
- Parse configuration once at the composition boundary and inject typed values. Domain modules must not read
  `process.env` directly.
- Keep public UI configuration separate from server secrets. Only an explicit allowlist may be serialized into static or
  runtime-served browser configuration.
- Resolve project identity, database, object-storage prefix, and MCP signing/audience configuration from trusted platform
  deployment state—not request input.
- Fail readiness before accepting traffic when required configuration is absent, malformed, inconsistent, or references
  an unavailable required capability.
- Rotate secrets without rebuilding the image; log names/versions where safe, never values.

## Limitations

Environment variables have platform-specific size, encoding, and rotation behavior. A schema validates shape, not the
correctness or authorization of an external credential.

## Correct example

```ts
const RuntimeConfig = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  MONGODB_URI: z.string().url(),
  FILES_ENDPOINT: z.string().url(),
}).strict();

const config = RuntimeConfig.parse(process.env);
```

Only the application composition root reads the environment and passes smaller typed configs to owned services.

## Avoid

- Reading `process.env` throughout routers, repositories, components, or module handlers.
- Defaulting missing production credentials to local/insecure values.
- Putting secrets into `VITE_*`, static JSON, fixtures, source, logs, or image layers.
- Selecting a project/database from host headers or caller parameters without platform verification.

## Verification

Test valid startup, every required missing/invalid value, cross-field constraints, public-config allowlisting, redaction,
secret rotation behavior, and failure before listener readiness.
