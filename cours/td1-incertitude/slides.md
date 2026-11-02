---
theme: default
title: Propager une incertitude
info: |
  TD-I du module M114. Cycle d'ingénieur, 1re année, Génie des procédés.
  Année universitaire 2026/2027.
author: Ahmed Dimokrati
lang: fr
colorSchema: light
aspectRatio: 16/9
canvasWidth: 980
transition: none
routerMode: hash
fonts:
  sans: Atkinson Hyperlegible
  mono: IBM Plex Mono
  provider: google
drawings:
  persist: false
layout: titre
seance: TD-I, 2 heures
---

# Propager une incertitude

## De la formule linéarisée à la simulation de Monte-Carlo

Ahmed Dimokrati

Cycle d'ingénieur, 1<sup>re</sup> année, Génie des procédés

Module M114, année universitaire 2026/2027

<p class="gris">College of Chemical Science and Engineering (CCSE), Département MSN</p>

---

# Objectifs de la séance

À la fin de ces deux heures, vous saurez :

1. dire ce qu'est une **incertitude-type** et l'estimer à partir d'une information simple ;
2. **propager** des incertitudes à travers une formule, par linéarisation ;
3. faire la même chose par **simulation de Monte-Carlo**, et comprendre quand les deux méthodes divergent ;
4. choisir un **nombre de tirages** justifié ;
5. tenir compte d'**entrées corrélées** ;
6. identifier l'entrée qui pèse le plus, et **présenter** un résultat avec les bons chiffres significatifs.

---

# Déroulé

| Durée | Partie | Ce qu'on fait |
|---|---|---|
| 15 min | 1. Mesurer, c'est estimer | incertitude-type, lois usuelles |
| 30 min | 2. Propagation linéarisée | formule, exercice 1 |
| 30 min | 3. Monte-Carlo | principe, code, exercice 2 |
| 15 min | 4. Combien de tirages ? | convergence en $1/\sqrt{N}$ |
| 15 min | 5. Entrées corrélées | covariance, exercice 3 |
| 15 min | 6. Budget et chiffres significatifs | exercice 4, synthèse |

<p class="gris">Matériel : Python avec numpy. Les exercices se font en binôme.</p>

---
layout: partie
numero: 1
---

# Mesurer, c'est estimer

---

# Un chiffre seul ne permet pas de décider

Deux bureaux d'études évaluent le temps de retour d'un même investissement :

| | Temps de retour |
|---|---:|
| Bureau A | 2,1 ans |
| Bureau B | 2,6 ans |

Ces deux résultats sont-ils en désaccord ?

<v-click>

- Si chacun est connu à ± 0,05 an près : **oui**, nettement.
- Si chacun est connu à ± 0,7 an près : **non**, ils sont compatibles.

<Bloc titre="À retenir" variante="retenir">

Sans son incertitude, un résultat ne peut être ni comparé, ni utilisé pour décider.

</Bloc>

</v-click>

---

# L'incertitude-type

<Bloc titre="Définition">

L'**incertitude-type** $u(x)$ d'une grandeur $x$ est l'écart-type de la loi de probabilité qui décrit ce que l'on sait de $x$.

</Bloc>

On l'estime de deux façons :

- **Évaluation de type A**, par la statistique : on répète la mesure $n$ fois et on prend $u = s/\sqrt{n}$, où $s$ est l'écart-type des mesures.
- **Évaluation de type B**, par tout le reste : fiche du fabricant, résolution d'un appareil, plage donnée par un expert, historique de prix.

<p class="gris">Les deux types se combinent exactement de la même manière dans la suite.</p>

---

# Trois lois à connaître

| Ce que l'on sait | Loi | Incertitude-type |
|---|---|---|
| une valeur et un écart-type | normale | $u = \sigma$ |
| « entre $a-\Delta$ et $a+\Delta$, sans préférence » | uniforme | $u = \Delta/\sqrt{3}$ |
| « plutôt autour de $a$, jamais au-delà de $\pm\Delta$ » | triangulaire | $u = \Delta/\sqrt{6}$ |

<br>

La loi uniforme est le choix prudent quand on ne connaît que des bornes : elle donne la plus grande incertitude des trois.

---

# À vous

