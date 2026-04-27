import data from '../assets/wash-dishes-ascii.json'
import AsciiScene from './AsciiScene'
import { ROOM } from './palettes'

export default function SinkScene() {
  return <AsciiScene data={data} density={1.15} parallaxPx={6} palette={ROOM} />
}
