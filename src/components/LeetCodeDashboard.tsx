import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onAddXp: (amount: number) => void;
  playSound: (type: 'click' | 'hover') => void;
  onShareSolution: (details: { problemTitle: string; code: string; lang: string }) => void;
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
  Easy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Hard: { text: 'text-rose-400 font-semibold', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
};

// Static purple theme heatmap colors
const purpleHeatColors = ['#131318', '#1e1b4b', '#4338ca', '#6d5cff'];

// Generate activity logs for heatmap
const heatmapData = Array.from({ length: 52 * 7 }, (_, i) => {
  const r = Math.sin(i * 0.3) * 0.5 + Math.random();
  let val = 0;
  if (i > 340) val = r > 0.6 ? (r > 0.85 ? 3 : r > 0.72 ? 2 : 1) : 0;
  else val = r > 0.7 ? (r > 0.9 ? 3 : r > 0.8 ? 2 : 1) : 0;
  
  const d = new Date();
  d.setDate(d.getDate() - (52 * 7 - i));
  return {
    val,
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    count: val === 3 ? '8 submissions' : val === 2 ? '4 submissions' : val === 1 ? '1 submission' : 'No activity'
  };
});

// Autocomplete words
const AUTOCOMPLETE_WORDS = [
  'nums', 'target', 'map', 'length', 'push', 'pop', 'isValid', 
  'stack', 'Solution', 'result', 'return', 'const', 'function', 
  'let', 'char', 'hashmap', 'twoSum', 'mergeKLists'
];

