import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LeetCodeDashboard } from "./components/LeetCodeDashboard";
import { ContestView } from "./components/ContestView";
import { LeaderboardView } from "./components/LeaderboardView";
import { synthSound } from "./utils/audio";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("bb_xp");
    return saved ? parseInt(saved, 10) : 230;
  });
  const [username] = useState("akrist");

  // Update XP dynamically
  const handleAddXp = (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem("bb_xp", String(next));
      return next;
    });
  };

  // Sync default crimson accent color with HTML styles
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--mg-acc", "#ff2a38");
    }
  }, []);

  // Audio helper (always enabled)
  const playSound = (type: "click" | "hover") => {
    if (type === "click") synthSound.click();
    if (type === "hover") synthSound.hover();
  };

  const handleLogout = () => {
    playSound("click");
    alert("Logout initiated. Returning to control shell...");
  };

  const handleTabChange = (tab: string) => {
    playSound("click");
    setActiveTab(tab);
  };

  return (
    <div className="w-full min-h-screen bg-[#030308] text-zinc-100 flex flex-col font-sans selection:bg-mg-acc/30 selection:text-white">
      {/* Navbar component */}
      <Navbar
        activeTab={activeTab}
        xp={xp}
        username={username}
        onNavigate={handleTabChange}
        onLogout={handleLogout}
        onHoverSound={() => playSound("hover")}
      />

      <main className="w-full flex-1 flex flex-col">
        {activeTab === "home" && (
          <LeetCodeDashboard 
            onAddXp={handleAddXp} 
            playSound={playSound}
          />
        )}
        {activeTab === "blitz" && (
          <ContestView 
            playSound={playSound} 
            onAddXp={handleAddXp}
          />
        )}
        {activeTab === "leaderboard" && (
          <LeaderboardView 
            playSound={playSound} 
            currentUser={username}
          />
        )}
      </main>
    </div>
  );
}
