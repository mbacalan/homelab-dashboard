<script lang="ts">
  import { onMount } from "svelte";
  import { GameServerManager } from "./lib/game-server-manager.ts";
  import { minecraftState, abioticState } from "./lib/stores/stores.ts";
  import ServerSection from "./lib/components/server-section.svelte";
  import LinkSection from "./lib/components/link-section.svelte";
  import type { Games, LinkData } from "./lib/types.js";

  let gameManager: GameServerManager;

  const servarrLinks: LinkData[] = [
    { label: "Movies", name: "Radarr", url: import.meta.env.VITE_RADARR_URL },
    { label: "TV Shows", name: "Sonarr", url: import.meta.env.VITE_SONARR_URL },
    {
      label: "Subtitles",
      name: "Bazarr",
      url: import.meta.env.VITE_BAZARR_URL,
    },
  ];

  const utilityLinks: LinkData[] = [
    {
      label: "Torrent Client",
      name: "qBittorrent",
      url: import.meta.env.VITE_QBIT_URL,
    },
    {
      label: "Indexer",
      name: "Prowlarr",
      url: import.meta.env.VITE_PROWLARR_URL,
    },
    {
      label: "Captcha Solver",
      name: "FlareSolverr",
      url: import.meta.env.VITE_SOLVERR_URL,
    },
  ];

  onMount(() => {
    gameManager = new GameServerManager();
    gameManager.connect();

    return () => {
      if (gameManager) {
        gameManager.disconnect();
      }
    };
  });

  function handleCheckStatus(game: Games): void {
    gameManager.checkServerStatus(game);
  }

  function handleToggleServer(game: Games): void {
    gameManager.toggleServer(game);
  }
</script>

<svelte:head>
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <title>Homelab Dashboard</title>
</svelte:head>

<header class="container">
  <hgroup>
    <h1>Homelab Dashboard</h1>
    <h2>Automation, media library & game servers</h2>
  </hgroup>
</header>

<main class="container">
  <div class="grid">
    <LinkSection title="ServArr" links={servarrLinks} />
    <LinkSection title="Utilities" links={utilityLinks} />
  </div>

  <ServerSection
    title="Minecraft"
    game="minecraft"
    state={minecraftState}
    onCheckStatus={handleCheckStatus}
    onToggleServer={handleToggleServer}
    showMap={true}
    mapUrl={import.meta.env.VITE_MCMAP_URL}
  />

  <ServerSection
    title="Abiotic"
    game="abiotic"
    state={abioticState}
    onCheckStatus={handleCheckStatus}
    onToggleServer={handleToggleServer}
  />
</main>
