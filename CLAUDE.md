# CLAUDE.md — Reed-Choked House (Interactive Roleplay)

This file is the working brief for Claude on this project. Read it before making any non-trivial change so the work stays on-concept.

## 1. What this project is

An interactive, first-person, browser-based roleplay experience reimagining **"The Reed-Choked House" (浅茅が宿 / *Asaji ga Yado*)** from Ueda Akinari's *Ugetsu Monogatari* (1776). Built for an EALC course context (EALC_110).

**Twist on the source:** the user inhabits the *ghost's* perspective — i.e. Miyagi, the wife who waited and died waiting — rather than the returning husband Katsushirō. The setting is **shifted to a more modern era** (closer to ours; not strictly contemporary, but not Sengoku-era feudal Japan either). Choose visuals/props consistent with that semi-modern reframing rather than period-accurate 16th-century ones.

**Branching:** the user navigates the story through dialogue/choice options that teleport them between scenes. Outcomes can diverge from the canonical ending — alternate endings are explicitly allowed — **but**:

- The core themes of the source must remain present: longing, fidelity / waiting, the porous boundary between the living and the dead, the cost of separation, time's erosion.
- Divergent endings must be defensible as something Akinari himself could have written — i.e. honor the author's moral and aesthetic logic (yūgen, mono no aware, ghostly justice). No happy-ending sugar that betrays the source.

When in doubt about whether a story branch fits, prefer the more melancholic / spectral / thematically-loaded option.

## 2. Source-story cheat sheet

Brief so future-Claude doesn't have to re-derive it:

- Katsushirō, a husband in rural Japan, leaves his wife Miyagi to seek wealth in the capital, promising to return by autumn.
- War, illness, and brigandage strand him for years. Miyagi waits, refusing to flee or remarry.
- He finally returns home. The house is overgrown but standing; Miyagi greets him; they spend the night together.
- He wakes to find the house a ruin and Miyagi long dead. A grave marker and a final poem reveal she died years ago and her ghost waited only to see him once more.

The user, as the ghost, lives the *waiting* — the house, the reeds, the seasons, the absence — and the choices they make shape whether the husband ever returns, in what state, and what they (the ghost) become.

## 3. Tech stack

- **Build/runtime:** Vite + React 19 (already scaffolded — see `package.json`).
- **Package manager:** **bun** (see `bun.lock`). Use `bun add` / `bun install`, not npm/pnpm.
- **Linting:** ESLint flat config (`eslint.config.js`).
- **Language:** JavaScript (`.jsx`), not TypeScript. Don't migrate to TS unless the user asks.

`App.jsx` is load-bearing — it mounts `<StoryLayout />`, which is the top-level shell that drives the story graph and renders the active scene plus the dialogue/choice card.

The runtime is plain React + DOM. An earlier phase of this project used Three.js / @react-three/fiber / @react-three/drei; those deps have been removed and the 3D approach is retired (see house rule §9). Don't reintroduce them.

## 4. ASCII scenes (image → typographic scene)

There is no 3D anywhere in this project. **Every** visual scene is a still-image rendered as live ASCII typography. The chrome stays on a white page; ASCII layers paint into it. Each scene reads as a faded memory or a half-recalled photograph.

**The pipeline:** drop an image into `public/`, generate an ASCII grid at build-time, render it through the reusable `<AsciiScene>` component.

**One-shot workflow when the user says "turn `<name>.png` into a scene":**

1. Confirm `public/<name>.<png|jpg|jpeg|webp>` exists.
2. Generate the ASCII grid:
   ```sh
   bun run ascii <name>
   ```
   Writes `src/assets/<name>-ascii.json`. Optional flags: `--cols=N` (grid width, default 264) and `--gamma=N` (default 1.2 — `<1` darker, `>1` brighter).
3. Create a thin scene wrapper at `src/scenes/<Name>Scene.jsx`. Pick a palette from `src/scenes/palettes.js` (or add one there):
   ```jsx
   import data from '../assets/<name>-ascii.json'
   import AsciiScene from './AsciiScene'
   import { ROOM } from './palettes'
   export default function <Name>Scene() {
     return <AsciiScene data={data} density={1.1} parallaxPx={8} palette={ROOM} />
   }
   ```
4. Wire it into the `SceneView` dispatch inside `src/components/StoryLayout.jsx` so the right scene mounts when a node's `sceneId` is active. Add a corresponding lazy `import()` and a matching warm-up call in the mount-time preload `useEffect` (see §5).
5. If a `claude-docs/script.md` Scene Library row corresponds to your new wrapper, keep them in sync — and pick the same `sceneId` string the graph uses (see §5 on the script.md ↔ graph.js id divergence).

