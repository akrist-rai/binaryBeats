import { useState } from "react";
import { DEFAULT_CPP_CODE } from "../lib/wandbox";

interface CodeDraft {
  code: string;
  stdin: string;
}

const DRAFTS_KEY = "bb_blitz_code_v1";

function readAllDrafts(): Record<string, CodeDraft> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistDraft(problemKey: string, draft: CodeDraft) {
  try {
    const all = readAllDrafts();
    all[problemKey] = draft;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
  } catch {
    // ignore quota errors — draft simply won't survive a refresh
  }
}

/** Persists a per-problem C++ code/stdin draft in localStorage, keyed by problemKey. */
export function useCodeDraft(problemKey: string) {
  const [draft, setDraft] = useState<CodeDraft>(() => {
    const existing = readAllDrafts()[problemKey];
    return existing ?? { code: DEFAULT_CPP_CODE, stdin: "" };
  });

  const setCode = (code: string) => {
    setDraft((prev) => {
      const next = { ...prev, code };
      persistDraft(problemKey, next);
      return next;
    });
  };

  const setStdin = (stdin: string) => {
    setDraft((prev) => {
      const next = { ...prev, stdin };
      persistDraft(problemKey, next);
      return next;
    });
  };

  return { draft, setCode, setStdin };
}
