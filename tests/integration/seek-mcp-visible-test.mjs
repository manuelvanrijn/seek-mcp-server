import { spawn } from "node:child_process";

const cases = [
  ["plain_substring", "SERVER_NAME"],
  ["content_filter", "content:NO_RESULTS_TEXT file:src"],
  ["regex_explicit", "regex:registerSeek.*"],
  ["symbol_search", "sym:main"],
  ["path_filter", "SEEK_TIMEOUT_MS file:src/services"],
  ["lang_filter", "SERVER_NAME lang:typescript"],
  ["case_filter", "case:yes NO_RESULTS_TEXT file:src"],
  ["type_file", "type:file package.json"],
  ["path_exclusion", "NO_RESULTS_TEXT -file:tests"],
  ["boolean_or", "SERVER_NAME or SEEK_TIMEOUT_MS"],
  ["grouping", "(SERVER_NAME or NO_RESULTS_TEXT) lang:typescript"],
  ["combined", "NO_RESULTS_TEXT file:src -file:tests"],
  ["known_no_match", "sym:this_symbol_should_never_exist_987654321"]
];

let buffer = "";
const responses = new Map();
const expectedIds = new Set(cases.map((_, i) => i + 10));
const NO_RESULTS_TEXT = "(no results)";
const noResultCases = new Set(["known_no_match"]);
const TEST_SEEK_TIMEOUT_MS = 30_000;
const TEST_STARTUP_SLACK_MS = 10_000;
const TEST_TIMEOUT_MS = TEST_SEEK_TIMEOUT_MS + TEST_STARTUP_SLACK_MS;
let timeoutHandle;

const proc = spawn("node", ["dist/index.js"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    SEEK_TIMEOUT_MS: String(TEST_SEEK_TIMEOUT_MS)
  }
});

function send(msg) {
  proc.stdin.write(JSON.stringify(msg) + "\n");
}

function finish() {
  clearTimeout(timeoutHandle);

  console.log("use_case | isError | hasOutput | sample");
  console.log("---------+---------+-----------+--------------------------------------------");

  const failures = [];
  let rowId = 10;
  for (const [name] of cases) {
    const res = responses.get(rowId);
    const isError = Boolean(res?.result?.isError);
    const text = res?.result?.content?.[0]?.text ?? "";
    const hasOutput = text.length > 0;
    const isNoResults = text.trim() === NO_RESULTS_TEXT;
    const shouldBeNoResults = noResultCases.has(name);
    const sample = text.replace(/\s+/g, " ").slice(0, 44);
    console.log(`${name} | ${isError} | ${hasOutput} | ${sample}`);

    if (isError) {
      failures.push(`${name}: unexpected error — ${sample}`);
    } else if (!hasOutput) {
      failures.push(`${name}: empty response`);
    } else if (shouldBeNoResults && !isNoResults) {
      failures.push(`${name}: expected exactly '${NO_RESULTS_TEXT}'`);
    } else if (!shouldBeNoResults && isNoResults) {
      failures.push(`${name}: unexpected '${NO_RESULTS_TEXT}'`);
    }
    rowId += 1;
  }

  proc.kill();

  if (failures.length > 0) {
    console.error(`\n${failures.length} assertion(s) failed:`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  process.exit(0);
}

function maybeFinish() {
  for (const id of expectedIds) {
    if (!responses.has(id)) return;
  }
  finish();
}

function consumeLine(line) {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    if (msg.id !== undefined) {
      responses.set(msg.id, msg);

      // After receiving initialize response, send initialized notification then tool calls
      if (msg.id === 1) {
        send({ jsonrpc: "2.0", method: "notifications/initialized" });

        let id = 10;
        for (const [, query] of cases) {
          send({
            jsonrpc: "2.0",
            id,
            method: "tools/call",
            params: {
              name: "seek_search",
              arguments: { query, max_results: 5 }
            }
          });
          id += 1;
        }
        return;
      }

      maybeFinish();
    }
  } catch {
    // ignore non-json output
  }
}

proc.stdout.on("data", chunk => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf("\n")) >= 0) {
    consumeLine(buffer.slice(0, idx));
    buffer = buffer.slice(idx + 1);
  }
});

send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "visible-test", version: "1.0.0" }
  }
});

timeoutHandle = setTimeout(() => {
  if (proc.killed) return;
  const missing = [];
  for (const id of expectedIds) {
    if (!responses.has(id)) missing.push(id);
  }
  console.error(`Timeout: missing responses for ids: ${missing.join(",")}`);
  proc.kill();
  process.exit(1);
}, TEST_TIMEOUT_MS);
