import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LeetCodeDashboard } from "./components/LeetCodeDashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [xp] = useState(230); // Matches dashboard stats
  const [username] = useState("akrist");

  // Set the default theme accent color (purple) on mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--mg-acc", "#ef4444");
    }
  }, []);

  const handlePlayEpisode = (id: string) => {
    console.log(`Navigating to play episode: ${id}`);
    alert(`Play Challenge Triggered: Starting compile environment for ${id}`);
  };

  const handleLogout = () => {
    alert("Logout initiated. Returning to control shell...");
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
          <LeetCodeDashboard onPlayEpisode={handlePlayEpisode} />
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
