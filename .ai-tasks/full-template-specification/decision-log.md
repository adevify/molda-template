# Decision Log: Full Template Specification

## Stage-routed documentation

**Decision:** Keep `FIRST.md` and `CODER.md` authoritative, and route detailed rules through a concise `docs/README.md`.

**Reason:** Coder runs should load only the documents relevant to the active phase while retaining deterministic rules.

## Normative document shape

**Decision:** Every framework guide states ownership, required rules, limitations, correct usage, prohibited usage, and
verification expectations.

**Reason:** Repeated structure makes rules discoverable and testable instead of relying on prose interpretation.

## Examples

**Decision:** Examples use neutral domain shapes and explicit `good`/`avoid` contrast. They must not create preview
fixtures or imply project facts.

**Reason:** The template needs reusable implementation guidance without violating the no-fake-data preview rule.

## Module scope

**Decision:** Specify all 20 module boundaries and the shared implementation contract, but keep module packages
declaration-only in this task.

**Reason:** The user requested full specifications; runtime module implementation remains a separate, much larger task.

## Static contract compatibility

**Decision:** Preserve the accepted public option spelling `static.overides` and document its exact first-path-segment to
HTML-entry behavior.

**Reason:** Renaming a public field in documentation would create a mismatch with the approved project composition
contract. A spelling correction requires an explicit versioned migration.

## Discovery boundaries

**Decision:** Keep the owner-facing Composer catalog limited to `composer.queries` and `composer.mutations`. Define the
common MCP `tools/list` result as the authorized union of those operations, explicit selected-module MCP tools, and
generic scoped structural data tools. Do not mirror these operations into MCP prompts/resources.

**Reason:** The Studio UI catalog, project API, and LLM tool manifest have different consumers and security boundaries.

## External state

**Decision:** Document MongoDB and S3-compatible mutable file storage as external project-scoped services; immutable UI
bundles and release assets remain inside the single project image.

**Reason:** Image replacement must not destroy customer data, while release artifacts must remain bound to the verified
image digest.
