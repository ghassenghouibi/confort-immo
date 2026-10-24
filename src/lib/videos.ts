import { VIDEOS, type VideoItem } from '../data/videos'
import { byRef, type Listing } from './listings'

/** Références (minuscules) des biens qui ont au moins une vidéo */
export const VIDEO_REFS = new Set(VIDEOS.filter((v) => v.ref).map((v) => v.ref!.toLowerCase()))

export const hasVideo = (l: Listing) => VIDEO_REFS.has(l.reference.toLowerCase())

export const videosFor = (l: Listing): VideoItem[] =>
  VIDEOS.filter((v) => v.ref && v.ref.toLowerCase() === l.reference.toLowerCase())

/** Bien lié à une vidéo, si la référence existe dans les annonces */
export const listingOf = (v: VideoItem): Listing | undefined => (v.ref ? byRef(v.ref) : undefined)

/** Image de couverture : cover explicite > 1ère photo du bien lié > rien */
export const coverOf = (v: VideoItem): string | undefined => v.cover ?? listingOf(v)?.photos[0]
