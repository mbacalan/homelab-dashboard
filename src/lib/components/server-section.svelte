<script lang="ts">
  import type { Games, GameState } from "../types.js";
  import type { Writable } from "svelte/store";

  export let title: string;
  export let game: Games;
  export let state: Writable<GameState>;
  export let onCheckStatus: (game: Games) => void;
  export let onToggleServer: (game: Games) => void;
  export let showMap: boolean = false;
  export let mapUrl: string = "";
</script>

<section>
  <h2>{title}</h2>

  <p aria-busy={$state.isLoading}>
    {$state.statusText}
  </p>

  {#if $state.showDetails || ($state.online && $state.version)}
    <details open>
      <summary class="secondary">Details</summary>

      {#if $state.version}
        <div>
          <p>Version: {$state.version.name || "-"}</p>
        </div>
      {/if}

      {#if $state.players}
        <div>
          <p>Online: {$state.players.online || "0"}</p>
        </div>
      {/if}

      {#if showMap}
        <div>
          <a href={mapUrl} target="_blank" rel="noreferrer"> View Map </a>
        </div>
      {/if}

      {#if $state.logs}
        <div class="log">
          {#if $state.logs.length === 0}
            <p>Terminal output is empty</p>
          {:else}
            {#each $state.logs as log}
              <p>{log}</p>
            {/each}
          {/if}
        </div>
      {/if}
    </details>
  {/if}

  <div class="grid">
    <button on:click={() => onCheckStatus(game)}> Check Status </button>
    <button
      disabled={$state.buttonDisabled}
      on:click={() => onToggleServer(game)}
    >
      {$state.online ? "Stop Server" : "Start Server"}
    </button>
  </div>
</section>
