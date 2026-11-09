<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button type="button" @click="count++">Count is {{ count }}</button>
</template>

<style scoped>
button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: var(--accent);
  color: white;
  cursor: pointer;
  transition: background-color 0.25s;
}

button:hover {
  background-color: var(--accent-hover);
}
</style>
