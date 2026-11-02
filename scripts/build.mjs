// Construit chaque cours (cours/<nom>/slides.md) dans dist/<nom>/,
// puis génère la page d'accueil dist/index.html qui les liste.
// Usage : node scripts/build.mjs [base]   (base par défaut : /, sur GitHub Pages : /<dépôt>/)
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const TITRE_SITE = 'Supports de cours'

const racine = resolve(import.meta.dirname, '..')
const dossierCours = join(racine, 'cours')
const dist = join(racine, 'dist')
const base = (process.argv[2] ?? '/').replace(/\/?$/, '/')

// Lit les champs utiles dans l'en-tête YAML de slides.md (title, seance, info, author).
function lireEntete(fichier) {
  const entete = readFileSync(fichier, 'utf-8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const champ = nom => entete.match(new RegExp(`^${nom}:[ \\t]*(.+)$`, 'm'))?.[1].trim()
  const bloc = entete.match(/^info:[ \t]*\|\n((?:[ \t]+.*\n?)+)/m)?.[1]
  return {
    titre: champ('title'),
    seance: champ('seance'),
    auteur: champ('author'),
    info: bloc ? bloc.split('\n').map(l => l.trim()).filter(Boolean).join(' ') : champ('info'),
  }
}

const echapper = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const cours = readdirSync(dossierCours, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(dossierCours, d.name, 'slides.md')))
  .map(d => d.name)
  .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))

rmSync(dist, { recursive: true, force: true })

for (const nom of cours) {
  console.log(`\n=== ${nom} ===`)
  execFileSync('npx', ['slidev', 'build', join(dossierCours, nom, 'slides.md'),
    '--base', `${base}${nom}/`, '--out', join(dist, nom)], { stdio: 'inherit', cwd: racine })
}

const entetes = cours.map(nom => ({ nom, ...lireEntete(join(dossierCours, nom, 'slides.md')) }))
const auteur = entetes.find(e => e.auteur)?.auteur

const cartes = entetes.map(e => `
    <a class="carte" href="./${encodeURIComponent(e.nom)}/">
      <span class="carte__seance">${echapper(e.seance ?? e.nom)}</span>
      <span class="carte__titre">${echapper(e.titre ?? e.nom)}</span>
      ${e.info ? `<span class="carte__info">${echapper(e.info)}</span>` : ''}
    </a>`).join('')

writeFileSync(join(dist, 'index.html'), `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${echapper(TITRE_SITE)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap">
  <style>
    :root { --encre: #1b2733; --accent: #1f4e79; --gris-texte: #5b6670; --filet: #d5dbe0; --fond-bloc: #f1f3f5; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff; color: var(--encre); font: 1.05rem/1.5 'Atkinson Hyperlegible', system-ui, sans-serif; }
    main { max-width: 52rem; margin: 0 auto; padding: 2.5rem 1rem 3rem; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--filet); padding-bottom: 1rem; margin-bottom: 1.8rem; }
    h1 { margin: 0; font-size: 1.9rem; color: var(--accent); }
    header p { margin: 0.2rem 0 0; color: var(--gris-texte); }
    header img { height: 2.6rem; }
    .liste { display: grid; gap: 0.9rem; }
    .carte { display: block; padding: 1rem 1.2rem; border-radius: 4px; background: var(--fond-bloc); border-left: 4px solid var(--accent); color: inherit; text-decoration: none; }
    .carte:hover, .carte:focus-visible { background: #e3e7eb; }
    .carte span { display: block; }
    .carte__seance { font-size: 0.85rem; color: var(--gris-texte); }
    .carte__titre { font-size: 1.25rem; font-weight: 700; color: var(--accent); }
    .carte__info { font-size: 0.92rem; margin-top: 0.2rem; }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>${echapper(TITRE_SITE)}</h1>
        ${auteur ? `<p>${echapper(auteur)}</p>` : ''}
      </div>
      <img src="./logo_um6p.png" alt="UM6P, Université Mohammed VI Polytechnique">
    </header>
    <nav class="liste">${cartes}
    </nav>
  </main>
</body>
</html>
`)
copyFileSync(join(racine, 'commun', 'assets', 'logo_um6p.png'), join(dist, 'logo_um6p.png'))

console.log(`\nPage d'accueil : dist/index.html (${cours.length} cours)`)
