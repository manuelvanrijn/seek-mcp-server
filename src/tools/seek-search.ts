import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { NO_RESULTS_TEXT } from "../constants.js";
import { seekSearchInputSchema, seekSearchOutputSchema } from "../schemas/seek.js";
import { getSeekWorkspaceRoot, runSeek } from "../services/seek-runner.js";

export function registerSeekSearchTool(server: McpServer): void {
  server.registerTool(
    "seek_search",
    {
      title: "Seek Search",
      description:
        "Primary code search tool for this workspace. Use for symbol lookup (sym:), file discovery (type:file), and content search (content:). Supports language filtering (lang:) and path include/exclude (file:/-file:).",
      inputSchema: seekSearchInputSchema,
      outputSchema: seekSearchOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ query, max_results }) => {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        return {
          content: [{ type: "text", text: "Missing required argument: query" }],
          isError: true
        };
      }

      try {
        const rawOutput = await runSeek(normalizedQuery, max_results, getSeekWorkspaceRoot());
        const text = rawOutput || NO_RESULTS_TEXT;

        return {
          content: [{ type: "text", text }],
          structuredContent: {
            query: normalizedQuery,
            max_results,
            text,
            no_results: text === NO_RESULTS_TEXT
          }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: String(error instanceof Error ? error.message : error) }],
          isError: true
        };
      }
    }
  );
}