import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css";
import { installMockFetch } from "./mockFetch";
import { SolveWorkspace } from "../components/solve/SolveWorkspace";
import type { SolvableProblem } from "../components/solve/types";

installMockFetch();

document.documentElement.dataset.theme = new URLSearchParams(location.search).get("theme") === "dark" ? "dark" : "light";

const problem: SolvableProblem = {
  key: "1500A",
  contestId: 1500,
  index: "A",
  title: "Bad Ugly Numbers",
  rating: 1500,
  tags: ["constructive algorithms", "math"],
  judgeable: true,
};

const App: React.FC = () => (
  <div className="w-full min-h-screen bg-bb-paper text-bb-ink flex flex-col font-sans p-4" style={{ height: "100vh" }}>
    <SolveWorkspace
      mode="practice"
      problem={problem}
      solved={false}
      onBack={() => {}}
      onAccepted={() => {}}
      playSound={() => {}}
    />
  </div>
);

const container = document.getElementById("app")!;
createRoot(container).render(<App />);
