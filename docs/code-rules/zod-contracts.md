# Zod contract rules

## Responsibility

Zod schemas parse and validate untrusted runtime inputs and provide the runtime source for typed boundary contracts.

## Non-responsibility

Schemas do not decide authorization, persist data, or prove that values are true business facts.

## Required rules

- Parse external inputs at the boundary: API procedures, MCP tools, environment configuration, and decoded external-service responses.
- Use explicit schemas with bounded strings, numeric ranges, enumerations, and strict object behavior where the contract should reject unknown keys.
- Infer TypeScript input/output types from schemas when both are needed; do not trust a cast as validation.
- Convert validation failures into stable, safe boundary errors without returning secrets or unfiltered raw input.
- Keep schema ownership near the contract it protects and reuse shared schemas only where ownership is genuinely shared.
- When several objects share a field group, export one reusable object/shape fragment and compose it. Prefer
  `.extend(OtherSchema.shape)` for Zod objects; do not use deprecated `.merge(...)`.
- If an adapter needs a missing reusable domain schema, add it to the owning shared contract first. Do not recreate an
  equivalent shape locally from smaller scalar aliases.

## Limitations

Schema validity does not establish permissions, uniqueness, existence, or consistency with external state. Version and supported Zod APIs must match the approved dependency set.

## Correct example

```ts
const CreateRecordInput = z.object({
  title: z.string().trim().min(1).max(120),
}).strict();

const StoredRecord = CreateRecordInput.extend(RecordIdentity.shape);

type CreateRecordInput = z.infer<typeof CreateRecordInput>;
const input = CreateRecordInput.parse(untrustedValue);
```

## Avoid

- `untrustedValue as CreateRecordInput` without parsing.
- Unbounded free-form values or permissive catch-all objects at security-sensitive boundaries.
- Using successful parsing as a substitute for checking the caller's access.
- Redeclaring a domain object independently in API, persistence, MCP, and UI packages.

## Verification

For each schema, exercise valid input, missing/invalid fields, bounds, unexpected fields, and safe error mapping in deterministic Node tests. Run typecheck to confirm inferred types align with service contracts.
