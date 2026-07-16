import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css";
import { installBlitzMock, type Scenario } from "./blitzMock";
import { BlitzDuelView } from "../components/blitz/BlitzDuelView";

const scenario = (new URLSearchParams(location.search).get("scenario") as Scenario) || "duel-active";
installBlitzMock(scenario);

document.documentElement.dataset.theme = new URLSearchParams(location.search).get("theme") === "dark" ? "dark" : "light";

const App: React.FC = () => (
  <div className="w-full min-h-screen bg-bb-paper text-bb-ink flex flex-col font-sans">
    <div className="h-14 shrink-0 border-b border-bb-line bg-bb-paper flex items-center px-6">
      <span className="font-mono text-xs text-bb-ink-faint">Binary Beats — harness navbar stand-in</span>
    </div>
    <BlitzDuelView playSound={() => {}} />
  </div>
);

const container = document.getElementById("app")!;
createRoot(container).render(<App />);
