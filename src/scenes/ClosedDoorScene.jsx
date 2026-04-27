import data from '../assets/room-closedoor-ascii.json'
import AsciiScene from './AsciiScene'
import { ROOM } from './palettes'

export default function ClosedDoorScene() {
  return <AsciiScene data={data} density={1.1} parallaxPx={6} palette={ROOM} />
}
