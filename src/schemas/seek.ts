import { z } from "zod";

import {
  DEFAULT_MAX_RESULTS,
  MAX_MAX_RESULTS,
  MIN_MAX_RESULTS
} from "../constants.js";

export const seekSearchInputSchema = z
  .object({
    query: z
      .string()
      .describe(
        "One full seek query string. Put the search terms and all filters in this single string. Use it for named lookup and scoped local search. Common patterns: sym:handleRequest, type:file config, handleRequest file:api -file:test, content:async def.*handler lang:python, regex:class\\s+Validator, (lang:go or lang:python) ValidationError."
      ),
    max_results: z
      .number()
      .int()
      .min(MIN_MAX_RESULTS)
      .max(MAX_MAX_RESULTS)
      .default(DEFAULT_MAX_RESULTS)
      .describe(
        "Maximum number of results to return. Defaults to 200. seek ranks results and groups them by file."
      )
  })
  .strict();

export const seekSearchOutputSchema = z
  .object({
    query: z.string().describe("The exact seek query string that was executed."),
    max_results: z.number().int().describe("The max_results limit used for this search."),
    text: z
      .string()
      .describe("Raw seek output, ranked by relevance and grouped by file. Returns '(no results)' when nothing matches."),
    no_results: z.boolean().describe("True when seek returned no matches.")
  })
  .strict();

export type SeekSearchInput = z.infer<typeof seekSearchInputSchema>;
export type SeekSearchOutput = z.infer<typeof seekSearchOutputSchema>;