export const LeetCodeDashboard = ({ onAddXp, playSound, onShareSolution }: Props) => {
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const [activeChallenge, setActiveChallenge] = useState<Problem | null>(null);
  
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('bb_solved_challenges');
    return saved ? JSON.parse(saved) : ['p1']; // Default Two Sum solved
  });

  // Editor states
  const [editorLang, setEditorLang] = useState<'javascript' | 'python' | 'cpp'>('javascript');
  const [editorCode, setEditorCode] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [compileStatus, setCompileStatus] = useState<'idle' | 'running' | 'success' | 'claimed'>('idle');
  
  const [workspaceTab, setWorkspaceTab] = useState<'solution' | 'readme' | 'tests'>('solution');
  const [consoleTab, setConsoleTab] = useState<'output' | 'cases' | 'hardware'>('output');

  // Interactive IDE editor tools
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [customTestsInput, setCustomTestsInput] = useState('');
  
  // Autocomplete popup
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);
  const [suggestionMenuPos, setSuggestionMenuPos] = useState({ top: 0, left: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Command Palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Refs for scrolling and sync
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const codeHighlightRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date(); d.setHours(24, 0, 0, 0);
      const ms = Math.max(0, d.getTime() - Date.now());
      setCountdown(`${String(Math.floor(ms / 3.6e6)).padStart(2, '0')}:${String(Math.floor((ms % 3.6e6) / 6e4)).padStart(2, '0')}:${String(Math.floor((ms % 6e4) / 1e3)).padStart(2, '0')}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const handleEditorScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
      if (codeHighlightRef.current) {
        codeHighlightRef.current.scrollTop = scrollTop;
        codeHighlightRef.current.scrollLeft = scrollLeft;
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        playSound('click');
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

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

  const openChallenge = (prob: Problem) => {
    playSound('click');
    setActiveChallenge(prob);
    setEditorCode(prob.templates[editorLang]);
    setCustomTestsInput(JSON.stringify(prob.examples, null, 2));
    setCompileStatus(solvedChallenges.includes(prob.id) ? 'claimed' : 'idle');
    setTerminalLogs(['Compile system idle. Workspace fully synced. Ready to test inputs.']);
    setWorkspaceTab('solution');
  };

  useEffect(() => {
    if (activeChallenge) {
      setEditorCode(activeChallenge.templates[editorLang]);
    }
  }, [editorLang, activeChallenge]);

  const commands = useMemo(() => {
    const list = [
      { name: 'Run Local Code Tests', desc: 'Simulate parameters locally', action: () => runCode() },
      { name: 'Submit Solution Code', desc: 'Deploy compiler target tests', action: () => submitCode() },
      { name: 'Reset Workspace Template', desc: 'Restore original stub structure', action: () => {
        if (activeChallenge) setEditorCode(activeChallenge.templates[editorLang]);
      }},
      { name: 'Switch language: JavaScript', desc: 'Toggle JS active tab', action: () => setEditorLang('javascript') },
      { name: 'Switch language: Python', desc: 'Toggle PY active tab', action: () => setEditorLang('python') },
      { name: 'Switch language: C++', desc: 'Toggle CPP active tab', action: () => setEditorLang('cpp') },
      { name: 'View Problem Specifications', desc: 'Focus instructions tab', action: () => setWorkspaceTab('readme') },
      { name: 'Edit Test Case Arrays', desc: 'Focus JSON tests tab', action: () => setWorkspaceTab('tests') },
    ];
    if (compileStatus === 'success' || compileStatus === 'claimed') {
      list.unshift({
        name: 'Share solution to Community Forum',
        desc: 'Post solution in Discussions panel',
        action: () => {
          if (activeChallenge) {
            onShareSolution({
              problemTitle: activeChallenge.title,
              code: editorCode,
              lang: editorLang
            });
          }
        }
      });
    }
    return list.filter(cmd => cmd.name.toLowerCase().includes(commandQuery.toLowerCase()));
  }, [commandQuery, activeChallenge, editorCode, editorLang, compileStatus]);

  const runCode = () => {
    playSound('click');
    setCompileStatus('running');
    setConsoleTab('output');
    setTerminalLogs(['> Initializing local compiler...', 'Parsing custom test JSON...', 'Running mock execution...']);
    
    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        '✓ Test Case 1 Passed. Output matches expected matrix.',
        '✓ Test Case 2 Passed. Constraints satisfied.',
        'Status: Ready to deploy to production cluster (Ready to Submit)'
      ]);
      setCompileStatus('idle');
    }, 1200);
  };

  const submitCode = () => {
    playSound('click');
    setCompileStatus('running');
    setConsoleTab('output');
    setTerminalLogs(['> Initiating remote build...', 'Analyzing space/time bounds...', 'Compiling symbols...']);
    
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, 'Stage 3: Running evaluations across 52 test matrices...']);
      
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          'Stage 4: Checking performance overhead thresholds...',
          '✓ 52/52 Test Matrices Passed.',
          'ACCEPTED! compiling completed successfully.'
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

  const updateCursorPosition = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });

    const lastWord = textBeforeCursor.match(/\b[a-zA-Z]{1,15}$/);
    if (lastWord) {
      const matchWord = lastWord[0].toLowerCase();
      const filtered = AUTOCOMPLETE_WORDS.filter(w => 
        w.toLowerCase().startsWith(matchWord) && w.toLowerCase() !== matchWord
      );
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setActiveSuggestionIdx(0);
        setShowSuggestions(true);
        setSuggestionMenuPos({
          top: Math.min(220, lines.length * 18 + 20),
          left: Math.min(300, (lines[lines.length - 1].length) * 8 + 40)
        });
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        playSound('click');
        insertSuggestion(suggestions[activeSuggestionIdx]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    }
  };

  const insertSuggestion = (word: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const selStart = textarea.selectionStart;
    const value = textarea.value;
    const textBefore = value.substring(0, selStart);
    const lastWordMatch = textBefore.match(/\b[a-zA-Z]{1,15}$/);
    
    if (lastWordMatch) {
      const startIdx = selStart - lastWordMatch[0].length;
      const textAfter = value.substring(textarea.selectionEnd);
      const newCode = value.substring(0, startIdx) + word + textAfter;
      setEditorCode(newCode);
      setShowSuggestions(false);
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = startIdx + word.length;
      }, 0);
    }
  };

  const getHighlightedCode = (code: string, lang: string) => {
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    const jsKeywords = /\b(function|const|let|var|return|if|else|for|while|do|class|import|export|from|new|try|catch|finally|throw|typeof|instanceof)\b/g;
    const pyKeywords = /\b(def|class|return|if|elif|else|for|in|while|try|except|finally|import|from|as|print|lambda|and|or|not|is|None|Self)\b/g;
    const cppKeywords = /\b(class|public|private|protected|virtual|override|int|float|double|bool|char|void|vector|unordered_map|map|set|stack|queue|return|if|else|for|while)\b/g;
    
    const keywords = lang === 'python' ? pyKeywords : lang === 'cpp' ? cppKeywords : jsKeywords;
    escaped = escaped.replace(keywords, '<span class="syntax-keyword">$1</span>');
    
    escaped = escaped.replace(/(['"`])(.*?)\1/g, '<span class="syntax-string">$1$2$1</span>');
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');
    escaped = escaped.replace(/(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g, '<span class="syntax-comment">$1</span>');
    
    return escaped;
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] text-zinc-100 relative flex flex-col">

      {/* Main Container */}
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8 py-10 relative z-10 flex-1 flex flex-col gap-10">
        <AnimatePresence mode="wait">
          {!activeChallenge ? (
            /* Dashboard Home Panel */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start"
            >
              {/* ═══ LEFT COLUMN (Full Width Utilization) ═══ */}
              <div className="flex flex-col gap-6">
                
                {/* Spotlight Banner - Premium Glass design */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl p-8 flex items-center justify-between gap-8 overflow-hidden relative shimmer-effect"
                  style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.12) 0%, rgba(139,92,246,0.06) 50%, rgba(109,92,255,0.03) 100%)', border: '1px solid rgba(109,92,255,0.15)' }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                        ⚡ Daily Challenge
                      </span>
                      <span className="text-sm text-zinc-500">
                        {countdown} left
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Merge K Sorted Lists
                    </h3>
                    <p className="text-base text-zinc-400 leading-relaxed max-w-[500px]">
                      Merge multiple sorted linked lists into one. Complete for bonus <span className="text-indigo-300 font-semibold">+50 XP</span>.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const spotlight = PROBLEMS.find(p => p.id === 'p3');
                      if (spotlight) openChallenge(spotlight);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="shrink-0 px-7 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-base font-semibold cursor-pointer transition-all shadow-lg shadow-indigo-500/25"
                  >
                    Start Solving →
                  </button>
                </motion.div>

                {/* Toolbar: Search + Difficulty Tabs */}
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.15 }}
                  className="flex gap-4 items-center"
                >
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      value={search} 
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search problems..."
                      className="w-full h-12 pl-11 pr-4 rounded-xl text-[15px] text-white bg-white/[0.04] placeholder-zinc-600 focus:outline-none transition-colors border border-white/[0.06] focus:border-indigo-500/30"
                    />
                  </div>

                  {/* Filter Status Reset Badge */}
                  {selectedTag && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-mg-acc/10 border border-mg-acc/20 rounded-lg text-xs text-zinc-300">
                      <span>{selectedTag}</span>
                      <button 
                        onClick={() => {
                          playSound('click');
                          setSelectedTag(null);
                        }}
                        className="text-mg-acc hover:text-white cursor-pointer font-bold text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Difficulty Selector Tabs */}
                  <div className="flex rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.03] p-1">
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
                          className={`px-5 py-2 rounded-[10px] text-[15px] font-medium cursor-pointer transition-colors relative ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="activeFilterBg"
                              className="absolute inset-0 bg-white/[0.08] rounded-[10px]"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{d}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Problem List (Stretched full screen width) */}
                <motion.div 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]"
                >
                  {/* Table Header */}
                  <div className="grid grid-cols-[48px_1fr_110px_90px_90px] items-center h-12 px-7 text-sm font-medium text-zinc-500 border-b border-white/[0.06] select-none">
                    <span></span>
                    <span>Problem</span>
                    <span className="text-center">Level</span>
                    <span className="text-center">Rate</span>
                    <span className="text-right">XP</span>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col divide-y divide-white/[0.04]">
                    <AnimatePresence mode="popLayout">
                      {visible.length === 0 ? (
                        <motion.div 
                          key="empty" 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          className="py-16 text-center text-sm text-zinc-500"
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
                              className="grid grid-cols-[48px_1fr_110px_90px_90px] items-center px-7 py-5 cursor-pointer transition-all hover:bg-white/[0.03] group"
                            >
                              {/* Status */}
                              <div className="flex justify-center">
                                {isSolved ? (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500 text-white text-sm">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-zinc-700/60 group-hover:border-indigo-500/50 transition-colors" />
                                )}
                              </div>

                              {/* Title & Tags */}
                              <div className="min-w-0 pl-3">
                                <span className="text-[16px] font-medium text-zinc-200 group-hover:text-white transition-colors">
                                  {p.num}. {p.title}
                                </span>
                                <div className="flex gap-2 mt-1.5">
                                  {p.tags.map(t => (
                                    <span key={t} className="text-[13px] px-2.5 py-0.5 rounded-lg text-zinc-500 bg-white/[0.04]">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Difficulty */}
                              <div className="text-center">
                                <span className={`text-sm px-3 py-1 rounded-lg border ${theme.text} ${theme.bg} ${theme.border}`}>
                                  {p.diff}
                                </span>
                              </div>

                              {/* Acceptance */}
                              <div className="text-center text-[15px] text-zinc-500">{p.rate}</div>

                              {/* Reward */}
                              <div className="text-right text-[15px] font-semibold text-zinc-400 group-hover:text-indigo-300 transition-colors">
                                +{p.xp}
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
              <div className="flex flex-col gap-7">

                {/* Profile card */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.25 }}
                  className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.03] relative"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" className="fill-none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                        <circle 
                          cx="28" cy="28" r="24" 
                          className="fill-none" 
                          stroke="#6d5cff"
                          strokeWidth="3"
                          strokeDasharray={150.79}
                          strokeDashoffset={150.79 - (150.79 * pct) / 100}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out', filter: 'drop-shadow(0 0 6px rgba(109,92,255,0.4))' }}
                        />
                      </svg>
                      <span className="absolute text-[15px] font-bold text-white">{pct}%</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">akrist</div>
                      <div className="text-sm text-zinc-500">Rank #142</div>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="flex flex-col gap-4">
                    {([
                      { label: 'Easy', solved: solvedChallenges.includes('p1') ? 1 : 0, total: 1, color: '#34d399' },
                      { label: 'Medium', solved: solvedChallenges.includes('p2') ? 1 : 0, total: 1, color: '#fbbf24' },
                      { label: 'Hard', solved: solvedChallenges.includes('p3') ? 1 : 0, total: 1, color: '#f87171' },
                    ]).map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between mb-2 text-sm">
                          <span style={{ color: s.color }} className="font-medium">{s.label}</span>
                          <span className="text-zinc-500">{s.solved}/{s.total}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-white/[0.04]">
                          <motion.div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: s.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${s.total ? (s.solved / s.total) * 100 : 0}%` }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/[0.06] text-center">
                    {[
                      { n: `${solvedCount}`, label: 'Solved' },
                      { n: '230', label: 'Streak' },
                      { n: 'Top 12%', label: 'Tier' }
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <div className="text-lg font-bold text-white">{s.n}</div>
                        <div className="text-sm text-zinc-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Submissions Heatmap */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.35 }}
                  className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.03]"
                >
                  <div className="flex justify-between items-center mb-5 text-sm text-zinc-500 font-medium">
                    <span>Activity</span>
                  </div>
                  
                  {/* Heatmap Grid */}
                  <div className="flex gap-[3px] overflow-hidden justify-center">
                    {Array.from({ length: 22 }, (_, week) => (
                      <div key={week} className="flex flex-col gap-[3px]">
                        {Array.from({ length: 7 }, (_, day) => {
                          const idx = week * 7 + day;
                          const log = heatmapData[idx] || { val: 0, date: '', count: 'No activity' };
                          return (
                            <div 
                              key={day}
                              className="w-[9px] h-[9px] rounded-[1.5px] cursor-pointer hover:ring-1 hover:ring-white transition-all relative group/cell"
                              style={{ background: purpleHeatColors[log.val] }}
                            >
                              {/* Glowing Tooltip */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 hidden group-hover/cell:block bg-zinc-950 border border-zinc-800 text-[8px] text-zinc-300 p-1.5 rounded shadow-xl text-center pointer-events-none z-50">
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
                  <div className="flex items-center justify-end gap-1 mt-4 text-[10px] text-zinc-600 select-none">
                    <span className="mr-1">Less</span>
                    {purpleHeatColors.map((c, i) => (
                      <div key={i} className="w-2 h-2 rounded-sm" style={{ background: c }} />
                    ))}
                    <span className="ml-1">More</span>
                  </div>
                </motion.div>

                {/* Trending Topics - interactive category filters */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.45 }}
                  className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.03]"
                >
                  <h4 className="text-sm font-medium text-zinc-500 mb-4 border-b border-white/[0.06] pb-3">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`text-sm px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                            isSelected 
                              ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                              : 'border-white/[0.06] text-zinc-500 bg-white/[0.03] hover:text-white hover:border-white/[0.12]'
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
            /* Interactive Challenge High-Fidelity IDE Workspace (Stretched fully) */
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              {/* Workspace Header & Navigation Breadcrumb */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.06] select-none gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveChallenge(null);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="h-10 px-4 rounded-xl border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white cursor-pointer text-sm font-medium transition-all bg-white/[0.02]"
                  >
                    ← Dashboard
                  </button>
                  
                  <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-500">
                    <span>problems</span>
                    <span>/</span>
                    <span className="text-white font-semibold">
                      {activeChallenge.num}. {activeChallenge.title}
                    </span>
                    <span className={`text-xs font-semibold ml-2 px-2.5 py-0.5 rounded-full border ${DC[activeChallenge.diff].text} ${DC[activeChallenge.diff].bg} ${DC[activeChallenge.diff].border}`}>
                      {activeChallenge.diff}
                    </span>
                  </div>
                </div>

                {/* Environment Controls */}
                <div className="flex items-center gap-3">
                  {/* Language Selector in Drizzle pill style */}
                  <div className="flex items-center gap-1 border border-white/[0.06] bg-white/[0.02] p-1 rounded-xl">
                    {(['javascript', 'python', 'cpp'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          playSound('click');
                          setEditorLang(lang);
                        }}
                        onMouseEnter={() => playSound('hover')}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                          editorLang === lang 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'C++'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      playSound('click');
                      setCommandPaletteOpen(true);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="h-10 px-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-zinc-400 hover:text-white cursor-pointer transition-all text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-mono text-xs opacity-60">Ctrl+P</span>
                  </button>
                </div>
              </div>

              {/* IDE Workspace Layout (Left: Drizzle-like Docs Sidebar, Right: Code Playground) */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-stretch">
                
                {/* Left Pane: Documentation & Challenge Tree Navigation */}
                <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.06] p-6 bg-white/[0.01]">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-4 select-none">
                      Documentation
                    </h4>
                    <div className="flex flex-col gap-1 text-sm">
                      <button 
                        onClick={() => { playSound('click'); setWorkspaceTab('readme'); }}
                        className={`w-full text-left py-2 px-3 rounded-lg font-medium transition-all ${
                          workspaceTab === 'readme' 
                            ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500' 
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        📖 Instructions
                      </button>
                      <button 
                        onClick={() => { playSound('click'); setWorkspaceTab('tests'); }}
                        className={`w-full text-left py-2 px-3 rounded-lg font-medium transition-all ${
                          workspaceTab === 'tests' 
                            ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500' 
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        ⚙️ Test Configurations
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-4 select-none">
                      All Challenges
                    </h4>
                    <div className="flex flex-col gap-2.5">
                      {PROBLEMS.map(p => {
                        const isCurrent = p.id === activeChallenge.id;
                        const isSolved = solvedChallenges.includes(p.id);
                        return (
                          <div 
                            key={p.id}
                            onClick={() => {
                              if (p.id !== activeChallenge.id) {
                                playSound('click');
                                openChallenge(p);
                              }
                            }}
                            className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all ${
                              isCurrent 
                                ? 'bg-white/[0.05] border border-white/[0.08] text-white' 
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                p.diff === 'Easy' ? 'bg-emerald-400' : p.diff === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                              }`} />
                              <span className="text-sm font-medium truncate">{p.title}</span>
                            </div>
                            
                            {isSolved && (
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/[0.04] text-xs text-zinc-600 select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span>Server status:</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                      </span>
                    </div>
                    <div>Target Node: runtime-v18</div>
                  </div>
                </div>

                {/* Right Pane: IDE Code Workspace Editor */}
                <div className="flex flex-col gap-6">
                  
                  {/* Code Editor Container */}
                  <div className="flex-1 min-h-[460px] relative rounded-2xl border border-white/[0.06] bg-[#0c0c11] overflow-hidden flex flex-col font-mono">
                    
                    {/* Monaco style Editor Tabs bar */}
                    <div className="h-11 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between px-5 select-none">
                      <div className="flex items-center gap-1 h-full">
                        {[
                          { id: 'solution', label: `solution.${editorLang === 'javascript' ? 'js' : editorLang === 'python' ? 'py' : 'cpp'}` },
                          { id: 'readme', label: 'instructions.md' },
                          { id: 'tests', label: 'test-cases.json' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => {
                              playSound('click');
                              setWorkspaceTab(tab.id as any);
                            }}
                            className={`h-full px-4 text-xs font-semibold cursor-pointer border-b-2 flex items-center transition-all ${
                              workspaceTab === tab.id
                                ? 'border-indigo-500 text-white bg-white/[0.01]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                      </div>
                    </div>

                    {/* Workspace active panel body */}
                    <div className="flex-1 relative flex overflow-hidden">
                      {workspaceTab === 'solution' && (
                        <>
                          {/* Line numbers gutter */}
                          <div 
                            ref={gutterRef}
                            className="w-12 bg-[#09090d] border-r border-white/[0.04] flex flex-col pt-5 items-end pr-3.5 text-zinc-600 text-xs select-none overflow-hidden leading-relaxed custom-scrollbar font-mono"
                          >
                            {editorCode.split('\n').map((_, idx) => (
                              <div key={idx} className="h-[21px] flex items-center font-bold">
                                {idx + 1}
                              </div>
                            ))}
                          </div>

                          {/* Editor text content */}
                          <div className="flex-1 relative overflow-hidden bg-transparent">
                            {/* Highlights */}
                            <pre 
                              ref={codeHighlightRef}
                              className="absolute inset-0 p-5 text-xs text-zinc-300 leading-relaxed overflow-hidden pointer-events-none select-none font-mono whitespace-pre bg-transparent border-0 outline-none z-0"
                              dangerouslySetInnerHTML={{ __html: getHighlightedCode(editorCode, editorLang) }}
                            />

                            {/* Textarea */}
                            <textarea
                              ref={textareaRef}
                              value={editorCode}
                              onChange={e => {
                                setEditorCode(e.target.value);
                                updateCursorPosition(e);
                              }}
                              onScroll={handleEditorScroll}
                              onKeyUp={updateCursorPosition}
                              onSelect={updateCursorPosition}
                              onClick={updateCursorPosition}
                              onKeyDown={handleKeyDown}
                              className="absolute inset-0 p-5 text-xs text-transparent caret-white selection:bg-indigo-500/20 selection:text-zinc-100 leading-relaxed overflow-auto font-mono whitespace-pre bg-transparent border-0 outline-none resize-none focus:ring-0 focus:border-0 w-full h-full z-10 custom-scrollbar"
                              spellCheck={false}
                            />

                            {/* Autocomplete suggestions */}
                            {showSuggestions && (
                              <div 
                                className="absolute bg-[#0f0f14] border border-white/[0.08] rounded-xl shadow-2xl p-1.5 w-48 z-30 font-mono text-xs animate-popup"
                                style={{ top: `${suggestionMenuPos.top}px`, left: `${suggestionMenuPos.left}px` }}
                              >
                                {suggestions.map((word, idx) => (
                                  <button
                                    key={word}
                                    onClick={() => insertSuggestion(word)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg cursor-pointer ${
                                      idx === activeSuggestionIdx 
                                        ? 'bg-indigo-500 text-white font-semibold' 
                                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    {word}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Minimap */}
                          <div className="w-16 h-full bg-[#0a0a0e] border-l border-white/[0.04] flex flex-col pt-5 px-1.5 overflow-hidden select-none pointer-events-none z-10">
                            {editorCode.split('\n').map((line, idx) => (
                              <div 
                                key={idx} 
                                className="h-[2px] mb-[1px] bg-zinc-800/80 rounded-sm" 
                                style={{ width: `${Math.min(100, Math.max(12, line.length * 1.8))}%` }}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {workspaceTab === 'readme' && (
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar text-zinc-300 text-sm leading-relaxed select-text">
                          <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase border-b border-white/[0.06] pb-2 mb-4">
                            Problem Description
                          </h3>
                          <div className="whitespace-pre-wrap leading-relaxed mb-6 text-[15px]">
                            {activeChallenge.desc}
                          </div>

                          {/* Examples */}
                          <div className="flex flex-col gap-4 mb-6">
                            <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Examples</span>
                            {activeChallenge.examples.map((ex, idx) => (
                              <div key={idx} className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl font-mono text-sm leading-relaxed">
                                <div className="mb-2"><span className="text-indigo-400 font-semibold">Input:</span> <span className="text-zinc-300">{ex.input}</span></div>
                                <div className="mb-2"><span className="text-indigo-400 font-semibold">Output:</span> <span className="text-zinc-300">{ex.output}</span></div>
                                {ex.explanation && (
                                  <div><span className="text-zinc-500 font-semibold">Explanation:</span> <span className="text-zinc-400">{ex.explanation}</span></div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Constraints */}
                          <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
                            <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Constraints</span>
                            <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-2">
                              {activeChallenge.constraints.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {workspaceTab === 'tests' && (
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">
                              Test Cases (JSON)
                            </span>
                          </div>
                          <textarea
                            value={customTestsInput}
                            onChange={e => setCustomTestsInput(e.target.value)}
                            className="flex-1 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-zinc-300 text-sm focus:outline-none resize-none font-mono leading-relaxed"
                            spellCheck={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Editor Status Bar */}
                    <div className="h-8 bg-[#09090d] border-t border-white/[0.06] flex items-center justify-between px-5 text-xs text-zinc-500 select-none">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          main
                        </span>
                        <span className="text-zinc-800">|</span>
                        <span>synced ✓</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                        <span className="text-zinc-800">|</span>
                        <span>Spaces: 4</span>
                        <span className="text-zinc-800">|</span>
                        <span>UTF-8</span>
                        <span className="text-zinc-800">|</span>
                        <span className="uppercase text-white font-bold">{editorLang}</span>
                      </div>
                    </div>
                  </div>

                  {/* High Fidelity Drizzle-style Console / Terminal Output */}
                  <div className="h-44 rounded-2xl border border-white/[0.06] bg-[#0c0c11] overflow-hidden flex flex-col font-mono text-sm">
                    <div className="h-10 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between px-5 text-zinc-500 font-semibold select-none">
                      <div className="flex gap-6 items-center h-full">
                        {[
                          { id: 'output', label: 'Terminal Logs' },
                          { id: 'cases', label: 'Compiler Assertions' },
                          { id: 'hardware', label: 'Environment Metrics' }
                        ].map(cTab => (
                          <button
                            key={cTab.id}
                            onClick={() => {
                              playSound('click');
                              setConsoleTab(cTab.id as any);
                            }}
                            className={`h-full text-xs font-semibold cursor-pointer border-b-2 flex items-center transition-all ${
                              consoleTab === cTab.id 
                                ? 'border-indigo-500 text-white' 
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {cTab.label}
                          </button>
                        ))}
                      </div>
                      {compileStatus === 'running' && (
                        <span className="text-indigo-400 animate-pulse text-xs">Compiling code...</span>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-1.5 custom-scrollbar bg-black/10">
                      {consoleTab === 'output' && (
                        terminalLogs.map((log, idx) => {
                          const isCmd = log.startsWith('>');
                          const isSuccess = log.includes('ACCEPTED') || log.includes('Passed') || log.includes('Success');
                          const isErr = log.includes('Failed') || log.includes('Error');
                          return (
                            <div 
                              key={idx} 
                              className={`${isCmd ? 'text-zinc-600 font-semibold' : isSuccess ? 'text-green-400 font-bold' : isErr ? 'text-rose-400 font-semibold' : 'text-zinc-300'}`}
                            >
                              {log}
                            </div>
                          );
                        })
                      )}

                      {consoleTab === 'cases' && (
                        <div className="text-zinc-400 space-y-1.5 font-mono text-xs">
                          <div><span className="text-zinc-600 font-semibold">TEST TARGET:</span> 52 Matrix Checks</div>
                          <div><span className="text-zinc-600 font-semibold">RUN TYPE:</span> Full Regression Suite</div>
                          <div className="pt-2.5 border-t border-white/[0.04] mt-2.5">
                            {compileStatus === 'success' || compileStatus === 'claimed' ? (
                              <div className="text-green-400 font-bold">✓ ALL TEST MATRICES VERIFIED (SUCCESS)</div>
                            ) : (
                              <div className="text-zinc-500">Run code or submit solution to execute example inputs against compiler.</div>
                            )}
                          </div>
                        </div>
                      )}

                      {consoleTab === 'hardware' && (
                        <div className="grid grid-cols-3 gap-4 text-zinc-500 py-1 text-xs">
                          <div className="p-3 border border-white/[0.06] rounded-xl bg-white/[0.01]">
                            <span>V8 Memory Usage</span>
                            <span className="block text-white font-bold mt-1 text-[15px]">14.2 MB</span>
                          </div>
                          <div className="p-3 border border-white/[0.06] rounded-xl bg-white/[0.01]">
                            <span>Response Latency</span>
                            <span className="block text-white font-bold mt-1 text-[15px]">12 ms</span>
                          </div>
                          <div className="p-3 border border-white/[0.06] rounded-xl bg-white/[0.01]">
                            <span>Active Workers</span>
                            <span className="block text-white font-bold mt-1 text-[15px]">4 / 4</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-between">
                    {(compileStatus === 'success' || compileStatus === 'claimed') ? (
                      <button
                        onClick={() => {
                          onShareSolution({
                            problemTitle: activeChallenge.title,
                            code: editorCode,
                            lang: editorLang
                          });
                        }}
                        onMouseEnter={() => playSound('hover')}
                        className="px-5 py-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-300 hover:text-white cursor-pointer text-sm font-semibold transition-all flex items-center gap-2"
                      >
                        <span>📢 Share Solution</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        disabled={compileStatus === 'running'}
                        onClick={runCode}
                        onMouseEnter={() => playSound('hover')}
                        className="h-12 px-5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white cursor-pointer text-sm font-semibold bg-white/[0.02] hover:bg-white/[0.05] transition-all disabled:opacity-50"
                      >
                        Run Code
                      </button>

                      {compileStatus === 'success' ? (
                        <button
                          onClick={claimReward}
                          onMouseEnter={() => playSound('hover')}
                          className="h-12 px-6 rounded-xl bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-400 cursor-pointer transition-all"
                        >
                          Claim +{activeChallenge.xp} XP
                        </button>
                      ) : compileStatus === 'claimed' ? (
                        <div className="h-12 px-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">
                          ✓ Solved (+{activeChallenge.xp} XP)
                        </div>
                      ) : (
                        <button
                          disabled={compileStatus === 'running'}
                          onClick={submitCode}
                          onMouseEnter={() => playSound('hover')}
                          className="h-12 px-6 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-white/5"
                        >
                          Submit Solution
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-[500px] border border-white/[0.08] bg-[#12121a] rounded-xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="relative border-b border-white/[0.06]">
                <input
                  type="text"
                  autoFocus
                  value={commandQuery}
                  onChange={e => setCommandQuery(e.target.value)}
                  placeholder="Search commands..."
                  className="w-full h-12 pl-5 pr-12 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white cursor-pointer border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 rounded-md"
                >
                  ESC
                </button>
              </div>

              <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                {commands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-600">
                    No commands found
                  </div>
                ) : (
                  commands.map((cmd) => (
                    <button
                      key={cmd.name}
                      onClick={() => {
                        playSound('click');
                        setCommandPaletteOpen(false);
                        cmd.action();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-white/[0.05] border border-transparent cursor-pointer flex justify-between items-center transition-all group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                          {cmd.name}
                        </span>
                        <span className="text-xs text-zinc-600 mt-0.5">
                          {cmd.desc}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-700 group-hover:text-zinc-400 select-none">
                        ↵
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
