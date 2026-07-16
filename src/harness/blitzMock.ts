// Dev-only harness for BlitzDuelView: seeds localStorage + intercepts fetch
// so every scenario (link/setup/active/finished, blitz/duel) can be
// screenshotted without a running server or a real Codeforces handle.

export type Scenario =
  | "link"
  | "setup"
  | "duel-active"
  | "duel-finished-victory"
  | "duel-finished-defeat"
  | "blitz-active"
  | "blitz-finished";

const ME = "tourist_fan";
const RIVAL = "rival_hacker";

function problem(contestId: number, index: string, name: string, rating: number, tags: string[]) {
  return { contestId, index, name, rating, tags, covered: true, judgeable: true };
}

const DUEL_PROBLEMS = [
  problem(1500, "A", "Bad Ugly Numbers", 1500, ["math"]),
  problem(1400, "B", "Copy Set", 1400, ["dsu", "games"]),
  problem(1600, "C", "Everyone is a Winner", 1600, ["binary search"]),
  problem(1700, "D", "Yet Another Card Deck", 1700, ["data structures"]),
  problem(1800, "E", "Fake Plastic Trees", 1800, ["dp", "trees"]),
];

const BLITZ_PROBLEMS = [
  problem(1200, "A", "Round Down", 1200, ["math"]),
  problem(1400, "B", "String Splitting", 1400, ["greedy"]),
  problem(1600, "C", "Tree Painting", 1600, ["dfs", "trees"]),
  problem(1900, "D", "Segment Tricks", 1900, ["data structures"]),
];

function baseSession(mode: "blitz" | "duel", problems: typeof DUEL_PROBLEMS, status: "active" | "finished") {
  const now = Math.floor(Date.now() / 1000);
  const handles = mode === "duel" ? [ME, RIVAL] : [ME];
  return {
    id: "mock-session-0001",
    mode,
    createdAtSeconds: now - 605,
    handles,
    displayHandles: Object.fromEntries(handles.map((h) => [h, h])),
    ratings: Object.fromEntries(handles.map((h) => [h, h === ME ? 1487 : 1520])),
    baselineSubmissionId: Object.fromEntries(handles.map((h) => [h, 0])),
    problems,
    results: {} as Record<string, Record<string, number>>,
    solveSources: {},
    status,
    finishedAtSeconds: status === "finished" ? now : undefined,
  };
}

function buildScenarioSession(scenario: Scenario) {
  if (scenario === "duel-active") {
    const s = baseSession("duel", DUEL_PROBLEMS, "active");
    s.results = {
      [ME]: { "1500-A": s.createdAtSeconds + 60, "1400-B": s.createdAtSeconds + 200 },
      [RIVAL]: { "1600-C": s.createdAtSeconds + 150 },
    };
    return s;
  }
  if (scenario === "duel-finished-victory") {
    const s = baseSession("duel", DUEL_PROBLEMS, "finished");
    s.results = {
      [ME]: { "1500-A": 1, "1400-B": 2, "1600-C": 3 },
      [RIVAL]: { "1700-D": 4 },
    };
    return s;
  }
  if (scenario === "duel-finished-defeat") {
    const s = baseSession("duel", DUEL_PROBLEMS, "finished");
    s.results = {
      [ME]: { "1500-A": 1 },
      [RIVAL]: { "1400-B": 2, "1600-C": 3, "1700-D": 4 },
    };
    return s;
  }
  if (scenario === "blitz-active") {
    const s = baseSession("blitz", BLITZ_PROBLEMS, "active");
    s.results = { [ME]: { "1200-A": s.createdAtSeconds + 40, "1400-B": s.createdAtSeconds + 300 } };
    return s;
  }
  if (scenario === "blitz-finished") {
    const s = baseSession("blitz", BLITZ_PROBLEMS, "finished");
    s.results = { [ME]: { "1200-A": 1, "1400-B": 2, "1600-C": 3, "1900-D": 4 } };
    return s;
  }
  return null;
}

function ok(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

export function installBlitzMock(scenario: Scenario) {
  if (scenario !== "link") {
    localStorage.setItem("bb_cf_handle", ME);
    localStorage.setItem(
      "bb_cf_user",
      JSON.stringify({ user: { handle: ME, rating: 1487, maxRating: 1550, rank: "specialist" }, fetchedAt: Date.now() })
    );
  }
  if (scenario.startsWith("duel-") || scenario.startsWith("blitz-")) {
    localStorage.setItem("bb_blitz_session_id", "mock-session-0001");
  }

  const realFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/api/cf/user/")) {
      return ok({ users: [{ handle: ME, rating: 1487, maxRating: 1550, rank: "specialist" }] });
    }

    if (url.endsWith("/api/blitz/sessions") && init?.method === "POST") {
      const session = buildScenarioSession(scenario) ?? baseSession("blitz", BLITZ_PROBLEMS, "active");
      return ok({ session });
    }

    if (url.includes("/api/blitz/sessions/") && url.endsWith("/end")) {
      return ok({});
    }

    const sessionMatch = url.match(/\/api\/blitz\/sessions\/([^/]+)$/);
    if (sessionMatch) {
      const session = buildScenarioSession(scenario);
      if (!session) return new Response(JSON.stringify({ error: "NOT_FOUND" }), { status: 404 });
      return ok({ session });
    }

    return realFetch(input, init);
  };
}
