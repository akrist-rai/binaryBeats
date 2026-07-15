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

  useEffect(() => {
    document.documentElement.style.setProperty("--mg-acc", "#6d5cff");
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

  const handleTabChange = (tab: string) => {
    playSound("click");
    setActiveTab(tab);
  };

  const handleShareSolution = (details: { problemTitle: string; code: string; lang: string }) => {
    setSharedCode(details);
    setActiveTab("community");
  };

  return (
    <div className="w-full min-h-screen bg-[#08080c] text-zinc-100 flex flex-col font-sans noise-bg">
      <Navbar
        activeTab={activeTab}
        xp={xp}
        username={username}
        onNavigate={handleTabChange}
        onLogout={() => { playSound("click"); alert("Logging out..."); }}
        onHoverSound={() => playSound("hover")}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <main className="w-full flex-1 flex flex-col relative">
        {/* Global ambient orbs */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.04] blur-[200px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.03] blur-[180px]" />
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col">
          {activeTab === "home" && (
            <LeetCodeDashboard onAddXp={handleAddXp} playSound={playSound} onShareSolution={handleShareSolution} />
          )}
          {activeTab === "blitz" && (
            <ContestView playSound={playSound} onAddXp={handleAddXp} />
          )}
          {activeTab === "leaderboard" && (
            <LeaderboardView playSound={playSound} currentUser={username} />
          )}
          {activeTab === "community" && (
            <CommunityView playSound={playSound} onAddXp={handleAddXp} sharedCode={sharedCode} onClearSharedCode={() => setSharedCode(null)} />
          )}
        </div>
      </main>
    </div>
  );
}
