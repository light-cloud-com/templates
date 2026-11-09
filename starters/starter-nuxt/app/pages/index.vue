<script setup lang="ts">
useHead({ title: 'Home' })

// Runs on the server for the first request, so the time is the server's render time.
const renderedAt = formatDateTime(new Date())
</script>

<template>
  <section>
    <h1>Welcome to Nuxt</h1>
    <p>
      This page is rendered on the server. Edit <code>app/pages/index.vue</code> and save to see
      the change.
    </p>
    <p>
      Rendered at <time>{{ renderedAt }}</time>. The API route at
      <a href="/api/health">/api/health</a> answers with JSON.
    </p>
  </section>
</template>
