#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { ensureSeekAvailable, getSeekWorkspaceRoot } from "./services/seek-runner.js";
import { registerSeekSearchTool } from "./tools/seek-search.js";

const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION
});

registerSeekSearchTool(server);

async function main(): Promise<void> {
  const workspaceRoot = getSeekWorkspaceRoot();
  ensureSeekAvailable();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`${SERVER_NAME} running on stdio (workspace: ${workspaceRoot})`);
}

main().catch(error => {
  console.error("Fatal error while starting seek-mcp-server:", error);
  process.exit(1);
});