<script lang="ts">
  import { synthSound } from '../utils/audio';

  const VERBS = ['captured', 'pwned', 'exfiltrated', 'cracked', 'breached'];

  const CAT_COLORS: Record<string, string> = {
    GRADIENT: '#4fc3f7', ARCHITECTURE: '#f9a825', INFERENCE: '#e8000d',
    'DATA LEAK': '#ff6b35', TRAINING: '#ab47bc', NLP: '#26c6da',
    OVERFITTING: '#ef5350', SYSTEMS: '#66bb6a', CRYPTO: '#ffd54f',
    ALGORITHMS: '#80cbc4', FAIRNESS: '#ce93d8', WEB: '#e8000d',
    PWN: '#ff4466', REVERSE: '#d500f9', SCRIPTING: '#ab47bc',
  };

  const CAT_ICONS: Record<string, string> = {
    GRADIENT: '∇', ARCHITECTURE: '⬡', INFERENCE: '◈', 'DATA LEAK': '⚠',
    TRAINING: '⟳', NLP: '⌥', OVERFITTING: '⤴', SYSTEMS: '⚙',
    CRYPTO: '🔐', ALGORITHMS: '◇', FAIRNESS: '⚖', WEB: '🌐',
    PWN: '☠', REVERSE: '⇄', SCRIPTING: '📜',
  };

  const activities = [
    { userId: 'shinji_eva', challengeId: 'S1E3_A7', points: 280, category: 'TRAINING', time: '12s' },
    { userId: 'cyber_bandit', challengeId: 'S1E2_A2', points: 220, category: 'PWN', time: '45s' },
    { userId: 'johan_fan', challengeId: 'S1E2', points: 110, category: 'TRAINING', time: '3m' },
    { userId: 'luffy_pirate', challengeId: 'S1E4_A2', points: 280, category: 'CRYPTO', time: '7m' },
    { userId: 'akrist', challengeId: 'S1E5_A1', points: 190, category: 'ALGORITHMS', time: '14m' },
    { userId: 'okabe_future', challengeId: 'S1E3_A8', points: 260, category: 'CRYPTO', time: '22m' },
    { userId: 'reaper_xp', challengeId: 'S2E2_A2', points: 180, category: 'WEB', time: '30m' },
    { userId: 'guts_knight', challengeId: 'S2E2_A1', points: 220, category: 'ALGORITHMS', time: '44m' }
  ];

  // Hex address builder from username
  function getHexAddr(userId: string) {
    let hash = 0x5381;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) + hash) ^ userId.charCodeAt(i);
    }
    return '0x' + (hash >>> 0).toString(16).toUpperCase().slice(0, 4);
  }

  function getVerb(userId: string, challengeId: string) {
    const idx = (userId.charCodeAt(0) + challengeId.charCodeAt(0)) % VERBS.length;
    return VERBS[idx];
  }

  function handleMouseEnter() {
    synthSound.hover();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="af-strip" on:mouseenter={handleMouseEnter}>
  <div class="af-label">
    <span class="af-pulse"></span>
    <span class="af-label-text">LIVE NET</span>
  </div>
  <div class="af-ticker">
    <div class="af-ticker-inner">
      <!-- Looping marquee entries (render list twice for seamless layout loop) -->
      {#each [...activities, ...activities] as entry, index}
        {@const isMe = entry.userId === 'akrist'}
        {@const catColor = CAT_COLORS[entry.category] || 'var(--red)'}
        {@const catIcon = CAT_ICONS[entry.category] || '□'}
        {@const hexAddr = getHexAddr(entry.userId)}
        {@const verb = getVerb(entry.userId, entry.challengeId)}

        <div class="af-item {isMe ? 'af-me' : ''}">
          <span class="af-item-dot" style="background: {catColor}"></span>
          <span class="af-hex-addr">{hexAddr}</span>
          <span class="af-item-user" style="color: {isMe ? '#00ff41' : 'rgba(255,255,255,.75)'}">{entry.userId}</span>
          <span class="af-item-verb {verb !== 'captured' ? 'af-item-verb-hot' : ''}">{verb}</span>
          <span class="af-item-cat-icon" style="color: {catColor}">{catIcon}</span>
          <span class="af-item-chal" style="color: {catColor}">{entry.challengeId}</span>
          <span class="af-item-pts">+{entry.points}</span>
          <span class="af-item-sep">·</span>
          <span class="af-item-time">{entry.time}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
