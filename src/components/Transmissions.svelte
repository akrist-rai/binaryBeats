<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { synthSound } from '../utils/audio';
  import type { Arc, Episode } from '../data/content';

  const dispatch = createEventDispatcher();
  export let ARCS: Arc[] = [];
  export let EPISODES: Episode[] = [];

  const TYPE_META = {
    ctf:      { label: 'CTF',      color: '#000', bg: '#00c85a' },
    research: { label: 'RESEARCH', color: '#fff', bg: '#e8000d' },
    quiz:     { label: 'QUIZ',     color: '#fff', bg: '#9b5fff' },
    exploit:  { label: 'EXPLOIT',  color: '#fff', bg: '#9b5fff' }
  };

  // Reactively compute transmissions (top 4, active first, then XP desc)
  $: transmissions = (() => {
    const list = EPISODES.map(ep => {
      const arc = ARCS.find(a => a.id === ep.arcId);
      return { ...ep, arc };
    });
    
    list.sort((a, b) => {
      const actA = a.active ? 1 : 0;
      const actB = b.active ? 1 : 0;
      if (actB !== actA) return actB - actA;
      return b.xp - a.xp;
    });
    
    return list.slice(0, 4);
  })();

  $: activeCount = transmissions.filter(t => t.active).length;

  // Custom hover state management for each card index
  let hoveredIndex: number | null = null;

  function handleMouseEnter(index: number) {
    hoveredIndex = index;
    synthSound.hover();
  }

  function handleMouseLeave() {
    hoveredIndex = null;
  }

  function handlePlay(tx: any) {
    synthSound.click();
    dispatch('play', { arcId: tx.arcId, episodeId: tx.id });
  }

  function getEpisodeImage(epId: string, arcId: number) {
    const map: Record<string, string> = {
      'S1E1_A9': 'photos/episodes/S1E1.jpeg',
      'S1E2_A9': 'photos/episodes/S1E2.jpeg',
      'S1E3_A9': 'photos/episodes/S1E3.jpeg',
      'S1E4_A9': 'photos/episodes/S1E4.jpeg',
      'S1E5_A9': 'photos/episodes/S1E5.jpeg',
      'S1E6_A9': 'photos/episodes/S1E6.jpeg',
      'S1E7_A9': 'photos/episodes/S1E7.jpeg',
      'S1E8_A9': 'photos/episodes/S1E8.jpeg',
      'S1E1_A6': 'photos/episodes/S2E1.jpeg',
      'S1E2_A6': 'photos/episodes/S2E2.jpeg',
      'S1E3_A6': 'photos/episodes/S2E3.jpeg',
      'S1E1_A1': 'photos/episodes/S3E1.jpeg',
      'S1E2_A1': 'photos/episodes/S3E2.jpeg',
      'S1E3_A1': 'photos/episodes/S3E3.jpeg',
      'S1E4_A1': 'photos/episodes/S3E4.jpeg',
      'S1E1_A5': 'photos/episodes/S4E1.jpeg',
      'S1E2_A5': 'photos/episodes/S4E2.jpeg',
      'S1E3_A5': 'photos/episodes/S4E3.jpeg',
      'S1E1_A2': 'photos/episodes/S5E1.jpeg',
      'S1E2_A2': 'photos/episodes/S5E2.jpeg',
      'S1E3_A2': 'photos/episodes/S5E3.jpeg',
      'S2E1_A2': 'photos/0xEP001p.jpeg',
      'S2E2_A2': 'photos/0xEP002p.jpeg',
      'S2E3_A2': 'photos/0xEP005p.jpeg',
      'S1E1_A4': 'photos/episodes/S6E1.jpeg',
      'S1E2_A4': 'photos/episodes/S6E2.jpeg',
      'S1E3_A4': 'photos/episodes/S6E3.jpeg',
      'S1E1_A3': 'photos/episodes/S7E1.jpeg',
      'S1E2_A3': 'photos/episodes/S7E2.jpeg',
      'S1E3_A3': 'photos/episodes/S7E3.jpeg',
      'S1E1': 'photos/episodes/0xEP063p.jpeg',
      'S1E2': 'photos/episodes/0xEP064p.jpeg',
      'S1E3': 'photos/episodes/0xEP065p.jpeg',
      'S2E1': 'photos/episodes/0xEP066p.jpeg',
      'S2E2': 'photos/episodes/0xEP067p.jpeg',
      'S2E3': 'photos/episodes/0xEP068p.jpeg',
      'S1E1_A7': 'photos/episodes/S8E1.jpeg',
      'S1E2_A7': 'photos/episodes/S8E2.jpeg',
      'S1E3_A7': 'photos/episodes/S8E3.jpeg',
      'S1E1_A8': 'photos/episodes/S9E1.jpeg',
      'S1E2_A8': 'photos/episodes/S9E2.jpeg',
      'S1E3_A8': 'photos/episodes/S9E3.jpeg',
    };
    
    // Default fallback: arc cover
    const defaultCovers: Record<number, string> = {
      1: 'photos/arc-covers/0xAC001p.jpeg',
      2: 'photos/arc-covers/0xAC002p.jpeg',
      3: 'photos/arc-covers/0xAC003p.jpeg',
      4: 'photos/arc-covers/0xAC004p.jpeg',
      5: 'photos/arc-covers/0xAC005p.jpeg',
      6: 'photos/arc-covers/0xAC006p.jpeg',
      7: 'photos/arc-covers/0xAC007p.jpeg',
      8: 'photos/arc-covers/0xAC008p.jpeg',
      9: 'photos/arc-covers/0xAC009p.jpeg'
    };
    
    const raw = map[epId] || defaultCovers[arcId] || defaultCovers[1];
    return raw;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="tx-sect tx-sect--has-gif" style="position: relative;">
  <div class="sect-hdr" style="position: relative; z-index: 5;">
    <div class="sect-ttl">TRANSMISSIONS</div>
    <div class="sect-id">// EPISODES</div>
    <div class="tx-active-badge">
      {#if activeCount > 0}
        <span class="tx-ab-dot"></span>ACTIVE NOW
      {:else}
        {transmissions.length} AVAILABLE
      {/if}
    </div>
    <div class="sect-more" on:click={() => dispatch('browse_all')}>ALL EPISODES →</div>
  </div>
  <div class="sect-div"></div>

  <div class="tx-grid">
    {#each transmissions as tx, idx}
      {@const acc = tx.arc ? tx.arc.accColor : '#e8000d'}
      {@const tm = TYPE_META[tx.type] || TYPE_META.ctf}
      {@const img = getEpisodeImage(tx.id, tx.arcId)}
      
      <div 
        class="tx-card {hoveredIndex === idx ? 'tx-hov' : ''}" 
        style="--tx-acc: {acc};"
        on:mouseenter={() => handleMouseEnter(idx)}
        on:mouseleave={handleMouseLeave}
        on:click={() => handlePlay(tx)}
      >
        <div class="tx-img-wrap">
          <img src={img} alt={tx.title} class="tx-img" on:error|self={(e) => e.currentTarget.style.display = 'none'} />
          <div class="tx-img-overlay" style="background: linear-gradient(0deg, {tx.arc?.bgColor || '#06060e'}ee 0%, rgba(6,6,14,.1) 100%)"></div>
          <div class="tx-img-scan"></div>
          <div class="tx-card-idx">{String(idx + 1).padStart(2, '0')}</div>
          <div class="tx-type-tag" style="background: {tm.bg}; color: {tm.color};">
            {tm.label}{#if tx.active}&nbsp;<span class="tx-live-dot">◉</span>{/if}
          </div>
          <div class="tx-xp-badge">⚡ {tx.xp} XP</div>
        </div>
        <div class="tx-body">
          <div class="tx-domain" style="color: {acc};">{tx.arc?.domain || tx.arc?.arcName}</div>
          <div class="tx-title">
            {tx.title}
          </div>
          <div class="tx-meta">
            <span class="tx-arc-name" style="color: {acc}99;">{tx.arc?.arcName || ''}</span>
            <span class="tx-ep-num">EP {tx.n}</span>
          </div>
        </div>
        <div class="hc sm tl" style="border-color: {acc};"></div>
        <div class="hc sm br" style="border-color: {acc};"></div>

        {#if tx.active}
          <div class="tx-active-bar" style="background: {acc};"></div>
        {/if}
        
        <div class="tx-bottom-bar" style="background: linear-gradient(90deg, {acc}44, transparent);"></div>
      </div>
    {/each}
  </div>
</div>
