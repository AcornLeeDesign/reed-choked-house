import data from '../assets/heaven-ascii.json'
import AsciiScene from './AsciiScene'
import { HEAVEN } from './palettes'
import './HeavenScene.css'

export default function HeavenScene() {
  return (
    <div className="heaven-scene">
      <AsciiScene
        data={data}
        density={1.85}
        parallaxPx={6}
        // Same upper-bound swapRate as BurningScene (see CLAUDE.md §4) but a
        // slower 140ms tick so the cloud floor feels like it's drifting
        // rather than shimmering — this is the ascension beat, the last
        // image before pure luminance.
        swapRate={0.1}
        tickMs={140}
        palette={HEAVEN}
      />
    </div>
  )
}
