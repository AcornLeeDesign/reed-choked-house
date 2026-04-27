// Sample public/<name>.<png|jpg|jpeg|webp> into an ASCII grid and write
// src/assets/<name>-ascii.json. Run via:
//   bun run ascii <name> [--cols=N] [--gamma=N]
// Characters ordered light → dark; cell aspect compensates for character height.
import sharp from 'sharp'
import { writeFile, mkdir, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// CLI parsing: first positional = image basename (default 'room'), flags --cols/--gamma.
const argv = process.argv.slice(2)
const flags = {}
const positionals = []
for (const a of argv) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=')
    flags[k] = v
  } else positionals.push(a)
}
const NAME = positionals[0] || 'room'

const RAMP = ' .:+*#/'
const COLS = Number(flags.cols ?? 264)
const CELL_ASPECT = 0.5 // chars are ~2x taller than wide
const GAMMA = Number(flags.gamma ?? 1.2)

const EXT_CANDIDATES = ['png', 'jpg', 'jpeg', 'webp']

async function findSource(name) {
  for (const ext of EXT_CANDIDATES) {
    const p = resolve(__dirname, `../public/${name}.${ext}`)
    try { await access(p); return p } catch { /* try next */ }
  }
  throw new Error(
    `no public/${name}.{${EXT_CANDIDATES.join(',')}} found`,
  )
}

async function main() {
  const SRC = await findSource(NAME)
  const OUT = resolve(__dirname, `../src/assets/${NAME}-ascii.json`)

  const meta = await sharp(SRC).metadata()
  const aspect = meta.height / meta.width
  const rows = Math.round(COLS * aspect * CELL_ASPECT)

  const { data, info } = await sharp(SRC)
    .resize(COLS, rows, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const lines = []
  for (let y = 0; y < info.height; y++) {
    let line = ''
    for (let x = 0; x < info.width; x++) {
      const lum = data[y * info.width + x] / 255 // 0 dark → 1 light
      const adj = Math.pow(lum, 1 / GAMMA)
      const idx = Math.min(
        RAMP.length - 1,
        Math.floor((1 - adj) * RAMP.length),
      )
      line += RAMP[idx]
    }
    lines.push(line)
  }

  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(
    OUT,
    JSON.stringify({ cols: info.width, rows: info.height, lines }, null, 0),
  )
  console.log(`wrote ${info.width}×${info.height} → ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
