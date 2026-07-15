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
  Easy: { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
  Medium: { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
  Hard: { text: 'text-rose-400 font-semibold', bg: 'bg-rose-500/5', border: 'border-rose-500/10' }
};

// Static green theme heatmap colors
const purpleHeatColors = ['#111116', '#1a2e05', '#3d6b0f', '#c3f73a'];

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
      
    // 1. Extract comments first to prevent matching keywords/strings inside them
    const comments: string[] = [];
    const commentRegex = lang === 'python' ? /(#.*)/g : /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
    escaped = escaped.replace(commentRegex, (match) => {
      comments.push(match);
      return `__COMMENT_${comments.length - 1}__`;
    });

    // 2. Extract strings next to prevent matching keywords inside them
    const strings: string[] = [];
    escaped = escaped.replace(/(['"`])([\s\S]*?)\1/g, (match) => {
      strings.push(match);
      return `__STRING_${strings.length - 1}__`;
    });

    // 3. Highlight keywords and numbers safely
    const jsKeywords = /\b(function|const|let|var|return|if|else|for|while|do|class|import|export|from|new|try|catch|finally|throw|typeof|instanceof)\b/g;
    const pyKeywords = /\b(def|class|return|if|elif|else|for|in|while|try|except|finally|import|from|as|print|lambda|and|or|not|is|None|Self)\b/g;
    const cppKeywords = /\b(class|public|private|protected|virtual|override|int|float|double|bool|char|void|vector|unordered_map|map|set|stack|queue|return|if|else|for|while)\b/g;
    
    const keywords = lang === 'python' ? pyKeywords : lang === 'cpp' ? cppKeywords : jsKeywords;
    escaped = escaped.replace(keywords, '<span class="syntax-keyword">$1</span>');
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');

    // 4. Restore strings wrapped in span tags
    escaped = escaped.replace(/__STRING_(\d+)__/g, (_, idx) => {
      const originalString = strings[parseInt(idx, 10)];
      return `<span class="syntax-string">${originalString}</span>`;
    });

    // 5. Restore comments wrapped in span tags
    escaped = escaped.replace(/__COMMENT_(\d+)__/g, (_, idx) => {
      const originalComment = comments[parseInt(idx, 10)];
      return `<span class="syntax-comment">${originalComment}</span>`;
    });

    return escaped;
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] text-zinc-100 relative flex flex-col">

      {/* Main Container */}
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8 py-10 relative z-10 flex-1 flex flex-col gap-10">
        <AnimatePresence mode="wait">
          {!activeChallenge ? (
            /* ═══ PROBLEMS PAGE ═══ */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-0"
            >

              {/* ══════════════════════════════════════════
                  HERO SECTION
              ══════════════════════════════════════════ */}
              <motion.div
                className="border-b border-white/[0.08] pb-8 mb-8 overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              >
                {/* Top bar */}
                <motion.div
                  className="flex items-center justify-between mb-6"
                  variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                >
                  <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600 tracking-wider uppercase">
                    <span>Binary Beats</span>
                    <span className="text-zinc-800">/</span>
                    <span className="text-zinc-400">Problem Set</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c3f73a] opacity-50" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c3f73a]" />
                      </span>
                      <span className="text-zinc-500">1,248 coders online</span>
                    </div>
                    <div className="h-3 w-px bg-white/[0.08]" />
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                      <span className="text-zinc-600">Reset in</span>
                      <span className="text-white font-bold tabular-nums">{countdown}</span>
                    </div>
                  </div>
                </motion.div>

                {/* 3-panel hero grid */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_220px_1px_220px] gap-0">

                  {/* Panel 1: Rating + sparkline */}
                  <motion.div
                    className="pr-8"
                    variants={{ hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.16,1,0.3,1] } } }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div
                        className="w-8 h-8 rounded-lg bg-[#c3f73a]/10 border border-[#c3f73a]/20 flex items-center justify-center text-sm font-bold text-[#c3f73a] font-mono"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >A</motion.div>
                      <div>
                        <div className="text-sm font-bold text-white font-heading">akrist</div>
                        <div className="text-[10px] font-mono text-zinc-600">Global Rank #142</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-end gap-2 mb-1">
                        <motion.span
                          className="text-4xl font-mono font-black text-white leading-none"
                          initial={{ opacity: 0, scale: 0.75 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200, damping: 18 }}
                        >1,842</motion.span>
                        <motion.span
                          className="text-sm font-mono text-[#c3f73a] mb-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45, duration: 0.35 }}
                        >▲ +67</motion.span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Current Rating · Division II</div>
                    </div>
                    <div className="flex items-end gap-[3px] h-8 mb-3">
                      {[40,55,35,70,50,80,60,90,75,100,85,95].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-sm cursor-pointer"
                          style={{ height: `${h}%`, background: i===11 ? '#c3f73a' : `rgba(195,247,58,${0.1+i*0.055})`, originY: 1 }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.3 + i*0.04, duration: 0.4, ease: 'easeOut' }}
                          whileHover={{ scaleY: 1.2, background: '#c3f73a' }}
                        />
                      ))}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-700">Rating trend · last 12 contests</div>
                  </motion.div>

                  <div className="hidden md:block bg-white/[0.06]" />

                  {/* Panel 2: Solve stats */}
                  <motion.div
                    className="px-8 pt-6 md:pt-0"
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}
                  >
                    <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-600 mb-4">Problems Solved</div>
                    <div className="space-y-3">
                      {([
                        { label: 'Easy', solved: solvedChallenges.includes('p1') ? 1 : 0, total: 1, color: '#34d399' },
                        { label: 'Medium', solved: solvedChallenges.includes('p2') ? 1 : 0, total: 1, color: '#fbbf24' },
                        { label: 'Hard', solved: solvedChallenges.includes('p3') ? 1 : 0, total: 1, color: '#f87171' },
                      ] as const).map((s, si) => (
                        <div key={s.label} className="flex items-center gap-3">
                          <div className="w-14 text-right text-xs font-mono font-bold" style={{ color: s.color }}>{s.solved}/{s.total}</div>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${s.total ? (s.solved/s.total)*100 : 0}%` }}
                              transition={{ delay: 0.35 + si*0.12, duration: 1, ease: [0.16,1,0.3,1] }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-600 w-10">{s.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65, duration:0.4 }}>
                          <div className="text-2xl font-mono font-black text-white">{solvedCount}</div>
                          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider mt-0.5">Total solved</div>
                        </motion.div>
                        <motion.div className="text-right" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.75, duration:0.4 }}>
                          <div className="text-2xl font-mono font-black text-white">Top {Math.max(1,100-pct)}%</div>
                          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider mt-0.5">Global tier</div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="hidden md:block bg-white/[0.06]" />

                  {/* Panel 3: Streak + recent */}
                  <motion.div
                    className="px-8 pt-6 md:pt-0"
                    variants={{ hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.16,1,0.3,1] } } }}
                  >
                    <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-600 mb-4">Current Streak</div>
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className="text-4xl font-mono font-black text-white leading-none"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 16 }}
                      >3</motion.div>
                      <div>
                        <motion.div className="text-base"
                          initial={{ rotate: -25, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
                        >🔥</motion.div>
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">days</div>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-5">
                      {['M','T','W','T','F','S','S'].map((d, i) => (
                        <motion.div key={i} className="flex-1 flex flex-col items-center gap-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.38 + i*0.06, duration: 0.3 }}
                        >
                          <motion.div
                            className={`w-full aspect-square rounded-sm ${i<3 ? 'bg-[#c3f73a]' : 'bg-white/[0.06]'}`}
                            whileHover={{ scale: 1.25 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          />
                          <span className="text-[8px] font-mono text-zinc-700">{d}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-600 mb-2">Recent</div>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { title: 'Two Sum', status: 'Accepted', color: '#34d399' },
                        { title: 'Valid Parens', status: 'Wrong Ans', color: '#f87171' },
                      ].map((r, i) => (
                        <motion.div key={i}
                          className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0"
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i*0.1, duration: 0.35 }}
                        >
                          <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[100px]">{r.title}</span>
                          <span className="text-[9px] font-mono font-bold" style={{ color: r.color }}>{r.status}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* ══════════════════════════════════════════
                  PROBLEMS SECTION — Monochrome / Editorial Brutalism
              ══════════════════════════════════════════ */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">

                {/* LEFT: Problem list */}
                <div className="flex flex-col gap-4">

                  {/* Daily challenge — compact, monochrome */}
                  <div
                    onClick={() => { const s = PROBLEMS.find(p => p.id === 'p3'); if (s) openChallenge(s); }}
                    className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 cursor-pointer hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 text-[9px] font-mono font-bold tracking-[0.15em] uppercase text-white border border-white/25 bg-white/5 px-1.5 py-0.5 rounded">Daily</span>
                      <span className="text-sm font-semibold text-white truncate">23. Merge K Sorted Lists</span>
                      <span className="shrink-0 text-[10px] font-mono text-zinc-300 border border-white/10 bg-white/[0.02] px-1.5 py-0.5 rounded uppercase tracking-wider">Hard</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[10px] font-mono text-zinc-500 hidden md:block">+50 XP bonus</span>
                      <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white transition-colors">Solve →</span>
                    </div>
                  </div>

                  {/* Filter toolbar — monochrome */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title or tag..."
                        className="w-full h-9 pl-9 pr-3 rounded-lg text-xs font-mono text-white bg-[#111116] placeholder-zinc-700 focus:outline-none border border-white/[0.08] focus:border-white/[0.2] transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg border border-white/[0.08] bg-[#111116] p-0.5 font-mono text-[11px] gap-0.5">
                        {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                          <button key={d}
                            onClick={() => { playSound('click'); setFilter(d); }}
                            className={`px-3 h-7 rounded-md font-bold cursor-pointer transition-colors whitespace-nowrap ${
                              filter === d
                                ? 'bg-white text-zinc-950'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >{d}</button>
                        ))}
                      </div>
                      {selectedTag && (
                        <button onClick={() => { playSound('click'); setSelectedTag(null); }}
                          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/20 bg-white/5 text-[11px] font-mono text-white cursor-pointer hover:bg-white/10 transition-colors">
                          #{selectedTag} ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Table header */}
                  <div className="grid grid-cols-[32px_1fr_90px_72px_72px] gap-2 items-center px-4 text-[10px] font-mono tracking-wider uppercase text-zinc-600 select-none">
                    <span />
                    <span>Problem</span>
                    <span className="text-center">Difficulty</span>
                    <span className="text-center">Acc %</span>
                    <span className="text-right">XP</span>
                  </div>

                  {/* Problem rows — monochrome */}
                  <div className="flex flex-col gap-1">
                    <AnimatePresence mode="popLayout">
                      {visible.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="py-16 text-center text-xs text-zinc-600 font-mono border border-dashed border-white/[0.05] rounded-xl">
                          No problems match your filters
                        </motion.div>
                      ) : visible.map((p, i) => {
                        const isSolved = solvedChallenges.includes(p.id);
                        // Monochrome difficulty classes
                        const diffClass = p.diff === 'Easy' 
                          ? 'border-white/10 text-zinc-400 bg-white/[0.02]' 
                          : p.diff === 'Medium' 
                            ? 'border-white/25 text-zinc-200 bg-white/[0.05]' 
                            : 'border-white/50 text-white bg-white/[0.08]';

                        return (
                          <motion.div key={p.id} layout
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => openChallenge(p)}
                            onMouseEnter={() => playSound('hover')}
                            className={`grid grid-cols-[32px_1fr_90px_72px_72px] gap-2 items-center px-4 py-3.5 rounded-lg border cursor-pointer transition-all group ${
                              isSolved
                                ? 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.1]'
                                : 'border-white/[0.08] bg-[#111116] hover:border-white/[0.2] hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex justify-center">
                              {isSolved ? (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-white/[0.15] group-hover:border-white/[0.35] transition-colors" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono text-zinc-600 tabular-nums">{p.num}.</span>
                                <span className={`text-sm font-medium truncate transition-colors ${isSolved ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>{p.title}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.tags.map(t => (
                                  <button key={t}
                                    onClick={e => { e.stopPropagation(); playSound('click'); setSelectedTag(selectedTag === t ? null : t); }}
                                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                      selectedTag === t
                                        ? 'border border-white/40 bg-white/10 text-white'
                                        : 'border border-white/[0.05] bg-white/[0.02] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.15]'
                                    }`}
                                  >{t}</button>
                                ))}
                              </div>
                            </div>
                            <div className="text-center">
                              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${diffClass}`}>{p.diff}</span>
                            </div>
                            <div className="text-center font-mono text-xs text-zinc-500 tabular-nums">{p.rate}</div>
                            <div className={`text-right font-mono text-xs font-bold tabular-nums transition-colors ${isSolved ? 'text-zinc-400' : 'text-zinc-500 group-hover:text-white'}`}>+{p.xp}</div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-700">
                    <span>Showing {visible.length} of {PROBLEMS.length} problems</span>
                    <span>{solvedCount} solved · {PROBLEMS.length - solvedCount} remaining</span>
                  </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="flex flex-col gap-4">

                  {/* Topics — monochrome */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
                    <h4 className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 mb-3">Filter by Topic</h4>
                    <div className="flex flex-col gap-1">
                      {[
                        { name: 'Array', count: 1 },
                        { name: 'Hash Table', count: 1 },
                        { name: 'Stack', count: 1 },
                        { name: 'Linked List', count: 1 },
                        { name: 'Heap', count: 1 },
                        { name: 'String', count: 1 },
                      ].map(t => {
                        const isActive = selectedTag === t.name;
                        return (
                          <button key={t.name}
                            onClick={() => { playSound('click'); setSelectedTag(isActive ? null : t.name); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-mono cursor-pointer transition-all ${
                              isActive
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent'
                            }`}
                          >
                            <span>{t.name}</span>
                            <span className={`text-[10px] tabular-nums ${isActive ? 'text-white' : 'text-zinc-700'}`}>{t.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity heatmap — monochrome (grey shades) */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">Activity</h4>
                      <span className="text-[10px] font-mono text-zinc-600">22 weeks</span>
                    </div>
                    <div className="flex gap-[3px] overflow-hidden justify-center">
                      {Array.from({ length: 22 }, (_, week) => (
                        <div key={week} className="flex flex-col gap-[3px]">
                          {Array.from({ length: 7 }, (_, day) => {
                            const idx = week * 7 + day;
                            const log = heatmapData[idx] || { val: 0, date: '', count: 'No activity' };
                            const monoColors = ['#111116', '#222226', '#44444a', '#ffffff'];
                            return (
                              <div key={day}
                                className="w-[9px] h-[9px] rounded-[1.5px] cursor-pointer hover:ring-1 hover:ring-white/30 transition-all relative group/cell"
                                style={{ background: monoColors[log.val] }}>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 hidden group-hover/cell:block bg-[#0a0a0f] border border-white/[0.08] text-[8px] text-zinc-300 p-1.5 rounded shadow-xl text-center pointer-events-none z-50">
                                  <span className="block font-bold text-white">{log.count}</span>
                                  <span className="text-[7px] text-zinc-500">{log.date}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[9px] font-mono text-zinc-700">Less</span>
                      <div className="flex gap-1">
                        {['#111116', '#222226', '#44444a', '#ffffff'].map((c, i) => (
                          <div key={i} className="w-2 h-2 rounded-sm" style={{ background: c }} />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-zinc-700">More</span>
                    </div>
                  </div>

                  {/* Next contest — monochrome */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">Next Contest</h4>
                      <span className="text-[9px] font-mono text-white border border-white/20 px-1.5 py-0.5 rounded">Upcoming</span>
                    </div>
                    <div className="text-sm font-bold text-white mb-1">Weekly Round #47</div>
                    <div className="text-[11px] font-mono text-zinc-500 mb-3">Sat, Jul 19 · 20:00 IST · 2h duration</div>
                    <div className="font-mono text-xs text-zinc-400">
                      <span className="text-white font-bold text-base tabular-nums">3d 21h 13m</span>
                      <span className="text-zinc-700 text-[10px] ml-2">until start</span>
                    </div>
                  </div>
                </div>
              </div>            </motion.div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] select-none gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveChallenge(null);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="h-9 px-3.5 rounded-lg border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 hover:text-white cursor-pointer text-xs font-bold font-mono uppercase tracking-wider transition-all bg-white/[0.01]"
                  >
                    ← Dashboard
                  </button>
                  
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <span>problems</span>
                    <span>/</span>
                    <span className="text-white font-semibold font-sans text-sm">
                      {activeChallenge.num}. {activeChallenge.title}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ml-2 px-2 py-0.5 rounded border ${DC[activeChallenge.diff].text} ${DC[activeChallenge.diff].bg} ${DC[activeChallenge.diff].border}`}>
                      {activeChallenge.diff}
                    </span>
                  </div>
                </div>

                {/* Environment Controls */}
                <div className="flex items-center gap-3">
                  {/* Language Selector in Drizzle pill style */}
                  <div className="flex items-center gap-0.5 border border-white/[0.08] bg-[#111116] p-0.5 rounded-lg font-mono text-xs">
                    {(['javascript', 'python', 'cpp'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          playSound('click');
                          setEditorLang(lang);
                        }}
                        onMouseEnter={() => playSound('hover')}
                        className={`px-3 h-7 rounded-md font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          editorLang === lang 
                            ? 'bg-[#c3f73a] text-black shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {lang === 'javascript' ? 'JS' : lang === 'python' ? 'PY' : 'C++'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      playSound('click');
                      setCommandPaletteOpen(true);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="h-9 px-3.5 rounded-lg border border-white/[0.08] bg-[#111116] hover:bg-white/[0.04] text-zinc-400 hover:text-white cursor-pointer transition-all text-xs font-mono flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="opacity-60">Ctrl+P</span>
                  </button>
                </div>
              </div>

              {/* IDE Workspace Layout (Left: Drizzle-like Docs Sidebar, Right: Code Playground) */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-stretch">
                
                {/* Left Pane: Documentation & Challenge Tree Navigation */}
                <div className="flex flex-col gap-6 rounded-xl border border-white/[0.08] p-5 bg-[#111116]">
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 mb-3 select-none">
                      Documentation
                    </h4>
                    <div className="flex flex-col gap-0.5 text-xs font-mono">
                      <button 
                        onClick={() => { playSound('click'); setWorkspaceTab('readme'); }}
                        className={`w-full text-left py-2 px-3 rounded transition-all ${
                          workspaceTab === 'readme' 
                            ? 'bg-[#c3f73a]/5 text-white border-l-2 border-l-[#c3f73a]' 
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        📖 Instructions
                      </button>
                      <button 
                        onClick={() => { playSound('click'); setWorkspaceTab('tests'); }}
                        className={`w-full text-left py-2 px-3 rounded transition-all ${
                          workspaceTab === 'tests' 
                            ? 'bg-[#c3f73a]/5 text-white border-l-2 border-l-[#c3f73a]' 
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        ⚙️ Test Configurations
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 mb-3 select-none">
                      All Challenges
                    </h4>
                    <div className="flex flex-col gap-1.5">
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
                            className={`group flex items-center justify-between py-2 px-3 rounded cursor-pointer transition-all font-mono ${
                              isCurrent 
                                ? 'bg-white/[0.04] border border-white/[0.08] text-white' 
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                p.diff === 'Easy' ? 'bg-emerald-400' : p.diff === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                              }`} />
                              <span className="text-xs font-medium truncate">{p.title}</span>
                            </div>
                            
                            {isSolved && (
                              <span className="text-[10px] text-[#c3f73a] bg-[#c3f73a]/10 px-1 py-0.5 rounded">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/[0.08] text-[10px] font-mono text-zinc-600 select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span>Server status:</span>
                      <span className="text-[#c3f73a] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c3f73a]" /> Online
                      </span>
                    </div>
                    <div>Target Node: runtime-v18</div>
                  </div>
                </div>

                {/* Right Pane: IDE Code Workspace Editor */}
                <div className="flex flex-col gap-6">
                  
                  {/* Code Editor Container */}
                  <div className="flex-1 min-h-[460px] relative rounded-xl border border-white/[0.08] bg-[#0c0c11] overflow-hidden flex flex-col font-mono">
                    
                    {/* Monaco style Editor Tabs bar */}
                    <div className="h-10 bg-white/[0.01] border-b border-white/[0.08] flex items-center justify-between px-5 select-none">
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
                            className={`h-full px-4 text-xs font-bold cursor-pointer border-b-2 flex items-center transition-all ${
                              workspaceTab === tab.id
                                ? 'border-b-[#c3f73a] text-white bg-white/[0.01]'
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
                    <div className="h-8 bg-[#09090d] border-t border-white/[0.08] flex items-center justify-between px-5 text-[10px] font-mono text-zinc-500 select-none">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-[#c3f73a] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c3f73a]" />
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
                  <div className="h-44 rounded-xl border border-white/[0.08] bg-[#0c0c11] overflow-hidden flex flex-col font-mono text-xs">
                    <div className="h-10 bg-white/[0.01] border-b border-white/[0.08] flex items-center justify-between px-5 text-zinc-500 font-semibold select-none">
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
                            className={`h-full text-[10px] font-mono tracking-wider uppercase cursor-pointer border-b-2 flex items-center transition-all ${
                              consoleTab === cTab.id 
                                ? 'border-[#c3f73a] text-white' 
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {cTab.label}
                          </button>
                        ))}
                      </div>
                      {compileStatus === 'running' && (
                        <span className="text-[#c3f73a] animate-pulse text-xs font-mono">Compiling code...</span>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-1.5 custom-scrollbar bg-black/10">
                      {consoleTab === 'output' && (
                        terminalLogs.map((log, idx) => {
                          const isCmd = log.startsWith('>');
                          const isSuccess = log.includes('ACCEPTED') || log.includes('Passed') || log.includes('Success') || log.includes('COMPLETED') || log.includes('claimed');
                          const isErr = log.includes('Failed') || log.includes('Error');
                          return (
                            <div 
                              key={idx} 
                              className={`${isCmd ? 'text-zinc-600 font-semibold' : isSuccess ? 'text-[#c3f73a] font-bold' : isErr ? 'text-rose-400 font-semibold' : 'text-zinc-300'}`}
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
                          <div className="pt-2.5 border-t border-white/[0.08] mt-2.5">
                            {compileStatus === 'success' || compileStatus === 'claimed' ? (
                              <div className="text-[#c3f73a] font-bold">✓ ALL TEST MATRICES VERIFIED (SUCCESS)</div>
                            ) : (
                              <div className="text-zinc-500">Run code or submit solution to execute example inputs against compiler.</div>
                            )}
                          </div>
                        </div>
                      )}

                      {consoleTab === 'hardware' && (
                        <div className="grid grid-cols-3 gap-3 text-zinc-500 py-1 text-xs">
                          <div className="p-3 border border-white/[0.08] rounded-lg bg-white/[0.01]">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">V8 Memory Usage</span>
                            <span className="block text-white font-bold mt-1 text-sm font-mono">14.2 MB</span>
                          </div>
                          <div className="p-3 border border-white/[0.08] rounded-lg bg-white/[0.01]">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Response Latency</span>
                            <span className="block text-white font-bold mt-1 text-sm font-mono">12 ms</span>
                          </div>
                          <div className="p-3 border border-white/[0.08] rounded-lg bg-white/[0.01]">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Active Workers</span>
                            <span className="block text-white font-bold mt-1 text-sm font-mono">4 / 4</span>
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
                        className="px-4 py-2.5 rounded-lg border border-[#c3f73a]/25 bg-[#c3f73a]/5 hover:bg-[#c3f73a]/10 text-white cursor-pointer text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                      >
                        <span>📢 Share Solution</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-3 select-none">
                      <button
                        disabled={compileStatus === 'running'}
                        onClick={runCode}
                        onMouseEnter={() => playSound('hover')}
                        className="h-10 px-4.5 rounded-lg border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 hover:text-white cursor-pointer text-xs font-mono font-bold uppercase tracking-wider bg-[#111116] hover:bg-white/[0.02] transition-all disabled:opacity-50"
                      >
                        Run Code
                      </button>

                      {compileStatus === 'success' ? (
                        <button
                          onClick={claimReward}
                          onMouseEnter={() => playSound('hover')}
                          className="h-10 px-5 rounded-lg bg-[#c3f73a] hover:bg-[#b0e230] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all"
                        >
                          Claim +{activeChallenge.xp} XP
                        </button>
                      ) : compileStatus === 'claimed' ? (
                        <div className="h-10 px-4.5 rounded-lg border border-[#c3f73a]/20 bg-[#c3f73a]/5 text-[#c3f73a] flex items-center justify-center text-xs font-mono font-bold uppercase tracking-wider">
                          ✓ Solved (+{activeChallenge.xp} XP)
                        </div>
                      ) : (
                        <button
                          disabled={compileStatus === 'running'}
                          onClick={submitCode}
                          onMouseEnter={() => playSound('hover')}
                          className="h-10 px-5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
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
              className="w-full max-w-[500px] border border-white/[0.08] bg-[#111116] rounded-xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="relative border-b border-white/[0.08] p-1.5 bg-black/20">
                <input
                  type="text"
                  autoFocus
                  value={commandQuery}
                  onChange={e => setCommandQuery(e.target.value)}
                  placeholder="Search commands..."
                  className="w-full h-10 pl-4 pr-12 bg-transparent text-xs font-mono text-white placeholder-zinc-600 focus:outline-none"
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-500 hover:text-white cursor-pointer border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 rounded"
                >
                  ESC
                </button>
              </div>

              <div className="p-1.5 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                {commands.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-zinc-600">
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
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-white/[0.02] border border-transparent cursor-pointer flex justify-between items-center transition-all group font-mono"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                          {cmd.name}
                        </span>
                        <span className="text-[10px] text-zinc-600 mt-0.5">
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
