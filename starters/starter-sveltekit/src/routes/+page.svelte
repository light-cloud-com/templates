<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head>
	<title>Home | SvelteKit App</title>
</svelte:head>

<h1>Welcome to SvelteKit</h1>
<p>
	This page is rendered on the server. Edit <code>src/routes/+page.svelte</code> and save to see
	the change.
</p>
<p>
	Rendered at <time>{data.renderedAt}</time>. The API route at
	<a href={resolve('/api/health')}>/api/health</a> answers with JSON.
</p>
