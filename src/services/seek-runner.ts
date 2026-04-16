import { spawn, spawnSync } from "node:child_process";

import { SEEK_TIMEOUT_MS } from "../constants.js";

export function getSeekWorkspaceRoot(): string {
  const overrideRoot = process.env.SEEK_WORKSPACE_ROOT?.trim();
  if (overrideRoot) {
    return overrideRoot;
  }

  return process.cwd();
}

export function ensureSeekAvailable(): void {
  const check = spawnSync("seek", ["--help"], {
    stdio: "ignore"
  });

  if (check.error) {
    const reason = check.error instanceof Error ? check.error.message : String(check.error);
    throw new Error(
      `seek CLI is not available in PATH (${reason}). Install seek and ensure it is discoverable before starting seek-mcp-server.`
    );
  }
}

export function runSeek(query: string, maxResults: number, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("seek", ["-n", String(maxResults), query], {
      cwd,
      env: process.env
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    const timer =
      SEEK_TIMEOUT_MS === undefined
        ? undefined
        : setTimeout(() => {
            killed = true;
            child.kill();
            reject(new Error(`seek timed out after ${SEEK_TIMEOUT_MS}ms`));
          }, SEEK_TIMEOUT_MS);

    child.stdout.on("data", chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", chunk => {
      stderr += chunk.toString();
    });

    child.on("error", error => {
      if (timer) {
        clearTimeout(timer);
      }

      reject(error);
    });

    child.on("close", code => {
      if (timer) {
        clearTimeout(timer);
      }

      if (killed) return;

      if (code === 0) {
        resolve(stdout.trimEnd());
        return;
      }

      if (code === 1) {
        resolve("");
        return;
      }

      const message = stderr.trim() || `seek exited with code ${code}`;
      reject(new Error(message));
    });
  });
}
