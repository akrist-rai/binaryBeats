import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { LeetCodeDashboard } from "./components/LeetCodeDashboard";
import { BlitzDuelView } from "./components/blitz/BlitzDuelView";
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
  const [sharedCode, setSharedCode] = useState<{ problemTitle: string; code: string } | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--mg-acc", "#c3f73a");
    document.documentElement.style.setProperty("--mg-acc2", "#35e8ff");
    document.documentElement.style.setProperty("--mg-bg", "#08080b");
    document.documentElement.style.setProperty("--mg-surface", "#111116");
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

  const handleShareSolution = (details: { problemTitle: string; code: string }) => {
    setSharedCode(details);
    setActiveTab("community");
  };

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-zinc-200 flex flex-col font-sans noise-bg relative overflow-x-hidden">
      {/* Shared ambient background — aurora blobs + blueprint grid, sits behind every tab */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="aurora-blob aurora-blob-acc w-[560px] h-[560px] -top-40 -left-32" />
        <div className="aurora-blob aurora-blob-acc2 w-[480px] h-[480px] top-1/3 -right-40" />
        <div className="absolute inset-0 grid-texture" />
      </div>

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

      <main className="w-full flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <LeetCodeDashboard onAddXp={handleAddXp} playSound={playSound} onShareSolution={handleShareSolution} />
            </motion.div>
          )}
          {activeTab === "blitz" && (
            <motion.div key="blitz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <BlitzDuelView playSound={playSound} onAddXp={handleAddXp} />
            </motion.div>
          )}
          {activeTab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <LeaderboardView playSound={playSound} currentUser={username} />
            </motion.div>
          )}
          {activeTab === "community" && (
            <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <CommunityView playSound={playSound} onAddXp={handleAddXp} sharedCode={sharedCode} onClearSharedCode={() => setSharedCode(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
