import data from '../assets/kitchen-stove-ascii.json'
import AsciiScene from './AsciiScene'
import { ROOM } from './palettes'

export default function KitchenScene() {
  return <AsciiScene data={data} density={1.1} parallaxPx={8} palette={ROOM} />
}
