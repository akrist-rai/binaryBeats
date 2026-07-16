// Dev-only harness: intercepts the two backend calls CodeWorkspace/StatementPane
// make (statement fetch + judge run create/poll) so the real solve UI can be
// screenshotted and iterated on without a running server or auth session.

const MOCK_STATEMENT = {
  key: "1500A",
  contestId: 1500,
  index: "A",
  title: "Bad Ugly Numbers",
  rating: 1500,
  tags: ["constructive algorithms", "math", "number theory"],
  timeLimitMs: 2000,
  memoryLimitMb: 256,
  description:
    "You are given a positive integer n, written without leading zeroes (for example, the integer 1023 is written as \"1023\", but not as \"0001023\" or \"+1023\").\n\nYou have to build the smallest number with the same parity as n and the same number of digits, such that the resulting number doesn't have any leading zeroes, and it's divisible by every digit it contains except for zero (if it contains a zero, the zero is simply ignored).",
  inputFormat:
    "The first line contains a single integer t (1 ≤ t ≤ 1000) — the number of test cases.\n\nThe second line of each test case contains a single integer n (1 ≤ n < 10^17).",
  outputFormat: "For every test case, print the smallest such number as described above.",
  examples: [
    { input: "3\n1\n2\n3", output: "1\n2\n3" },
    { input: "4\n17\n224\n1000\n2", output: "11\n224\n1001\n1" },
  ],
  interactive: false,
  judgeable: true,
  testCount: 47,
};

function ok(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

let runCounter = 0;
const runStore = new Map<string, { kind: string; createdAt: number }>();

export function installMockFetch() {
  const realFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/api/problems/") && url.endsWith("/statement")) {
      return ok({ problem: MOCK_STATEMENT });
    }

    if (url.endsWith("/api/judge/runs") && init?.method === "POST") {
      const runId = `mock-${++runCounter}`;
      runStore.set(runId, { kind: JSON.parse(String(init.body)).kind, createdAt: Date.now() });
      return ok({ runId });
    }

    const runMatch = url.match(/\/api\/judge\/runs\/(mock-\d+)$/);
    if (runMatch) {
      const runId = runMatch[1];
      const entry = runStore.get(runId);
      const elapsed = entry ? Date.now() - entry.createdAt : 999;
      const kind = entry?.kind ?? "custom";

      if (elapsed < 500) {
        return ok({ run: { id: runId, kind, state: "compiling" } });
      }
      if (elapsed < 1200 && kind !== "custom") {
        const total = kind === "submit" ? 47 : 2;
        const done = Math.min(total, Math.floor((elapsed - 500) / 250));
        return ok({ run: { id: runId, kind, state: "running", progress: { done, total } } });
      }

      if (kind === "custom") {
        return ok({
          run: {
            id: runId,
            kind,
            state: "done",
            output: { stdout: "11\n224\n1001\n1\n", stderr: "", timeMs: 46, peakMemoryMb: 3, exitCode: 0, timedOut: false },
          },
        });
      }
      if (kind === "samples") {
        return ok({
          run: {
            id: runId,
            kind,
            state: "done",
            samples: [
              { index: 0, pass: true, input: "3\n1\n2\n3", expected: "1\n2\n3", actual: "1\n2\n3", timeMs: 31, peakMemoryMb: 3, outcome: "ok" },
              {
                index: 1,
                pass: false,
                input: "4\n17\n224\n1000\n2",
                expected: "11\n224\n1001\n1",
                actual: "11\n224\n1000\n1",
                timeMs: 29,
                peakMemoryMb: 3,
                outcome: "ok",
              },
            ],
          },
        });
      }
      // submit
      return ok({
        run: {
          id: runId,
          kind,
          state: "done",
          verdict: {
            status: "AC",
            passedCount: 47,
            totalCount: 47,
            timeMs: 62,
            peakMemoryMb: 4,
            solveRecorded: true,
          },
        },
      });
    }

    return realFetch(input, init);
  };
}
