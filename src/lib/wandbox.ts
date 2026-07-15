// Real code execution via Wandbox (https://wandbox.org/), a free, public,
// CORS-enabled compile-and-run service. No API key, no server of our own needed.

export type BlitzLanguage = "cpp" | "python" | "java";

interface LanguageMeta {
  label: string;
  compiler: string;
  options?: string;
}

export const LANGUAGE_META: Record<BlitzLanguage, LanguageMeta> = {
  cpp: { label: "C++17", compiler: "gcc-13.2.0", options: "warning,gnu++17" },
  python: { label: "Python 3", compiler: "cpython-3.13.8" },
  java: { label: "Java", compiler: "openjdk-jdk-21+35" },
};

export const DEFAULT_CODE: Record<BlitzLanguage, string> = {
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n",
  python: "def main():\n    pass\n\nmain()\n",
  java: "public class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n",
};

export interface RunResult {
  success: boolean;
  compileError?: string;
  output: string;
  stderr: string;
}

const WANDBOX_URL = "https://wandbox.org/api/compile.json";

interface WandboxResponse {
  status: string;
  compiler_output?: string;
  compiler_error?: string;
  program_output?: string;
  program_error?: string;
}

export async function runCode(language: BlitzLanguage, code: string, stdin: string): Promise<RunResult> {
  const meta = LANGUAGE_META[language];

  // Wandbox writes the source to prog.java, so a top-level `public class` trips javac's
  // filename check. Only affects this scratch run — Codeforces doesn't require `public`
  // either, and the code you copy out is untouched.
  const submittedCode = language === "java" ? code.replace(/\bpublic\s+class\b/, "class") : code;

  let res: Response;
  try {
    res = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: submittedCode, compiler: meta.compiler, options: meta.options, stdin }),
    });
  } catch {
    return { success: false, output: "", stderr: "Could not reach the run service — check your connection and retry." };
  }

  if (!res.ok) {
    return { success: false, output: "", stderr: `Run service returned an error (${res.status}).` };
  }

  let body: WandboxResponse;
  try {
    body = await res.json();
  } catch {
    return { success: false, output: "", stderr: "Run service returned an unreadable response." };
  }

  const compileError = body.compiler_error?.trim() ? body.compiler_error : undefined;
  return {
    success: body.status === "0" && !compileError,
    compileError,
    output: body.program_output ?? "",
    stderr: body.program_error ?? "",
  };
}
