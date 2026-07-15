import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onAddXp: (amount: number) => void;
  playSound: (type: 'click' | 'hover') => void;
}

interface Problem {
  id: string;
  num: number;
  title: string;
  tags: string[];
  diff: 'Easy' | 'Medium' | 'Hard';
  rate: string;
  xp: number;
  solved: boolean;
  desc: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  templates: {
    javascript: string;
    python: string;
    cpp: string;
  };
}

const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    num: 1,
    title: 'Two Sum',
    tags: ['Array', 'Hash Table'],
    diff: 'Easy',
    rate: '52.4%',
    xp: 80,
    solved: true,
    desc: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9'
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        hashmap = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in hashmap:\n                return [hashmap[diff], i]\n            hashmap[num] = i\n        return []`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> hashmap;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (hashmap.count(diff)) {\n                return {hashmap[diff], i};\n            }\n            hashmap[nums[i]] = i;\n        }\n        return {};\n    }\n};`
    }
  },
  {
    id: 'p2',
    num: 15,
    title: 'Valid Parentheses',
    tags: ['Stack', 'String'],
    diff: 'Medium',
    rate: '43.1%',
    xp: 150,
    solved: false,
    desc: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n- Every close bracket has a corresponding open bracket of the same type.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\''
    ],
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    templates: {
      javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    const stack = [];\n    const map = { ")": "(", "}": "{", "]": "[" };\n    for (let char of s) {\n        if (char === "(" || char === "{" || char === "[") {\n            stack.push(char);\n        } else if (stack.pop() !== map[char]) {\n            return false;\n        }\n    }\n    return stack.length === 0;\n}`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {")": "(", "}": "{", "]": "["}\n        for char in s:\n            if char in mapping.values():\n                stack.append(char)\n            elif char in mapping:\n                if not stack or stack.pop() != mapping[char]:\n                    return False\n        return not stack`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == \'(\' || c == \'{\' || c == \'[\') {\n                st.push(c);\n            } else {\n                if (st.empty()) return false;\n                if (c == \')\' && st.top() != \'(\') return false;\n                if (c == \'}\' && st.top() != \'{\') return false;\n                if (c == \']\' && st.top() != \'[\') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};`
    }
  },
  {
    id: 'p3',
    num: 23,
    title: 'Merge K Sorted Lists',
    tags: ['Heap', 'Linked List'],
    diff: 'Hard',
    rate: '19.7%',
    xp: 300,
    solved: false,
    desc: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.',
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500'
    ],
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'Merging lists: 1->1->2->3->4->4->5->6' }
    ],
    templates: {
      javascript: `/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode[]} lists\n * @return {ListNode}\n */\nfunction mergeKLists(lists) {\n    // Solve using priority queue or divide-and-conquer\n    return null;\n}`,
      python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        # Add implementation here\n        return None`,
      cpp: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        // Merge lists\n        return nullptr;\n    }\n};`
    }
  },
];

const DC = {
  Easy: { text: 'text-zinc-400', bg: 'bg-zinc-900', border: 'border-zinc-800' },
  Medium: { text: 'text-zinc-200', bg: 'bg-zinc-800', border: 'border-zinc-700' },
  Hard: { text: 'text-white font-bold', bg: 'bg-zinc-700', border: 'border-zinc-600' }
};

const heatColors = ['#121214', '#27272a', '#52525b', '#e4e4e7'];

// Generate fake activity logs for heatmap tooltips
const heatmapData = Array.from({ length: 52 * 7 }, (_, i) => {
  const r = Math.sin(i * 0.3) * 0.5 + Math.random();
  let val = 0;
  if (i > 340) val = r > 0.6 ? (r > 0.85 ? 3 : r > 0.72 ? 2 : 1) : 0;
  else val = r > 0.7 ? (r > 0.9 ? 3 : r > 0.8 ? 2 : 1) : 0;
  
  // Calculate a mock date
  const d = new Date();
  d.setDate(d.getDate() - (52 * 7 - i));
  return {
    val,
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    count: val === 3 ? '8 submissions' : val === 2 ? '4 submissions' : val === 1 ? '1 submission' : 'No activity'
  };
});

