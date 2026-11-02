<script setup lang="ts">
defineProps<{ seance?: string }>()
</script>

<template>
  <div class="slidev-layout titre">
    <img class="titre__logo" src="/logo_um6p.png" alt="UM6P, Université Mohammed VI Polytechnique" />
    <div class="titre__corps">
      <div v-if="seance" class="titre__seance">{{ seance }}</div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.titre { display: flex; flex-direction: column; justify-content: center; height: 100%; }
.titre__logo { position: absolute; top: 1.6rem; right: 2.4rem; height: 2.6rem; }
.titre__seance { color: var(--gris-texte); font-size: 0.95rem; margin-bottom: 0.6rem; }
.titre :deep(h1) { font-size: 2.3rem; border: none; padding: 0; margin: 0 0 0.4rem; }
.titre :deep(h2) { font-size: 1.25rem; font-weight: 400; margin: 0 0 1.2rem; padding-bottom: 1.1rem; border-bottom: 1px solid var(--filet); }
.titre :deep(p) { margin: 0.15rem 0; font-size: 1rem; }
.titre :deep(p.gris) { font-size: 0.85rem; margin-top: 0.4rem; }
</style>
