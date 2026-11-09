<template>
  <div class="layout">
    <AppHeader />
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
