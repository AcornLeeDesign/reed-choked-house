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
        // Slower, sparser char-alternation so the cloud floor feels like it's
        // drifting rather than shimmering — this is the ascension beat, the
        // last image before pure luminance.
        swapRate={0.002}
        tickMs={260}
        palette={HEAVEN}
      />
    </div>
  )
}
