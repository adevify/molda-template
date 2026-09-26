# Task Context: Full Template Specification

## Original task

Produce the full Molda project-template specifications in one pass, including precise code rules, framework examples,
limitations, correct usage, and prohibited usage while keeping token use economical.

## Refined task

Turn the template into a deterministic, stage-routed handbook for Coder runs. Cover project composition, TypeScript,
React/MUI, Node.js, tRPC, Zod, MongoDB, Composer, common MCP, events, static UIs, security, testing, Docker, and all 20
module contracts. Add reference examples and repository tests for documentation completeness. Do not implement runtime
modules in this documentation task.

## Project context

- Existing npm workspace template with reserved `apps/api` and `apps/web` packages.
- Preview authoring is limited to shared components, pages, project types, fixtures, and bindings.
- `FIRST.md` owns deterministic bootstrap and `CODER.md` owns workflow gates.
- Twenty `@molda-org/*` declaration packages are installed from the `next` channel.
- Existing tests use `node:test`; browser testing is outside scope.

## Approved scope

- Documentation information architecture and reading routes.
- Normative framework and runtime rules with good/bad examples and limitations.
- Complete module catalog and module-authoring contract.
- Static validation tests for required documents and coverage.
- Updates to the top-level agent, Coder, and repository indexes.

## Deferred scope

- Runtime implementations of module packages.
- Project-specific production application code.
- Changes to the user-level workflow in `/Users/arsenii/code/.ai-workflow`.

## Implementation checkpoints

- [x] Context gathered
- [x] Architecture defined
- [x] Documentation contracts defined
- [x] Test strategy defined
- [ ] Handbook implemented
- [x] Handbook implemented
- [x] Module catalog implemented
- [x] Examples implemented
- [x] Tests pass
- [x] Changes committed and pushed
