<script setup lang="ts">
// Simulation interactive : diviser par n ou par n − 1 ?
// On tire des échantillons de taille n d'une loi normale de variance σ² = 1,
// et on suit la moyenne des deux estimations de la variance.
import { ref, computed, onBeforeUnmount } from 'vue'

const n = ref(3)
const tirages = ref(0)
const sommeN = ref(0)
const sommeN1 = ref(0)
const histN = ref<number[]>([])
const histN1 = ref<number[]>([])
const enCours = ref(false)
const MAX = 4000
let graine = 12345
let timer: number | undefined

function alea() { // générateur pseudo-aléatoire à graine fixe (mulberry32)
  graine |= 0; graine = (graine + 0x6D2B79F5) | 0
  let t = Math.imul(graine ^ (graine >>> 15), 1 | graine)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
function normale() { // Box-Muller
  const u = 1 - alea(), v = alea()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
function unEchantillon() {
  const ech = Array.from({ length: n.value }, normale)
  const m = ech.reduce((a, b) => a + b, 0) / n.value
  const sc = ech.reduce((a, x) => a + (x - m) ** 2, 0)
  tirages.value++
  sommeN.value += sc / n.value
  sommeN1.value += sc / (n.value - 1)
  if (tirages.value % 20 === 0 || tirages.value < 20) {
    histN.value.push(sommeN.value / tirages.value)
    histN1.value.push(sommeN1.value / tirages.value)
  }
}
function lancer() {
  if (enCours.value) return
  if (tirages.value >= MAX) reinitialiser()
  enCours.value = true
  timer = window.setInterval(() => {
    for (let k = 0; k < 25 && tirages.value < MAX; k++) unEchantillon()
    if (tirages.value >= MAX) arreter()
  }, 30)
}
function arreter() { enCours.value = false; if (timer) window.clearInterval(timer) }
function reinitialiser() {
  arreter(); graine = 12345; tirages.value = 0; sommeN.value = 0; sommeN1.value = 0; histN.value = []; histN1.value = []
}
function changerN(e: Event) { n.value = Number((e.target as HTMLInputElement).value); reinitialiser() }
onBeforeUnmount(arreter)

const W = 560, H = 260, G = 46, B = 34
const YMAX = 1.6
const px = (i: number, total: number) => G + (total <= 1 ? 0 : i / (total - 1)) * (W - G - 12)
const py = (v: number) => H - B - Math.min(v, YMAX) / YMAX * (H - B - 10)
const chemin = (h: number[]) => h.map((v, i) => `${i ? 'L' : 'M'}${px(i, Math.max(h.length, 2)).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
const attendu = computed(() => (n.value - 1) / n.value)
const fr = (v: number, d = 3) => v.toFixed(d).replace('.', ',')
const moyN = computed(() => tirages.value ? sommeN.value / tirages.value : NaN)
const moyN1 = computed(() => tirages.value ? sommeN1.value / tirages.value : NaN)
</script>

<template>
  <div class="sim">
    <div class="sim__cmd">
      <label>Taille des échantillons : <b>n = {{ n }}</b>
        <input type="range" min="2" max="10" step="1" :value="n" @input="changerN" />
      </label>
      <button class="btn prim" @click="lancer" :disabled="enCours">Lancer</button>
      <button class="btn" @click="reinitialiser">Réinitialiser</button>
      <span class="gris">{{ tirages }} échantillons tirés</span>
    </div>
    <div class="sim__corps">
      <svg :viewBox="`0 0 ${W} ${H}`" class="sim__fig" role="img"
           aria-label="Moyenne courante des deux estimations de la variance en fonction du nombre d'échantillons.">
        <line :x1="G" :x2="W - 12" :y1="H - B" :y2="H - B" class="axe" />
        <line :x1="G" :x2="G" y1="10" :y2="H - B" class="axe" />
        <g v-for="t in [0, 0.5, 1, 1.5]" :key="t">
          <text :x="G - 7" :y="py(t) + 4" class="grad gauche">{{ fr(t, 1) }}</text>
        </g>
        <text :x="(G + W) / 2" :y="H - 8" class="grad">nombre d'échantillons tirés →</text>
        <line :x1="G" :x2="W - 12" :y1="py(1)" :y2="py(1)" class="ref" />
        <text :x="W - 14" :y="py(1) - 6" class="grad droite acc">vraie variance σ² = 1</text>
        <line :x1="G" :x2="W - 12" :y1="py(attendu)" :y2="py(attendu)" class="ref gris-trait" />
        <text :x="W - 14" :y="py(attendu) + 15" class="grad droite">(n − 1)/n = {{ fr(attendu, 2) }}</text>
        <path v-if="histN1.length > 1" :d="chemin(histN1)" class="courbe c-n1" />
        <path v-if="histN.length > 1" :d="chemin(histN)" class="courbe c-n" />
      </svg>
      <div class="sim__res">
        <div class="sim__ligne"><span class="pastille p-n"></span>division par <b>n</b><br><b class="grand">{{ isNaN(moyN) ? '–' : fr(moyN) }}</b></div>
        <div class="sim__ligne"><span class="pastille p-n1"></span>division par <b>n − 1</b><br><b class="grand">{{ isNaN(moyN1) ? '–' : fr(moyN1) }}</b></div>
        <div class="gris petit">Moyenne des variances estimées, sur tous les échantillons tirés.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim__cmd { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem 1rem; font-size: 0.92rem; margin-bottom: 0.4rem; }
.sim__cmd input { vertical-align: middle; width: 9rem; accent-color: #1f4e79; }
.btn { border: 1px solid #b9c2ca; background: #fff; border-radius: 4px; padding: 0.15rem 0.7rem; cursor: pointer; font: inherit; }
.btn.prim { background: #1f4e79; border-color: #1f4e79; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: default; }
.sim__corps { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.2rem; align-items: center; }
.sim__fig { width: 100%; height: auto; max-height: 17rem; }
.axe { stroke: #9aa4ad; stroke-width: 1; }
.grad { font-size: 11px; fill: #5b6670; text-anchor: middle; }
.gauche { text-anchor: end; } .droite { text-anchor: end; }
.acc { fill: #1f4e79; font-weight: 700; }
.ref { stroke: #1f4e79; stroke-width: 1; stroke-dasharray: 5 4; }
.gris-trait { stroke: #8b96a0; }
.courbe { fill: none; stroke-width: 2.2; }
.c-n1 { stroke: #1f4e79; }
.c-n { stroke: #8b96a0; }
.sim__res { display: flex; flex-direction: column; gap: 0.7rem; font-size: 0.95rem; }
.sim__ligne { background: var(--fond-bloc); border-radius: 4px; padding: 0.45rem 0.75rem; }
.grand { font-size: 1.35rem; font-variant-numeric: tabular-nums; }
.pastille { display: inline-block; width: 0.8rem; height: 0.25rem; border-radius: 2px; margin-right: 0.4rem; vertical-align: middle; }
.p-n { background: #8b96a0; } .p-n1 { background: #1f4e79; }
</style>
