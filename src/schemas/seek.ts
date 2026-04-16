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
      .describe("Full seek query string, for example: sym:Coach file:role_models"),
    max_results: z
      .number()
      .int()
      .min(MIN_MAX_RESULTS)
      .max(MAX_MAX_RESULTS)
      .default(DEFAULT_MAX_RESULTS)
      .describe("Maximum number of results to return. Defaults to 200.")
  })
  .strict();

export const seekSearchOutputSchema = z
  .object({
    query: z.string(),
    max_results: z.number().int(),
    text: z.string(),
    no_results: z.boolean()
  })
  .strict();

export type SeekSearchInput = z.infer<typeof seekSearchInputSchema>;
export type SeekSearchOutput = z.infer<typeof seekSearchOutputSchema>;