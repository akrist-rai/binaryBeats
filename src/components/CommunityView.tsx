import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CommunityViewProps {
  playSound: (type: 'click' | 'hover') => void;
  onAddXp: (amount: number) => void;
  sharedCode: { problemTitle: string; code: string; lang: string } | null;
  onClearSharedCode: () => void;
}

interface ForumThread {
  id: string;
  title: string;
  author: string;
  avatar: string;
  content: string;
  tag: 'Solutions' | 'Contest' | 'General' | 'Bugs';
  upvotes: number;
  commentsCount: number;
  date: string;
  comments: Array<{
    id: string;
    author: string;
    avatar: string;
    content: string;
    date: string;
  }>;
}

interface ActivityEvent {
  id: string;
  message: string;
  time: string;
  icon: string;
}

interface Clan {
  id: string;
  name: string;
  tag: string;
  members: number;
  weeklyXp: number;
  desc: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  playSound,
  onAddXp,
  sharedCode,
  onClearSharedCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'forum' | 'feed' | 'clans'>('forum');
  
  // Clans State
  const [userClan, setUserClan] = useState<string | null>(() => {
    return localStorage.getItem('bb_user_clan') || null;
  });

  const initialClans: Clan[] = [
    { id: 'c1', name: 'Bit Shifters', tag: 'BITS', members: 24, weeklyXp: 14850, desc: 'Optimizing O(1) algorithms and byte alignment.' },
    { id: 'c2', name: 'Kernel Panic', tag: 'PANIC', members: 18, weeklyXp: 12400, desc: 'Systems programming enthusiasts and assembly hackers.' },
    { id: 'c3', name: 'Null Pointers', tag: 'NULL', members: 15, weeklyXp: 9920, desc: 'Dereferencing the void. We operate in safe spaces.' },
    { id: 'c4', name: 'Stack Overflowers', tag: 'OVER', members: 9, weeklyXp: 6800, desc: 'Recursion limits are just suggestions. Keep pushing!' }
  ];

  const [clans, setClans] = useState<Clan[]>(initialClans);

  // Activity Feed State
  const [activities, setActivities] = useState<ActivityEvent[]>([
    { id: 'a1', message: 'compile_king solved Valid Parentheses (+150 XP)', time: 'Just now', icon: '⚡' },
    { id: 'a2', message: 'syntax_scripter unlocked badge "Night Owl"', time: '2m ago', icon: '🏆' },
    { id: 'a3', message: 'byte_boss upvoted a solution to Merge K Sorted Lists', time: '5m ago', icon: '👍' },
    { id: 'a4', message: 'git_gud joined clan Bit Shifters', time: '12m ago', icon: '🛡️' },
    { id: 'a5', message: 'cache_flow registered for Binary Blitz #04', time: '20m ago', icon: '🎫' },
  ]);

  // Threads State
  const [threads, setThreads] = useState<ForumThread[]>([
    {
      id: 't1',
      title: 'Two Sum: Javascript 99.8% Speed O(N) Hashmap solution',
      author: 'byte_boss',
      avatar: 'BB',
      tag: 'Solutions',
      upvotes: 42,
      commentsCount: 3,
      date: '2h ago',
      content: 'Using a JavaScript Map provides sub-millisecond retrieval compared to objects. Highly recommended to store values mapping to indexes.',
      comments: [
        { id: 'c1_1', author: 'syntax_scripter', avatar: 'SS', content: 'Clean solution! Can also be solved with an object in slightly slower runtimes due to hashing overhead.', date: '1h ago' },
        { id: 'c1_2', author: 'compile_king', avatar: 'CK', content: 'Very neat. O(N) space complexity is negligible for these sizes.', date: '45m ago' }
      ]
    },
    {
      id: 't2',
      title: 'Binary Blitz #04 prep thread - what topics to expect?',
      author: 'compile_king',
      avatar: 'CK',
      tag: 'Contest',
      upvotes: 18,
      commentsCount: 2,
      date: '4h ago',
      content: 'Blitz matches typically feature stacks, arrays, heap problems, and basic dynamic programming. Let us use this thread to coordinate training!',
      comments: [
        { id: 'c2_1', author: 'cache_flow', avatar: 'CF', content: 'Hoping for a stack challenge. Parenthesis manipulation matches my core libraries!', date: '3h ago' }
      ]
    },
    {
      id: 't3',
      title: 'Recursion vs Loop stack overhead in modern runtimes',
      author: 'syntax_scripter',
      avatar: 'SS',
      tag: 'General',
      upvotes: 27,
      commentsCount: 1,
      date: '1d ago',
      content: 'In V8, recursive calls push scopes to the callstack, risking overflows. Loop iteration with manual stack objects is far safer for nested trees.',
      comments: [
        { id: 'c3_1', author: 'byte_boss', avatar: 'BB', content: 'Correct. Tailwind recursive trees also suffer stack limits. Loop arrays is standard practice.', date: '18h ago' }
      ]
    },
    {
      id: 't4',
      title: 'Compiler warnings for vectors in older C++ frameworks',
      author: 'cache_flow',
      avatar: 'CF',
      tag: 'Bugs',
      upvotes: 5,
      commentsCount: 0,
      date: '2d ago',
      content: 'Seeing warnings about capacity reservations on C++17 compilers. Will verify optimization directives and update the codebase.',
      comments: []
    }
  ]);

  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<'All' | 'Solutions' | 'Contest' | 'General' | 'Bugs'>('All');
  