<Bloc titre="Exercice d'échauffement" variante="avous">

1. Un thermocouple est garanti « à ± 1 K près ». Quelle est son incertitude-type ?
2. Un acheteur vous dit : « le prix de la chaleur sera entre 28 et 42 €/MWh, je ne peux pas dire mieux ». Quelle valeur centrale et quelle incertitude-type retenez-vous ?

</Bloc>

<v-click>

<Bloc titre="Réponses" variante="reponse">

1. Des bornes sans préférence : loi uniforme, $u = 1/\sqrt{3} \approx 0{,}58$ K.
2. Centre 35 €/MWh, demi-largeur 7 €/MWh, loi uniforme : $u = 7/\sqrt{3} \approx 4{,}0$ €/MWh.

</Bloc>

</v-click>

---

# Incertitude absolue, incertitude relative

- **Absolue** : $u(x)$, dans l'unité de $x$. Exemple : $u(\Delta T) = 4$ K.
- **Relative** : $u(x)/|x|$, sans unité. Exemple : $4/65 \approx 6{,}2$ %.

La forme relative permet de comparer des grandeurs d'unités différentes : un débit connu à 7,5 % est moins bien connu qu'une température connue à 6,2 %.

<p class="gris">Nous allons voir qu'elle rend aussi les calculs très simples dès que la formule est un produit.</p>

---
layout: partie
numero: 2
---

# Propagation linéarisée

---

# L'idée : approcher la formule par sa tangente

Soit un résultat $y = f(x_1, \dots, x_n)$ calculé à partir d'entrées incertaines. Si chaque entrée varie un peu autour de sa valeur, un développement au premier ordre donne :

$$
\Delta y \;\approx\; \frac{\partial f}{\partial x_1}\,\Delta x_1 + \dots + \frac{\partial f}{\partial x_n}\,\Delta x_n
$$

- On remplace la formule par une **relation linéaire** autour du point de calcul.
- Le coefficient $c_i = \partial f/\partial x_i$ s'appelle le **coefficient de sensibilité** : il dit de combien $y$ bouge quand $x_i$ bouge d'une unité.

---

# La loi de propagation (entrées indépendantes)

<Bloc titre="Formule">

$$
u_c^2(y) \;=\; \sum_{i=1}^{n} c_i^2\, u^2(x_i)
\qquad\text{avec}\qquad c_i = \frac{\partial f}{\partial x_i}
$$

</Bloc>

- $u_c(y)$ est l'**incertitude-type composée** du résultat.
- Chaque terme $c_i^2\,u^2(x_i)$ est la **contribution** de l'entrée $x_i$ : on les additionne, comme des carrés de côtés dans un théorème de Pythagore.
- Conséquence : une entrée deux fois plus incertaine pèse *quatre* fois plus.

---

# Deux cas particuliers à connaître par cœur

<div class="grid grid-cols-2 gap-10">
<div>

### Sommes et différences

$$ y = x_1 + x_2 - x_3 $$

$$ u^2(y) = u^2(x_1) + u^2(x_2) + u^2(x_3) $$

<p class="gris petit">Les incertitudes absolues s'ajoutent en carré, même pour une soustraction.</p>

</div>
<div>

### Produits et quotients

$$ y = k\, x_1^{a_1} x_2^{a_2} \cdots $$

$$ \left(\frac{u(y)}{y}\right)^2 = \sum_i a_i^2 \left(\frac{u(x_i)}{x_i}\right)^2 $$

<p class="gris petit">Les incertitudes relatives s'ajoutent en carré, pondérées par les exposants.</p>

</div>
</div>

<Bloc titre="Exemple" variante="avous">

Puissance récupérée $Q = \dot m\, c_p\, \Delta T$ avec $\dot m = 4{,}0 \pm 0{,}3$ kg/s et $\Delta T = 65 \pm 4$ K ($c_p = 4{,}18$ kJ/(kg·K), supposé exact).

<v-click>

$u(Q)/Q = \sqrt{0{,}075^2 + 0{,}062^2} = 9{,}7$ %, &nbsp; $Q = 1\,087$ kW, &nbsp; $u(Q) \approx 105$ kW.

</v-click>

</Bloc>

---

# Exercice 1 : le cas étudié

