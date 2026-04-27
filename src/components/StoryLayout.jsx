import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { GRAPH, ENTRY } from '../story/graph'
import RoomScene from '../scenes/RoomScene'
import audio from '../audio/audio'
import './StoryLayout.css'

// Lazy so the initial bundle stays small (per claude-docs/CLAUDE.md §6),
// but we kick off these imports on mount below to warm the chunk cache —
// by the time the player navigates into them, the chunk is already loaded
// and Suspense never has a chance to flash its fallback.
const TempleScene  = lazy(() => import('../scenes/TempleScene'))
const KitchenScene = lazy(() => import('../scenes/KitchenScene'))
const DoorScene       = lazy(() => import('../scenes/DoorScene'))
const FloorScene      = lazy(() => import('../scenes/FloorScene'))
const SinkScene       = lazy(() => import('../scenes/SinkScene'))
const EatScene        = lazy(() => import('../scenes/EatScene'))
const ClosedDoorScene = lazy(() => import('../scenes/ClosedDoorScene'))
const BurningScene    = lazy(() => import('../scenes/BurningScene'))
const LampScene       = lazy(() => import('../scenes/LampScene'))
const HeavenScene     = lazy(() => import('../scenes/HeavenScene'))

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

// Scenes that ask the page chrome itself to flip to dark. Currently none —
// the burning scene used to live here, but BurningScene.css now paints its
// own full-viewport dark wash, so the chrome can stay white throughout.
// Left as an extension point for any future scene that wants the chrome to
// do the darkening instead.
const DARK_SCENES = new Set()

// Default delay between completing the final task of a checklist and
// auto-advancing to its `next` node. Tasks may override via their own
// `completionDelayMs` — e.g. the "Go to sleep" task uses 0 so the
// burning scene's dark backdrop appears immediately, with the 4s breath
// of stillness handled inside BurningScene itself.
const DEFAULT_TASK_COMPLETE_DELAY_MS = 500

// Sequential fade for scene swaps: the outgoing scene fully fades out, then
// the incoming scene fades in — no overlap. Both phases must match the
// matching keyframe durations in StoryLayout.css. The chrome's background
// transition (also in StoryLayout.css) is sized to the *total* duration so
// its midpoint lines up with the phase boundary, keeping the upper scene
// area and lower bar visually in lockstep.
const SCENE_FADE_OUT_MS = 300
const SCENE_FADE_IN_MS  = 300

const SPEAKER_LABEL = {
  wife:    'Miyagi',
  husband: 'Katsushirō',
}

const ENDING_LABEL = {
  good:       'Good Ending',
  complete:   'Complete Ending',
  incomplete: 'Incomplete Ending',
}

function SceneView({ sceneId }) {
  // Chrome-darkened scenes (currently none) skip rendering a scene element so
  // the chrome's data-dark transition is the single source of darkness — see
  // DARK_SCENES comment above. The burning beat USED to live here, but
  // BurningScene now paints its own full-viewport dark wash, so it falls
  // through to the dispatch table below like any other scene.
  if (DARK_SCENES.has(sceneId)) return null

  if (!sceneId || sceneId === 'reed-house-room') return <RoomScene />

  // Suspense fallbacks are intentionally `null` (transparent) rather than a
  // beige scene-void so a slow chunk load doesn't strobe an alien color
  // through the crossfade. Combined with the mount-time preload above, the
  // fallback should almost never be visible.
  if (sceneId === 'kitchen') return (
    <Suspense fallback={null}>
      <KitchenScene />
    </Suspense>
  )
  if (sceneId === 'temple-scene') return (
    <Suspense fallback={null}>
      <TempleScene />
    </Suspense>
  )
  if (sceneId === 'door') return (
    <Suspense fallback={null}>
      <DoorScene />
    </Suspense>
  )
  if (sceneId === 'floor') return (
    <Suspense fallback={null}>
      <FloorScene />
    </Suspense>
  )
  if (sceneId === 'sink') return (
    <Suspense fallback={null}>
      <SinkScene />
    </Suspense>
  )
  if (sceneId === 'eat') return (
    <Suspense fallback={null}>
      <EatScene />
    </Suspense>
  )
  if (sceneId === 'room-closed') return (
    <Suspense fallback={null}>
      <ClosedDoorScene />
    </Suspense>
  )
  if (sceneId === 'burning-reed-house') return (
    <Suspense fallback={null}>
      <BurningScene />
    </Suspense>
  )
  if (sceneId === 'lamp') return (
    <Suspense fallback={null}>
      <LampScene />
    </Suspense>
  )
  if (sceneId === 'heaven') return (
    <Suspense fallback={null}>
      <HeavenScene />
    </Suspense>
  )
  // Unbuilt light scene placeholder.
  return <div className="scene-void scene-void--light" data-scene={sceneId} />
}

