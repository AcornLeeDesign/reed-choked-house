# Reed-Choked House

An interactive, first-person, browser-based roleplay reimagining of **"The Reed-Choked House"** (浅茅が宿 / *Asaji ga Yado*) from Ueda Akinari's *Ugetsu Monogatari* (1776).

You play not Katsushirō, the husband who leaves, but **Miyagi** — the wife who waits, and dies waiting, and lingers. The story is shifted into a more modern register; the longing is unchanged.

Built for an EALC_110 course context.

## Aesthetic

Every visual scene is a still photograph rendered as live ASCII typography on a white page. Four tonal layers, the smallest amount of motion possible: a slow alternation of characters and a faint mouse parallax. Each scene reads as a faded memory or a half-recalled photograph.

## Stack

- Vite + React 19
- Plain JavaScript (`.jsx`)
- ESLint flat config
- [Bun](https://bun.sh) as the package manager and script runner

## Develop

```sh
bun install
bun run dev
```

Then open the printed local URL.

## Build

```sh
bun run build
bun run preview
```

## Adding a scene from an image

Drop a moody, low-contrast still into `public/` and run:

```sh
bun run ascii <name>
```

This generates `src/assets/<name>-ascii.json`. Then create a thin scene wrapper in `src/scenes/`, register it in `SceneView` inside `src/components/StoryLayout.jsx`, and wire its `sceneId` into the relevant node in `src/story/graph.js`.

Optional flags: `--cols=N` (grid width, default 264) and `--gamma=N` (default 1.2; `<1` darker, `>1` brighter).

## Story

The canonical narrative spec lives in [`claude-docs/script.md`](claude-docs/script.md): all 24 nodes, the Scene Library, the adjacency graph, and the build instructions. The runtime story graph in `src/story/graph.js` is derived from it; the two are kept in sync.

Branches may diverge from the canonical ending, but every ending should leave the source's emotional residue — loss, recognition, the cost of waiting. No clean resolutions.

## Source

Ueda Akinari, *Ugetsu Monogatari* (雨月物語), 1776. "Asaji ga Yado" / 浅茅が宿 / "The Reed-Choked House."
