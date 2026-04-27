import data from '../assets/room-ascii.json'
import AsciiScene from './AsciiScene'
import { ROOM } from './palettes'

export default function RoomScene() {
  return <AsciiScene data={data} density={1.2} parallaxPx={8} palette={ROOM} />
}
