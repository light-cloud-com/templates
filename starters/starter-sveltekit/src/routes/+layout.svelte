<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { SiteHeader } from '$lib';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	<SiteHeader />
	<main>
		{@render children()}
	</main>
	<footer>Deployed with Light Cloud</footer>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 960px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	main {
		flex: 1;
		padding: 3rem 0;
	}

	footer {
		padding: 1.5rem 0;
		color: var(--muted);
		font-size: 0.9rem;
		border-top: 1px solid var(--border);
	}
</style>
