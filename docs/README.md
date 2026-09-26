# Molda Project Engineering Handbook

This directory is the normative implementation handbook for a project created from the Molda template. `FIRST.md`
remains the bootstrap authority and `CODER.md` remains the workflow-gate authority. This handbook defines how permitted
code is shaped after the relevant gate opens.

[`frameworks.md`](./frameworks.md) is the default stack matrix and links each framework to its normative contract.

Normative words have their usual meaning:

- **must** and **must not** are release requirements;
- **should** records the preferred default and requires a written architecture reason to diverge;
- **may** identifies an allowed option, not a requirement.

Examples demonstrate structure. They are not project requirements, fixture facts, module implementations, or permission
to advance the workflow.

## Read by phase

### Every Coder run

Read, in order:

1. [`../FIRST.md`](../FIRST.md)
2. [`../CODER.md`](../CODER.md)
3. [`../project/project.md`](../project/project.md)
4. [`../project/workflow.md`](../project/workflow.md)
5. completed project surveys and decisions
6. this index and only the concern documents required by the active task

### Preview and design iteration

- [`code-rules/typescript.md`](./code-rules/typescript.md)
- [`code-rules/react-mui.md`](./code-rules/react-mui.md)
- [`code-rules/zod-contracts.md`](./code-rules/zod-contracts.md)
- [`code-rules/testing.md`](./code-rules/testing.md)
- [`examples/react-page-and-bindings.md`](./examples/react-page-and-bindings.md)

The preview allowlist and prohibitions in `CODER.md` override every build-phase example.

### Architecture

- [`code-rules/architecture.md`](./code-rules/architecture.md)
- [`code-rules/project-composition.md`](./code-rules/project-composition.md)
- [`code-rules/module-authoring.md`](./code-rules/module-authoring.md)
- [`modules/README.md`](./modules/README.md)
- [`modules/catalog.md`](./modules/catalog.md)
- [`code-rules/security.md`](./code-rules/security.md)

Architecture records what the project needs. It does not implement it.

### Application build

- [`code-rules/node-runtime.md`](./code-rules/node-runtime.md)
- [`code-rules/trpc.md`](./code-rules/trpc.md)
- [`code-rules/zod-contracts.md`](./code-rules/zod-contracts.md)
- [`code-rules/mongodb.md`](./code-rules/mongodb.md)
- [`code-rules/external-files.md`](./code-rules/external-files.md)
- [`code-rules/composer.md`](./code-rules/composer.md)
- [`code-rules/common-mcp.md`](./code-rules/common-mcp.md)
- [`code-rules/structural-data-tools.md`](./code-rules/structural-data-tools.md)
- [`code-rules/events.md`](./code-rules/events.md)
- [`code-rules/static-uis.md`](./code-rules/static-uis.md)
- [`code-rules/testing.md`](./code-rules/testing.md)

### Release and deployment

- [`code-rules/docker.md`](./code-rules/docker.md)
- [`code-rules/security.md`](./code-rules/security.md)
- [`code-rules/testing.md`](./code-rules/testing.md)

## Concern map

| Concern | Authority | Key invariant |
| --- | --- | --- |
| Repository bootstrap | [`FIRST.md`](../FIRST.md) | Project key identifies folder, branch, subdomain, and project. |
| Workflow permissions | [`CODER.md`](../CODER.md) | No phase starts before its recorded gate. |
| Composition | [`project-composition.md`](./code-rules/project-composition.md) | `startProject` is the only project runtime composition root. |
| Presentation | [`react-mui.md`](./code-rules/react-mui.md) | Components and pages have typed props and no transport access. |
| Project API | [`trpc.md`](./code-rules/trpc.md) | Routers expose application API only; registration never implies MCP exposure. |
| Reusable owner actions | [`composer.md`](./code-rules/composer.md) | Composer definitions are explicit, typed queries or mutations. |
| LLM tools | [`common-mcp.md`](./code-rules/common-mcp.md) | Project and actor scope comes from a short-lived session, not tool arguments. |
| Generic data operations | [`structural-data-tools.md`](./code-rules/structural-data-tools.md) | Only allowlisted resources and a versioned structural AST are accepted. |
| Persistence | [`mongodb.md`](./code-rules/mongodb.md) | Database selection is server-controlled and project-scoped. |
| Mutable files | [`external-files.md`](./code-rules/external-files.md) | Object keys and credentials are server-controlled and project-scoped. |
| Async work | [`events.md`](./code-rules/events.md) | Delivery is at least once; handlers are idempotent. |
| UI serving | [`static-uis.md`](./code-rules/static-uis.md) | One image may serve a root UI and named UI overrides. |
| Module boundaries | [`modules/catalog.md`](./modules/catalog.md) | Reuse a module contract; extend only genuinely project-specific metadata. |

## Examples

[`examples/README.md`](./examples/README.md) indexes paired correct/avoid examples. Copying an example without adapting
names, authorization, schemas, and project requirements is forbidden. A production implementation must also satisfy the
linked normative guide and the project's approved architecture.

## Conflict order

When documents appear to conflict, use this order:

1. explicit accepted project requirements and approvals;
2. `FIRST.md` and `CODER.md` phase gates;
3. project architecture specification;
4. normative `docs/code-rules/` contracts;
5. module catalog boundaries;
6. examples.

An example never overrides a rule.
