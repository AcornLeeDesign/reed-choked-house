import data from '../assets/lamp-ascii.json'
import AsciiScene from './AsciiScene'
import { ROOM } from './palettes'

export default function LampScene() {
  return <AsciiScene data={data} density={1.05} parallaxPx={5} palette={ROOM} />
}
