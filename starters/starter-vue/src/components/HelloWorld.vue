<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="card">
    <button type="button" @click="count++">Count is {{ count }}</button>
    <p>Edit <code>src/components/HelloWorld.vue</code> to test HMR</p>
  </div>
</template>

<style scoped>
.card {
  padding: 2rem;
  border-radius: 8px;
  background: #f9f9f9;
}

button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: #42b883;
  color: white;
  cursor: pointer;
  transition: background-color 0.25s;
}

button:hover {
  background-color: #33a06f;
}

p {
  margin-top: 1rem;
  color: #888;
}

code {
  background: #e0e0e0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
