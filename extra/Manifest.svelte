<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { synthSound } from "../src/utils/audio";
  import SpeedLines from "../src/components/Effects/SpeedLines.svelte";
  import type { Arc, Episode } from "../src/data/content";

  const dispatch = createEventDispatcher();
  export let ARCS: Arc[] = [];
  export let EPISODES: Episode[] = [];

  let activeCellId: number | null = null;

  function handleCellClick(id: number) {
    synthSound.click();
    if (activeCellId === id) {
      activeCellId = null;
    } else {
      activeCellId = id;
    }
  }

  function handleSelectArc(id: number, event: Event) {
    event.stopPropagation();
    synthSound.click();
    dispatch("selectArc", { id });
  }

  function getArcProgress(arcId: number) {
    const eps = EPISODES.filter((e) => e.arcId === arcId);
    if (!eps.length) return { pct: 0, done: 0, total: 0 };
    const done = eps.filter((e) => e.done).length;
    return {
      pct: Math.round((done / eps.length) * 100),
      done,
      total: eps.length,
    };
  }

  function getArcImage(arcId: number) {
    const defaultCovers: Record<number, string> = {
      1: "photos/arc-covers/0xAC001p.jpeg",
      2: "photos/arc-covers/0xAC002p.jpeg",
      3: "photos/arc-covers/0xAC003p.jpeg",
      4: "photos/arc-covers/0xAC004p.jpeg",
      5: "photos/arc-covers/0xAC005p.jpeg",
      6: "photos/arc-covers/0xAC006p.jpeg",
      7: "photos/arc-covers/0xAC007p.jpeg",
      8: "photos/arc-covers/0xAC008p.jpeg",
      9: "photos/arc-covers/0xAC009p.jpeg",
    };
    return defaultCovers[arcId] || defaultCovers[1];
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="tx-sect" style="margin-top: 1.5rem;">
  <div class="sect-hdr">
    <div class="sect-ttl">SERIES MANIFEST</div>
    <div class="sect-id">// ALL SECTIONS</div>
  </div>
  <div class="sect-div"></div>

  <div class="mf-manga-grid">
    {#each ARCS as arc}
      {@const progress = getArcProgress(arc.id)}
      {@const isExpanded = activeCellId === arc.id}
      {@const img = getArcImage(arc.id)}

      <div
        class="mf-manga-cell {isExpanded ? 'mf-manga-cell--on' : ''}"
        style="--mg-acc: {arc.accColor};"
        on:mouseenter={() => synthSound.hover()}
        on:click={() => handleCellClick(arc.id)}
      >
        <div
          class="mf-manga-cell-bg"
          style="background-image: url({img});"
        ></div>
        <div
          class="mf-manga-cell-overlay"
          style="background: linear-gradient(to top, {arc.bgColor}ee, rgba(0,0,0,0.4) 60%, transparent 100%)"
        ></div>
        <div class="mf-manga-cell-scan"></div>

        {#if isExpanded}
          <div class="mf-manga-cell-tone" style="opacity: 0.15;"></div>
          <!-- SpeedLines visual highlight on active cells -->
          <SpeedLines
            color={arc.accColor}
            density={40}
            opacity={0.12}
            origin="center"
            animated={true}
          />
        {/if}

        <div class="mf-manga-cell-hdr">
          <div class="mf-manga-cell-meta" style="color: {arc.accColor};">
            <span class="mf-manga-cell-domain">{arc.domain}</span>
            <span>·</span>
            <span>V{arc.id}</span>
          </div>
          <div class="mf-manga-cell-title">{arc.title}</div>
        </div>

        {#if isExpanded}
          <div class="mf-manga-cell-body">
            <p>{arc.description}</p>
            <div class="mf-manga-cell-progress">
              <div class="mf-manga-cell-progress-lbl">
                <span>COMPLETION</span>
                <span
                  class="mf-manga-cell-progress-pct"
                  style="color: {arc.accColor};">{progress.pct}%</span
                >
              </div>
              <div class="mf-manga-cell-progress-bar-wrap">
                <div
                  class="mf-manga-cell-progress-bar"
                  style="width: {progress.pct}%; background: {arc.accColor};"
                ></div>
              </div>
              <div class="mf-manga-cell-progress-count">
                {progress.done} OF {progress.total} CHALLENGES RESOLVED
              </div>
            </div>
            <button
              class="mf-manga-cell-btn"
              on:click={(e) => handleSelectArc(arc.id, e)}
            >
              SELECT ARC
            </button>
          </div>
        {/if}

        <!-- Interactive corner markings -->
        <div class="hc sm tl" style="border-color: {arc.accColor};"></div>
        <div class="hc sm tr" style="border-color: {arc.accColor};"></div>
        <div class="hc sm bl" style="border-color: {arc.accColor};"></div>
        <div class="hc sm br" style="border-color: {arc.accColor};"></div>
      </div>
    {/each}
  </div>
</div>
