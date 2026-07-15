import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ContestProps {
  playSound: (type: 'click' | 'hover') => void;
  onAddXp: (amount: number) => void;
}

export const ContestView: React.FC<ContestProps> = ({ playSound, onAddXp }) => {
  const [registered, setRegistered] = useState(false);
  const [countdown, setCountdown] = useState({ hours: '02', minutes: '14', seconds: '45' });

  // Countdown timer for next contest
  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + 2, target.getMinutes() + 14, target.getSeconds() + 45);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRegister = () => {
    playSound('click');
    setRegistered(true);
    onAddXp(10); // Reward 10 XP for registering
  };

  const pastContests = [
    { id: 'c3', title: 'Binary Blitz #03', date: '2026-07-10', users: 1420, winner: 'byte_boss', winnerXp: '+450 XP' },
    { id: 'c2', title: 'Binary Blitz #02', date: '2026-07-03', users: 1104, winner: 'compile_king', winnerXp: '+420 XP' },
    { id: 'c1', title: 'Binary Blitz #01', date: '2026-06-26', users: 954, winner: 'akrist', winnerXp: '+500 XP' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] text-white bg-black relative pb-12">
      {/* Decorative ambient neon background glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-mg-acc/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-8 py-10 flex flex-col gap-8 relative z-10">
        
        {/* Banner with Tech styling */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden glass-panel p-8 tech-corners"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-mg-acc text-black shadow-[0_0_8px_var(--mg-acc)]">
                  Upcoming Contest
                </span>
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Weekly Speed Match</span>
              </div>
              <h2 className="text-3xl font-bold font-bebas tracking-wider uppercase mb-1">
                Binary Blitz #04: The Redundancy Run
              </h2>
              <p className="text-sm text-zinc-400 font-light max-w-xl">
                Race against the clock and other engineers to solve 4 cyber challenges. Winners secure exclusive double XP points and unique badges.
              </p>
            </div>

            {/* Countdown digital display */}
            <div className="flex flex-col items-center justify-center bg-zinc-950/80 border border-zinc-900 px-6 py-4 rounded-xl min-w-[200px] shadow-inner font-mono text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Starts In</span>
              <div className="flex items-center gap-1.5 text-2xl font-bold text-white tracking-widest font-mono">
                <span className="text-glow">{countdown.hours}</span>
                <span className="text-zinc-600 animate-pulse">:</span>
                <span className="text-glow">{countdown.minutes}</span>
                <span className="text-zinc-600 animate-pulse">:</span>
                <span className="text-glow">{countdown.seconds}</span>
              </div>
              <span className="text-[9px] text-zinc-600 uppercase mt-1">HRS : MIN : SEC</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Contest Cards (Col Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Active contest details */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl glass-panel p-6"
            >
              <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">
                Arena Parameters
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 font-mono">
                {[
                  { label: 'Format', value: 'Algorithms' },
                  { label: 'Duration', value: '90 Minutes' },
                  { label: 'Challenges', value: '4 Questions' },
                  { label: 'Registered', value: registered ? '1,430 Coders' : '1,429 Coders' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-zinc-950/50 border border-zinc-900/60 p-3.5 rounded-xl text-center">
                    <span className="text-[9px] text-zinc-500 uppercase block mb-1">{item.label}</span>
                    <span className="text-xs font-bold text-zinc-200 block">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Registration and Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/40">
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 block font-semibold">
                    {registered ? '✓ ACCESS GRANTED' : 'RESERVE COMPILING TICKET'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 font-light block">
                    {registered ? 'You are registered! Terminal key issued.' : 'Registration rewards +10 XP immediately.'}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {registered ? (
                    <motion.div
                      key="registered"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-glow text-zinc-200 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(255,255,255,0.02)]"
                    >
                      Registered ⚡
                    </motion.div>
                  ) : (
                    <motion.button
                      key="register-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleRegister}
                      onMouseEnter={() => playSound('hover')}
                      className="px-6 py-2.5 rounded-lg bg-mg-acc text-black font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_var(--mg-acc)] cursor-pointer"
                    >
                      Register Now
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Past Contests List */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl glass-panel overflow-hidden"
            >
              <div className="p-6 pb-2">
                <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Historical Records
                </h3>
              </div>

              <div className="flex flex-col divide-y divide-zinc-900/60 font-mono">
                {pastContests.map((pc, idx) => (
                  <div 
                    key={pc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="flex flex-col gap-1 mb-2 sm:mb-0">
                      <span className="text-[13px] text-zinc-200 font-bold">{pc.title}</span>
                      <div className="flex gap-3 text-[10px] text-zinc-500">
                        <span>DATE: {pc.date}</span>
                        <span>PARTICIPANTS: {pc.users}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase block">Champion</span>
                        <span className="text-xs font-bold text-zinc-300">{pc.winner}</span>
                      </div>
                      <div className="px-2.5 py-1 bg-zinc-950 rounded border border-zinc-900 text-xs text-glow font-bold text-zinc-400">
                        {pc.winnerXp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Rules and guidelines sidebar */}
          <div className="flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl glass-panel p-6 font-mono"
            >
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">
                Arena Regulations
              </h4>
              <ul className="flex flex-col gap-3 text-[10px] text-zinc-500 leading-relaxed list-none pl-0">
                <li className="flex gap-2">
                  <span className="text-mg-acc">◼</span>
                  <span>Penalty points accrue at +1 minute for each incorrect submission.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-mg-acc">◼</span>
                  <span>Results lock instantly upon target countdown expiration.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-mg-acc">◼</span>
                  <span>Code undergoes runtime evaluation across multiple test matrices.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-mg-acc">◼</span>
                  <span>Cheating, plagiarism, or multi-tab compiling prompts immediate disqualification.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};
