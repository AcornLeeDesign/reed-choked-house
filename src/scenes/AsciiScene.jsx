import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './AsciiScene.css'

// Within-tier alternates so swaps never noticeably brighten/darken a cell.
const ALTS = {
  '.': [':'],
  ':': ['.', '+'],
  '+': ['*', ':'],
  '*': ['+', '#'],
  '#': ['/', '*'],
  '/': ['#'],
}

// Reference grid width that the default coverPad was tuned against. Larger
// images (more cols) need a proportionally larger pad so per-char physical
// size stays constant across scenes.
const BASE_COLS = 220
const BASE_COVER_PAD = 0.46

const DEFAULT_PALETTE = {
  light: '#b8b8b8',
  mid: '#707070',
  shadow: '#333333',
  dark: '#050505',
}

export default function AsciiScene({
  data,
  parallaxPx = 28,
  swapRate = 0.004,
  tickMs = 180,
  density = 1, // multiplier on the auto-computed coverPad — >1 zooms in
  coverPad, // explicit override; if omitted, scales with cols
  palette = DEFAULT_PALETTE,
}) {
  const { cols, rows, lines } = data

  const baseChars = useMemo(() => lines.join('\n'), [lines])
  const flat = useMemo(() => {
    const idx = []
    for (let i = 0; i < baseChars.length; i++) {
      const c = baseChars[i]
      if (c !== '\n' && c !== ' ' && ALTS[c]) idx.push(i)
    }
    return idx
  }, [baseChars])

  // Static per-cell tier mask: 0=newline, 1=space, 2=light, 3=mid, 4=shadow, 5=dark.
  const tierMask = useMemo(() => {
    const m = new Uint8Array(baseChars.length)
    for (let i = 0; i < baseChars.length; i++) {
      const c = baseChars[i]
      if (c === '\n') m[i] = 0
      else if (c === ' ') m[i] = 1
      else if (c === '.' || c === ':') m[i] = 2
      else if (c === '+') m[i] = 3
      else if (c === '*') m[i] = 4
      else m[i] = 5
    }
    return m
  }, [baseChars])

  const [frame, setFrame] = useState(baseChars)

  // Subtle char-alternation animation.
  useEffect(() => {
    const swapsPerTick = Math.max(4, Math.floor(flat.length * swapRate))
    const buf = baseChars.split('')
    const dirty = []
    let raf = 0
    let last = 0

    const tick = (t) => {
      if (t - last >= tickMs) {
        last = t
        for (const i of dirty) buf[i] = baseChars[i]
        dirty.length = 0
        for (let n = 0; n < swapsPerTick; n++) {
          const i = flat[(Math.random() * flat.length) | 0]
          const alts = ALTS[baseChars[i]]
          buf[i] = alts[(Math.random() * alts.length) | 0]
          dirty.push(i)
        }
        setFrame(buf.join(''))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [baseChars, flat, swapRate, tickMs])

  const wrapRef = useRef(null)
  const lightRef = useRef(null)
  const midRef = useRef(null)
  const shadowRef = useRef(null)
  const darkRef = useRef(null)

  // Effective cover pad: explicit override > auto-scaled-by-cols × density.
  const effectiveCoverPad = useMemo(() => {
    if (coverPad != null) return coverPad
    return (cols / BASE_COLS) * BASE_COVER_PAD * density
  }, [coverPad, cols, density])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const probe = darkRef.current
    if (!wrap || !probe) return

    const fit = () => {
      const probeSize = 100
      probe.style.fontSize = `${probeSize}px`
      const { width: pw, height: ph } = probe.getBoundingClientRect()
      const charW = pw / cols
      const charH = ph / rows
      const vw = wrap.clientWidth
      const vh = wrap.clientHeight
      const scale = Math.max(vw / (cols * charW), vh / (rows * charH)) * effectiveCoverPad
      const px = `${probeSize * scale}px`
      for (const r of [lightRef, midRef, shadowRef, darkRef]) {
        if (r.current) r.current.style.fontSize = px
      }
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [cols, rows, effectiveCoverPad])

  // Mouse parallax via CSS vars.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      wrap.style.setProperty('--mx', String(-nx))
      wrap.style.setProperty('--my', String(-ny))
    }
    const onLeave = () => {
      wrap.style.setProperty('--mx', '0')
      wrap.style.setProperty('--my', '0')
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const { light, mid, shadow, dark } = useMemo(() => {
    const len = frame.length
    const L = new Array(len)
    const M = new Array(len)
    const S = new Array(len)
    const D = new Array(len)
    for (let i = 0; i < len; i++) {
      const t = tierMask[i]
      const c = frame[i]
      if (t === 0) L[i] = M[i] = S[i] = D[i] = '\n'
      else if (t === 2) { L[i] = c; M[i] = ' '; S[i] = ' '; D[i] = ' ' }
      else if (t === 3) { L[i] = ' '; M[i] = c; S[i] = ' '; D[i] = ' ' }
      else if (t === 4) { L[i] = ' '; M[i] = ' '; S[i] = c; D[i] = ' ' }
      else if (t === 5) { L[i] = ' '; M[i] = ' '; S[i] = ' '; D[i] = c }
      else { L[i] = M[i] = S[i] = D[i] = ' ' }
    }
    return { light: L.join(''), mid: M.join(''), shadow: S.join(''), dark: D.join('') }
  }, [frame, tierMask])

  return (
    <div
      ref={wrapRef}
      className="ascii-scene"
      style={{ '--parallax': `${parallaxPx}px` }}
    >
      <pre ref={lightRef} className="ascii-scene__pre" style={{ color: palette.light }} aria-hidden="true">{light}</pre>
      <pre ref={midRef} className="ascii-scene__pre" style={{ color: palette.mid }} aria-hidden="true">{mid}</pre>
      <pre ref={shadowRef} className="ascii-scene__pre" style={{ color: palette.shadow }} aria-hidden="true">{shadow}</pre>
      <pre ref={darkRef} className="ascii-scene__pre" style={{ color: palette.dark }} aria-hidden="true">{dark}</pre>
    </div>
  )
}