Un échangeur récupère la chaleur d'un effluent chaud pour préchauffer de l'eau, ce qui réduit la consommation de la chaudière. Est-ce rentable ?

$$
T_r = \frac{I}{S}
\qquad\text{avec}\qquad
S = \varepsilon\,\dot m\,c_p\,\Delta T \cdot h \cdot p
$$

| Entrée | Signification | Valeur | $u$ | Unité |
|---|---|---:|---:|---|
| $I$ | investissement | 250 | 37,5 | k€ |
| $\varepsilon$ | efficacité de l'échangeur | 0,78 | 0,05 | – |
| $\dot m$ | débit d'eau préchauffée | 4,0 | 0,3 | kg/s |
| $\Delta T$ | écart de température disponible | 65 | 4 | K |
| $h$ | heures de marche par an | 4 000 | 500 | h/an |
| $p$ | prix de la chaleur évitée | 0,035 | 0,007 | €/kWh |

<p class="gris petit">c<sub>p</sub> = 4,18 kJ/(kg·K) est supposé exact. Les entrées sont indépendantes.</p>

---

# Exercice 1 : questions

<Bloc titre="Exercice 1" variante="avous">

1. Calculez la puissance récupérée $Q$, l'économie annuelle $S$ et le temps de retour $T_r$.
2. Écrivez $T_r$ comme un produit de puissances des entrées. Quels sont les exposants ?
3. Calculez l'incertitude relative puis l'incertitude-type de $T_r$.
4. Quelle part de la variance de $T_r$ vient de chaque entrée ?

</Bloc>

<p class="gris">Conseil : faites un tableau à une ligne par entrée. Vous le réutiliserez jusqu'à la fin de la séance.</p>

---

# Exercice 1 : correction des questions 1 et 2

**1.** Valeurs nominales :

$$
Q = 0{,}78 \times 4{,}0 \times 4{,}18 \times 65 = 847{,}7 \text{ kW}
$$

$$
S = 847{,}7 \text{ kW} \times 4\,000 \text{ h} \times 0{,}035 \text{ €/kWh} = 118{,}7 \text{ k€/an}
\qquad
T_r = \frac{250}{118{,}7} = 2{,}11 \text{ ans}
$$

**2.** En réarrangeant :

$$
T_r = \frac{1}{c_p}\; I^{\,+1}\, \varepsilon^{-1}\, \dot m^{-1}\, \Delta T^{-1}\, h^{-1}\, p^{-1}
$$

Tous les exposants valent ±1 : la règle des produits s'applique directement, et chaque entrée contribue par son incertitude relative au carré.

---

# Exercice 1 : correction de la question 3

| Entrée | $u(x)/x$ | $(u/x)^2$ | Part |
|---|---:|---:|---:|
| $p$ | 20,0 % | 0,0400 | 43,6 % |
| $I$ | 15,0 % | 0,0225 | 24,6 % |
| $h$ | 12,5 % | 0,0156 | 17,0 % |
| $\dot m$ | 7,5 % | 0,0056 | 6,1 % |
| $\varepsilon$ | 6,4 % | 0,0041 | 4,5 % |
| $\Delta T$ | 6,2 % | 0,0038 | 4,1 % |
| **Total** | | **0,0917** | 100 % |

<div class="text-center mt-4">

$u(T_r)/T_r = \sqrt{0{,}0917} = 30{,}3$ % &emsp; $u(T_r) = 0{,}303 \times 2{,}11 = 0{,}64$ an

</div>

---

# Exercice 1 : correction de la question 4, le budget d'incertitude

<img src="/fig/tdi_budget.svg" class="figure" style="max-height: 17rem" alt="Part de la variance du temps de retour due à chaque entrée : prix 43,6 %, investissement 24,6 %, heures 17,0 %, débit 6,1 %, efficacité 4,5 %, écart de température 4,1 %." />

<Bloc titre="À retenir" variante="retenir">

Le temps de retour est incertain d'abord à cause du **prix de l'énergie**, puis de l'investissement. La thermique de l'échangeur ($\varepsilon$, $\dot m$, $\Delta T$) ne pèse que 15 % à elle seule.

</Bloc>

---

# Les limites de la linéarisation

La méthode suppose que la formule reste presque linéaire sur toute la plage d'incertitude.