function initLog(node) {
  if (node.type === 'dialogue') return [node.lines[0]]
  if (node.type === 'event')    return [{ speaker: 'stage', text: node.description }]
  return []
}

// Distributes items into two columns by index parity so labels read
// left-to-right, top-to-bottom (A B / C D / E F / G).
// 4 items → left:[A,C], right:[B,D].  3 items → left:[A,C], right:[B].
function splitIntoColumns(items) {
  const left = []
  const right = []
  items.forEach((item, i) => (i % 2 === 0 ? left : right).push({ item, i }))
  return [left, right]
}

function ChoiceGrid({ items, renderOption }) {
  if (items.length <= 1) {
    return (
      <div className="choice-grid choice-grid--single">
        {items.map((item, i) => renderOption(item, i))}
      </div>
    )
  }
  const [left, right] = splitIntoColumns(items)
  return (
    <div className="choice-grid">
      <div className="choice-grid__col">
        {left.map(({ item, i }) => renderOption(item, i))}
      </div>
      <div className="choice-grid__col">
        {right.map(({ item, i }) => renderOption(item, i))}
      </div>
    </div>
  )
}

export default function StoryLayout() {
  const firstNode = GRAPH[ENTRY]

  const [nodeId,           setNodeId]           = useState(ENTRY)
  const [lineIdx,          setLineIdx]          = useState(0)
  const [log,              setLog]              = useState(() => initLog(firstNode))
  const [sceneId,          setSceneId]          = useState(firstNode.sceneId || 'reed-house-room')
  const [previousSceneId,  setPreviousSceneId]  = useState(null)
  const [sceneEpoch,       setSceneEpoch]       = useState(0) // bump on every scene swap to remount + retrigger fade-in
  // 'in'  → fade-in animation running on the active scene (also the initial
  //         state so the very first scene fades up from the white chrome)
  // 'out' → fade-out running on the *previous* scene; new scene not yet mounted
  // 'idle'→ no animation; the active scene is settled at full opacity
  const [phase,            setPhase]            = useState('in')
  const [completedTasks,   setCompletedTasks]   = useState(() => new Set())

  const logRef     = useRef(null)
  const prevIdRef  = useRef(sceneId)
  const node       = GRAPH[nodeId]

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  // Preload lazy scene chunks once on mount. Vite/webpack will resolve these
  // imports in the background while the player reads the opening dialogue,
  // so by the time they hit a checklist's "Cooking" or the temple, the
  // KitchenScene/TempleScene chunk is already in cache — no Suspense flash.
  useEffect(() => {
    import('../scenes/KitchenScene')
    import('../scenes/TempleScene')
    import('../scenes/DoorScene')
    import('../scenes/FloorScene')
    import('../scenes/SinkScene')
    import('../scenes/EatScene')
    import('../scenes/ClosedDoorScene')
    import('../scenes/BurningScene')
    import('../scenes/LampScene')
    import('../scenes/HeavenScene')
  }, [])

  // Sequential fade: when sceneId changes, fade the outgoing scene fully
  // out (phase 'out'), THEN swap and fade the new scene in (phase 'in'),
  // THEN settle to 'idle'. There is intentionally no overlap between the
  // two scenes — at any moment only one is mounted in the scene area.
  useEffect(() => {
    // Audio: route ambience for the new scene every time. Safe to call
    // before the first user gesture — the engine will just record the
    // active sceneId and bring up the layers when it's allowed to.
    audio.setScene(sceneId)

    if (prevIdRef.current === sceneId) return

    // Whoosh only fires on actual scene changes, never on initial mount —
    // the prevIdRef guard above handles that.
    audio.whoosh()

    setPreviousSceneId(prevIdRef.current)
    setSceneEpoch(e => e + 1)
    setPhase('out')
    prevIdRef.current = sceneId
    const tOut = setTimeout(() => {
      setPreviousSceneId(null)
      setPhase('in')
    }, SCENE_FADE_OUT_MS)
    const tIn = setTimeout(() => {
      setPhase('idle')
    }, SCENE_FADE_OUT_MS + SCENE_FADE_IN_MS)
    return () => {
      clearTimeout(tOut)
      clearTimeout(tIn)
    }
  }, [sceneId])

  // Settle the *initial* scene's fade-in (no preceding fade-out on first mount).
  // The functional setter guards against the case where the user navigates
  // before this timer fires — we only collapse to 'idle' if we're still in the
  // initial 'in' phase; if the navigation effect has already advanced us to
  // 'out', leave that state alone.
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(p => (p === 'in' ? 'idle' : p))
    }, SCENE_FADE_IN_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Navigation ──────────────────────────────────────────────────────

  function goTo(nextId) {
    if (!nextId || !GRAPH[nextId]) return
    const next = GRAPH[nextId]

    setNodeId(nextId)
    setLineIdx(0)
    setCompletedTasks(new Set())
    if (next.sceneId) setSceneId(next.sceneId)

    if (next.type === 'dialogue') {
      setLog(prev => [...prev, next.lines[0]])
    } else if (next.type === 'event') {
      setLog(prev => [...prev, { speaker: 'stage', text: next.description }])
    }
  }

  function restart() {
    const first = GRAPH[ENTRY]
    setNodeId(ENTRY)
    setLineIdx(0)
    setSceneId(first.sceneId || 'reed-house-room')
    setCompletedTasks(new Set())
    setLog(initLog(first))
  }

  // ── Handlers ────────────────────────────────────────────────────────

  // The click *sound* is fired from each button's onPointerDown so it lands
  // on press rather than release — see the render helpers below. The
  // handlers themselves stay bound to onClick so click semantics (drag-off
  // cancel, keyboard Enter/Space activation) keep working normally.

  function handleContinue() {
    if (node.type === 'dialogue') {
      if (lineIdx < node.lines.length - 1) {
        const next = lineIdx + 1
        setLineIdx(next)
        setLog(prev => [...prev, node.lines[next]])
      } else {
        goTo(node.next)
      }
    } else if (node.type === 'event' && node.next) {
      goTo(node.next)
    }
  }

  function handleChoice(choice) {
    if (choice.terminal || !choice.next) return
    setLog(prev => [
      ...prev,
      { speaker: 'wife', text: choice.text, isAction: choice.kind === 'action' },
    ])
    goTo(choice.next)
  }

  function handleTask(task) {
    if (node.type !== 'checklist') return
    // Idempotent: re-clicking a done task is a no-op. Also makes the
    // StrictMode double-invoke of state updaters below harmless.
    if (completedTasks.has(task.id)) return

    // Tasks may override the checklist's backdrop (e.g. cooking → kitchen).
    // Other tasks revert to the checklist node's own sceneId.
    setSceneId(task.sceneId ?? node.sceneId ?? 'reed-house-room')

    setCompletedTasks(prev => {
      const next = new Set(prev)
      next.add(task.id)
      return next
    })

    // Auto-advance is scheduled OUTSIDE the setCompletedTasks updater. In
    // dev StrictMode React intentionally invokes every state updater twice
    // to surface impure ones — any setTimeout/goTo nested inside that
    // callback would fire twice, which previously double-logged the
    // burning-house description and double-navigated to E15. Computing
    // willBeComplete from the captured render snapshot and scheduling the
    // timer out here keeps the side effect to exactly one call.
    const willBeComplete = completedTasks.size + 1 === node.tasks.length
    if (willBeComplete) {
      const delay = task.completionDelayMs ?? DEFAULT_TASK_COMPLETE_DELAY_MS
      setTimeout(() => goTo(node.next), delay)
    }
  }

  // ── Derived state ────────────────────────────────────────────────────

  const isTerminal = node && !node.next &&
    node.type !== 'scene' && node.type !== 'checklist'

  const showChoices   = node?.type === 'scene'
  const showChecklist = node?.type === 'checklist'
  const showContinue  = (node?.type === 'dialogue') ||
    (node?.type === 'event' && node?.next)

  // ── Render helpers ───────────────────────────────────────────────────

  const renderChoice = (choice, i) => (
    <button
      key={i}
      className="choice-option"
      onPointerDown={() => audio.click()}
      onClick={() => handleChoice(choice)}
    >
      <span className="choice-badge">{LETTERS[i] ?? String(i + 1)}</span>
      <span className="choice-text">{choice.text}</span>
    </button>
  )

  // A task can declare `requires: 'all-others'` to stay locked until every
  // other task in the same checklist is checked off (used for "Go to sleep",
  // which canonically must come last — see claude-docs/script.md §6).
  function isTaskLocked(task) {
    if (node?.type !== 'checklist') return false
    if (task.requires !== 'all-others') return false
    return node.tasks.some(t => t.id !== task.id && !completedTasks.has(t.id))
  }

  const renderTask = (task, i) => {
    const done   = completedTasks.has(task.id)
    const locked = !done && isTaskLocked(task)
    const inert  = done || locked
    const cls = `choice-option${done ? ' choice-option--done' : ''}${locked ? ' choice-option--locked' : ''}`
    return (
      <button
        key={task.id}
        className={cls}
        onPointerDown={() => !inert && audio.click()}
        onClick={() => !inert && handleTask(task)}
        disabled={inert}
      >
        <span className="choice-badge">
          {done ? '✓' : LETTERS[i] ?? String(i + 1)}
        </span>
        <span className="choice-text">{task.text}</span>
      </button>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div
      className="story-layout"
      data-dark={DARK_SCENES.has(sceneId) ? 'true' : undefined}
    >

      <div className="story-layout__scene">
        {phase === 'out' && previousSceneId ? (
          <div
            key={`scene-out-${sceneEpoch}`}
            className="scene-fade scene-fade--out"
            aria-hidden="true"
          >
            <SceneView sceneId={previousSceneId} />
          </div>
        ) : (
          <div
            key={`scene-in-${sceneEpoch}`}
            className={`scene-fade${phase === 'in' ? ' scene-fade--in' : ''}`}
          >
            <SceneView sceneId={sceneId} />
          </div>
        )}
      </div>

      <div className="story-layout__bar">
        <div className="story-card">

          {/* Script log inside the card */}
          <div className="story-card__script" ref={logRef}>
            {log.map((line, i) => {
              if (line.speaker === 'stage') {
                return (
                  <div key={i} className="script-line script-line--stage">
                    <span className="script-text script-text--stage">{line.text}</span>
                  </div>
                )
              }
              return (
                <div key={i} className={`script-line script-line--${line.speaker}`}>
                  <span className="script-speaker">
                    {SPEAKER_LABEL[line.speaker] ?? line.speaker}:
                  </span>
                  <span className={`script-text${line.isAction ? ' script-text--action' : ''}`}>
                    {line.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Choices inside the card */}
          {showChoices   && <ChoiceGrid items={node.choices} renderOption={renderChoice} />}
          {showChecklist && <ChoiceGrid items={node.tasks}   renderOption={renderTask} />}

          {showContinue && (
            <div className="choice-grid choice-grid--single">
              <button
                className="choice-option choice-option--continue"
                onPointerDown={() => audio.click()}
                onClick={handleContinue}
              >
                <span className="choice-badge choice-badge--arrow">→</span>
                <span className="choice-text">Continue</span>
              </button>
            </div>
          )}

          {isTerminal && (
            <div className="choice-grid choice-grid--single">
              {node.ending && (
                <div className="ending-label">
                  {ENDING_LABEL[node.ending] ?? 'End'}
                </div>
              )}
              <button
                className="choice-option choice-option--continue"
                onPointerDown={() => audio.click()}
                onClick={restart}
              >
                <span className="choice-badge choice-badge--arrow">↺</span>
                <span className="choice-text">Restart</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
