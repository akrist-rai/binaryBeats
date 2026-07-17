import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Panel } from './ui/Panel';
import { Tag } from './ui/Tag';
import { Button } from './ui/Button';
import { Eyebrow } from './ui/Eyebrow';
import { Divider } from './ui/Divider';

interface CommunityViewProps {
  playSound: (type: 'click' | 'hover') => void;
  sharedCode: { problemTitle: string; code: string } | null;
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
  weeklySolves: number;
  desc: string;
}

// Forum categories (Solutions/Contest/General/Bugs) are decorative labels,
// not semantic states — they don't get success/danger/rival/warning colors,
// since those are reserved for real verdict/duel/caution meaning elsewhere
// in the app. Every category renders in the same neutral tone and is told
// apart by its label text only (left-accent-bar convention kept from the
// problem lists, just de-tinted to match).
const TAG_ACCENT: Record<ForumThread['tag'], string> = {
  Solutions: 'bg-bb-line-strong',
  Contest: 'bg-bb-line-strong',
  General: 'bg-bb-line-strong',
  Bugs: 'bg-bb-line-strong',
};

export const CommunityView: React.FC<CommunityViewProps> = ({
  playSound,
  sharedCode,
  onClearSharedCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'forum' | 'feed' | 'clans'>('forum');

  // Clans State
  const [userClan, setUserClan] = useState<string | null>(() => {
    return localStorage.getItem('bb_user_clan') || null;
  });

  const initialClans: Clan[] = [
    { id: 'c1', name: 'Bit Shifters', tag: 'BITS', members: 24, weeklySolves: 312, desc: 'Optimizing O(1) algorithms and byte alignment.' },
    { id: 'c2', name: 'Kernel Panic', tag: 'PANIC', members: 18, weeklySolves: 268, desc: 'Systems programming enthusiasts and assembly hackers.' },
    { id: 'c3', name: 'Null Pointers', tag: 'NULL', members: 15, weeklySolves: 201, desc: 'Dereferencing the void. We operate in safe spaces.' },
    { id: 'c4', name: 'Stack Overflowers', tag: 'OVER', members: 9, weeklySolves: 137, desc: 'Recursion limits are just suggestions. Keep pushing!' }
  ];

  const [clans, setClans] = useState<Clan[]>(initialClans);

  // Activity Feed State
  const [activities, setActivities] = useState<ActivityEvent[]>([
    { id: 'a1', message: 'compile_king solved Valid Parentheses', time: 'Just now', icon: '⚡' },
    { id: 'a2', message: 'syntax_scripter unlocked badge "Night Owl"', time: '2m ago', icon: '🏆' },
    { id: 'a3', message: 'byte_boss upvoted a solution to Merge K Sorted Lists', time: '5m ago', icon: '👍' },
    { id: 'a4', message: 'git_gud joined clan Bit Shifters', time: '12m ago', icon: '🛡️' },
    { id: 'a5', message: 'cache_flow started a Blitz & Duel session', time: '20m ago', icon: '🎫' },
  ]);

  // Threads State
  const [threads, setThreads] = useState<ForumThread[]>([
    {
      id: 't1',
      title: 'Two Sum: 99.8th percentile O(N) unordered_map solution',
      author: 'byte_boss',
      avatar: 'BB',
      tag: 'Solutions',
      upvotes: 42,
      commentsCount: 3,
      date: '2h ago',
      content: 'An unordered_map gives amortized O(1) lookups vs a sorted map\'s O(log N). Highly recommended for storing value-to-index lookups on the first pass.',
      comments: [
        { id: 'c1_1', author: 'syntax_scripter', avatar: 'SS', content: 'Clean solution! std::map also works but the ordering overhead makes it noticeably slower here.', date: '1h ago' },
        { id: 'c1_2', author: 'compile_king', avatar: 'CK', content: 'Very neat. O(N) space complexity is negligible for these sizes.', date: '45m ago' }
      ]
    },
    {
      id: 't2',
      title: 'Blitz & Duel prep thread — what rating band should I expect?',
      author: 'compile_king',
      avatar: 'CK',
      tag: 'Contest',
      upvotes: 18,
      commentsCount: 2,
      date: '4h ago',
      content: 'Solo Blitz draws a 4-problem staircase around your linked Codeforces rating, and Duel anchors 60/40 toward the lower-rated player. Use this thread to coordinate training and compare draws!',
      comments: [
        { id: 'c2_1', author: 'cache_flow', avatar: 'CF', content: 'Got a 1900-2200 band on my last Blitz session. Segment trees and binary search carried me through.', date: '3h ago' }
      ]
    },
    {
      id: 't3',
      title: 'Recursion vs iterative stack overhead on deep trees',
      author: 'syntax_scripter',
      avatar: 'SS',
      tag: 'General',
      upvotes: 27,
      commentsCount: 1,
      date: '1d ago',
      content: 'Deep recursion risks a real stack overflow well before you hit any algorithmic limit, especially on skewed/unbalanced trees. Converting to an explicit std::stack-based iteration is the safer bet for anything that isn\'t guaranteed shallow.',
      comments: [
        { id: 'c3_1', author: 'byte_boss', avatar: 'BB', content: 'Confirmed on GCC/Clang too — no guaranteed tail-call optimization, so iterative + explicit stack is standard practice for deep DFS.', date: '18h ago' }
      ]
    },
    {
      id: 't4',
      title: 'Compiler warnings for vector reserve() on older C++ standards',
      author: 'cache_flow',
      avatar: 'CF',
      tag: 'Bugs',
      upvotes: 5,
      commentsCount: 0,
      date: '2d ago',
      content: 'Seeing warnings about capacity reservations when compiling under -std=c++14. Will verify the optimization directives and update to c++17.',
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
      setNewTitle(`My C++ solution for ${sharedCode.problemTitle}`);
      setNewTag('Solutions');
      setNewContent(`Here is my accepted C++ solution:\n\n\`\`\`cpp\n${sharedCode.code}\n\`\`\``);
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
          message = `${user} solved ${prob}`;
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
  };

  // Highest-upvoted thread — surfaced as a "Next Up"-style featured card in
  // the sidebar, a practical shortcut to whatever's currently resonating.
  const trendingThread = useMemo(() => {
    if (threads.length === 0) return null;
    return [...threads].sort((a, b) => b.upvotes - a.upvotes)[0];
  }, [threads]);

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
    <div className="w-full min-h-[calc(100vh-64px)] text-bb-ink relative pb-12">
      <div className="w-full px-12 py-8 relative z-10 max-w-7xl mx-auto">

        {/* Hub Header & Navigation sub-tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-bb-line pb-6 mb-6">
          <div>
            <Eyebrow number="04" className="mb-2">Community</Eyebrow>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-bb-ink mb-2 mt-2">
              Community Hub
            </h2>
            <p className="text-xs font-mono text-bb-ink-faint">
              Share C++ solutions, review code, and coordinate within engineering guilds
            </p>
          </div>

          {/* Sub tabs */}
          <div className="flex rounded overflow-hidden border border-bb-line bg-bb-surface p-0.5 font-mono text-[10px]">
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
                className={`px-4 h-8 rounded-sm font-bold tracking-wider cursor-pointer uppercase transition-colors relative ${
                  activeSubTab === tab.id ? 'text-bb-ground' : 'text-bb-ink-faint hover:text-bb-ink-soft'
                }`}
              >
                {activeSubTab === tab.id && (
                  <motion.span
                    layoutId="activeSubTabBg"
                    className="absolute inset-0 bg-bb-ink rounded-sm"
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
                >
                  <Panel className="p-6">
                  {/* Thread Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        playSound('click');
                        setSelectedThread(null);
                      }}
                    >
                      ← Back to Feed
                    </Button>

                    <Tag tone="neutral">{selectedThread.tag}</Tag>
                  </div>

                  {/* Title & Author Info */}
                  <div className="flex gap-4 items-start mb-6">
                    <div className="w-10 h-10 rounded-full bg-bb-ink text-bb-ground flex items-center justify-center text-xs font-bold font-mono">
                      {selectedThread.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold font-display text-bb-ink leading-tight">
                        {selectedThread.title}
                      </h3>
                      <div className="flex gap-3 text-[10px] text-bb-ink-faint font-mono mt-1">
                        <span>POSTED BY: @{selectedThread.author}</span>
                        <span>⏱ {selectedThread.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="bg-bb-ground border border-bb-line p-5 rounded text-bb-ink-soft text-xs leading-relaxed whitespace-pre-wrap font-sans mb-6">
                    {selectedThread.content}
                  </div>

                  {/* Upvote Bar */}
                  <div className="flex items-center gap-4 border-b border-bb-line pb-5 mb-5">
                    <button
                      onClick={(e) => handleUpvote(selectedThread.id, e)}
                      className="cursor-pointer"
                    >
                      <Tag tone="success" className="gap-2 px-3 py-1.5 text-xs">
                        <span>👍 Upvote</span>
                        <span className="font-bold text-bb-ink">{selectedThread.upvotes}</span>
                      </Tag>
                    </button>
                    <span className="text-bb-ink-faint font-mono text-[10px]">
                      {selectedThread.commentsCount} Comments
                    </span>
                  </div>

                  {/* Comments list */}
                  <div className="flex flex-col gap-4 mb-6">
                    <Eyebrow tone="muted" className="mb-2">Review Thread Comments</Eyebrow>

                    {selectedThread.comments.length === 0 ? (
                      <div className="py-4 text-center text-xs text-bb-ink-faint font-mono bg-bb-ground rounded border border-dashed border-bb-line">
                        No responses yet. Start the review thread!
                      </div>
                    ) : (
                      selectedThread.comments.map(c => (
                        <Panel key={c.id} className="flex gap-3 items-start p-4">
                          <div className="w-8 h-8 rounded-full bg-bb-ink text-bb-ground flex items-center justify-center text-[10px] font-bold font-mono">
                            {c.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-bold text-bb-ink font-mono">@{c.author}</span>
                              <span className="text-[9px] text-bb-ink-faint font-mono">{c.date}</span>
                            </div>
                            <p className="text-xs text-bb-ink-soft mt-1 font-sans leading-relaxed">
                              {c.content}
                            </p>
                          </div>
                        </Panel>
                      ))
                    )}
                  </div>

                  {/* Add comment editor */}
                  <div className="flex flex-col gap-3 font-mono">
                    <textarea
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      placeholder="Compile response or review comments..."
                      className="w-full h-20 p-3 bg-bb-ground border border-bb-line rounded text-xs text-bb-ink placeholder-bb-ink-faint focus:outline-none focus:border-bb-line-strong resize-none font-mono"
                    />
                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" onClick={handleAddComment}>
                        Post Response
                      </Button>
                    </div>
                  </div>
                  </Panel>
                </motion.div>
              ) : (
                /* Thread Feed list */
                <div className="flex flex-col gap-4">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center font-mono">
                    {/* Search forum */}
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bb-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search posts or code..."
                        className="w-full h-9 pl-9 pr-3 rounded text-xs text-bb-ink bg-bb-surface placeholder-bb-ink-faint focus:outline-none transition-colors border border-bb-line focus:border-bb-line-strong"
                      />
                    </div>

                    {/* New Post Button */}
                    <Button
                      variant="primary"
                      onClick={() => {
                        playSound('click');
                        setIsCreatorOpen(true);
                      }}
                    >
                      + Create Post
                    </Button>
                  </div>

                  {/* Thread Cards list */}
                  <div className="flex flex-col gap-3">
                    {filteredThreads.length === 0 ? (
                      <div className="py-16 text-center text-xs text-bb-ink-faint font-mono rounded border border-dashed border-bb-line">
                        No discussion threads match this criteria
                      </div>
                    ) : (
                      filteredThreads.map(t => (
                        <motion.div key={t.id} layout>
                          <Panel
                            lift
                            onClick={() => {
                              playSound('click');
                              setSelectedThread(t);
                            }}
                            className="relative p-5 pl-6 cursor-pointer flex gap-4 items-start group overflow-hidden"
                          >
                          <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${TAG_ACCENT[t.tag]}`} />
                          <span className="link-chip">↗</span>
                          {/* Left avatar column */}
                          <div className="w-8 h-8 rounded-full bg-bb-ink text-bb-ground flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                            {t.avatar}
                          </div>

                          {/* Right main column */}
                          <div className="flex-1 min-w-0 font-mono">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <Tag tone="neutral">{t.tag}</Tag>
                              <span className="text-[9.5px] text-bb-ink-faint">
                                Posted by @{t.author} • {t.date}
                              </span>
                            </div>

                            <h3 className="text-[13px] font-bold text-bb-ink group-hover:text-bb-yellow transition-colors leading-tight">
                              {t.title}
                            </h3>

                            <p className="text-[10px] text-bb-ink-faint font-sans mt-1.5 line-clamp-1 font-light">
                              {t.content}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-[10px] text-bb-ink-faint font-mono">
                              <button
                                onClick={(e) => handleUpvote(t.id, e)}
                                className="flex items-center gap-1.5 hover:text-bb-success transition-colors group/up"
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
                          </Panel>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Categories filtering panel */}
            <div className="flex flex-col gap-6 font-mono">
              {/* Trending thread — a practical shortcut to whatever's resonating right now */}
              {trendingThread && (
                <Panel bracket className="p-5 relative overflow-hidden text-bb-yellow">
                  <Eyebrow tone="accent" className="mb-3">Trending</Eyebrow>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${TAG_ACCENT[trendingThread.tag]}`} />
                    <span className="text-[9px] uppercase tracking-wider text-bb-ink-faint">{trendingThread.tag}</span>
                    <span className="text-[9px] text-bb-ink-faint ml-auto">👍 {trendingThread.upvotes}</span>
                  </div>
                  <div className="text-sm font-display font-bold text-bb-ink mb-4 leading-snug line-clamp-2">
                    {trendingThread.title}
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      playSound('click');
                      setSelectedThread(trendingThread);
                    }}
                  >
                    Read Thread →
                  </Button>
                </Panel>
              )}

              <Panel className="p-5">
                <div className="mb-3.5">
                  <Eyebrow tone="muted">Topic Filter</Eyebrow>
                  <Divider className="mt-2" />
                </div>
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded border text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-bb-yellow-fill text-bb-yellow border-bb-yellow/30 font-bold'
                            : 'border-transparent text-bb-ink-faint hover:text-bb-ink-soft hover:bg-bb-ink/[0.03]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {tag !== 'All' && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TAG_ACCENT[tag]}`} />}
                          {tag === 'All' ? 'All Channels' : `# ${tag}`}
                        </span>
                        {tag !== 'All' && (
                          <Tag tone={isSelected ? 'accent' : 'neutral'}>
                            {threads.filter(t => t.tag === tag).length}
                          </Tag>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Panel>

              {/* Guidelines panel */}
              <Panel className="p-5 text-[10px] text-bb-ink-faint">
                <div className="mb-3">
                  <Eyebrow tone="muted">Code Sharing Protocol</Eyebrow>
                  <Divider className="mt-2" />
                </div>
                <ul className="flex flex-col gap-2.5 list-none pl-0 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-bb-yellow">◼</span>
                    <span>Sanitize secrets, keys, and tokens prior to uploading scripts.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-bb-yellow">◼</span>
                    <span>Explain O(N) constraints to simplify complexity reviews.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-bb-yellow">◼</span>
                    <span>Upvote optimized compilers to encourage clean architecture.</span>
                  </li>
                </ul>
              </Panel>
            </div>

          </div>
        )}

        {/* ═══ TAB CONTENT: LIVE ACTIVITIES ═══ */}
        {activeSubTab === 'feed' && (
          <div className="w-full font-mono">
            <Panel className="p-6">
              <div className="flex items-center justify-between border-b border-bb-line pb-4 mb-6 select-none">
                <Eyebrow tone="muted">Live Activity Signal Feed</Eyebrow>
                <span className="flex items-center gap-1.5 text-[9px] text-bb-success uppercase tracking-widest font-black animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-bb-success" />
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
                    >
                      <Panel className="flex items-start gap-4 p-4 hover:border-bb-line-strong transition-colors">
                        <div className="w-8 h-8 rounded bg-bb-ground border border-bb-line flex items-center justify-center text-xs shrink-0">
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-bb-ink leading-relaxed">
                            {a.message}
                          </p>
                          <span className="text-[8px] text-bb-ink-faint block mt-1 uppercase font-bold">
                            ⏱ {a.time}
                          </span>
                        </div>
                      </Panel>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Panel>
          </div>
        )}

        {/* ═══ TAB CONTENT: CLANS HUB ═══ */}
        {activeSubTab === 'clans' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Clans list */}
            <div className="flex flex-col gap-4 font-mono">
              <div className="mb-1">
                <Eyebrow tone="muted">Clans Standing Leaderboard</Eyebrow>
                <Divider className="mt-2" />
              </div>

              <div className="flex flex-col gap-3">
                {clans.map((clan, idx) => {
                  const isMember = userClan === clan.name;
                  return (
                    <Panel
                      key={clan.id}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isMember ? 'border-bb-success/50 bg-bb-success/[0.06]' : 'hover:border-bb-line-strong'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-xs border ${
                          isMember
                            ? 'bg-bb-success text-bb-ground border-bb-success'
                            : 'bg-bb-ink text-bb-ground border-bb-ink'
                        }`}>
                          {clan.tag}
                        </div>
                        <div className="flex flex-col max-w-sm">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-bold text-bb-ink">{clan.name}</span>
                            <span className="text-[9px] text-bb-ink-faint">#{idx + 1} GUILD</span>
                          </div>
                          <p className="text-[10px] text-bb-ink-faint font-sans font-light mt-1.5 leading-relaxed">
                            {clan.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[9px] text-bb-ink-faint block">WEEKLY SOLVES</span>
                          <span className="text-xs font-bold text-bb-ink-soft">{clan.weeklySolves.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-bb-ink-faint block">CODERS</span>
                          <span className="text-xs font-bold text-bb-ink-soft">{clan.members}</span>
                        </div>

                        <Button
                          variant={isMember ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleJoinClan(clan.id)}
                          className={isMember ? 'hover:text-bb-danger hover:border-bb-danger/40 hover:bg-bb-danger/10' : ''}
                        >
                          {isMember ? 'Leave' : 'Join'}
                        </Button>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </div>

            {/* User Guild Profile status */}
            <div className="flex flex-col gap-6 font-mono">
              <Panel className="p-5 relative">
                <div className="mb-3.5">
                  <Eyebrow tone="muted">Your Guild Affiliation</Eyebrow>
                  <Divider className="mt-2" />
                </div>

                {userClan ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[9px] text-bb-ink-faint uppercase block mb-1">Active Clan</span>
                      <div className="text-base font-bold text-bb-ink uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-bb-success" />
                        {userClan}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-bb-ink-faint uppercase block mb-1">Weekly contribution</span>
                      <span className="text-xs font-bold text-bb-success">7 problems solved</span>
                    </div>
                    <div className="p-3 bg-bb-ground border border-bb-line rounded text-[9px] text-bb-ink-faint leading-relaxed font-sans font-light">
                      Your solves add to the clan leaderboard weekly. Keep solving to rank up your guild!
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="text-[30px] block mb-2 opacity-50">🛡️</span>
                    <span className="text-[10px] text-bb-ink-faint block uppercase font-semibold">No Active Clan</span>
                    <p className="text-[9px] text-bb-ink-faint mt-2 font-sans font-light px-2">
                      Join a programming guild above to participate in clan tournaments and secure contribution points.
                    </p>
                  </div>
                )}
              </Panel>
            </div>
          </div>
        )}

        {/* ═══ CREATE THREAD DIALOG MODAL ═══ */}
        <AnimatePresence>
          {isCreatorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-bb-ground/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[600px] font-mono"
              >
                <Panel className="p-6">
                <div className="flex items-center justify-between border-b border-bb-line pb-3.5 mb-5">
                  <h3 className="text-sm font-bold text-bb-ink uppercase tracking-wider">
                    Compile New Forum Thread
                  </h3>
                  <button
                    onClick={() => {
                      playSound('click');
                      setIsCreatorOpen(false);
                    }}
                    className="text-bb-ink-faint hover:text-bb-ink cursor-pointer text-sm font-bold font-sans"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-bb-ink-faint uppercase font-semibold">Thread Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="E.g., std::vector capacity reservation tricks"
                      className="h-10 px-3.5 bg-bb-ground border border-bb-line rounded text-bb-ink placeholder-bb-ink-faint focus:outline-none focus:border-bb-line-strong"
                    />
                  </div>

                  {/* Channel Tag */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-bb-ink-faint uppercase font-semibold">Tag Channel</label>
                    <select
                      value={newTag}
                      onChange={e => setNewTag(e.target.value as any)}
                      className="h-10 px-3 bg-bb-ground border border-bb-line rounded text-bb-ink focus:outline-none focus:border-bb-line-strong"
                    >
                      <option value="Solutions"># Solutions</option>
                      <option value="Contest"># Contest</option>
                      <option value="General"># General</option>
                      <option value="Bugs"># Bugs</option>
                    </select>
                  </div>

                  {/* Code / Content */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-bb-ink-faint uppercase font-semibold">Body Content (Markdown Supported)</label>
                    <textarea
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      placeholder="Write your explanation or paste your codebase snippets..."
                      className="h-44 p-4 bg-bb-ground border border-bb-line rounded text-bb-ink placeholder-bb-ink-faint focus:outline-none focus:border-bb-line-strong resize-none font-mono text-[11px] leading-relaxed"
                    />
                  </div>

                  {/* Save/Cancel */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-bb-line mt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        playSound('click');
                        setIsCreatorOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateThread}>
                      Deploy Thread
                    </Button>
                  </div>
                </div>
                </Panel>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
