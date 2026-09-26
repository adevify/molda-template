# Decision Log: Lock Module MCP Catalog

## Channel and lock behavior

`package.json` continues to name `next`, while `package-lock.json` records one reviewed exact catalog release. New project
bootstrap therefore remains reproducible until the template intentionally refreshes its lock.

## Required evidence

Tests verify both version convergence and the installed `MoldaModuleDefinition.mcp` declaration. Documentation wording
alone is not sufficient evidence that a generated project receives the expected types.
