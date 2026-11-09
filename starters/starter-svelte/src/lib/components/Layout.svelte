<script>
  import Ticks from './Ticks.svelte'
  let { children } = $props()
</script>

{@render children()}

<Ticks />
<section class="spacer"></section>

<style>
  .spacer {
    height: 88px;
    border-top: 1px solid var(--border);
    @media (max-width: 1024px) {
      height: 48px;
    }
  }
</style>