**`AsciiScene` props (all optional except `data`):**
- `data` — the ASCII JSON ({ cols, rows, lines }).
- `parallaxPx` — max mouse-parallax translate in px (default `28`).
- `swapRate` / `tickMs` — character-alternation animation density and cadence (defaults `0.004` / `180`).
- `density` — multiplier on the auto-computed cover pad. `>1` zooms in, `<1` shrinks. Default `1`. In practice every built scene runs `1.05–1.85`.
- `coverPad` — explicit override of the cover-pad calc. Usually leave unset; it auto-scales with `cols` (see `BASE_COLS` / `BASE_COVER_PAD` constants).
- `palette` — `{ light, mid, shadow, dark }` hex colors. Default is a muted gray→black ramp; prefer importing a named palette from `palettes.js`.

**Key constants and where they live:**
- Ramp `' .:+*#/'` and gamma — `scripts/imageToAscii.js`. Must stay in sync with the tier mask in `AsciiScene.jsx` if you ever change the ramp (the mask buckets `.`/`:` → light, `+` → mid, `*` → shadow, `#`/`/` → dark).
- Per-scene tone — pass a `palette` prop to `<AsciiScene>`. Named ramps live in `src/scenes/palettes.js`: `ROOM` (warm interior), `LOOK_OUTSIDE` (sage-yellow centre, dark shutters around it), `FIRE` (ember/crimson), `TEMPLE` (dawn gold), `HEAVEN` (cream → slate-blue, deliberately not true black).
- Per-scene zoom — `density` prop.