- Ici, $T_r$ dépend de $1/p$, et $p$ est incertain à 20 %. Ce n'est plus « petit ».
- La linéarisation donne un intervalle **symétrique** : $2{,}11 \pm 1{,}96 \times 0{,}64$, soit de **0,86 à 3,36 ans**.
- Mais une fonction en $1/x$ n'est pas symétrique : quand $p$ baisse, $T_r$ monte plus vite qu'il ne descend quand $p$ monte.

<Bloc titre="Vérifiez à la main" variante="avous">

$p$ à 0,028 (−20 %) : $T_r = 2{,}63$, soit **+0,53**. &emsp; $p$ à 0,042 (+20 %) : $T_r = 1{,}76$, soit **−0,35**.

</Bloc>

<p class="gris">Pour voir la vraie forme de la distribution, il faut une autre méthode.</p>

---
layout: partie
numero: 3
---

# La méthode de Monte-Carlo

---

# Le principe

**Idée** : au lieu d'approcher la formule, on la calcule des milliers de fois, avec des entrées tirées au hasard selon leurs lois.

<div class="flux">
  <div class="flux__etape">lois des entrées<br><span>I, ε, ṁ, ΔT, h, p</span></div>
  <div class="flux__lien">N tirages</div>
  <div class="flux__etape">formule<br><span>T<sub>r</sub> = I / S</span></div>
  <div class="flux__lien">N calculs</div>
  <div class="flux__etape">N valeurs de T<sub>r</sub><br><span>= sa distribution</span></div>
</div>

- Aucune dérivée à calculer, aucune hypothèse de linéarité.
- On obtient la distribution complète : moyenne, médiane, intervalles, probabilité de dépasser un seuil.
- Le prix à payer : beaucoup de calculs. Ici, ce n'est pas un problème.

---

# L'algorithme en quatre étapes

