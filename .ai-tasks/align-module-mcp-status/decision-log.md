# Decision Log: Align Module MCP Status

## Declaration versus runtime

The shared declaration now requires the eleventh `mcp` surface. This does not make any module runnable; module packages
remain declaration-only until their separate implementation phase.

## Stale installs

The template must fail closed when a local `next` install predates the new surface. The coder updates aligned
declarations instead of using casts or reflecting API routes.
