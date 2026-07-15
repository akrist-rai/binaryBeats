import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LeetCodeDashboard } from "./components/LeetCodeDashboard";
import { ContestView } from "./components/ContestView";
import { LeaderboardView } from "./components/LeaderboardView";
import { CommunityView } from "./components/CommunityView";
import { synthSound } from "./utils/audio";

const THEMES: Record<string, string> = {
  crimson: "#ff2a38",
  cyber: "#00f5ff",
  matrix: "#00ff66",
  volt: "#ccff00",
  violet: "#bd00ff",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("bb_xp");
    return saved ? parseInt(saved, 10) : 230;
  });
  const [username] = useState("akrist");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("bb_sound");
    return saved !== "false";
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("bb_theme") || "crimson";
  });
  const [sharedCode, setSharedCode] = useState<{ problemTitle: string; code: string; lang: string } | null>(null);

  // Sync theme accent color with HTML styles
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hex = THEMES[theme] || THEMES.crimson;
      document.documentElement.style.setProperty("--mg-acc", hex);
    }
  }, [theme]);

  // Update XP dynamically
  const handleAddXp = (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem("bb_xp", String(next));
      return next;
    });
  };

  // Audio helper with mute functionality
  const playSound = (type: "click" | "hover") => {
    if (!soundEnabled) return;
    if (type === "click") synthSound.click();
    if (type === "hover") synthSound.hover();
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("bb_sound", String(next));
      return next;
    });
  };

  const handleThemeChange = (newTheme: string) => {
    playSound("click");
    setTheme(newTheme);
    localStorage.setItem("bb_theme", newTheme);
  };

  const handleLogout = () => {
    playSound("click");
    alert("Logout initiated. Returning to control shell...");
  };

  const handleTabChange = (tab: string) => {
    playSound("click");
    setActiveTab(tab);
  };

  const handleShareSolution = (details: { problemTitle: string; code: string; lang: string }) => {
    setSharedCode(details);
    setActiveTab("community");
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
        theme={theme}
        onThemeChange={handleThemeChange}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <main className="w-full flex-1 flex flex-col">
        {activeTab === "home" && (
          <LeetCodeDashboard 
            onAddXp={handleAddXp} 
            playSound={playSound}
            onShareSolution={handleShareSolution}
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
        {activeTab === "community" && (
          <CommunityView
            playSound={playSound}
            onAddXp={handleAddXp}
            sharedCode={sharedCode}
            onClearSharedCode={() => setSharedCode(null)}
          />
        )}
      </main>
    </div>
  );
}

