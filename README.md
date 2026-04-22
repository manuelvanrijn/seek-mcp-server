# @manuelvanrijn/seek-mcp-server

MCP stdio server package that exposes the seek CLI as one read-only tool: `seek_search`.

## 1) Install seek CLI

seek project: https://github.com/dualeai/seek

Quick install:

```bash
go install github.com/dualeai/seek/cmd/seek@latest
```

Then verify:

```bash
seek -version
```

## 2) Use the published npm package

You can run it directly with `npx` (no global install required).

VS Code MCP config example:

```json
{
	"servers": {
		"seek-mcp-server": {
			"command": "npx",
			"args": ["-y", "@manuelvanrijn/seek-mcp-server"]
		}
	}
}
```

Optional: force a specific workspace root for seek execution.

Optional environment variables:

- `SEEK_WORKSPACE_ROOT`: absolute path passed to `seek` as its working directory.
- `SEEK_TIMEOUT_MS`: per-search timeout in milliseconds. Leave unset to let `seek` run until it finishes.

```json
{
	"servers": {
		"seek-mcp-server": {
			"command": "npx",
			"args": ["-y", "@manuelvanrijn/seek-mcp-server"],
			"env": {
				"SEEK_WORKSPACE_ROOT": "/absolute/path/to/repo",
				"SEEK_TIMEOUT_MS": "30000"
			}
		}
	}
}
```

## Test

Run the integration test suite:

```bash
npm test
```

The test lives at tests/integration/seek-mcp-visible-test.mjs.

## Releasing

Publishing to npm is fully automated via `.github/workflows/publish.yml`, triggered by pushing a `v*.*.*` tag.

From a clean `main`:

```bash
git switch main && git pull
npm version patch   # or: minor | major
git push --follow-tags
```

`npm version` bumps `package.json` + `package-lock.json`, creates a commit and annotated tag `vX.Y.Z`. The tag push triggers the workflow, which:

1. Verifies the tag matches `package.json` version.
2. Creates a GitHub Release with auto-generated notes.
3. Publishes to npm with `--provenance` (OIDC / sigstore).
