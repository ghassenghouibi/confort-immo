/**
 * ============================================================
 *  VIDÉOS & RÉSEAUX SOCIAUX — C'EST ICI QUE VOUS AJOUTEZ VOS CONTENUS
 * ============================================================
 *
 *  1. Ouvrez le reel sur Instagram (ou TikTok / YouTube), copiez le lien
 *     de partage, ex :
 *        https://www.instagram.com/reel/C8xYz123abc/
 *        https://www.tiktok.com/@confort.immo0/video/7351234567890123456
 *        https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *
 *  2. Ajoutez une entrée dans VIDEOS ci-dessous avec ce lien dans `url`.
 *     Le site détecte automatiquement la plateforme et affiche le lecteur
 *     intégré au clic sur la vignette.
 *
 *  3. (Optionnel) `ref` = référence du bien (ex. "CI5846") : la vidéo
 *     apparaît alors aussi sur la fiche du bien et le bien reçoit le badge
 *     "Vidéo" dans les listes.
 *
 *  4. (Optionnel) `cover` = URL d'une image de couverture. Sans cover, le
 *     site utilise la 1ère photo du bien lié, sinon un fond dégradé.
 *
 *  Les vidéos sont affichées dans l'ordre de ce tableau (la première en
 *  premier). Les 4 premières apparaissent sur la page d'accueil.
 */

export interface VideoItem {
  /** Lien Instagram reel / post, TikTok, YouTube, ou fichier .mp4 direct */
  url: string
  /** Titre affiché sous la vignette */
  title: string
  /** Sous-titre (quartier · référence, ou "Décryptage quartier") */
  subtitle?: string
  /** Référence du bien lié (facultatif) */
  ref?: string
  /** Image de couverture (facultatif) */
  cover?: string
  /** Nombre de vues à afficher, ex. "120 K" (facultatif) */
  views?: string
  /** Format : visite | quartier | coulisses | bien-du-jour (facultatif) */
  format?: 'visite' | 'quartier' | 'coulisses' | 'bien-du-jour'
}

export const VIDEOS: VideoItem[] = [
  // Ajoutez ici les reels du compte @confortimmo, ex :
  // { url: 'https://www.instagram.com/reel/XXXXXXXXXXX/', title: 'Penthouse S+3 aux Berges du Lac 2', subtitle: 'Berges du Lac · CI5846', ref: 'CI5846' },
]

/**
 * Derniers posts Instagram (grille "Les derniers posts" de la page Studio).
 * Collez simplement les liens des posts / reels. Le libellé est facultatif.
 */
export interface PostItem {
  url: string
  label?: string
  cover?: string
}

export const INSTAGRAM_POSTS: PostItem[] = [
  // { url: 'https://www.instagram.com/p/XXXXXXXXXXX/', label: 'Villa avec piscine · Gammarth' },
]

/**
 * Comptes et audiences affichés dans les cartes réseaux.
 * Mettez à jour `followers` quand vous voulez (texte libre).
 */
export const SOCIAL = {
  instagram: { handle: '@confortimmo', url: 'https://www.instagram.com/confortimmo/', followers: 'Suivre' },
  tiktok: { handle: '@confort.immo0', url: 'https://www.tiktok.com/@confort.immo0', followers: 'Suivre' },
  facebook: { handle: 'Confort Immo', url: 'https://www.facebook.com/profile.php?id=100063650349361', followers: 'Suivre' },
}
