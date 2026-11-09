<script setup lang="ts">
const { public: { siteName } } = useRuntimeConfig()
</script>

<template>
  <header class="header">
    <NuxtLink to="/" class="brand">{{ siteName }}</NuxtLink>
    <nav class="nav">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.header {
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

.nav {
  display: flex;
  gap: 1rem;
}

.nav a {
  color: var(--muted);
  text-decoration: none;
}

.nav a.router-link-exact-active,
.nav a:hover {
  color: var(--text);
}
</style>
