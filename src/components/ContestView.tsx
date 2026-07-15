import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ContestProps {
  playSound: (type: 'click' | 'hover') => void;
  onAddXp: (amount: number) => void;
}

export const ContestView: React.FC<ContestProps> = ({ playSound, onAddXp }) => {
  const [registered, setRegistered] = useState(false);
  const [countdown, setCountdown] = useState({ hours: '02', minutes: '14', seconds: '45' });

  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + 2, target.getMinutes() + 14, target.getSeconds() + 45);
    const interval = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { clearInterval(interval); setCountdown({ hours: '00', minutes: '00', seconds: '00' }); return; }
      setCountdown({
        hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0')
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = () => { playSound('click'); setRegistered(true); onAddXp(10); };

  const pastContests = [
    { id: 'c3', title: 'Binary Blitz #03', date: '2026-07-10', users: 1420, winner: 'byte_boss', winnerXp: '+450 XP' },
    { id: 'c2', title: 'Binary Blitz #02', date: '2026-07-03', users: 1104, winner: 'compile_king', winnerXp: '+420 XP' },
    { id: 'c1', title: 'Binary Blitz #01', date: '2026-06-26', users: 954, winner: 'akrist', winnerXp: '+500 XP' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-56px)] text-zinc-100 bg-[#0a0a0f] relative pb-12">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#111116] p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4 select-none">
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded border border-[#c3f73a]/20 bg-[#c3f73a]/5 text-[#c3f73a]">
                  Upcoming
                </span>
                <span className="text-xs text-zinc-500 font-mono">Weekly Speed Match</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2 tracking-tight">
                Binary Blitz #04
              </h2>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed max-w-xl">
                Race against the clock to solve 4 challenges. Winners earn double XP and exclusive badges.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.08] px-6 py-4 rounded-xl min-w-[200px]">
              <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 mb-2 font-medium">Starts In</span>
              <div className="flex items-center gap-2 text-3xl font-semibold text-[#c3f73a] font-mono tracking-wider">
                <span>{countdown.hours}</span>
                <span className="text-[#c3f73a]/50 animate-pulse">:</span>
                <span>{countdown.minutes}</span>
                <span className="text-[#c3f73a]/50 animate-pulse">:</span>
                <span>{countdown.seconds}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 mt-1.5 uppercase">hrs : min : sec</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Contest Details */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/[0.08] bg-[#111116] p-6"
            >
              <h3 className="text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 mb-4 border-b border-white/[0.08] pb-2">
                Details
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Format', value: 'Algorithms' },
                  { label: 'Duration', value: '90 Minutes' },
                  { label: 'Challenges', value: '4 Questions' },
                  { label: 'Registered', value: registered ? '1,430' : '1,429' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/[0.08] p-4 rounded-lg text-center">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">{item.label}</span>
                    <span className="text-sm font-mono font-bold text-white block">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.01]">
                <div>
                  <span className="text-sm text-zinc-300 block font-medium">
                    {registered ? '✓ You\'re registered' : 'Register for this contest'}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono block mt-1">
                    {registered ? 'You\'re all set. Good luck!' : '+10 XP for registering.'}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {registered ? (
                    <motion.div key="registered" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="px-4 py-2.5 rounded-lg border border-[#c3f73a]/25 bg-[#c3f73a]/5 text-[#c3f73a] text-[10px] font-bold font-mono tracking-wider uppercase">
                      Registered ✓
                    </motion.div>
                  ) : (
                    <motion.button key="register-btn"
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleRegister}
                      onMouseEnter={() => playSound('hover')}
                      className="px-5 py-2.5 rounded-lg bg-[#c3f73a] hover:bg-[#b0e230] text-black font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Register Now
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Past Contests */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl border border-white/[0.08] bg-[#111116] overflow-hidden"
            >
              <div className="p-6 pb-3">
                <h3 className="text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500">Past Contests</h3>
              </div>

              <div className="flex flex-col divide-y divide-white/[0.04]">
                {pastContests.map((pc) => (
                  <div key={pc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/[0.01] hover:border-l-2 hover:border-l-[#c3f73a] border-l-2 border-l-transparent transition-all">
                    <div className="flex flex-col gap-1 mb-2 sm:mb-0 pl-1 sm:pl-0">
                      <span className="text-sm text-zinc-200 font-medium">{pc.title}</span>
                      <div className="flex gap-4 text-xs font-mono text-zinc-500">
                        <span>{pc.date}</span>
                        <span>{pc.users} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">Winner</span>
                        <span className="text-sm font-medium text-zinc-300">{pc.winner}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.08] rounded-lg text-xs font-bold font-mono text-[#c3f73a]">
                        {pc.winnerXp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Rules sidebar */}
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="rounded-xl border border-white/[0.08] bg-[#111116] p-6"
            >
              <h4 className="text-[10px] font-mono uppercase tracking-wider font-medium text-zinc-500 mb-4 border-b border-white/[0.08] pb-2">
                Rules
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-zinc-400 font-sans leading-relaxed list-none pl-0">
                {[
                  'Penalty +1 min per wrong submission.',
                  'Results lock when timer expires.',
                  'Code is evaluated across multiple test cases.',
                  'Plagiarism results in disqualification.'
                ].map((rule, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c3f73a] mt-2 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
