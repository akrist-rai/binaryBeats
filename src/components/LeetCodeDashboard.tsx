import React, { useState, useEffect, useMemo } from 'react';
import { synthSound } from '../utils/audio';

interface Challenge {
  id: string;
  n: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp: number;
  min: number;
  done: boolean;
  active?: boolean;
  acceptance: string;
}

interface LeetCodeDashboardProps {
  onPlayEpisode: (id: string) => void;
}

const DUMMY_CHALLENGES: Challenge[] = [
  {
    id: "S1E1_A9",
    n: 1,
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    category: "ALGORITHMS",
    difficulty: "Easy",
    xp: 80,
    min: 15,
    done: true,
    acceptance: "48.2%"
  },
  {
    id: "S1E3_A9",
    n: 2,
    title: "Valid Parentheses",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    category: "DATA STRUCTURES",
    difficulty: "Medium",
    xp: 150,
    min: 25,
    done: false,
    acceptance: "41.5%"
  },
  {
    id: "S1E3_A1",
    n: 3,
    title: "Optimal Sacrifice (3-SAT)",
    description: "Formulate a reduction proof showing Griffith's apostle sacrifice decision matches the NP-Complete 3-satisfiability problem bounds.",
    category: "COMP. PROG",
    difficulty: "Hard",
    xp: 300,
    min: 50,
    done: false,
    active: true,
    acceptance: "18.9%"
  }
];

const DIFFICULTY_THEMES = {
  Easy: {
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    leftBorder: 'border-l-emerald-500',
    shadow: 'hover:shadow-emerald-500/5'
  },
  Medium: {
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    leftBorder: 'border-l-amber-500',
    shadow: 'hover:shadow-amber-500/5'
  },
  Hard: {
    color: 'text-rose-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    leftBorder: 'border-l-rose-500',
    shadow: 'hover:shadow-rose-500/5'
  }
};

