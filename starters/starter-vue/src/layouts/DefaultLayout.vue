<script setup>
import { RouterLink } from 'vue-router'

const title = import.meta.env.VITE_APP_TITLE || 'Vue App'
</script>

<template>
  <div class="layout">
    <header class="header">
      <span class="brand">{{ title }}</span>
      <nav class="nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>
    <main class="main">
      <slot />
    </main>
    <footer class="footer">Deployed with Light Cloud</footer>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

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

.main {
  flex: 1;
  padding: 3rem 0;
}

.footer {
  padding: 1.5rem 0;
  color: var(--muted);
  font-size: 0.9rem;
  border-top: 1px solid var(--border);
}
</style>
