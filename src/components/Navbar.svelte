<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { synthSound } from "../utils/audio";

  const dispatch = createEventDispatcher();
  export let activeTab: string = "home";
  export let xp: number = 360;
  export let username: string = "akrist";

  function handleNavigate(tab: string, event: Event) {
    event.preventDefault();
    synthSound.click();
    dispatch("navigate", { tab });
  }

  function handleKeyDown(tab: string, event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      handleNavigate(tab, event);
    }
  }

  function handleLogout() {
    synthSound.click();
    dispatch("logout");
  }
</script>

<nav>
  <div
    class="logo"
    on:click={(e) => handleNavigate("home", e)}
    on:keydown={(e) => handleKeyDown("home", e)}
    role="link"
    tabindex="0"
  >
    <em>E</em>PHEMERAL
  </div>
  <div class="nav-mid">
    <a
      href="#home"
      class={activeTab === "home" ? "on" : ""}
      on:click={(e) => handleNavigate("home", e)}>Home</a
    >
    <a
      href="#blitz"
      class={activeTab === "series" ? "on" : ""}
      on:click={(e) => handleNavigate("series", e)}>Series</a
    >
    <a
      href="#leaderboard"
      class={activeTab === "leaderboard" ? "on" : ""}
      on:click={(e) => handleNavigate("leaderboard", e)}>Leaderboard</a
    >
  </div>
  <div class="nav-r">
    <span class="nav-status">
      <span class="nav-dot"></span>
      <span class="nav-uid">{username}</span>
    </span>
    <span
      style="font-size: 0.55rem; font-family: var(--mono); color: var(--paper); background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 0.3rem;"
    >
      <span style="color: var(--crt)">⚡</span>
      <span id="nav-xp">{xp} XP</span>
    </span>
    <button class="nav-btn" on:click={handleLogout}>Logout</button>
  </div>
</nav>
