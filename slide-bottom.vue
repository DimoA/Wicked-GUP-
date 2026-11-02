<script setup lang="ts">
// Pied de chaque diapositive : logo à gauche, numéro à droite.
// Masqué sur la page de titre et les intercalaires de partie.
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $page, $nav, $frontmatter } = useSlideContext()
const visible = computed(() => !['titre', 'partie'].includes(($frontmatter as any)?.layout))
</script>

<template>
  <footer v-if="visible" class="pied">
    <img src="/logo_um6p.png" alt="" class="pied__logo" />
    <span class="pied__num">{{ $page }}/{{ $nav.total }}</span>
  </footer>
</template>

<style scoped>
.pied { position: absolute; left: 0; right: 0; bottom: 0.7rem; padding: 0 1.4rem; display: flex; align-items: center; justify-content: space-between; pointer-events: none; }
.pied__logo { height: 1.05rem; }
.pied__num { font-size: 0.72rem; color: var(--gris-texte); font-variant-numeric: tabular-nums; }
</style>
