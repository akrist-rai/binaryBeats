import { useState, useEffect, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ActivityTicker } from "./components/ActivityTicker";
import { Transmissions } from "./components/Transmissions";
import { Manifest } from "./components/Manifest";
import { ARCS, EPISODES } from "./data/content";

export default function App() {
  // Global State variables
  const [activeArcId, setActiveArcId] = useState(3);
  const [activeEpId, setActiveEpId] = useState("S1E3_A1");
  const [currentMode, setCurrentMode] = useState<"SOLO" | "NETWORK">("SOLO");
  const [activeTab, setActiveTab] = useState("home");
  const [xp] = useState(360);
  const [username] = useState("akrist");

  // Load local storage states on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("ephemeral_mode");
    if (savedMode === "SOLO" || savedMode === "NETWORK") {
      setCurrentMode(savedMode);
    }

    const savedArcId = localStorage.getItem("ephemeral_arc_id");
    if (savedArcId) {
      setActiveArcId(parseInt(savedArcId, 10));
    }

    const savedEpId = localStorage.getItem("ephemeral_ep_id");
    if (savedEpId) {
      setActiveEpId(savedEpId);
    }
  }, []);

  // Reactively track and update theme colors
  const activeArc = useMemo(() => {
    return ARCS.find((a) => a.id === activeArcId) || ARCS[0];
  }, [activeArcId]);

  useEffect(() => {
    if (typeof document !== "undefined" && activeArc) {
      document.documentElement.style.setProperty("--mg-acc", activeArc.accColor);
    }
  }, [activeArc]);

  const handleSelectArc = (id: number) => {
    setActiveArcId(id);
    localStorage.setItem("ephemeral_arc_id", String(id));

    // Auto-select first episode of new Arc
    const arcEpisodes = EPISODES.filter((ep) => ep.arcId === id);
    if (arcEpisodes.length > 0) {
      setActiveEpId(arcEpisodes[0].id);
      localStorage.setItem("ephemeral_ep_id", arcEpisodes[0].id);
    }
  };

  const handleSelectEpisode = (id: string) => {
    setActiveEpId(id);
    localStorage.setItem("ephemeral_ep_id", id);
  };

  const handleToggleMode = (mode: "SOLO" | "NETWORK") => {
    setCurrentMode(mode);
    localStorage.setItem("ephemeral_mode", mode);
  };

  const handlePlayEpisode = (id: string) => {
    console.log(`Navigating to play episode: ${id}`);
    alert(`Play Episode Triggered: Starting session for challenge ${id}`);
  };

  const handleLogout = () => {
    alert("Logout initiated. Returning to control shell...");
  };

  const handleTransmissionPlay = (arcId: number, episodeId: string) => {
    handleSelectArc(arcId);
    handleSelectEpisode(episodeId);
  };

  return (
    <div className="w-full min-h-screen bg-[#030308] text-paper flex flex-col font-sans">
      {/* Navbar component */}
      <Navbar
        activeTab={activeTab}
        xp={xp}
        username={username}
        onNavigate={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      {activeTab === "home" ? (
        /* Home Dashboard Section wrapper */
        <main className="w-full pb-12">
          {/* Hero panel layout component */}
          <Hero
            ARCS={ARCS}
            EPISODES={EPISODES}
            activeArcId={activeArcId}
            activeEpId={activeEpId}
            currentMode={currentMode}
            onSelectArc={handleSelectArc}
            onSelectEpisode={handleSelectEpisode}
            onToggleMode={handleToggleMode}
            onPlayEpisode={handlePlayEpisode}
            onBrowseAll={() => setActiveTab("blitz")}
          />

          {/* Activity Ticker */}
          <ActivityTicker />

          {/* Transmissions grid */}
          <Transmissions
            ARCS={ARCS}
            EPISODES={EPISODES}
            onPlay={handleTransmissionPlay}
            onBrowseAll={() => setActiveTab("blitz")}
          />

          {/* blitz Manifest grid */}
          <Manifest 
            ARCS={ARCS} 
            EPISODES={EPISODES} 
            onSelectArc={handleSelectArc} 
          />
        </main>
      ) : (
        /* Stub panels for other tabs */
        <main className="relative flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center text-paper px-6 py-12">
          <div className="absolute inset-0 bg-mg-tone-fine bg-[size:5px_5px] opacity-5 pointer-events-none"></div>
          
          <div className="border border-mg-acc bg-white/[0.02] p-8 md:p-12 relative max-w-[500px] w-full">
            <div className="absolute w-[9px] h-[9px] border-t-[1.5px] border-l-[1.5px] border-solid border-mg-acc top-[4px] left-[4px]"></div>
            <div className="absolute w-[9px] h-[9px] border-b-[1.5px] border-r-[1.5px] border-solid border-mg-acc bottom-[4px] right-[4px]"></div>

            <h2 className="font-bebas text-4xl tracking-widest text-mg-acc mb-4 select-none">
              SECTION: {activeTab.toUpperCase()}
            </h2>
            
            <p className="font-sans text-xs text-white/70 leading-relaxed mb-6 font-light">
              This terminal segment is currently offline or loading. Refer to
              primary HOME console to interface with operational training arcs.
            </p>
            
            <button
              className="bg-mg-acc text-black font-bebas text-sm py-2 px-6 border-none cursor-pointer tracking-widest hover:brightness-110 active:translate-y-[1px] transition-all duration-150"
              onClick={() => setActiveTab("home")}
            >
              RETURN TO HOME CONSOLE
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
