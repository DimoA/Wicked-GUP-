<script setup lang="ts">
defineProps<{ numero?: number | string }>()
</script>

<template>
  <div class="slidev-layout partie">
    <div v-if="numero" class="partie__numero">Partie {{ numero }}</div>
    <slot />
  </div>
</template>

<style scoped>
.partie { display: flex; flex-direction: column; justify-content: center; height: 100%; }
.partie__numero { color: var(--gris-texte); font-size: 1rem; margin-bottom: 0.5rem; }
.partie :deep(h1) { font-size: 2.2rem; border-bottom: 1px solid var(--filet); padding-bottom: 0.8rem; width: 78%; }
</style>
