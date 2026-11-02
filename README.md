# TD-I : Propager une incertitude (Slidev)

Module M114, cycle d'ingénieur 1re année, Génie des procédés. Année universitaire 2026/2027.

## Lancer la présentation

Prérequis : Node.js 18 ou plus récent.

```bash
npm install        # une seule fois
npm run dev        # ouvre la présentation dans le navigateur
```

Raccourcis utiles pendant la séance : flèches pour avancer, `o` pour la vue d'ensemble,
`p` pour le mode présentateur (notes, diapositive suivante), `d` pour le mode sombre (désactivé ici).

## Produire une version statique ou un PDF

```bash
npm run build      # site statique dans dist/, à héberger ou ouvrir via un serveur
npm run export     # PDF ; nécessite une fois : npm install -D playwright-chromium
```

## Organisation du projet

- `slides.md` : tout le contenu, une diapositive entre deux lignes `---`
- `components/Bloc.vue` : encadrés « À vous », « Réponse », « À retenir »
- `layouts/titre.vue`, `layouts/partie.vue` : page de titre et intercalaires de partie
- `slide-bottom.vue` : pied de page (logo et numéro)
- `styles/index.css` : couleurs et typographie
- `public/` : logo et figures

Les réponses aux exercices apparaissent au clic (`<v-click>`) ; le code Python se dévoile bloc par bloc.

## Mettre le projet sur GitHub

1. Sur github.com, créez un dépôt **vide** (sans README ni licence), par exemple `td1-incertitude-slidev`.
2. Dans le dossier du projet :

```bash
git init
git add .
git commit -m "TD-I : propager une incertitude (Slidev)"
git branch -M main
git remote add origin https://github.com/VOTRE-IDENTIFIANT/td1-incertitude-slidev.git
git push -u origin main
```

Le fichier `.gitignore` exclut `node_modules/` et `dist/` : seuls une vingtaine de fichiers sont envoyés.

## Publier la présentation en ligne (GitHub Pages)

Le fichier `.github/workflows/deploy.yml` construit et publie la présentation à chaque envoi sur `main`.

1. Dans le dépôt : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Envoyez un commit (ou relancez le workflow depuis l'onglet **Actions**).
3. La présentation est en ligne à l'adresse `https://VOTRE-IDENTIFIANT.github.io/td1-incertitude-slidev/`.

Pour un dépôt privé, GitHub Pages n'est disponible qu'avec certaines offres payantes ; sur un dépôt public, c'est gratuit.