export const LeetCodeDashboard = ({ onAddXp, playSound }: Props) => {
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const [activeChallenge, setActiveChallenge] = useState<Problem | null>(null);
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('bb_solved_challenges');
    return saved ? JSON.parse(saved) : ['p1']; // Default solved is Two Sum
  });

  // Editor states
  const [editorLang, setEditorLang] = useState<'javascript' | 'python' | 'cpp'>('javascript');
  const [editorCode, setEditorCode] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [compileStatus, setCompileStatus] = useState<'idle' | 'running' | 'success' | 'claimed'>('idle');

  useEffect(() => {
    const tick = () => {
      const d = new Date(); d.setHours(24, 0, 0, 0);
      const ms = Math.max(0, d.getTime() - Date.now());
      setCountdown(`${String(Math.floor(ms / 3.6e6)).padStart(2, '0')}:${String(Math.floor((ms % 3.6e6) / 6e4)).padStart(2, '0')}:${String(Math.floor((ms % 6e4) / 1e3)).padStart(2, '0')}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // Filter problems based on difficulty, search text, and sidebar categories
  const visible = useMemo(() => PROBLEMS.filter(p => {
    if (filter !== 'All' && p.diff !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedTag && !p.tags.includes(selectedTag)) return false;
    return true;
  }), [filter, search, selectedTag]);

  const solvedCount = useMemo(() => {
    return PROBLEMS.filter(p => solvedChallenges.includes(p.id)).length;
  }, [solvedChallenges]);

  const pct = Math.round((solvedCount / PROBLEMS.length) * 100);

  // Setup initial editor code when a challenge opens
  const openChallenge = (prob: Problem) => {
    playSound('click');
    setActiveChallenge(prob);
    setEditorCode(prob.templates[editorLang]);
    setCompileStatus(solvedChallenges.includes(prob.id) ? 'claimed' : 'idle');
    setTerminalLogs(['Compile system idle. Ready to test inputs.']);
  };

  // Keep editor templates synced on language change
  useEffect(() => {
    if (activeChallenge) {
      setEditorCode(activeChallenge.templates[editorLang]);
    }
  }, [editorLang, activeChallenge]);

  const runCode = () => {
    playSound('click');
    setCompileStatus('running');
    setTerminalLogs(['> Testing local solutions...', 'Running tests against example inputs...']);
    
    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '✓ Test Case 1 Passed. Input matches output.',
        '✓ Test Case 2 Passed. Constraints satisfied.',
        'Status: Success (Ready to Submit)'
      ]);
      setCompileStatus('idle');
    }, 1200);
  };

  const submitCode = () => {
    playSound('click');
    setCompileStatus('running');
    setTerminalLogs(['> Submitting workspace build...', 'Stage 1: Validating file structure...', 'Stage 2: Compiling instructions...']);
    
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, 'Stage 3: Running evaluations across 52 test matrices...']);
      
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          'Stage 4: Checking performance overhead thresholds...',
          '✓ 52/52 Test Matrices Passed.',
          'ACCEPTED! compiling completed.'
        ]);
        setCompileStatus('success');
      }, 1000);
    }, 800);
  };

  const claimReward = () => {
    if (!activeChallenge) return;
    playSound('click');
    
    const newSolved = [...solvedChallenges, activeChallenge.id];
    setSolvedChallenges(newSolved);
    localStorage.setItem('bb_solved_challenges', JSON.stringify(newSolved));
    
    onAddXp(activeChallenge.xp);
    setCompileStatus('claimed');
  };

  return (
    <div style={{ background: '#000000' }} className="w-full min-h-[calc(100vh-64px)] text-white relative">
      {/* Absolute glowing gradient background */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[300px] rounded-full bg-mg-acc/5 blur-[150px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!activeChallenge ? (
            /* Dashboard Home Panel */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
            >
              {/* ═══ LEFT COLUMN ═══ */}
              <div className="flex flex-col gap-6">
                
                {/* Spotlight Banner - Premium Glass design */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl relative glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-zinc-800 transition-colors shadow-2xl overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-[200px] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-[200px] group-hover:translate-x-[400px] transition-transform duration-1000 ease-out" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-mg-acc text-black font-bold shadow-[0_0_8px_var(--mg-acc)]">
                        Daily Spotlight
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-semibold">
                        ⏱ {countdown} Remaining
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wide">
                      Merge K Sorted Lists
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 font-light max-w-[450px]">
                      Synthesize multiple arrays into one sorted sequence. Spotlight task guarantees a bonus +50 XP!
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const spotlight = PROBLEMS.find(p => p.id === 'p3');
                      if (spotlight) openChallenge(spotlight);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="shrink-0 px-6 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold cursor-pointer border border-zinc-800 bg-zinc-950/80 hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-md"
                  >
                    Solve Challenge
                  </button>
                </motion.div>

                {/* Toolbar: Search + Difficulty Tabs */}
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.15 }}
                  className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center font-mono"
                >
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      value={search} 
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search problems..."
                      className="w-full h-10 pl-10 pr-3 rounded-lg text-[13px] text-white bg-zinc-950/80 placeholder-zinc-600 focus:outline-none transition-colors border border-zinc-900 focus:border-zinc-700 shadow-inner"
                    />
                  </div>

                  {/* Filter Status Reset Badge */}
                  {selectedTag && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-mg-acc/10 border border-mg-acc/20 rounded-lg text-[10px] text-zinc-300">
                      <span>CATEGORY: {selectedTag}</span>
                      <button 
                        onClick={() => {
                          playSound('click');
                          setSelectedTag(null);
                        }}
                        className="text-mg-acc hover:text-white cursor-pointer ml-1 font-bold font-sans text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Difficulty Selector Tabs */}
                  <div className="flex rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950/80 p-0.5 shadow-inner">
                    {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => {
                      const isActive = filter === d;
                      return (
                        <button 
                          key={d} 
                          onClick={() => {
                            playSound('click');
                            setFilter(d);
                          }}
                          onMouseEnter={() => playSound('hover')}
                          className="px-4 h-8 rounded text-[11px] font-semibold tracking-wider cursor-pointer uppercase transition-colors relative"
                          style={{ color: isActive ? '#ffffff' : '#71717a' }}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="activeFilterBg"
                              className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded shadow-md"
                              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                            />
                          )}
                          <span className="relative z-10">{d}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Problem List */}
                <motion.div 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/30 backdrop-blur-sm"
                >
                  {/* Table Header */}
                  <div className="grid grid-cols-[50px_1fr_110px_80px_100px] items-center h-12 px-6 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900 bg-zinc-950/60 select-none">
                    <span></span>
                    <span>Title</span>
                    <span className="text-center">Difficulty</span>
                    <span className="text-center">Rate</span>
                    <span className="text-right">Reward</span>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col divide-y divide-zinc-900/40">
                    <AnimatePresence mode="popLayout">
                      {visible.length === 0 ? (
                        <motion.div 
                          key="empty" 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          className="py-16 text-center text-sm text-zinc-500 font-mono"
                        >
                          No problems found
                        </motion.div>
                      ) : (
                        visible.map((p, i) => {
                          const theme = DC[p.diff];
                          const isSolved = solvedChallenges.includes(p.id);
                          return (
                            <motion.div 
                              key={p.id} 
                              layout
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              exit={{ opacity: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => openChallenge(p)}
                              onMouseEnter={() => playSound('hover')}
                              className="grid grid-cols-[50px_1fr_110px_80px_100px] items-center px-6 py-4 cursor-pointer transition-colors hover:bg-white/[0.015] group"
                            >
                              {/* Status circle */}
                              <div className="flex justify-center">
                                {isSolved ? (
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-mg-acc text-black text-[9px] font-black shadow-[0_0_6px_var(--mg-acc)]">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-zinc-800 bg-transparent group-hover:border-zinc-700 transition-colors" />
                                )}
                              </div>

                              {/* Title & Tags */}
                              <div className="min-w-0 pl-1 font-mono">
                                <span className="text-[13px] font-semibold text-zinc-300 group-hover:text-white transition-colors">
                                  {String(p.num).padStart(3, '0')}. {p.title}
                                </span>
                                <div className="flex gap-1.5 mt-1.5">
                                  {p.tags.map(t => (
                                    <span key={t} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded text-zinc-500 bg-zinc-950 border border-zinc-900">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Difficulty */}
                              <div className="text-center font-mono uppercase tracking-wider text-[10px]">
                                <span className={`px-2 py-0.5 rounded border ${theme.text} ${theme.bg} ${theme.border} shadow-sm`}>
                                  {p.diff}
                                </span>
                              </div>

                              {/* Acceptance */}
                              <div className="text-center text-xs font-mono text-zinc-500">{p.rate}</div>

                              {/* Reward */}
                              <div className="text-right font-mono text-xs font-bold text-zinc-300 group-hover:text-white group-hover:text-glow transition-all">
                                +{p.xp} XP
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* ═══ RIGHT SIDEBAR ═══ */}
              <div className="flex flex-col gap-6">

                {/* Profile card with Circular Progress indicator */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.25 }}
                  className="rounded-2xl p-5 border border-zinc-900 bg-zinc-950/80 shadow-xl relative"
                >
                  <div className="flex items-center gap-4 mb-6 font-mono">
                    {/* SVG Radial Meter */}
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" className="stroke-zinc-900/60 fill-none" strokeWidth="4" />
                        <circle 
                          cx="28" 
                          cy="28" 
                          r="24" 
                          className="stroke-mg-acc fill-none" 
                          strokeWidth="4"
                          strokeDasharray={150.79}
                          strokeDashoffset={150.79 - (150.79 * pct) / 100}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out', filter: 'drop-shadow(0 0 4px var(--mg-acc))' }}
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-white uppercase tracking-tighter">
                        {pct}%
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase tracking-wider">akrist</div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">RANK #142</div>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="flex flex-col gap-3.5 font-mono text-[10px] tracking-wider">
                    {([
                      { label: 'Easy', solved: solvedChallenges.includes('p1') ? 1 : 0, total: 1, text: 'text-zinc-400', barBg: 'bg-zinc-400' },
                      { label: 'Medium', solved: solvedChallenges.includes('p2') ? 1 : 0, total: 1, text: 'text-zinc-300', barBg: 'bg-zinc-200' },
                      { label: 'Hard', solved: solvedChallenges.includes('p3') ? 1 : 0, total: 1, text: 'text-white', barBg: 'bg-white' },
                    ]).map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between mb-1 uppercase">
                          <span className={s.text}>{s.label}</span>
                          <span className="text-zinc-500 font-bold">{s.solved}/{s.total}</span>
                        </div>
                        <div className="h-[5px] rounded-full overflow-hidden bg-zinc-900">
                          <motion.div 
                            className={`h-full rounded-full ${s.barBg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${s.total ? (s.solved / s.total) * 100 : 0}%` }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-zinc-900 font-mono uppercase tracking-wider">
                    {[
                      { n: `${solvedCount}`, label: 'Solved' },
                      { n: '230', label: 'Streak' }, // Matches default streak
                      { n: 'Top 12%', label: 'Tier' }
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <div className="text-xs font-bold text-white">{s.n}</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Submissions Heatmap - monochrome cells with rich tooltips */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.35 }}
                  className="rounded-2xl p-5 border border-zinc-900 bg-zinc-950/80 shadow-xl"
                >
                  <div className="flex justify-between items-center mb-4 font-mono text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                    <span>Submission Matrix</span>
                  </div>
                  
                  {/* Heatmap Grid */}
                  <div className="flex gap-[3.5px] overflow-hidden justify-center">
                    {Array.from({ length: 22 }, (_, week) => (
                      <div key={week} className="flex flex-col gap-[3.5px]">
                        {Array.from({ length: 7 }, (_, day) => {
                          const idx = week * 7 + day;
                          const log = heatmapData[idx] || { val: 0, date: '', count: 'No activity' };
                          return (
                            <div 
                              key={day}
                              className="w-[9.5px] h-[9.5px] rounded-[2.5px] cursor-pointer hover:ring-1 hover:ring-white transition-all relative group/cell"
                              style={{ background: heatColors[log.val] }}
                            >
                              {/* Glowing Tooltip */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 hidden group-hover/cell:block bg-zinc-950 border border-zinc-800 text-[8px] font-mono text-zinc-300 p-1.5 rounded shadow-xl text-center pointer-events-none z-50">
                                <span className="block font-bold text-white">{log.count}</span>
                                <span className="text-[7px] text-zinc-500">{log.date}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-end gap-1 mt-4 font-mono text-[9px] uppercase tracking-wider text-zinc-600 font-semibold">
                    <span className="mr-1 text-[8px]">Less</span>
                    {heatColors.map((c, i) => (
                      <div key={i} className="w-[8px] h-[8px] rounded-[1.5px]" style={{ background: c }} />
                    ))}
                    <span className="ml-1 text-[8px]">More</span>
                  </div>
                </motion.div>

                {/* Trending Topics - interactive category filters */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.45 }}
                  className="rounded-2xl p-5 border border-zinc-900 bg-zinc-950/80 shadow-xl font-mono"
                >
                  <h4 className="text-[10px] font-bold text-zinc-400 mb-3.5 uppercase tracking-wider border-b border-zinc-900 pb-2">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Array', 'Hash Table', 'Stack', 'Heap', 'Linked List', 'String'].map(t => {
                      const isSelected = selectedTag === t;
                      return (
                        <span 
                          key={t} 
                          onClick={() => {
                            playSound('click');
                            setSelectedTag(isSelected ? null : t);
                          }}
                          onMouseEnter={() => playSound('hover')}
                          className={`text-[9.5px] px-2.5 py-1.5 rounded-lg border transition-all uppercase tracking-wider cursor-pointer font-bold ${
                            isSelected 
                              ? 'bg-mg-acc text-black border-mg-acc shadow-[0_0_8px_var(--mg-acc)]' 
                              : 'border-zinc-900 text-zinc-500 bg-zinc-950/40 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

            </motion.div>
          ) : (
            /* Interactive Challenge Mock Coding IDE Workspace */
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-6"
            >
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveChallenge(null);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="px-3.5 h-9 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white cursor-pointer font-mono text-xs transition-colors bg-zinc-950/60"
                  >
                    ← Dashboard
                  </button>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-zinc-100">
                      {String(activeChallenge.num).padStart(3, '0')}. {activeChallenge.title}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${DC[activeChallenge.diff].text} ${DC[activeChallenge.diff].bg} ${DC[activeChallenge.diff].border}`}>
                      {activeChallenge.diff}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5 border border-zinc-900 bg-zinc-950/60 p-1.5 rounded-lg">
                    {(['javascript', 'python', 'cpp'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          playSound('click');
                          setEditorLang(lang);
                        }}
                        onMouseEnter={() => playSound('hover')}
                        className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition-colors ${
                          editorLang === lang 
                            ? 'bg-zinc-800 text-white border border-zinc-700' 
                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                      >
                        {lang === 'javascript' ? 'JS' : lang === 'python' ? 'PY' : 'C++'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Split Workspace View */}
              <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 items-stretch min-h-[500px]">
                
                {/* Left side pane: description & constraints */}
                <div className="flex flex-col gap-5 rounded-2xl glass-panel p-6 overflow-y-auto max-h-[600px] border border-zinc-900 bg-zinc-950/40">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2 mb-1">
                    Problem Specification
                  </h4>
                  
                  <div className="text-zinc-300 text-xs font-light leading-relaxed whitespace-pre-wrap font-sans">
                    {activeChallenge.desc}
                  </div>

                  {/* Examples */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Examples</span>
                    {activeChallenge.examples.map((ex, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-900/60 p-4 rounded-xl font-mono text-[11px] leading-relaxed">
                        <div className="mb-1"><span className="text-zinc-500 uppercase font-semibold">Input:</span> <span className="text-zinc-300">{ex.input}</span></div>
                        <div className="mb-1"><span className="text-zinc-500 uppercase font-semibold">Output:</span> <span className="text-zinc-300">{ex.output}</span></div>
                        {ex.explanation && (
                          <div><span className="text-zinc-500 uppercase font-semibold">Explanation:</span> <span className="text-zinc-400">{ex.explanation}</span></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Constraints</span>
                    <ul className="list-disc pl-4 text-[10px] text-zinc-500 font-mono space-y-1.5">
                      {activeChallenge.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right side pane: interactive code editor & terminal logs */}
                <div className="flex flex-col gap-4">
                  {/* Pseudo Editor area */}
                  <div className="flex-1 min-h-[350px] relative rounded-2xl border border-zinc-900 bg-zinc-950 shadow-xl overflow-hidden flex flex-col font-mono">
                    <div className="h-10 bg-zinc-950/90 border-b border-zinc-900 flex items-center justify-between px-4 select-none">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Workspace Compile Frame
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600/30 border border-red-600/50" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-600/30 border border-yellow-600/50" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-600/30 border border-green-600/50" />
                      </div>
                    </div>

                    <textarea
                      value={editorCode}
                      onChange={e => setEditorCode(e.target.value)}
                      className="flex-1 bg-zinc-950 text-zinc-300 p-6 focus:outline-none resize-none font-mono text-[12px] leading-relaxed selection:bg-zinc-800 focus:ring-0 focus:border-0"
                      spellCheck={false}
                    />
                  </div>

                  {/* Output Terminal Console */}
                  <div className="h-44 rounded-2xl border border-zinc-900 bg-zinc-950 overflow-hidden flex flex-col font-mono text-[10px]">
                    <div className="h-8 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-4 text-zinc-500 font-semibold select-none uppercase tracking-wider">
                      <span>Evaluation Output</span>
                      {compileStatus === 'running' && (
                        <span className="text-mg-acc animate-pulse text-[9px]">Compiling...</span>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-zinc-400 bg-zinc-950/40">
                      {terminalLogs.map((log, idx) => {
                        const isCmd = log.startsWith('>');
                        const isSuccess = log.includes('ACCEPTED') || log.includes('Passed') || log.includes('Success');
                        const isErr = log.includes('Failed') || log.includes('Error');
                        return (
                          <div 
                            key={idx} 
                            className={`${isCmd ? 'text-zinc-500 font-bold' : isSuccess ? 'text-glow text-green-400' : isErr ? 'text-red-500' : 'text-zinc-400'}`}
                          >
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Console Run/Submit Controls */}
                  <div className="flex items-center justify-end gap-3 font-mono">
                    <button
                      disabled={compileStatus === 'running'}
                      onClick={runCode}
                      onMouseEnter={() => playSound('hover')}
                      className="px-5 h-10 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white cursor-pointer text-xs font-semibold uppercase tracking-wider bg-zinc-950/60 hover:bg-zinc-950 transition-colors disabled:opacity-50"
                    >
                      Run Code
                    </button>

                    {compileStatus === 'success' ? (
                      <button
                        onClick={claimReward}
                        onMouseEnter={() => playSound('hover')}
                        className="px-6 h-10 rounded-lg bg-mg-acc text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_var(--mg-acc)] hover:brightness-110 cursor-pointer"
                      >
                        Claim Reward (+{activeChallenge.xp} XP)
                      </button>
                    ) : compileStatus === 'claimed' ? (
                      <div className="px-5 h-10 rounded-lg border border-zinc-900 bg-zinc-950 text-glow text-green-400 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
                        ✓ SOLVED (+{activeChallenge.xp} XP CLAIMED)
                      </div>
                    ) : (
                      <button
                        disabled={compileStatus === 'running'}
                        onClick={submitCode}
                        onMouseEnter={() => playSound('hover')}
                        className="px-6 h-10 rounded-lg bg-zinc-100 hover:bg-white text-black font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
                      >
                        Submit Solution
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
