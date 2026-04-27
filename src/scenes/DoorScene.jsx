import data from '../assets/look-outside-ascii.json'
import AsciiScene from './AsciiScene'
import { LOOK_OUTSIDE } from './palettes'

export default function DoorScene() {
  return <AsciiScene data={data} density={1.1} parallaxPx={10} palette={LOOK_OUTSIDE} />
}
