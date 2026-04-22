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
        [
          "Primary tool for named code lookup and scoped local code search in this workspace.",
          "",
          "Use first for:",
          "- known symbol, class, method, file, path, or regex lookup",
          "- definition lookup with sym:",
          "- filename lookup with type:file",
          "- scoped local search with file:/-file:, lang:, content:, or regex:",
          "",
          "Not first for:",
          "- architecture, patterns, end-to-end flow, or how/why questions",
          "- callers, references, implementations, or type information when an LSP tool is available",
          "- exact non-code literal lookup",
          "",
          "Query notes:",
          "- pass one full seek query string in query",
          "- use sym:, type:file, file:/-file:, lang:, content:, regex:, and or / (...)",
          "- results are ranked by relevance and grouped by file",
          "- no matches return '(no results)'"
        ].join("\n"),
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
