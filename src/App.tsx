import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { LeetCodeDashboard } from "./components/LeetCodeDashboard";
import { BlitzDuelView } from "./components/blitz/BlitzDuelView";
import { LeaderboardView } from "./components/LeaderboardView";
import { CommunityView } from "./components/CommunityView";
import { synthSound } from "./utils/audio";
import { useAuth } from "./hooks/useAuth";
import { useCfHandle } from "./hooks/useCfHandle";

type Theme = "light" | "dark";

export default function App() {
  const { user, status: authStatus, logout } = useAuth();
  const { user: cfUser } = useCfHandle();
  const [activeTab, setActiveTab] = useState("home");
  // No UI toggle for this anymore — sound just plays, same default as before.
  const [soundEnabled] = useState(() => {
    const saved = localStorage.getItem("bb_sound");
    return saved !== "false";
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("bb_theme");
    return saved === "dark" ? "dark" : "light";
  });
  const [sharedCode, setSharedCode] = useState<{ problemTitle: string; code: string } | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bb_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      window.location.href = "/login.html";
    }
  }, [authStatus]);

  const playSound = (type: "click" | "hover") => {
    if (!soundEnabled) return;
    if (type === "click") synthSound.click();
    if (type === "hover") synthSound.hover();
  };

  const handleToggleTheme = () => {
    playSound("click");
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleTabChange = (tab: string) => {
    playSound("click");
    setActiveTab(tab);
  };

  const handleShareSolution = (details: { problemTitle: string; code: string }) => {
    setSharedCode(details);
    setActiveTab("community");
  };

  if (authStatus !== "authenticated" || !user) {
    // "checking" renders nothing (avoids a flash of the dashboard before the
    // session check resolves); "unauthenticated" is mid-redirect to login.html.
    return <div className="w-full min-h-screen bg-bb-paper" />;
  }

  const username = user.name || user.email;

  return (
    <div className="w-full min-h-screen bg-bb-paper text-bb-ink flex flex-col font-sans noise-bg relative overflow-x-hidden">
      {/* Shared ambient background — faint blueprint grid, sits behind every tab */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 grid-paper" />
      </div>

      <Navbar
        activeTab={activeTab}
        rating={cfUser?.rating ?? null}
        username={username}
        onNavigate={handleTabChange}
        onLogout={() => { playSound("click"); logout(); }}
        onHoverSound={() => playSound("hover")}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="w-full flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <LeetCodeDashboard
                playSound={playSound}
                onShareSolution={handleShareSolution}
                onNavigateTab={handleTabChange}
              />
            </motion.div>
          )}
          {activeTab === "blitz" && (
            <motion.div key="blitz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <BlitzDuelView playSound={playSound} />
            </motion.div>
          )}
          {activeTab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <LeaderboardView playSound={playSound} currentUser={username} />
            </motion.div>
          )}
          {activeTab === "community" && (
            <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col">
              <CommunityView playSound={playSound} sharedCode={sharedCode} onClearSharedCode={() => setSharedCode(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
