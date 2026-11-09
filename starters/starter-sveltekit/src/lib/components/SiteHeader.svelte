<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const siteName = env.PUBLIC_SITE_NAME || 'SvelteKit App';
	const links = [
		{ href: resolve('/'), label: 'Home' },
		{ href: resolve('/about'), label: 'About' }
	];
</script>

<header>
	<a href={resolve('/')} class="brand">{siteName}</a>
	<nav>
		{#each links as link (link.href)}
			<a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>
				{link.label}
			</a>
		{/each}
	</nav>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.brand {
		font-weight: 700;
		color: var(--accent);
		text-decoration: none;
	}

	nav {
		display: flex;
		gap: 1rem;
	}

	nav a {
		color: var(--muted);
		text-decoration: none;
	}

	nav a[aria-current='page'],
	nav a:hover {
		color: var(--text);
	}
</style>