  // Post Creator Modal
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState<'Solutions' | 'Contest' | 'General' | 'Bugs'>('Solutions');
  const [newContent, setNewContent] = useState('');

  // Handle Shared Code from Code Editor
  useEffect(() => {
    if (sharedCode) {
      setNewTitle(`My ${sharedCode.lang.toUpperCase()} solution for ${sharedCode.problemTitle}`);
      setNewTag('Solutions');
      setNewContent(`Here is my accepted solution written in ${sharedCode.lang.toUpperCase()}:\n\n\`\`\`${sharedCode.lang}\n${sharedCode.code}\n\`\`\``);
      setIsCreatorOpen(true);
      onClearSharedCode(); // clear to avoid re-opening
    }
  }, [sharedCode]);

  // Periodic Activity Generator to make feed feel live
  useEffect(() => {
    const users = ['byte_boss', 'compile_king', 'syntax_scripter', 'cache_flow', 'stack_trace', 'git_gud', 'binary_beats_fan', 'novice_coder'];
    const problems = ['Two Sum', 'Valid Parentheses', 'Merge K Sorted Lists', 'LRU Cache', 'Reverse Linked List', 'Binary Tree Inorder'];
    const badges = ['Speed Demon', 'First Blood', 'Bug Hunter', 'Weekend Warrior', 'Compiler King'];
    const clanNames = ['Bit Shifters', 'Kernel Panic', 'Null Pointers', 'Stack Overflowers'];
    
    const interval = setInterval(() => {
      if (activeSubTab !== 'feed') return;
      
      const randType = Math.floor(Math.random() * 4);
      const user = users[Math.floor(Math.random() * users.length)];
      let message = '';
      let icon = '⚡';

      switch (randType) {
        case 0:
          const prob = problems[Math.floor(Math.random() * problems.length)];
          const xpGained = Math.random() > 0.7 ? 300 : Math.random() > 0.4 ? 150 : 80;
          message = `${user} solved ${prob} (+${xpGained} XP)`;
          icon = '✓';
          break;
        case 1:
          const badge = badges[Math.floor(Math.random() * badges.length)];
          message = `${user} unlocked badge "${badge}"`;
          icon = '🏆';
          break;
        case 2:
          const clan = clanNames[Math.floor(Math.random() * clanNames.length)];
          message = `${user} joined clan "${clan}"`;
          icon = '🛡️';
          break;
        case 3:
          const targetProb = problems[Math.floor(Math.random() * problems.length)];
          message = `${user} upvoted a solution to ${targetProb}`;
          icon = '👍';
          break;
      }

      const newEvent: ActivityEvent = {
        id: 'a_' + Date.now(),
        message,
        time: 'Just now',
        icon
      };

      setActivities(prev => [newEvent, ...prev.slice(0, 15)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeSubTab]);

  // Upvote logic
  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, upvotes: t.upvotes + 1 };
      }
      return t;
    }));
    if (selectedThread && selectedThread.id === id) {
      setSelectedThread(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    }
  };

  // Join Clan Logic
  const handleJoinClan = (id: string) => {
    playSound('click');
    const targetClan = clans.find(c => c.id === id);
    if (!targetClan) return;

    if (userClan === targetClan.name) {
      // Leave clan
      setUserClan(null);
      localStorage.removeItem('bb_user_clan');
      setClans(prev => prev.map(c => {
        if (c.id === id) return { ...c, members: c.members - 1 };
        return c;
      }));
    } else {
      // Join clan
      // If already in a clan, decrement old one
      setClans(prev => prev.map(c => {
        if (userClan && c.name === userClan) return { ...c, members: c.members - 1 };
        if (c.id === id) return { ...c, members: c.members + 1 };
        return c;
      }));
      setUserClan(targetClan.name);
      localStorage.setItem('bb_user_clan', targetClan.name);
      onAddXp(25); // Reward XP for joining clan
    }
  };

  // Add Comment Logic
  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedThread) return;
    playSound('click');
    
    const newComment = {
      id: 'c_' + Date.now(),
      author: 'akrist',
      avatar: 'AK',
      content: commentInput.trim(),
      date: 'Just now'
    };

    const updatedComments = [...selectedThread.comments, newComment];

    setThreads(prev => prev.map(t => {
      if (t.id === selectedThread.id) {
        return { 
          ...t, 
          commentsCount: t.commentsCount + 1,
          comments: updatedComments
        };
      }
      return t;
    }));

    setSelectedThread(prev => prev ? {
      ...prev,
      commentsCount: prev.commentsCount + 1,
      comments: updatedComments
    } : null);

    setCommentInput('');
    onAddXp(5); // comment XP reward
  };

  // Create Thread Logic
  const handleCreateThread = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    playSound('click');

    const newThread: ForumThread = {
      id: 't_' + Date.now(),
      title: newTitle.trim(),
      author: 'akrist',
      avatar: 'AK',
      tag: newTag,
      upvotes: 1,
      commentsCount: 0,
      date: 'Just now',
      content: newContent.trim(),
      comments: []
    };

    setThreads(prev => [newThread, ...prev]);
    setIsCreatorOpen(false);
    setNewTitle('');
    setNewContent('');
    onAddXp(15); // reward 15 XP for sharing/creating discussion
  };

  // Filter threads
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchTag = selectedTag === 'All' || t.tag === selectedTag;
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTag && matchSearch;
    });
  }, [threads, selectedTag, searchQuery]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] text-white bg-[#0a0a0f] relative pb-12">
      <div className="w-full px-12 py-8 relative z-10 max-w-7xl mx-auto">
        
        {/* Hub Header & Navigation sub-tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-6 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-white mb-2">
              Community Hub
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              Sync templates, review solutions, and coordinate within engineering guilds
            </p>
          </div>

          {/* Sub tabs */}
          <div className="flex rounded-lg overflow-hidden border border-white/[0.08] bg-[#111116] p-0.5 font-mono text-[10px]">
            {[
              { id: 'forum', label: 'Discussions' },
              { id: 'feed', label: 'Live Activities' },
              { id: 'clans', label: 'Guilds / Clans' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('click');
                  setActiveSubTab(tab.id as any);
                  setSelectedThread(null);
                }}
                className={`px-4 h-8 rounded-md font-bold tracking-wider cursor-pointer uppercase transition-colors relative`}
                style={{ color: activeSubTab === tab.id ? '#000000' : '#71717a' }}
              >
                {activeSubTab === tab.id && (
                  <motion.span
                    layoutId="activeSubTabBg"
                    className="absolute inset-0 bg-[#c3f73a] rounded-md shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ TAB CONTENT: DISCUSSIONS FORUM ═══ */}
        {activeSubTab === 'forum' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            
            {/* Left side: Forum View */}
            <div className="flex flex-col gap-5">
              {selectedThread ? (
                /* Thread Detail Page */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 border border-white/[0.08] bg-[#111116]"
                >
                  {/* Thread Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => {
                        playSound('click');
                        setSelectedThread(null);
                      }}
                      className="px-3 py-1.5 rounded-md border border-white/[0.08] hover:border-white/[0.16] text-zinc-400 hover:text-white cursor-pointer font-mono text-[10px] uppercase tracking-wider bg-white/[0.02]"
                    >
                      ← Back to Feed
                    </button>
                    
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#c3f73a]/25 bg-[#c3f73a]/5 text-[#c3f73a]">
                      {selectedThread.tag}
                    </span>
                  </div>

                  {/* Title & Author Info */}
                  <div className="flex gap-4 items-start mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white shadow-sm font-mono">
                      {selectedThread.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold font-mono text-white leading-tight">
                        {selectedThread.title}
                      </h3>
                      <div className="flex gap-3 text-[10px] text-zinc-500 font-mono mt-1">
                        <span>POSTED BY: @{selectedThread.author}</span>
                        <span>⏱ {selectedThread.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="bg-white/[0.02] border border-white/[0.08] p-5 rounded-lg text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans mb-6">
                    {selectedThread.content}
                  </div>

                  {/* Upvote Bar */}
                  <div className="flex items-center gap-4 border-b border-white/[0.08] pb-5 mb-5">
                    <button
                      onClick={(e) => handleUpvote(selectedThread.id, e)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#c3f73a]/20 bg-[#c3f73a]/5 hover:border-[#c3f73a]/40 text-[#c3f73a] cursor-pointer text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                    >
                      <span>👍 Upvote</span>
                      <span className="font-bold text-white">{selectedThread.upvotes}</span>
                    </button>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      {selectedThread.commentsCount} Comments
                    </span>
                  </div>

                  {/* Comments list */}
                  <div className="flex flex-col gap-4 mb-6">
                    <h4 className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Review Thread Comments
                    </h4>

                    {selectedThread.comments.length === 0 ? (
                      <div className="py-4 text-center text-xs text-zinc-500 font-mono bg-white/[0.02] rounded-lg border border-dashed border-white/[0.08]">
                        No responses yet. Start the review thread!
                      </div>
                    ) : (
                      selectedThread.comments.map(c => (
                        <div key={c.id} className="flex gap-3 items-start p-4 rounded-lg border border-white/[0.08] bg-white/[0.01]">
                          <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] font-bold text-zinc-300 font-mono">
                            {c.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-bold text-zinc-200 font-mono">@{c.author}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{c.date}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment editor */}
                  <div className="flex flex-col gap-3 font-mono">
                    <textarea
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      placeholder="Compile response or review comments..."
                      className="w-full h-20 p-3 bg-[#111116] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#c3f73a]/30 resize-none font-mono"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddComment}
                        className="px-5 h-8 rounded-md bg-white hover:bg-zinc-100 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Post Response
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Thread Feed list */
                <div className="flex flex-col gap-4">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center font-mono">
                    {/* Search forum */}
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search posts or code..."
                        className="w-full h-9 pl-9 pr-3 rounded text-xs text-white bg-[#111116] placeholder-zinc-700 focus:outline-none transition-colors border border-white/[0.08] focus:border-[#c3f73a]/30 shadow-inner"
                      />
                    </div>

                    {/* New Post Button */}
                    <button
                      onClick={() => {
                        playSound('click');
                        setIsCreatorOpen(true);
                      }}
                      className="px-4 h-9 rounded bg-[#c3f73a] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_#c3f73a] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>+ Create Post</span>
                    </button>
                  </div>

                  {/* Thread Cards list */}
                  <div className="flex flex-col gap-3">
                    {filteredThreads.length === 0 ? (
                      <div className="py-16 text-center text-xs text-zinc-500 font-mono rounded border border-dashed border-white/[0.08] bg-[#111116]/10">
                        No discussion threads match this criteria
                      </div>
                    ) : (
                      filteredThreads.map(t => (
                        <motion.div 
                          key={t.id} 
                          layout
                          onClick={() => {
                            playSound('click');
                            setSelectedThread(t);
                          }}
                          className="rounded p-5 border border-white/[0.08] bg-[#111116]/30 hover:bg-[#111116]/60 transition-colors cursor-pointer flex gap-4 items-start group"
                        >
                          {/* Left avatar column */}
                          <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-white/[0.08] font-mono shadow-sm group-hover:border-[#c3f73a]/30 transition-colors">
                            {t.avatar}
                          </div>

                          {/* Right main column */}
                          <div className="flex-1 min-w-0 font-mono">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/[0.08] bg-[#0a0a0f] text-zinc-500">
                                {t.tag}
                              </span>
                              <span className="text-[9.5px] text-zinc-600">
                                Posted by @{t.author} • {t.date}
                              </span>
                            </div>

                            <h3 className="text-[13px] font-bold text-zinc-300 group-hover:text-white transition-colors leading-tight">
                              {t.title}
                            </h3>
                            
                            <p className="text-[10px] text-zinc-500 font-sans mt-1.5 line-clamp-1 font-light">
                              {t.content}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-[10px] text-zinc-500 font-mono">
                              <button
                                onClick={(e) => handleUpvote(t.id, e)}
                                className="flex items-center gap-1.5 hover:text-white transition-colors group/up"
                              >
                                <span className="group-hover/up:scale-110 transition-transform">👍</span>
                                <span className="font-bold">{t.upvotes}</span>
                              </button>
                              
                              <div className="flex items-center gap-1.5">
                                <span>💬</span>
                                <span className="font-bold">{t.commentsCount} Comments</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Categories filtering panel */}
            {/* Right side: Categories filtering panel */}
            <div className="flex flex-col gap-6 font-mono">
              <div className="rounded-xl p-5 border border-white/[0.08] bg-[#111116]">
                <h4 className="text-[10px] font-bold text-zinc-500 mb-3.5 uppercase tracking-wider border-b border-white/[0.08] pb-2">
                  Topic Filter
                </h4>
                <div className="flex flex-col gap-2">
                  {(['All', 'Solutions', 'Contest', 'General', 'Bugs'] as const).map(tag => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          playSound('click');
                          setSelectedTag(tag);
                          setSelectedThread(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-white/[0.03] text-[#c3f73a] border-[#c3f73a]/30 font-bold' 
                            : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                        }`}
                      >
                        <span>{tag === 'All' ? 'All Channels' : `# ${tag}`}</span>
                        {tag !== 'All' && (
                          <span className={`text-[9px] border px-1.5 py-0.5 rounded ${
                            isSelected 
                              ? 'text-[#c3f73a] bg-[#c3f73a]/5 border-[#c3f73a]/20'
                              : 'text-zinc-600 bg-[#111116] border-white/[0.08]'
                          }`}>
                            {threads.filter(t => t.tag === tag).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guidelines panel */}
              <div className="rounded-xl p-5 border border-white/[0.08] bg-[#111116] text-[10px] text-zinc-500">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-white/[0.08] pb-2">
                  Code Sharing Protocol
                </h4>
                <ul className="flex flex-col gap-2.5 list-none pl-0 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-[#c3f73a]">◼</span>
                    <span>Sanitize secrets, keys, and tokens prior to uploading scripts.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#c3f73a]">◼</span>
                    <span>Explain O(N) constraints to simplify complexity reviews.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#c3f73a]">◼</span>
                    <span>Upvote optimized compilers to encourage clean architecture.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* ═══ TAB CONTENT: LIVE ACTIVITIES ═══ */}
        {activeSubTab === 'feed' && (
          <div className="w-full font-mono">
            <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6 select-none">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Live Activity Signal Feed
                </span>
                <span className="flex items-center gap-1.5 text-[9px] text-[#c3f73a] uppercase tracking-widest font-black animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c3f73a]" />
                  Live Syncing
                </span>
              </div>

              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {activities.map((a) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden', margin: 0, padding: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="flex items-start gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs shadow-inner">
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-zinc-200 leading-relaxed">
                          {a.message}
                        </p>
                        <span className="text-[8px] text-zinc-600 block mt-1 uppercase font-bold">
                          ⏱ {a.time}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB CONTENT: CLANS HUB ═══ */}
        {activeSubTab === 'clans' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Clans list */}
            <div className="flex flex-col gap-4 font-mono">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 border-b border-white/[0.08] pb-2">
                Clans Standing Leaderboard
              </h3>

              <div className="flex flex-col gap-3">
                {clans.map((clan, idx) => {
                  const isMember = userClan === clan.name;
                  return (
                    <div 
                      key={clan.id}
                      className={`rounded-lg p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isMember 
                          ? 'border-[#c3f73a] bg-[#c3f73a]/5 shadow-[0_0_15px_rgba(195,247,58,0.04)]' 
                          : 'border-white/[0.08] bg-[#111116] hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-xs border ${
                          isMember 
                            ? 'bg-[#c3f73a] text-black border-[#c3f73a]' 
                            : 'bg-white/[0.02] text-zinc-400 border-white/[0.08]'
                        }`}>
                          {clan.tag}
                        </div>
                        <div className="flex flex-col max-w-sm">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{clan.name}</span>
                            <span className="text-[9px] text-zinc-500">#{idx + 1} GUILD</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-sans font-light mt-1.5 leading-relaxed">
                            {clan.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-500 block">WEEKLY XP</span>
                          <span className="text-xs font-bold text-zinc-300">{clan.weeklyXp.toLocaleString()} XP</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-500 block">CODERS</span>
                          <span className="text-xs font-bold text-zinc-300">{clan.members}</span>
                        </div>

                        <button
                          onClick={() => handleJoinClan(clan.id)}
                          className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all ${
                            isMember 
                              ? 'bg-white/[0.05] hover:bg-red-500/20 text-white hover:text-red-400 border border-white/[0.08] hover:border-red-500/30' 
                              : 'bg-white hover:bg-zinc-100 text-black hover:scale-103'
                          }`}
                        >
                          {isMember ? 'Leave' : 'Join'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Guild Profile status */}
            <div className="flex flex-col gap-6 font-mono">
              <div className="rounded-xl p-5 border border-white/[0.08] bg-[#111116] relative">
                <h4 className="text-[10px] font-bold text-zinc-400 mb-3.5 uppercase tracking-wider border-b border-white/[0.08] pb-2">
                  Your Guild Affiliation
                </h4>

                {userClan ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block mb-1">Active Clan</span>
                      <div className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c3f73a]" />
                        {userClan}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block mb-1">Weekly contribution</span>
                      <span className="text-xs font-bold text-[#c3f73a]">+230 XP contributed</span>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded text-[9px] text-zinc-500 leading-relaxed font-sans font-light">
                      Your scores add to the clan leaderboard weekly. Secure double-XP matches to rank up your guild!
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="text-[30px] block mb-2 opacity-50">🛡️</span>
                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">No Active Clan</span>
                    <p className="text-[9px] text-zinc-600 mt-2 font-sans font-light px-2">
                      Join a programming guild above to participate in clan tournaments and secure contribution points.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CREATE THREAD DIALOG MODAL ═══ */}
        <AnimatePresence>
          {isCreatorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#0a0a0f]/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[600px] border border-white/[0.08] bg-[#111116] p-6 rounded shadow-2xl font-mono"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 mb-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Compile New Forum Thread
                  </h3>
                  <button
                    onClick={() => {
                      playSound('click');
                      setIsCreatorOpen(false);
                    }}
                    className="text-zinc-500 hover:text-white cursor-pointer text-sm font-bold font-sans"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 uppercase font-semibold">Thread Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="E.g., JS runtime recursive stack optimization"
                      className="h-10 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded text-white placeholder-zinc-700 focus:outline-none focus:border-[#c3f73a]/30"
                    />
                  </div>

                  {/* Channel Tag */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 uppercase font-semibold">Tag Channel</label>
                    <select
                      value={newTag}
                      onChange={e => setNewTag(e.target.value as any)}
                      className="h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded text-white focus:outline-none focus:border-[#c3f73a]/30"
                    >
                      <option value="Solutions"># Solutions</option>
                      <option value="Contest"># Contest</option>
                      <option value="General"># General</option>
                      <option value="Bugs"># Bugs</option>
                    </select>
                  </div>

                  {/* Code / Content */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-500 uppercase font-semibold">Body Content (Markdown Supported)</label>
                    <textarea
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      placeholder="Write your explanation or paste your codebase snippets..."
                      className="h-44 p-4 bg-white/[0.04] border border-white/[0.08] rounded text-white placeholder-zinc-700 focus:outline-none focus:border-[#c3f73a]/30 resize-none font-mono text-[11px] leading-relaxed"
                    />
                  </div>

                  {/* Save/Cancel */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08] mt-2">
                    <button
                      onClick={() => {
                        playSound('click');
                        setIsCreatorOpen(false);
                      }}
                      className="px-4 h-9 rounded-md border border-white/[0.08] hover:border-white/[0.16] text-zinc-400 hover:text-white cursor-pointer uppercase text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateThread}
                      className="px-5 h-9 rounded-md bg-[#c3f73a] text-black font-bold uppercase tracking-wider hover:brightness-110 cursor-pointer text-xs transition-colors"
                    >
                      Deploy Thread (+15 XP)
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
