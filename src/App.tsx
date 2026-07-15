import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LeetCodeDashboard } from "./components/LeetCodeDashboard";
import { ContestView } from "./components/ContestView";
import { LeaderboardView } from "./components/LeaderboardView";
import { CommunityView } from "./components/CommunityView";
import { synthSound } from "./utils/audio";

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
  const [sharedCode, setSharedCode] = useState<{ problemTitle: string; code: string; lang: string } | null>(null);

  // Set accent color
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--mg-acc", "#7c5cfc");
    }
  }, []);

  const handleAddXp = (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem("bb_xp", String(next));
      return next;
    });
  };

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

  const handleLogout = () => {
    playSound("click");
    alert("Logging out...");
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
    <div className="w-full min-h-screen bg-[#0c0c10] text-zinc-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        xp={xp}
        username={username}
        onNavigate={handleTabChange}
        onLogout={handleLogout}
        onHoverSound={() => playSound("hover")}
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
