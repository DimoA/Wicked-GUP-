<script setup lang="ts">
// Écart-type et RMSE : même construction, deux « modèles ».
// 0 : le nuage ; 1 : écarts à la moyenne ; 2 : écarts à la droite de régression.
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const etape = computed(() => $clicks.value)

const xs = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5]
const ys = [53.5, 51.9, 51.3, 48.5, 44.7, 44.0, 41.5, 40.1]
const n = xs.length
const ym = ys.reduce((a, b) => a + b, 0) / n
const xm = xs.reduce((a, b) => a + b, 0) / n
const pente = xs.reduce((a, x, i) => a + (x - xm) * (ys[i] - ym), 0) / xs.reduce((a, x) => a + (x - xm) ** 2, 0)
const orig = ym - pente * xm
const pred = (x: number) => orig + pente * x
const rmsMoy = Math.sqrt(ys.reduce((a, y) => a + (y - ym) ** 2, 0) / n)
const rmsReg = Math.sqrt(ys.reduce((a, y, i) => a + (y - pred(xs[i])) ** 2, 0) / n)

const W = 520, H = 300, G = 60, B = 40
const px = (x: number) => G + (x - 1.5) / (6.0 - 1.5) * (W - G - 10)
const py = (y: number) => H - B - (y - 38) / (56 - 38) * (H - B - 15)
const fr = (v: number, d = 1) => v.toFixed(d).replace('.', ',')
</script>

<template>
  <div class="er">
    <svg :viewBox="`0 0 ${W} ${H}`" class="er__fig" role="img"
         aria-label="Nuage de points de la température de sortie en fonction du débit, avec les écarts à la moyenne puis à une droite de régression.">
      <line :x1="G" :x2="W - 10" :y1="H - B" :y2="H - B" class="axe" />
      <line :x1="G" :x2="G" y1="12" :y2="H - B" class="axe" />
      <g v-for="t in [2, 3, 4, 5, 6]" :key="'x' + t">
        <text :x="px(t)" :y="H - B + 16" class="grad">{{ t }}</text>
      </g>
      <g v-for="t in [40, 45, 50, 55]" :key="'y' + t">
        <text :x="G - 8" :y="py(t) + 4" class="grad gauche">{{ t }}</text>
      </g>
      <text :x="(G + W) / 2" :y="H - 4" class="grad">débit (kg/s)</text>
      <text x="14" :y="(H - B) / 2" class="grad" :transform="`rotate(-90 14 ${(H - B) / 2})`">température de sortie (°C)</text>

      <g v-if="etape === 1">
        <line :x1="G" :x2="W - 10" :y1="py(ym)" :y2="py(ym)" class="modele" />
        <line v-for="(x, i) in xs" :key="'em' + i" :x1="px(x)" :x2="px(x)" :y1="py(ys[i])" :y2="py(ym)" class="ecart" />
      </g>
      <g v-if="etape >= 2">
        <line :x1="G" :x2="W - 10" :y1="py(ym)" :y2="py(ym)" class="modele pale" />
        <line :x1="px(1.5)" :x2="px(6.0)" :y1="py(pred(1.5))" :y2="py(pred(6.0))" class="modele" />
        <line v-for="(x, i) in xs" :key="'er' + i" :x1="px(x)" :x2="px(x)" :y1="py(ys[i])" :y2="py(pred(x))" class="ecart" />
      </g>
      <circle v-for="(x, i) in xs" :key="'p' + i" :cx="px(x)" :cy="py(ys[i])" r="5" class="pt" />
    </svg>

    <div class="er__texte">
      <div class="er__bloc" :class="{ inactif: etape < 1 }">
        <div class="er__titre">Modèle « moyenne »</div>
        <div>On prédit la moyenne <i>ȳ</i> pour tous les points.</div>
        <div class="er__val">RMS des écarts : <b>{{ fr(rmsMoy) }} °C</b></div>
        <div class="gris petit">C'est (à la division près) l'écart-type des données.</div>
      </div>
      <div class="er__bloc" :class="{ inactif: etape < 2 }">
        <div class="er__titre">Modèle « droite de régression »</div>
        <div>On prédit <i>ŷ<sub>i</sub></i> en tenant compte du débit.</div>
        <div class="er__val">RMS des écarts : <b>{{ fr(rmsReg) }} °C</b></div>
        <div class="gris petit">C'est le RMSE du modèle.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.er { display: grid; grid-template-columns: 1.15fr 1fr; gap: 1.4rem; align-items: center; }
.er__fig { width: 100%; height: auto; max-height: 19rem; }
.axe { stroke: #9aa4ad; stroke-width: 1; }
.grad { font-size: 11px; fill: #5b6670; text-anchor: middle; }
.gauche { text-anchor: end; }
.pt { fill: #1b2733; }
.modele { stroke: #1f4e79; stroke-width: 2; }
.pale { stroke-opacity: 0.25; stroke-dasharray: 4 4; }
.ecart { stroke: #1f4e79; stroke-width: 1.5; stroke-dasharray: 3 2; }
.er__texte { display: flex; flex-direction: column; gap: 0.7rem; font-size: 0.95rem; }
.er__bloc { background: var(--fond-bloc); border-radius: 4px; padding: 0.5rem 0.8rem; transition: opacity 0.2s; }
.er__bloc.inactif { opacity: 0; }
.er__titre { font-weight: 700; color: var(--accent); margin-bottom: 0.15rem; }
.er__val { margin-top: 0.2rem; }
</style>
