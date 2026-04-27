import data from '../assets/vaccum-ascii.json'
import AsciiScene from './AsciiScene'
import { ROOM } from './palettes'

export default function FloorScene() {
  return <AsciiScene data={data} density={1.1} parallaxPx={8} palette={ROOM} />
}
