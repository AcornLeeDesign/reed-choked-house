import data from '../assets/eat-ascii.json'
import AsciiScene from './AsciiScene'
import { ROOM } from './palettes'

export default function EatScene() {
  return <AsciiScene data={data} density={1.1} parallaxPx={6} palette={ROOM} />
}
