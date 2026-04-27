import { useEffect, useState } from 'react'
import data from '../assets/smoke-ascii.json'
import AsciiScene from './AsciiScene'
import { FIRE } from './palettes'
import './BurningScene.css'

// The dark backdrop paints from t=0 (so the 2s post-sleep "buffer" reads as
// pure darkness instead of lingering on the bed scene), and the smoke +
// soot grain reveal themselves only after this delay. Matches the 2000ms
// pause the sleep checklist used to hold on the room scene before the
// fire cut — we've moved that breath of stillness here so it lands on
// black, not on the sleeping mat.
const SMOKE_REVEAL_DELAY_MS = 2000

export default function BurningScene() {
  const [smokeVisible, setSmokeVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSmokeVisible(true), SMOKE_REVEAL_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const smokeCls = `burning-scene__smoke${smokeVisible ? ' burning-scene__smoke--visible' : ''}`

  return (
    <div className="burning-scene">
      <div className="burning-scene__bg" aria-hidden="true" />
      <div className={smokeCls}>
        <AsciiScene
          data={data}
          density={1.575}
          parallaxPx={6}
          // ~25× the default 0.004 swap rate, with a faster 100ms tick —
          // visibly agitated character churn so the smoke reads as live fire,
          // not the near-still drift of the calm room scenes. Matches the
          // upper-bound swap rate that HeavenScene also uses (see CLAUDE.md §4).
          swapRate={0.1}
          tickMs={100}
          palette={FIRE}
        />
        <div className="burning-scene__noise" aria-hidden="true" />
      </div>
    </div>
  )
}