const CATEGORY_TAG_COLORS: Record<string, string> = {
  'ALGORITHMS': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'DATA STRUCTURES': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'COMP. PROG': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

export const LeetCodeDashboard: React.FC<LeetCodeDashboardProps> = ({ onPlayEpisode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Real-time daily countdown timer state
  const [timeRemaining, setTimeRemaining] = useState('08:00:00');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(24, 0, 0, 0); // Reset at midnight
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeRemaining(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter dummy challenges
  const filteredChallenges = useMemo(() => {
    return DUMMY_CHALLENGES.filter((ch) => {
      const matchesSearch =
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiff = selectedDifficulty === 'All' || ch.difficulty === selectedDifficulty;

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Solved' && ch.done) ||
        (selectedStatus === 'Todo' && !ch.done);

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [searchQuery, selectedDifficulty, selectedStatus]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = DUMMY_CHALLENGES.length;
    const solved = DUMMY_CHALLENGES.filter((c) => c.done).length;
    const percent = Math.round((solved / total) * 100);

    const easy = DUMMY_CHALLENGES.filter((c) => c.difficulty === 'Easy');
    const easySolved = easy.filter((c) => c.done).length;

    const medium = DUMMY_CHALLENGES.filter((c) => c.difficulty === 'Medium');
    const mediumSolved = medium.filter((c) => c.done).length;

    const hard = DUMMY_CHALLENGES.filter((c) => c.difficulty === 'Hard');
    const hardSolved = hard.filter((c) => c.done).length;

    return {
      total,
      solved,
      percent,
      easy: { total: easy.length, solved: easySolved, pct: easy.length > 0 ? (easySolved / easy.length) * 100 : 0 },
      medium: { total: medium.length, solved: mediumSolved, pct: medium.length > 0 ? (mediumSolved / medium.length) * 100 : 0 },
      hard: { total: hard.length, solved: hardSolved, pct: hard.length > 0 ? (hardSolved / hard.length) * 100 : 0 }
    };
  }, []);

  const handlePlay = (ch: Challenge) => {
    synthSound.click();
    onPlayEpisode(ch.id);
  };

  const handleResetFilters = () => {
    synthSound.click();
    setSearchQuery('');
    setSelectedDifficulty('All');
    setSelectedStatus('All');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10 font-sans text-paper">
      
      {/* Premium Tech Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/5 bg-zinc-950/40 backdrop-blur-md p-8 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        <div className="absolute inset-0 bg-mg-tone bg-[size:5px_5px] opacity-[0.02] pointer-events-none"></div>

        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-purple-400 font-bold block mb-1">DEVELOPER DASHBOARD</span>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-paper to-white/70 bg-clip-text text-transparent">
            Welcome Back, <span className="font-mono text-purple-400">akrist</span>
          </h1>
          <p className="font-mono text-[10px] text-white/35 mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-crt animate-pulse"></span>
            SHELL STABLE | VERSION 2.4.1
          </p>
        </div>

        {/* Global HUD metrics */}
        <div className="flex flex-wrap gap-8 font-mono text-xs">
          <div className="flex flex-col gap-1 border-r border-white/5 pr-6">
            <span className="text-[9px] text-white/35 uppercase tracking-wider">Solved Ratio</span>
            <span className="text-xl font-bold text-crt">
              {stats.solved}<span className="text-xs text-white/20"> / {stats.total}</span>
            </span>
          </div>
          <div className="flex flex-col gap-1 border-r border-white/5 pr-6">
            <span className="text-[9px] text-white/35 uppercase tracking-wider">Experience</span>
            <span className="text-xl font-bold text-[#b9ff00]">
              230 <span className="text-[10px] text-white/40">XP</span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-white/35 uppercase tracking-wider">Active Streak</span>
            <span className="text-xl font-bold text-amber-400 flex items-center gap-1">
              🔥 3 Days
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Challenges List & Search (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Header Row for List */}
          <div className="flex justify-between items-center select-none">
            <h2 className="font-bebas text-2xl tracking-widest text-paper/80">CHALLENGE LOGS</h2>
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">// ACTIVE ASSIGNMENTS</span>
          </div>

          {/* Spacious Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 border border-white/5 bg-zinc-950/20 rounded-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-white/30 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search by title, tag..."
                className="w-full bg-zinc-900/40 border border-white/5 hover:border-zinc-800 focus:border-purple-500/50 rounded-lg pl-10 pr-4 py-2.5 font-mono text-xs text-paper focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onMouseEnter={() => synthSound.hover()}
              />
            </div>

            {/* Quick Pills/Dropdowns */}
            <div className="flex gap-2.5">
              <select
                className="bg-zinc-900/40 border border-white/5 rounded-lg px-3 py-2 font-mono text-xs text-white/60 focus:outline-none focus:border-purple-500/50"
                value={selectedDifficulty}
                onChange={(e) => {
                  synthSound.click();
                  setSelectedDifficulty(e.target.value);
                }}
                onMouseEnter={() => synthSound.hover()}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                className="bg-zinc-900/40 border border-white/5 rounded-lg px-3 py-2 font-mono text-xs text-white/60 focus:outline-none focus:border-purple-500/50"
                value={selectedStatus}
                onChange={(e) => {
                  synthSound.click();
                  setSelectedStatus(e.target.value);
                }}
                onMouseEnter={() => synthSound.hover()}
              >
                <option value="All">All Statuses</option>
                <option value="Solved">Solved</option>
                <option value="Todo">Todo</option>
              </select>
            </div>

            {/* Clear filters shortcut */}
            {(searchQuery || selectedDifficulty !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="font-mono text-[10px] text-purple-400 hover:text-purple-300 hover:underline cursor-pointer flex items-center justify-center"
              >
                Reset [×]
              </button>
            )}
          </div>

          {/* Cards List Layout */}
          <div className="flex flex-col gap-4">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-zinc-950/10">
                <p className="font-mono text-xs text-white/35">No matching challenges found.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 font-mono text-[10px] text-purple-400 hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredChallenges.map((ch) => {
                const diffTheme = DIFFICULTY_THEMES[ch.difficulty];
                const catColor = CATEGORY_TAG_COLORS[ch.category] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';

                return (
                  <div
                    key={ch.id}
                    onClick={() => handlePlay(ch)}
                    onMouseEnter={() => synthSound.hover()}
                    className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-zinc-900/10 border-l-[3px] border border-white/5 hover:border-white/10 ${diffTheme.leftBorder} ${diffTheme.shadow} rounded-r-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${catColor}`}>
                          {ch.category}
                        </span>
                        <span className="font-mono text-[10px] text-white/30">
                          ⏱ {ch.min} mins
                        </span>
                        <span className="font-mono text-[10px] text-white/30">
                          Acceptance: {ch.acceptance}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-semibold text-paper flex items-center gap-2">
                        {ch.title}
                        {ch.done && (
                          <span className="text-crt text-xs flex items-center" title="Solved">
                            <svg className="w-4 h-4 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        {ch.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="In Progress"></span>
                        )}
                      </h3>
                      
                      <p className="font-sans text-xs text-white/50 leading-relaxed font-light mt-1.5">
                        {ch.description}
                      </p>
                    </div>

                    {/* Right: Difficulty, XP & CTA */}
                    <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                      <div className="flex flex-col items-start md:items-end">
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${diffTheme.color}`}>
                          {ch.difficulty}
                        </span>
                        <span className="font-mono text-xs text-[#b9ff00] font-bold mt-0.5">
                          +{ch.xp} XP
                        </span>
                      </div>

                      <button className="bg-white/5 hover:bg-purple-500 hover:text-black border border-white/10 hover:border-purple-400/30 text-white/80 text-[10px] font-bold py-2 px-4 rounded-lg transition-all cursor-pointer uppercase font-mono tracking-wider">
                        {ch.done ? 'Review' : ch.active ? 'Resume' : 'Solve'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Statistics & Highlights (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Circular solved stats */}
          <div className="bg-zinc-950/20 border border-white/5 p-6 rounded-2xl flex flex-col items-center gap-6">
            <h3 className="font-bebas text-lg tracking-widest text-white/50 self-start w-full border-b border-white/5 pb-2 uppercase">
              Operational Statistics
            </h3>

            {/* Glowing SVG Ring */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-white/5"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-purple-500 transition-all duration-700 ease-out"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.percent / 100)}`}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.4))' }}
                />
              </svg>
              {/* Overlay Statistics text */}
              <div className="absolute flex flex-col items-center text-center font-mono select-none">
                <span className="text-3xl font-black text-paper leading-none">{stats.percent}%</span>
                <span className="text-[8px] text-white/30 mt-1 tracking-widest uppercase">SOLVED</span>
                <span className="text-[10px] text-white/50 font-bold mt-0.5">{stats.solved} / {stats.total}</span>
              </div>
            </div>

            {/* Difficulty Metrics breakdown list */}
            <div className="w-full flex flex-col gap-4 font-mono text-xs select-none">
              {/* Easy breakdown */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-emerald-400 font-bold tracking-wider">EASY</span>
                  <span className="text-white/60">{stats.easy.solved} / {stats.easy.total}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${stats.easy.pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium breakdown */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-400 font-bold tracking-wider">MEDIUM</span>
                  <span className="text-white/60">{stats.medium.solved} / {stats.medium.total}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${stats.medium.pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Hard breakdown */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-rose-500 font-bold tracking-wider">HARD</span>
                  <span className="text-white/60">{stats.hard.solved} / {stats.hard.total}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${stats.hard.pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Challenge Spotlight */}
          <div className="bg-gradient-to-b from-purple-500/10 to-zinc-950/40 border border-purple-500/20 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2 select-none">
              <h3 className="font-bebas text-lg tracking-widest text-purple-400 uppercase">
                Daily Assignment
              </h3>
              <span className="font-mono text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                ⏱ {timeRemaining}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 select-none">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-rose-500/20 bg-rose-500/5 text-rose-500 uppercase">
                  Hard
                </span>
                <span className="text-[#b9ff00] font-mono font-bold text-[10px]">
                  +300 XP
                </span>
              </div>

              <h4 className="text-lg font-bold text-paper tracking-wide mt-1.5 hover:text-purple-400 transition-colors">
                Optimal Sacrifice (3-SAT)
              </h4>

              <p className="font-sans text-xs text-white/50 leading-relaxed font-light mt-1">
                Formulate a reduction proof showing Griffith's apostle sacrifice decision matches the 3-satisfiability problem bounds.
              </p>
            </div>

            <button
              onClick={() => handlePlay(DUMMY_CHALLENGES[2])}
              className="w-full bg-purple-500 hover:bg-purple-400 text-black font-mono text-xs font-bold py-2.5 rounded-lg tracking-wider active:translate-y-[1px] transition-all cursor-pointer text-center uppercase"
            >
              Solve Challenge
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
