<script setup lang="ts">
// Construction animée de l'écart-type en 5 clics, sur les dix relevés du réacteur.
// 0 : relevés et moyenne ; 1 : écarts ; 2 : leur somme est nulle ; 3 : carrés ;
// 4 : moyenne des carrés (variance) ; 5 : côté du carré moyen = s.
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const etape = computed(() => $clicks.value)

const releves = [77.7, 78.2, 77.9, 78.3, 78.0, 77.8, 78.1, 78.4, 77.6, 78.0]
const n = releves.length
const moyenne = releves.reduce((a, b) => a + b, 0) / n
const ecarts = releves.map(v => Math.round((v - moyenne) * 10) / 10)
const sommeCarres = ecarts.reduce((a, e) => a + e * e, 0)
const variance = sommeCarres / (n - 1)
const s = Math.sqrt(variance)

const X0 = 90, X1 = 470, VMIN = 77.4, VMAX = 78.6
const px = (v: number) => X0 + (v - VMIN) / (VMAX - VMIN) * (X1 - X0)
const ligne = (i: number) => 58 + i * 30
const K = 70 // pixels par °C pour les carrés
const fr = (v: number, d = 1) => v.toFixed(d).replace('.', ',').replace('-', '−')
const signe = (e: number) => (e > 0 ? '+' : '') + fr(e)
</script>

<template>
  <svg viewBox="0 0 920 430" class="ct" role="img"
       aria-label="Construction de l'écart-type : écarts à la moyenne, leurs carrés, la moyenne des carrés, puis sa racine.">
    <!-- bande ± s (étape 5) -->
    <rect v-if="etape >= 5" :x="px(moyenne - s)" :y="44" :width="px(moyenne + s) - px(moyenne - s)" :height="n * 30"
          class="bande" />
    <!-- axe et graduations -->
    <line :x1="X0" :x2="X1" :y1="ligne(n) - 6" :y2="ligne(n) - 6" class="axe" />
    <g v-for="t in [77.4, 77.6, 77.8, 78.0, 78.2, 78.4, 78.6]" :key="t">
      <line :x1="px(t)" :x2="px(t)" :y1="ligne(n) - 6" :y2="ligne(n) - 1" class="axe" />
      <text :x="px(t)" :y="ligne(n) + 12" class="grad">{{ fr(t) }}</text>
    </g>
    <text :x="(X0 + X1) / 2" :y="ligne(n) + 30" class="grad">température relevée (°C)</text>
    <!-- moyenne -->
    <line :x1="px(moyenne)" :x2="px(moyenne)" y1="40" :y2="ligne(n) - 6" class="moy" />
    <text :x="px(moyenne)" y="32" class="moy-txt">x̄ = 78,0</text>
    <!-- lignes de relevés -->
    <g v-for="(v, i) in releves" :key="i">
      <text x="56" :y="ligne(i) + 4" class="num">{{ i + 1 }}</text>
      <line v-if="etape >= 1 && ecarts[i] !== 0" :x1="px(moyenne)" :x2="px(v) - Math.sign(ecarts[i]) * 7" :y1="ligne(i)" :y2="ligne(i)"
            :class="ecarts[i] > 0 ? 'fl fl-pos' : 'fl fl-neg'" marker-end="url(#pointe)" />
      <circle :cx="px(v)" :cy="ligne(i)" r="5.5" class="pt" />
      <text v-if="etape >= 1" x="560" :y="ligne(i) + 4" class="val">{{ signe(ecarts[i]) }}</text>
      <text v-if="etape >= 3" x="660" :y="ligne(i) + 4" class="val">{{ fr(ecarts[i] * ecarts[i], 2) }}</text>
      <rect v-if="etape >= 3 && ecarts[i] !== 0" :x="700" :y="ligne(i) - Math.abs(ecarts[i]) * K / 2"
            :width="Math.abs(ecarts[i]) * K" :height="Math.abs(ecarts[i]) * K" class="carre" />
    </g>
    <defs>
      <marker id="pointe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#5b6670" />
      </marker>
    </defs>
    <!-- en-têtes de colonnes -->
    <text v-if="etape >= 1" x="560" y="32" class="tete">écart</text>
    <text v-if="etape >= 3" x="660" y="32" class="tete">carré</text>
    <!-- sommes -->
    <g v-if="etape >= 2">
      <line x1="525" x2="595" :y1="ligne(n) - 10" :y2="ligne(n) - 10" class="axe" />
      <text x="560" :y="ligne(n) + 8" class="val fort">0</text>
      <text x="560" :y="ligne(n) + 26" class="note">les écarts</text>
      <text x="560" :y="ligne(n) + 40" class="note">se compensent</text>
    </g>
    <g v-if="etape >= 3">
      <line x1="625" x2="695" :y1="ligne(n) - 10" :y2="ligne(n) - 10" class="axe" />
      <text x="660" :y="ligne(n) + 8" class="val fort">{{ fr(sommeCarres, 2) }}</text>
    </g>
    <!-- variance puis s -->
    <g v-if="etape >= 4">
      <text x="845" y="100" class="res">moyenne</text>
      <text x="845" y="118" class="res">des carrés</text>
      <text x="845" y="142" class="res fort">{{ fr(sommeCarres, 2) }} / 9</text>
      <text x="845" y="162" class="res fort">= {{ fr(variance, 3) }} °C²</text>
      <rect :x="845 - s * K / 2" y="180" :width="s * K" :height="s * K" class="carre-moy" />
    </g>
    <g v-if="etape >= 5">
      <line :x1="845 - s * K / 2" :x2="845 + s * K / 2" :y1="180 + s * K + 7" :y2="180 + s * K + 7" class="cote" />
      <text x="845" :y="180 + s * K + 28" class="res fort acc">côté = √{{ fr(variance, 3) }}</text>
      <text x="845" :y="180 + s * K + 50" class="res fort acc">s = {{ fr(s, 2) }} °C</text>
    </g>
  </svg>
</template>

<style scoped>
.ct { width: 100%; height: auto; max-height: 24.5rem; display: block; margin: 0 auto; font-family: inherit; }
.axe { stroke: #9aa4ad; stroke-width: 1; }
.grad { font-size: 11px; fill: #5b6670; text-anchor: middle; }
.moy { stroke: #1f4e79; stroke-width: 1.6; }
.moy-txt { font-size: 13px; fill: #1f4e79; text-anchor: middle; font-weight: 700; }
.num { font-size: 11px; fill: #5b6670; text-anchor: end; }
.pt { fill: #1b2733; }
.fl { stroke-width: 2; }
.fl-pos { stroke: #1f4e79; }
.fl-neg { stroke: #8b96a0; }
.val { font-size: 13px; fill: #1b2733; text-anchor: middle; font-variant-numeric: tabular-nums; }
.tete { font-size: 13px; fill: #5b6670; text-anchor: middle; font-weight: 700; }
.fort { font-weight: 700; }
.note { font-size: 11px; fill: #5b6670; text-anchor: middle; }
.carre { fill: #1f4e79; fill-opacity: 0.18; stroke: #1f4e79; stroke-width: 1; }
.carre-moy { fill: #1f4e79; fill-opacity: 0.35; stroke: #1f4e79; stroke-width: 1.5; }
.res { font-size: 13px; fill: #1b2733; text-anchor: middle; }
.acc { fill: #1f4e79; }
.cote { stroke: #1f4e79; stroke-width: 2.5; }
.bande { fill: #1f4e79; fill-opacity: 0.08; }
</style>
