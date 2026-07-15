<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./components/Navbar.svelte";
  import Hero from "./components/Hero.svelte";
  import ActivityTicker from "./components/ActivityTicker.svelte";
  import Transmissions from "./components/Transmissions.svelte";
  import Manifest from "../extra/Manifest.svelte";
  import { ARCS, EPISODES } from "./data/content";

  // Global State variables
  let activeArcId = 3;
  let activeEpId = "S1E3_A1";
  let currentMode: "SOLO" | "NETWORK" = "SOLO";
  let activeTab = "home";
  let xp = 360;
  let username = "akrist";

  // Reactively track and update theme colors
  $: activeArc = ARCS.find((a) => a.id === activeArcId) || ARCS[0];
  $: if (typeof document !== "undefined" && activeArc) {
    document.documentElement.style.setProperty("--mg-acc", activeArc.accColor);
  }

  onMount(() => {
    // Load local storage states if available
    const savedMode = localStorage.getItem("ephemeral_mode");
    if (savedMode === "SOLO" || savedMode === "NETWORK") {
      currentMode = savedMode;
    }

    const savedArcId = localStorage.getItem("ephemeral_arc_id");
    if (savedArcId) {
      activeArcId = parseInt(savedArcId, 10);
    }

    const savedEpId = localStorage.getItem("ephemeral_ep_id");
    if (savedEpId) {
      activeEpId = savedEpId;
    }
  });

  function handleSelectArc(event: CustomEvent<{ id: number }>) {
    activeArcId = event.detail.id;
    localStorage.setItem("ephemeral_arc_id", String(activeArcId));

    // Auto-select first episode of new Arc
    const arcEpisodes = EPISODES.filter((ep) => ep.arcId === activeArcId);
    if (arcEpisodes.length > 0) {
      activeEpId = arcEpisodes[0].id;
      localStorage.setItem("ephemeral_ep_id", activeEpId);
    }
  }

  function handleSelectEpisode(event: CustomEvent<{ id: string }>) {
    activeEpId = event.detail.id;
    localStorage.setItem("ephemeral_ep_id", activeEpId);
  }

  function handleToggleMode(event: CustomEvent<{ mode: "SOLO" | "NETWORK" }>) {
    currentMode = event.detail.mode;
    localStorage.setItem("ephemeral_mode", currentMode);
  }

  function handlePlayEpisode(event: CustomEvent<{ id: string }>) {
    console.log(`Navigating to play episode: ${event.detail.id}`);
    alert(
      `Play Episode Triggered: Starting session for challenge ${event.detail.id}`,
    );
  }

  function handleLogout() {
    alert("Logout initiated. Returning to control shell...");
  }
</script>

<div class="ephemeral-app">
  <!-- Navbar component -->
  <Navbar
    {activeTab}
    {xp}
    {username}
    on:navigate={(e) => (activeTab = e.detail.tab)}
    on:logout={handleLogout}
  />

  {#if activeTab === "home"}
    <!-- Home Dashboard Section wrapper -->
    <main class="scr on" style="display: block; padding-bottom: 3rem;">
      <!-- Hero panel layout component -->
      <Hero
        {ARCS}
        {EPISODES}
        {activeArcId}
        {activeEpId}
        {currentMode}
        on:selectArc={handleSelectArc}
        on:selectEpisode={handleSelectEpisode}
        on:toggleMode={handleToggleMode}
        on:playEpisode={handlePlayEpisode}
        on:browseAll={() => (activeTab = "series")}
      />

      <!-- Activity Ticker -->
      <ActivityTicker />

      <!-- Transmissions grid -->
      <Transmissions
        {ARCS}
        {EPISODES}
        on:play={(e) => {
          activeArcId = e.detail.arcId;
          activeEpId = e.detail.episodeId;
        }}
        on:browse_all={() => (activeTab = "series")}
      />

      <!-- Series Manifest grid -->
      <Manifest {ARCS} {EPISODES} on:selectArc={handleSelectArc} />
    </main>
  {:else}
    <!-- Stub panels for other tabs -->
    <main
      class="scr on"
      style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; color: var(--paper);"
    >
      <div
        class="mg-tone-fine"
        style="position: absolute; inset: 0; opacity: 0.05; pointer-events: none;"
      ></div>
      <div
        style="border: 1px solid var(--mg-acc); background: rgba(255,255,255,0.02); padding: 3rem 4rem; position: relative; max-width: 500px; box-sizing: border-box;"
      >
        <div class="hc sm tl" style="border-color: var(--mg-acc);"></div>
        <div class="hc sm br" style="border-color: var(--mg-acc);"></div>

        <h2
          style="font-family: var(--bebas); font-size: 2.5rem; letter-spacing: 2px; color: var(--mg-acc); margin-bottom: 1rem;"
        >
          SECTION: {activeTab.toUpperCase()}
        </h2>
        <p
          style="font-family: var(--sans); font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 2rem;"
        >
          This terminal segment is currently offline or loading. Refer to
          primary HOME console to interface with operational training arcs.
        </p>
        <button
          style="background: var(--mg-acc); color: #000; font-family: var(--bebas); font-size: 0.9rem; padding: 0.6rem 1.5rem; border: none; cursor: pointer; letter-spacing: 1px;"
          on:click={() => (activeTab = "home")}
        >
          RETURN TO HOME CONSOLE
        </button>
      </div>
    </main>
  {/if}
</div>