1. **Choisir** une loi pour chaque entrée (ici, normale de moyenne et d'écart-type donnés).
2. **Tirer** $N$ valeurs de chaque entrée, indépendamment.
3. **Calculer** $T_r$ pour chacun des $N$ jeux d'entrées.
4. **Résumer** les $N$ résultats :
   - moyenne et écart-type ;
   - médiane ;
   - intervalle à 95 % : entre le 2,5<sup>e</sup> et le 97,5<sup>e</sup> centile ;
   - probabilité d'un événement, par exemple $P(T_r > 3 \text{ ans})$.

<p class="gris">L'intervalle se lit directement sur les résultats triés : il n'a aucune raison d'être symétrique.</p>

---

# En Python

```python {all|3|7-12|14-15|17-18}
import numpy as np

rng = np.random.default_rng(2026)      # graine fixée : résultat reproductible
N = 10_000
cp = 4.18                              # kJ/(kg.K)

I   = rng.normal(250,   37.5,  N)      # k€
eps = rng.normal(0.78,  0.05,  N)
m   = rng.normal(4.0,   0.3,   N)      # kg/s
dT  = rng.normal(65,    4,     N)      # K
h   = rng.normal(4000,  500,   N)      # h/an
p   = rng.normal(0.035, 0.007, N)      # €/kWh

S  = eps * m * cp * dT * h * p / 1000  # k€/an
Tr = I / S                             # années

print(Tr.mean(), Tr.std(), np.median(Tr))
print(np.percentile(Tr, [2.5, 97.5]), np.mean(Tr > 3))
```

<p class="gris petit">Avancez pas à pas : la graine, les six tirages, le calcul, puis le résumé.</p>

---

# Exercice 2

<Bloc titre="Exercice 2" variante="avous">

1. Exécutez le code avec $N = 10\,000$. Relevez la moyenne, l'écart-type, la médiane, l'intervalle à 95 % et la probabilité que $T_r$ dépasse 3 ans.
2. Tracez l'histogramme de $T_r$. Quelle est sa forme ?
3. Comparez avec la propagation linéarisée. Qu'est-ce qui change ?
4. Pourquoi la moyenne n'est-elle pas égale à la valeur nominale 2,11 ans ?

</Bloc>

---

# Exercice 2 : correction de la question 1

<p class="gris">Valeurs obtenues avec N = 10<sup>6</sup> ; avec 10<sup>4</sup> tirages, vous trouvez les mêmes à quelques centièmes près.</p>

| | Monte-Carlo | Linéarisation |
|---|---|---|
| valeur centrale | moyenne 2,27 ; médiane 2,14 | 2,11 |
| écart-type | 0,77 an | 0,64 an |
| intervalle à 95 % | **1,19 à 4,10 ans** | 0,86 à 3,36 ans |
| $P(T_r > 3 \text{ ans})$ | **14 %** | – |

L'intervalle linéarisé est trop optimiste à droite et trop pessimiste à gauche. Il descend même sous 1 an, ce qui est impossible ici.

---

# Exercice 2 : correction de la question 2, la distribution

<img src="/fig/tdi_histo.svg" class="figure" style="max-height: 19rem" alt="Histogramme du temps de retour obtenu par Monte-Carlo, asymétrique avec une queue vers les longs temps de retour, comparé à la loi normale de la propagation linéarisée." />

La distribution est **asymétrique**, avec une queue vers les longs temps de retour. La loi normale de la linéarisation ne la représente pas.

---

# Exercice 2 : correction des questions 3 et 4

**Pourquoi la moyenne dépasse-t-elle la valeur nominale ?**

- $T_r$ varie comme $1/p$. Cette fonction est **convexe** : elle se courbe vers le haut.
- Un écart de $p$ vers le bas fait plus monter $T_r$ qu'un écart égal vers le haut ne le fait descendre (+0,53 contre −0,35, vu plus haut).
- En moyenne, les hausses l'emportent : $\mathbb{E}[T_r] > T_r(\text{valeurs moyennes})$.

<Bloc titre="À retenir" variante="retenir">

Calculer le résultat avec les valeurs moyennes des entrées ne donne **pas** la moyenne du résultat, dès que la formule n'est pas linéaire.

</Bloc>

**Quelle méthode croire ?** Monte-Carlo, à deux conditions : des lois d'entrée justifiées, et un nombre de tirages suffisant.

---
layout: partie
numero: 4
---

# Combien de tirages ?

---

# La convergence en $1/\sqrt{N}$

<div class="grid grid-cols-[1.25fr_1fr] gap-8 items-center">
<div>

<img src="/fig/tdi_convergence.svg" class="figure" alt="Erreur sur la moyenne estimée en fonction du nombre de tirages, en échelle logarithmique : une droite de pente moins un demi." />

</div>
<div>

L'erreur sur la moyenne estimée vaut environ

$$ \frac{\sigma}{\sqrt{N}} $$

où $\sigma$ est l'écart-type du résultat.

En échelle logarithmique, c'est une droite de pente $-1/2$. Celle mesurée ici : $-0{,}49$.

</div>
</div>

---

# Conséquence pratique

<Bloc titre="À retenir" variante="retenir">

Pour diviser l'erreur par 10, il faut **100 fois** plus de tirages.

</Bloc>

<Bloc titre="À vous" variante="avous">

L'écart-type de $T_r$ vaut $\sigma = 0{,}77$ an. Combien de tirages faut-il pour connaître la moyenne à 0,05 an près (en écart-type) ? Et à 0,01 an près ?

</Bloc>

<v-click>

<Bloc titre="Réponse" variante="reponse">

$N = (\sigma/e)^2$, soit $(0{,}77/0{,}05)^2 \approx 240$ et $(0{,}77/0{,}01)^2 \approx 5\,900$ tirages.

</Bloc>

<p class="gris petit">Attention : les centiles extrêmes (2,5 %, 97,5 %) demandent beaucoup plus de tirages que la moyenne, car peu de tirages tombent dans les queues.</p>

</v-click>

---

# Bonnes pratiques

- **Fixer la graine** du générateur aléatoire : le même code redonne exactement les mêmes nombres.
- **Vérifier la stabilité** : doublez $N$, ou changez de graine. Si le résultat bouge au chiffre que vous annoncez, $N$ est trop petit.
- **Écrire** $N$ et la graine dans votre compte rendu.
- **Vectoriser** le calcul (numpy) plutôt qu'une boucle : $10^6$ tirages prennent moins d'une seconde.

---
layout: partie
numero: 5
---

# Entrées corrélées

---

# Quand deux entrées bougent ensemble

Jusqu'ici, les entrées étaient **indépendantes**. Ce n'est pas toujours vrai.

**Exemple** : le débit $\dot m$ et les heures de marche $h$ dépendent tous deux de la charge de l'atelier. Une année chargée, les deux augmentent ensemble.

<Bloc titre="Covariance et coefficient de corrélation">

$$
u(x_i, x_j) = \rho_{ij}\, u(x_i)\, u(x_j) \qquad \text{avec } -1 \le \rho_{ij} \le 1
$$

$\rho = 0$ : indépendance ; $\rho > 0$ : elles varient dans le même sens ; $\rho < 0$ : en sens opposé.

</Bloc>

Ici, on retient $\rho(\dot m, h) = 0{,}6$.

---

# La loi de propagation complète

$$
u_c^2(y) = \sum_{i} c_i^2\, u^2(x_i) \;+\; 2 \sum_{i<j} c_i\, c_j\, u(x_i, x_j)
$$

Pour un produit de puissances, en relatif :

$$
\left(\frac{u(y)}{y}\right)^2 = \sum_i a_i^2 \left(\frac{u_i}{x_i}\right)^2
+ 2 \sum_{i<j} a_i\, a_j\, \rho_{ij} \frac{u_i}{x_i}\frac{u_j}{x_j}
$$

- Le terme croisé peut **augmenter** ou **diminuer** l'incertitude, selon le signe de $a_i a_j \rho_{ij}$.

---

# Exercice 3

<Bloc titre="Exercice 3" variante="avous">

1. Avec $\rho(\dot m, h) = 0{,}6$, calculez la nouvelle incertitude de $T_r$ par la formule.
2. Refaites le Monte-Carlo avec des tirages corrélés. Comparez.

</Bloc>

Pour tirer deux variables normales corrélées :

```python
z1 = rng.standard_normal(N)
z2 = 0.6 * z1 + np.sqrt(1 - 0.6**2) * rng.standard_normal(N)   # corr(z1, z2) = 0,6
m = 4.0  + 0.3 * z1
h = 4000 + 500 * z2
```

---

# Exercice 3 : correction

**1.** $\dot m$ et $h$ ont le même exposant $-1$, donc $a_{\dot m}\, a_h = +1$ :

$$
2 \times 0{,}6 \times 0{,}075 \times 0{,}125 = 0{,}0113
$$

$$
\left(\frac{u}{T_r}\right)^2 = 0{,}0917 + 0{,}0113 = 0{,}1029
\quad\Rightarrow\quad 32{,}1\ \%, \quad u(T_r) = 0{,}68 \text{ an}
$$

**2.** Monte-Carlo corrélé : écart-type 0,84 an, intervalle à 95 % de **1,15 à 4,27 ans** (contre 1,19 à 4,10 sans corrélation).

<Bloc titre="À retenir" variante="retenir">

Ignorer une corrélation positive entre deux entrées qui agissent dans le même sens **sous-estime** l'incertitude.

</Bloc>

---

# L'intuition du signe

<div class="grid grid-cols-2 gap-10">
<div>

### Les erreurs s'additionnent

Deux entrées corrélées positivement, qui jouent dans le même sens sur le résultat.

<p class="gris">Une année chargée : plus de débit et plus d'heures, les deux font baisser T<sub>r</sub> ensemble.</p>

</div>
<div>

### Les erreurs se compensent

Deux entrées corrélées positivement, qui jouent en sens opposés.

<p class="gris">Deux thermocouples du même lot mesurent T<sub>1</sub> et T<sub>2</sub> : leur biais commun s'annule dans T<sub>1</sub> − T<sub>2</sub>.</p>

</div>
</div>

<br>

C'est pourquoi on mesure souvent une **différence** avec le même instrument : elle est connue bien plus précisément que chacune des deux valeurs.

---
layout: partie
numero: 6
---

# Budget d'incertitude et chiffres significatifs

---

# Où faut-il investir pour réduire l'incertitude ?

<Bloc titre="Exercice 4" variante="avous">

Vous pouvez diviser par deux l'incertitude d'une seule entrée. Laquelle choisir ? Calculez la nouvelle incertitude relative de $T_r$ dans trois cas : $p$, $I$ ou $\varepsilon$.

</Bloc>

<v-click>

| Entrée améliorée | $u(T_r)/T_r$ | Gain |
|---|---:|---:|
| aucune | 30,3 % | – |
| prix $p$ | 24,8 % | −5,5 points |
| investissement $I$ | 27,3 % | −3,0 points |
| efficacité $\varepsilon$ | 29,8 % | −0,5 point |

<p class="gris">Améliorer la mesure de l'efficacité de l'échangeur ne sert presque à rien : elle ne pèse que 4,5 %.</p>

</v-click>

---

# Combien de chiffres annoncer ?

<Bloc titre="Trois règles">

1. L'incertitude s'écrit avec **un chiffre significatif**, ou deux si ce chiffre est 1 ou 2.
2. Le résultat s'arrondit **à la même décimale** que son incertitude.
3. On précise **ce que représente** l'incertitude : écart-type, intervalle à 95 %, méthode.

</Bloc>

**Application au temps de retour**

- Linéarisation : $u = 0{,}64 \rightarrow 0{,}6$, donc $T_r = 2{,}1 \pm 0{,}6$ an (incertitude-type).
- Monte-Carlo : « médiane 2,1 ans ; intervalle à 95 % de 1,2 à 4,1 ans ($N = 10^6$) ».

---

# À vous : corrigez ces écritures

<Bloc titre="Exercice" variante="avous">

1. $Q = 847{,}73 \pm 81{,}2$ kW
2. $\eta = 0{,}8912 \pm 0{,}0137$
3. $T_r = 2{,}10652$ ans
4. $\Delta T = 65$ K

</Bloc>

<v-click>

<Bloc titre="Réponses" variante="reponse">

1. $Q = 850 \pm 80$ kW <span class="gris">(8 est le premier chiffre : un seul chiffre significatif)</span>
2. $\eta = 0{,}891 \pm 0{,}014$ <span class="gris">(1 est le premier chiffre : on en garde deux)</span>
3. Impossible à corriger : il manque l'incertitude. Six chiffres laissent croire à une précision de la seconde.
4. Même problème : 65 K à 1 K près, ou à 10 K près ?

</Bloc>

</v-click>

---
layout: partie
numero: 7
---

# Synthèse

---

# À retenir

1. Un résultat sans incertitude ne permet pas de décider.
2. La **linéarisation** additionne les contributions en carré. Pour un produit, on travaille en relatif.
3. Le **Monte-Carlo** donne la distribution complète, sans hypothèse de linéarité. Il révèle l'asymétrie que la linéarisation cache.
4. Sa précision progresse en $1/\sqrt{N}$ : fixez la graine et vérifiez la stabilité.
5. Une **corrélation** peut augmenter ou réduire l'incertitude. L'ignorer est une erreur.
6. Le **budget d'incertitude** dit où investir : réduisez le terme dominant, pas les autres.
7. Annoncez **peu de chiffres**, et dites ce qu'ils représentent.

---

# Pour s'entraîner

<Bloc titre="Exercice A" variante="avous">

Masse volumique $\rho = m/V$, avec $m = 12{,}40 \pm 0{,}05$ g et $V = 10{,}0 \pm 0{,}1$ mL. Donnez $\rho$ et son incertitude.

</Bloc>

<Bloc titre="Exercice B" variante="avous">

$T_1 = 80{,}0$ °C et $T_2 = 39{,}4$ °C, mesurées avec $u = 0{,}5$ K chacune et une corrélation $\rho = 0{,}8$ (même lot de sondes). Calculez $u(T_1 - T_2)$, puis comparez au cas indépendant.

</Bloc>

<v-click>

<Bloc titre="Réponses" variante="reponse">

A. $\rho = 1{,}240$ g/mL ; $\sqrt{0{,}004^2 + 0{,}010^2} = 1{,}08$ % ; $\rho = 1{,}240 \pm 0{,}013$ g/mL.

B. $u^2 = 0{,}25 + 0{,}25 - 2 \times 0{,}8 \times 0{,}25 = 0{,}10$, soit $u = 0{,}32$ K, contre $0{,}71$ K si indépendantes.

</Bloc>

</v-click>
