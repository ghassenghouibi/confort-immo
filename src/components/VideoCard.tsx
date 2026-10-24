import { useState } from 'react'
import Photo from './Photo'
import { PlayFilled } from './Icons'
import type { VideoItem } from '../data/videos'
import { coverOf } from '../lib/videos'
import { VideoModal } from './VideoPlayer'
import './Video.css'

/**
 * Vignette verticale (reel) façon maquette : fond sombre, bouton play,
 * badge de vues, titre + sous-titre. Ouvre le lecteur intégré au clic.
 */
export default function VideoCard({ video, size = 'md' }: { video: VideoItem; size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false)
  const cover = coverOf(video)
  return (
    <>
      <button className={`vc vc-${size}`} onClick={() => setOpen(true)} aria-label={`Lire : ${video.title}`}>
        <Photo src={cover} tone="ph-dark" className="vc-media">
          <span className="vc-shade" />
          {video.views && <span className="vc-views">{video.views} vues</span>}
          <span className="vc-play"><PlayFilled size={22} /></span>
          <span className="vc-text">
            <span className="vc-title">{video.title}</span>
            {video.subtitle && <span className="vc-sub">{video.subtitle}</span>}
          </span>
        </Photo>
      </button>
      {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
    </>
  )
}
