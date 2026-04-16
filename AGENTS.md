# Project Guidelines

## Scope
- This workspace is a TypeScript MCP stdio package that exposes one seek CLI tool: `seek_search`.
- Keep changes minimal and focused; do not introduce extra frameworks unless explicitly requested.

## Build and Test
- Install: `npm install`
- Build: `npm run build`
- Test: `npm test`
- Run compiled server: `npm run start`

## Architecture
- `src/index.ts`: MCP server bootstrap and stdio transport wiring.
- `src/tools/seek-search.ts`: Tool registration and response shaping for `seek_search`.
- `src/services/seek-runner.ts`: seek CLI execution, PATH preflight, and workspace root resolution.
- `src/schemas/seek.ts`: Strict Zod input/output schemas.
- `src/constants.ts`: Server and tool constants.

## Conventions
- stdout is protocol-only for MCP stdio. Log diagnostic messages to stderr only.
- Preserve seek semantics: exit code `1` means no matches and is not an error.
- Keep `seek_search` stable unless a breaking change is explicitly requested.
- Keep `max_results` behavior consistent: default 200, min 1, max 1000.
- Respect `SEEK_WORKSPACE_ROOT` when running seek; default to `process.cwd()`.

## Testing
- Integration tests live in `tests/integration/seek-mcp-visible-test.mjs`.
- Keep query-matrix coverage for core seek syntax categories (substring, content, regex, symbol, filters, boolean/grouping, no-match).

## Reference Docs
- See `README.md` for user-facing install and MCP usage examples.
- See `package.json` for canonical scripts and publish metadata.
