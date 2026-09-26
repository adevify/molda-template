# Task Context: Lock Module MCP Catalog

## Task

Refresh the template lockfile to the first fully aligned declaration catalog containing the required module MCP surface,
and protect that alignment with deterministic tests.

## Scope

- Keep `package.json` on the `next` channel for future intentional refreshes.
- Lock all 21 installed `@molda-org/*` declaration packages to one exact catalog version.
- Assert the installed shared declaration exposes the required eleventh `mcp` surface.
- Do not add module runtime code.

## Status

- [x] Aligned `.3` catalog verified in npm.
- [x] Lockfile refreshed.
- [x] Alignment tests added.
- [x] Validation complete.
- [ ] Commit pushed and local checkout synchronized.
