<script setup lang="ts">
// Encadré pédagogique : « À vous », « Réponse », « À retenir » ou bloc neutre.
const props = defineProps<{ titre?: string; variante?: 'avous' | 'reponse' | 'retenir' | 'bloc' }>()
const variante = props.variante ?? 'bloc'
</script>

<template>
  <div class="bloc" :class="`bloc--${variante}`">
    <div v-if="titre" class="bloc__titre">{{ titre }}</div>
    <div class="bloc__corps"><slot /></div>
  </div>
</template>

<style scoped>
.bloc { border-radius: 4px; margin: 0.7rem 0; overflow: hidden; background: var(--fond-bloc); }
.bloc__titre { font-weight: 700; padding: 0.35rem 0.85rem; background: #e3e7eb; color: var(--encre); }
.bloc__corps { padding: 0.45rem 0.85rem 0.55rem; }
.bloc__corps :deep(p) { margin: 0.25rem 0; }
.bloc__corps :deep(ol), .bloc__corps :deep(ul) { margin-top: 0.15rem; margin-bottom: 0.15rem; }
.bloc--retenir .bloc__titre { background: var(--accent); color: #fff; }
.bloc--reponse { background: #f7f8f9; border-left: 3px solid var(--filet); }
.bloc--reponse .bloc__titre { background: transparent; color: var(--gris-texte); padding-bottom: 0; }
</style>
