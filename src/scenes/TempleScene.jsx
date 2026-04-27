import data from '../assets/temple-ascii.json'
import AsciiScene from './AsciiScene'
import { TEMPLE } from './palettes'

export default function TempleScene() {
  return <AsciiScene data={data} density={1.1} parallaxPx={10} palette={TEMPLE} />
}
