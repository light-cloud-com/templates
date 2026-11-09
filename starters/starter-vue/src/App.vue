<script setup>
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

const count = ref(0)
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Welcome to Vue</h1>
      <p>Your app is ready to deploy on Light Cloud</p>
    </header>
    <main class="main">
      <HelloWorld />
    </main>
    <footer class="footer">
      <p>Deployed with Light Cloud</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #42b883;
}

.header p {
  color: #666;
}

.footer {
  margin-top: 2rem;
  color: #999;
  font-size: 0.9rem;
}
</style>
