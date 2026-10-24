# Confort Immo — site web (React)

Front React (Vite + TypeScript + React Router) pour l'agence Confort Immo (Charguia 1, Tunis), alimenté par les 75 biens de `confort_immo_biens.json` (export de confort.immo).

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sortie dans dist/
npm run preview  # prévisualiser le build
```

## Pages

| Route | Contenu |
| --- | --- |
| `/` | Accueil : hero, recherche, chiffres, coups de cœur, locations, quartiers, section vidéo/Instagram, agences |
| `/acheter`, `/louer`, `/bureaux-et-commerces` | Listes filtrables (zone, type, budget, pièces, surface, "avec vidéo"), tri, pagination, carte, alerte |
| `/bien/:id` | Fiche du bien : galerie + lightbox, chiffres clés, description, prestations, détail, visite vidéo, adresse, formulaire, biens similaires |
| `/videos` | Réseaux sociaux : vidéos Instagram / TikTok (s'affichent dès qu'il y en a dans `videos.ts`) |
| `/agences`, `/contact`, `/deposer`, `/conseils`, `/favoris` | Pages secondaires |

## 🎬 Ajouter les vidéos Instagram de l'agence (@confortimmo)

Tout se passe dans **`src/data/videos.ts`** :

```ts
export const VIDEOS: VideoItem[] = [
  {
    url: 'https://www.instagram.com/reel/C8xYz123abc/',   // ← lien de partage du reel
    title: 'Visite : villa à Gammarth Marina',
    subtitle: 'Gammarth · CI5867',
    ref: 'CI5867',        // (optionnel) lie la vidéo à la fiche du bien
    views: '120 K',         // (optionnel)
  },
]
```

- Liens acceptés : reels et posts Instagram, TikTok, YouTube (watch / shorts), fichier `.mp4`.
- Le lecteur intégré s'ouvre au clic sur la vignette (embed officiel de chaque plateforme, aucun token nécessaire).
- Avec `ref`, la vidéo apparaît aussi sur la fiche du bien (bloc « Visite vidéo » + « La visite en vidéo ») et le bien reçoit le badge **Vidéo** dans les listes et le filtre « Avec vidéo ».
- `INSTAGRAM_POSTS` alimente la grille « Les derniers posts » de la page `/videos`.
- `SOCIAL` contient les comptes et le nombre d'abonnés affichés.

Tant qu'une URL contient `REMPLACER`, la vignette s'affiche avec un message « Vidéo à renseigner » au lieu du lecteur.

## 🎨 Logo & charte

- Logo source : `logo.png` (racine). `python3 scripts/build-logo.py` génère `src/assets/logo.png` (fond transparent), `src/assets/logo-light.png` (« CONFORT » et cadre en blanc, pour le hero et le pied de page) et `public/favicon.png` (pictogramme).
- Couleurs du logo dans `src/index.css` : bleu marine `--blue #153959` (fonds sombres `--navy #0f2a44`) et framboise `--berry #a02957` (boutons d'action, badges, soulignés ; `--berry-light` sur fond sombre). Titres en Montserrat (proche du lettrage du logo), texte en Inter.

## 🏠 Page d'accueil : hero & animations

- Le diaporama du hero (`SLIDES` dans `src/pages/Home.tsx`) utilise 4 photos libres de droits (Unsplash) dans `src/assets/hero/`. Remplacez-les par vos propres photos (≈1600 px de large, JPEG) et adaptez les légendes.
- Animations : Ken Burns + fondu entre les slides, entrée en scène du texte, carte "coup de cœur" flottante, compteurs animés, bandeau de quartiers défilant, apparition au scroll (`.reveal` / `.reveal-stagger`, hook `useRevealAll`). Le tout est désactivé si l'utilisateur a activé « réduire les animations ».
- L'en-tête est transparent sur le hero et devient blanc dès qu'on scrolle (`<Header overlay />`).

## Données

- `confort_immo_biens.json` : export brut de confort.immo (ventes + locations).
- `python3 scripts/import-confort.py` le convertit en `src/data/annonces.json` (format du site) : catégorie déduite du titre et du type, localisation recoupée entre étiquette, titre et adresse, « 1 DT » traité comme « prix sur demande », référence `CI` + id. À relancer après chaque nouvel export, puis `python3 scripts/build-proximite.py` pour les nouvelles localités.
- `src/lib/listings.ts` : normalisation (titres, prestations détectées), secteurs (`ZONES`), filtres.
- `src/data/agences.ts` : coordonnées de l'agence (41, rue de l'Industrie, Charguia 1 · +216 25 354 558 · contact@confort.immo).

Les photos sont chargées depuis `confort.immo` ; en cas d'image indisponible, un fond dégradé s'affiche à la place.

## Points à brancher plus tard

- Formulaires (contact, estimation, alerte, demande sur un bien) : actuellement un simple message de confirmation côté client — à relier à un back-end / e-mail.
- Carte : illustration décorative (les annonces n'ont pas de coordonnées GPS). Un lien « Ouvrir dans Google Maps » utilise l'adresse.
- Favoris : stockés dans `localStorage` du navigateur.