**Aesthetic rules for ASCII scenes:**
- White background, four tonal layers (light → mid → shadow → dark). Don't add a fifth tier; the renderer only buckets into four.
- The subtle char-alternation animation is the only motion besides parallax — keep most scenes sparse so it reads as *almost still*. Two scenes deliberately push the churn way up to read as agitated rather than calm: `BurningScene` and `HeavenScene` both run `swapRate={0.1}` (~25× the default `0.004`) with shortened `tickMs` (100ms for fire, 140ms for heaven). Treat `0.1` as the upper bound — anything past that just reads as visual noise.
- Source images should be moody, low-contrast, semi-modern interiors/landscapes (per §1's reframing). Tune `--gamma` per image if a particular photo is washed out or muddy.
- Note `AsciiScene.css` paints **no** background — it's transparent. The chrome (`.story-layout`) owns the page background. Don't add a fill on the scene element or you'll desync the upper-and-lower-half cross-fade.

## 5. Scene & branching architecture (current state)

> **Canonical story spec → [`claude-docs/script.md`](claude-docs/script.md)**
> That file is the authoritative narrative source: all 24 nodes (scenes, dialogues, events, checklists), the Scene Library defining every visual environment, the Scene Reference Map (tone/state per node), the full adjacency list, and Build Instructions. **Read it before touching narrative logic.** When you change a story branch in code, update `script.md` to match — they must stay in sync.

**Files that exist today:**

- `src/story/graph.js` — the runtime story graph derived from `script.md`. Exports `ENTRY` (currently `'D5'`) and `GRAPH` (a record keyed by node id). Every node has a `type` of `dialogue | event | scene | checklist`, plus type-specific fields:
  - `dialogue` → `lines: [{ speaker: 'wife' | 'husband', text }]`, `next`
  - `event`    → `description`, `next`, optional `ending: 'good' | 'complete' | 'incomplete'`
  - `scene`    → `choices: [{ kind: 'dialogue' | 'action', text, next }]`
  - `checklist`→ `tasks: [{ id, text, description, sceneId?, requires?, completionDelayMs? }]`, `next` (unlocks when all tasks complete)
  - Optional `sceneId` on any node tells the shell which visual environment to mount.
- `src/components/StoryLayout.jsx` (+ `.css`) — the top-level shell. Holds story state, mounts the active scene in the upper region, and renders a floating bottom card containing the scrolling **script log** (running dialogue/stage directions) and the **choice grid** (or checklist, continue, restart). Choice options are auto-labelled `A B C D…` and laid out in a 2-column grid that alternates by index parity (col 0 = A, C, E, G; col 1 = B, D, F) so they read top-to-bottom, left-to-right. `SceneView` inside this file is the dispatch table mapping `sceneId → scene component`.
- `src/scenes/AsciiScene.jsx` (+ `.css`) — the reusable ASCII renderer. **Note:** it uses `position: absolute; inset: 0` so it fills its parent, not the viewport. Don't change it to `position: fixed` (the two scenes that need viewport-fill, Burning and Heaven, do their own escaping — see below).
- `src/scenes/palettes.js` — named 4-tier color ramps consumed by every scene wrapper. Add new ramps here rather than inlining.
- `src/audio/audio.js` (+ `click.mp3`, `pure-elegance-…mp3`) — the singleton Web Audio engine. `StoryLayout.jsx` calls `audio.setScene(sceneId)` and `audio.whoosh()` from the scene-change `useEffect`, and every button fires `audio.click()` on `onPointerDown`. See §6 for the full breakdown.

**Built scene wrappers** (each ~5 lines around `<AsciiScene>`; all live in `src/scenes/`):

| `sceneId` | Component | ASCII asset | Palette | Used by |
|---|---|---|---|---|
| `reed-house-room` (default) | `RoomScene` | `room-ascii.json` | `ROOM` | S1, S8, S11, E13, S16, S18, both checklist hubs |
| `room-closed` | `ClosedDoorScene` | `room-closedoor-ascii.json` | `ROOM` | E7, E14 (door-closed beats) |
| `door` | `DoorScene` | `look-outside-ascii.json` | `LOOK_OUTSIDE` | C4/C24 "open the door" task |
| `floor` | `FloorScene` | `vaccum-ascii.json` | `ROOM` | C4/C24 "sweep" task |
| `kitchen` | `KitchenScene` | `kitchen-stove-ascii.json` | `ROOM` | C4/C24 "cooking" task |
| `eat` | `EatScene` | `eat-ascii.json` | `ROOM` | C4/C24 "eat" task |
| `sink` | `SinkScene` | `wash-dishes-ascii.json` | `ROOM` | C4/C24 "wash dishes" task |
| `lamp` | `LampScene` | `lamp-ascii.json` | `ROOM` | C4/C24 "light the lamp" task |
| `burning-reed-house` | `BurningScene` | `smoke-ascii.json` + dark wash + SVG soot grain | `FIRE` | E15, E23 |
| `temple-scene` | `TempleScene` | `temple-ascii.json` | `TEMPLE` | E20, E21, C22, E25 |
| `heaven` | `HeavenScene` | `heaven-ascii.json` | `HEAVEN` | E26 (complete ending) |

The "go to sleep" checklist task is intentionally left without its own `sceneId`, so it stays on the `reed-house-room` hub backdrop while the player completes it; it then transitions straight to the burning scene with `completionDelayMs: 0`. The bed scene from `script.md`'s Scene Library is therefore deliberately not built.

**Scene-id divergence between `script.md` and `graph.js` (important):**

The Scene Library in `script.md` uses verbose ids (`reed-house-door-interior`, `reed-house-kitchen-stove`, `reed-house-bed`, …). `graph.js` and `SceneView` use shortened ids (`door`, `kitchen`, no bed, …). The mapping is:

```
reed-house-door-interior  → door
reed-house-floor          → floor
reed-house-kitchen-stove  → kitchen
reed-house-kitchen-table  → eat
reed-house-kitchen-sink   → sink
reed-house-door-exterior  → lamp
reed-house-bed            → (none — falls through to reed-house-room)
```

When editing narrative logic, **the code is the source of truth for ids**. Don't introduce the long `reed-house-*` ids into `graph.js` or `SceneView` — fix `script.md` instead, or just leave the prose long-form in `script.md` and keep code on the short ids.

**`SceneView` and the `DARK_SCENES` extension point:** `SceneView` returns `null` for any sceneId in the `DARK_SCENES` set, on the assumption that the chrome's `data-dark` background is doing all the visual work. The set is currently **empty** — `BurningScene` paints its own viewport-filling dark wash internally, so it falls through to the dispatch table like any other scene. Keep `DARK_SCENES` as an extension point for future "the chrome itself goes black" scenes; don't put `burning-reed-house` back in it without first removing the in-component dark layer.

**Scenes that escape the scene container (`position: fixed`):**

`BurningScene` and `HeavenScene` set `position: fixed; inset: 0` so the smoke / cloud-floor ASCII fills the entire viewport instead of being clipped to the upper region above the script card. This is intentional — they're the most cinematic beats. The floating script card stays on top because `.story-layout__bar` has `z-index: 2`. If you add another fullscreen scene, follow the same pattern (mirror `BurningScene.css` / `HeavenScene.css`).

**Sequential cross-fade choreography:**

Scene swaps are sequential, not crossfaded. On `sceneId` change, `StoryLayout` runs the previous scene through a `phase: 'out'` (300ms fade 1→0), unmounts it, then runs the new scene through `phase: 'in'` (300ms fade 0→1), then settles to `'idle'`. At any moment exactly one scene is mounted in the scene area. The very first scene-mount also fades in (initial `phase: 'in'`) so the player doesn't pop into a fully-opaque scene from the white chrome. The chrome's own `transition: background 600ms ease` matches the total fade so its midpoint lines up with the phase boundary — that's why the upper scene region and lower script bar darken/lighten in lockstep on a fire-scene swap and you never see a hard horizontal seam. `SCENE_FADE_OUT_MS` / `SCENE_FADE_IN_MS` in `StoryLayout.jsx` and the `scene-fade-in` / `scene-fade-out` keyframes + the `transition: background 600ms` in `StoryLayout.css` must stay in sync if you change either.

The same scene-change `useEffect` also fires `audio.setScene(sceneId)` (every render, including initial mount, so the music layer can route to the active scene) and `audio.whoosh()` (only on actual changes, gated by `prevIdRef`, so initial mount is silent). See §6.

**Lazy-loading + mount-time preload:**

Every non-Room scene is `React.lazy()`-imported in `StoryLayout.jsx` so the initial bundle stays small. To prevent the Suspense fallback from flashing during a scene swap, an empty `useEffect` on mount fires the same `import('../scenes/…')` calls in the background while the player reads the opening dialogue — by the time they navigate, the chunk is in cache. Suspense `fallback` is `null` (transparent) rather than a placeholder color, so even on a cold load you don't strobe an alien background through the cross-fade. **When you add a new lazy scene, add it to both the `lazy(() => import(…))` block and the preload `useEffect`.**

**Speakers, stage directions, and action lines in the script log:**

The log is an append-only array of `{ speaker, text, isAction? }`. Speaker mapping:
- `wife` → "Miyagi:" (regular weight)
- `husband` → "Katsushirō:" (bold)
- `stage` → italic, dimmed, no speaker label (used for `event.description` lines)

When a player picks a `kind: 'action'` choice, the chosen text is appended to the log under `wife` with `isAction: true` (italic, faint) so the action narration stays in voice.

**Checklist mechanics:**

- Tasks complete on click. Re-clicking a done task is idempotent (also defends against React 19 StrictMode double-invokes — the `goTo` for the final task is scheduled *outside* the `setCompletedTasks` updater for the same reason).
- A task with `sceneId` swaps the backdrop on click; tasks without one revert to the checklist hub's `sceneId`. This is how "cooking" cuts to the kitchen and bounces back without a separate node.
- A task with `requires: 'all-others'` stays locked (rendered with `--locked` styling, not clickable) until every sibling task is complete. Currently used by "Go to sleep" so the routine stays narratively last.
- The default delay between completing the final task and auto-advancing to `next` is `DEFAULT_TASK_COMPLETE_DELAY_MS = 500ms`. A task can override with `completionDelayMs` — sleep uses `0` so the burning scene's dark wash appears immediately, and the 2s breath of stillness lives inside `BurningScene.jsx` as `SMOKE_REVEAL_DELAY_MS = 2000` before its smoke layer fades in. That same 2s is also the music fade-out duration in the audio engine (see §6) — they're deliberately matched so the piano going silent and the smoke rising land together.

**House rules for the graph:**

- Choice text in `graph.js` is what the player sees in the choice grid; quote it carefully and keep it in sync with `script.md`.
- A node with `next: null` (and not a `scene`/`checklist`) is terminal — `StoryLayout` shows the ending label + a Restart button.
- When you wire up new scenes, register them in `SceneView` *and* in the lazy/preload pair; nodes whose `sceneId` doesn't match anything mounted will show a `scene-void scene-void--light` placeholder (warm off-white, intentionally bland so you notice).

## 6. Audio (`src/audio/audio.js`)

There's a singleton Web Audio engine, exported as `audio` from `src/audio/audio.js`. `StoryLayout.jsx` imports it directly — no React state, no provider, no hooks. It runs four layers:

| Layer | Source | Triggered by | Notes |
|---|---|---|---|
| `click` | `src/audio/click.mp3` (decoded once, replayed via `AudioBufferSourceNode` so rapid clicks layer instead of cutting each other off) | every button's `onPointerDown` calls `audio.click()` | bound to `onPointerDown` so it lands on press, not release; `onClick` still owns the actual nav semantics |
| `whoosh` | synthesised band-passed noise sweep (~280Hz → 1.4kHz → 380Hz over 550ms) | `audio.whoosh()` fires inside the scene-change `useEffect` whenever `sceneId` actually changes (gated by `prevIdRef`) | never on initial mount |
| `music` | `src/audio/pure-elegance-…mp3` looped quietly (`MUSIC_TARGET_GAIN = 0.20`) as the ambient theme | `audio.setScene(sceneId)` runs on every scene change; music plays during every scene **except** `burning-reed-house`, where it fades out (2s) and back in (2s) on exit | the 2s music-out duration is intentionally matched to `BurningScene`'s `SMOKE_REVEAL_DELAY_MS = 2000` (see §5) |
| `fire` | synthesised low-pass rumble + scheduled high-pass crackle bursts (50–290ms apart) | only active on `sceneId === 'burning-reed-house'`; ramps in 1.4s after a 2s pre-delay (so it begins right as the music has finished fading out) and ramps out over 0.7s on exit | both rumble and crackles route through a `fireBus` gain node so the whole layer fades together |

**Browser autoplay handling:** the `AudioContext` is created eagerly (so `decodeAudioData` can prime the click + music buffers in the background) but stays `suspended` until the first user gesture. Every public method calls `_resume()`, so the very first click both unlocks audio and plays the click sound. The first successful unlock then applies whatever scene is currently active, which kicks off the music for non-fire scenes (or, in the unlikely case the player unlocks on the burning scene, the fire layer).

**House rules for audio:**
- Don't `await` anything from `audio.*`. The engine is fire-and-forget; if a buffer hasn't decoded yet, the call is a silent no-op and a later `_loadMusic`/`_loadClick` resolution will catch up.
- If you add a new sound, decide whether it belongs on `master` (one-shot SFX), `musicBus` (ambient bed, fades with scene), or `fireBus` (only audible during the burning scene).
- New scene IDs are routed through `setScene` automatically — you only need to special-case the engine if a scene needs music ducked / a different bed / its own ambient layer (right now only the burning scene does).
- Constants at the top of `audio.js` — `MUSIC_FADE_OUT_S`, `FIRE_PRE_DELAY_S`, `SMOKE_REVEAL_DELAY_MS` (in `BurningScene.jsx`), and `MUSIC_FADE_OUT_S = FIRE_PRE_DELAY_S = 2.0` — are interlocked. Don't change one without the others.

## 7. Performance guardrails

- Lazy-load scene modules (`React.lazy`) **and** kick off the same imports from a mount-time `useEffect` so chunks are warm before the first navigation. Both lists in `StoryLayout.jsx` need to stay in sync.
- Pre-generate ASCII JSON at build time (`bun run ascii <name>`) — never compute it in the browser.
- Keep the JSON assets small: tune `--cols` downward if a scene's grid is large but doesn't need the resolution. Most scenes ship at the default 264-col grid (~20 KB JSON); only push wider if the source image genuinely benefits.
- Source PNGs in `public/` are large (1–2 MB each). They're only fed to `bun run ascii` and never referenced from the browser bundle, so their size doesn't hit users — but don't add new full-resolution PNGs without confirming they're needed for the ASCII pass and not for runtime display.

## 8. Story / design constraints to respect

- Keep the ghost's perspective central — UI copy, choice phrasing, and ambient cues should reflect that the user is *not alive* and the world reflects their unresolved waiting.
- Time is unstable from the ghost's POV. Scene transitions can compress or dilate years; lean into that rather than hiding it.
- Endings can branch, but every ending should leave the user with the source's emotional residue (loss, recognition, the cost of waiting). No clean resolutions.

## 9. House rules for Claude

- Don't add Tailwind, TypeScript, Next.js, a router, Zustand, or any other framework-level dependency without asking. The project is intentionally minimal.
- When unsure whether a story branch is canonical-enough, ask before writing it; don't invent endings unilaterally.
- Keep `package.json` lean. Every dependency should earn its place.
- Asset files belong in their conventional homes: source PNGs/JPGs for the ASCII pipeline go in `public/`; generated ASCII JSON goes in `src/assets/`; audio (`click.mp3`, music bed) goes in `src/audio/` next to `audio.js`. Don't commit large binaries without confirming with the user first.
- Do not introduce Three.js / R3F / Drei code. The 3D approach has been retired from this project.
