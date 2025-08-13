<script lang="ts">
  import type { LinkData } from "../types.js";

  export let title: string;
  export let links: LinkData[];
</script>

<section>
  <h2>{title}</h2>

  <ul>
    {#each links as link}
      <li>
        {link.label}:
        <a href={link.url} target="_blank" rel="noreferrer">{link.name}</a>
      </li>
    {/each}
  </ul>
</section>
