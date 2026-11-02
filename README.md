# Supports de cours (Slidev)

Présentations Slidev de mes cours, publiées sur GitHub Pages :
**https://dimoa.github.io/Wicked-GUP-/** (page d'accueil qui liste tous les cours).

| Cours | En ligne |
|---|---|
| Cours : Propager une incertitude (M114) | https://dimoa.github.io/Wicked-GUP-/cours1-incertitude/ |
| TD-I : Propager une incertitude (M114) | https://dimoa.github.io/Wicked-GUP-/td1-incertitude/ |

## Organisation

```
cours/
  td1-incertitude/
    slides.md        tout le contenu, une diapositive entre deux lignes ---
    public/fig/      figures propres à ce cours (appelées /fig/... dans slides.md)
commun/              mise en page partagée par tous les cours (addon Slidev)
  layouts/           titre.vue (page de titre), partie.vue (intercalaires)
  components/        Bloc.vue : encadrés « À vous », « Réponse », « À retenir »
  slide-bottom.vue   pied de page (logo et numéro)
  styles/index.css   couleurs et typographie
  assets/            logo
scripts/build.mjs    construit chaque cours et génère la page d'accueil
```

Modifier un fichier de `commun/` change l'apparence de tous les cours à la fois.

## Travailler en local

Prérequis : Node.js 20 ou plus récent.

```bash
npm ci                                          # une seule fois
npm run dev cours/td1-incertitude/slides.md     # ouvre le cours dans le navigateur
npm run build                                   # tous les cours + page d'accueil dans dist/
npm run export cours/td1-incertitude/slides.md  # PDF ; nécessite une fois : npm install -D playwright-chromium
```

Raccourcis utiles pendant la séance : flèches pour avancer, `o` pour la vue d'ensemble,
`p` pour le mode présentateur (notes, diapositive suivante), `f` pour le plein écran.

## Ajouter un cours

1. Créez un dossier `cours/<nom>/` (par exemple `cours/td2-regression/`) contenant `slides.md`,
   et éventuellement `public/` pour ses figures. Le plus simple est de partir d'une copie de
   `cours/td1-incertitude/slides.md` pour garder le même en-tête.
2. Dans l'en-tête de `slides.md`, renseignez `title`, `seance` et `info` : ce sont eux qui
   apparaissent sur la page d'accueil.
3. Envoyez sur `main` :

```bash
git add cours/<nom>
git commit -m "Ajoute <nom>"
git push
```

Le workflow `.github/workflows/deploy.yml` reconstruit alors tous les cours et la page d'accueil ;
le nouveau cours est en ligne une minute plus tard à `https://dimoa.github.io/Wicked-GUP-/<nom>/`.
Les cours apparaissent sur la page d'accueil dans l'ordre alphabétique des dossiers.
