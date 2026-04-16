import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

function readPositiveIntegerEnv(name: string): number | undefined {
  const value = process.env[name]?.trim();
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer number of milliseconds.`);
  }

  return parsed;
}

export const SERVER_NAME = "seek-mcp-server";
export const SERVER_VERSION = pkg.version;

export const DEFAULT_MAX_RESULTS = 200;
export const MIN_MAX_RESULTS = 1;
export const MAX_MAX_RESULTS = 1000;

export const SEEK_TIMEOUT_MS = readPositiveIntegerEnv("SEEK_TIMEOUT_MS");

export const NO_RESULTS_TEXT = "(no results)";
