# Reed Choked House — Interactive Story Script

## Project Brief
- **Source material:** *The Reed Choked House* (folktale adaptation).
- **Format:** branching, playable web experience.
- **Player POV:** the **Wife** — present as a ghost, drifting through her former home. The Husband is alive but unable to fully perceive her.
- **Choice mechanic:** the player drives the story by selecting one option at each `SCENE` node. Options are either **Dialogue** (the Wife says something aloud) or **Action** (the Wife performs a gesture / movement / non-verbal act).
- **Node types:**
  - `SCENE` — a visual environment the player inhabits. Holds the visual/sensory description plus the player choices that branch the story.
  - `DIALOGUE` — a fixed back-and-forth between Wife and Husband, played in order, with no player input. Has exactly one outgoing path.
  - `EVENT` — a non-interactive world event, state change, or trigger (e.g. a candle gutters, the reeds rustle). Has exactly one outgoing path.
  - `CHECKLIST` — a gated objective node. The player MUST complete every listed task (in order, top to bottom) before the single outgoing edge unlocks and the next node plays. Each task transports the player to its designated subscene; the task is marked complete when the player performs the action there.
- **Reading order:** nodes are listed in graph order. Each node ends with its outgoing branches written as `→ <REF>`. Use these refs to trace any playthrough.

---

## Scene Library
The following are the distinct visual environments referenced throughout the script. Each `SCENE` and checklist-task subscene maps to one of these.

| Scene ID | Name | Description |
|---|---|---|
| `reed-house-room` | Reed House — Main Room | The single room of a modest rural dwelling. Tatami floor, low wooden beams, paper shoji screens diffusing grey morning light. Reeds press against the exterior walls; their rustling is constant. A small hearth sits cold at center. A worn sleeping mat is folded in the corner. The camera is eye-level, drifting slightly as if weightless. Used across the living, ghost, and argument phases — lighting and colour grade shift per story state. |
| `reed-house-door-interior` | Reed House — Door, Interior Side | POV stands just inside the front door, facing outward. The door is ajar. Through the gap: a dirt path, reed fields stretching to a pale horizon, and an empty road. A paper lamp hangs unlit from the eave, visible through the gap. |
| `reed-house-door-exterior` | Reed House — Door, Exterior Side | POV stands just outside the front doorstep, facing back toward the house. The paper lamp on the eave is the focal point — unlit during the living phase, softly glowing amber during the lone-year phase. Reed stalks frame both sides. The sky is dusk-coloured. |
| `reed-house-floor` | Reed House — Floor / Tatami | POV is low, close to the tatami floor, as if crouching or kneeling. A hand broom is nearby. Dust motes drift in slant light from the shoji screen. The room looks large from this angle — emptier. |
| `reed-house-kitchen-stove` | Reed House — Kitchen, Stovetop | POV faces a small clay stove. A pot sits on it, steam rising slowly. Firelight flickers from below, casting warm orange on the surrounding wall. One portion cooking. Isolated, intimate. |
| `reed-house-kitchen-table` | Reed House — Kitchen, Table | POV is seated at a low table. A single bowl of food is set out. No other place is set. The empty space across the table is visible and deliberate. Candlelight or window light falls across the surface. |
| `reed-house-kitchen-sink` | Reed House — Kitchen, Sink | POV faces a wooden washbasin. A bowl and chopsticks sit in still water. The window above the sink looks out onto the reed field. Quiet, routine, lonely. |
| `reed-house-bed` | Reed House — Sleeping Mat | POV faces the folded or unrolled sleeping mat in the corner. A single pillow. The room is dim — night. The shoji screens glow faintly with moonlight filtered through reeds. |
| `burning-reed-house` | Burning Reed House | The same main room, now consumed. Flames climb the shoji screens and the wooden beams. Smoke fills the upper half of the frame. The door is visible but the frame is warped — jammed. The camera shakes faintly. Orange and black. |
| `temple-scene` | Temple Grounds | A modest roadside temple at dawn. Stone lanterns, a mossy courtyard, a ginkgo tree. The husband kneels before a small altar; an elderly monk stands nearby. The atmosphere is still and suffused with pale gold light. The POV drifts in from the edge of the courtyard as if just arriving. |
| `heaven` | Heaven | Abstract, luminous. White and soft gold light dissolve the edges of the frame. The reed house, the road, the husband — all become faint outlines beneath the brightness before fading entirely. The camera drifts slowly upward. Silence. |

---

## Graph Summary
- **Total nodes:** 24 (scenes: 5, dialogue: 7, events: 9, checklists: 3)
- **Total edges:** 24
- **Entry points (no incoming edges):** `D5`
- **Terminal nodes (no outgoing edges):** `E13`, `E20`, `E25`, `E26`

## Node Index
- `S1` — SCENE: The Reed House — Threshold
- `C4` — CHECKLIST: housekeeping
- `D5` — DIALOGUE: Dialogue
- `D6` — DIALOGUE: Dialogue
- `E7` — EVENT: Event
- `S8` — SCENE: The Reed House — Threshold
- `D9` — DIALOGUE: Dialogue
- `D10` — DIALOGUE: Dialogue
- `S11` — SCENE: New scene
- `D12` — DIALOGUE: Dialogue
- `E13` — EVENT: Good ending
- `E14` — EVENT: miyagi alone
- `E15` — EVENT: burning house
- `S16` — SCENE: Ghost Miyagi
- `D17` — DIALOGUE: Dialogue
- `S18` — SCENE: Ghost Miyagi
- `D19` — DIALOGUE: Dialogue
- `E20` — EVENT: incomplete end
- `E21` — EVENT: temple scene
- `C22` — CHECKLIST: Checklist
- `E23` — EVENT: burning house
- `C24` — CHECKLIST: housekeeping
- `E25` — EVENT: Incomplete end
- `E26` — EVENT: Complete ending

---

## Nodes

### S1 · SCENE · The Reed House — Threshold

- **Incoming:** `D5`
- **Scene:** `reed-house-room`
- **State:** Morning. Cool blue-grey light through the shoji. The husband stands near the door with a travel pack. The room feels full — this is still a home. Colour grade: muted warm.

**Player choices (branching):**

1. **DIALOGUE** — "Stay, and let us face thin harvests together, rather than chase distant gold that may never bring you home." → `D6` (Dialogue)
2. **DIALOGUE** — "Then go, if you must—but do not pretend your heart is at ease in leaving me. Remember that it is by your own choice you turn your back on this house and on me." → `E7` (Event)

---

### C4 · CHECKLIST · housekeeping

- **Incoming:** `E14`
- **Scene (hub):** `reed-house-room`
- **State:** One year later. Miyagi alone. Same room, same geometry, but the husband's belongings are gone. The reeds outside press closer. Colour grade: cool, hollow. Each task teleports the player to its subscene; completing the action there marks it done and returns the player to this hub.

**Required tasks (player must complete ALL, in order, before advancing):**

- [ ] 1. **Open the door to check if he's there** → subscene: `reed-house-door-interior` — *Player drifts to the door and opens it. The road is empty. Wind moves the reeds.*
- [ ] 2. **Sweep the floor** → subscene: `reed-house-floor` — *Player crouches low, moving a broom across the tatami. Dust lifts and drifts. The room looks vast from down here.*
- [ ] 3. **Cooking** → subscene: `reed-house-kitchen-stove` — *Player stands before the stove. A single pot steams. Firelight flickers. One portion. Always one.*
- [ ] 4. **Eat** → subscene: `reed-house-kitchen-table` — *Player sits at the low table. One bowl. The empty place across the table holds the scene.*
- [ ] 5. **Wash the dishes** → subscene: `reed-house-kitchen-sink` — *Player stands at the washbasin. Water is still. The reed field is visible through the small window above.*
- [ ] 6. **Light the lamp** → subscene: `reed-house-door-exterior` — *Player steps just outside and lights the paper lamp on the eave. It glows amber against the darkening sky. She waits a moment, looking down the road.*
- [ ] 7. **Go to sleep** → subscene: `reed-house-bed` — *Player faces the sleeping mat. She kneels and lies down. The shoji screens glow faintly with reed-filtered moonlight. She closes her eyes.*

**On full completion → `E15` (burning house)**

---

### D5 · DIALOGUE · Dialogue

- **Incoming:** _(entry point)_

**Script (play in order, no player input):**

- **HUSBAND:** I must leave

**Continues to:** `S1` (The Reed House — Threshold)

---

### D6 · DIALOGUE · Dialogue

- **Incoming:** `S1`

**Script (play in order, no player input):**

- **HUSBAND:** "But don't you see"
- **WIFE:** ...no, really I don't" *tearing up*
- **HUSBAND:** There's so much out there - our lives could be so much better. Without this business, we would have nothing, *nothing*. This is for our future – you know this."
- **WIFE:** When will you be back?
- **HUSBAND:** ….
- **WIFE:** See, you don't know

**Continues to:** `S8` (The Reed House — Threshold)

---

### E7 · EVENT · Event

- **Incoming:** `S1`

**Event (non-interactive world beat):**

> Husband leaves. The door closes. The room is the same — but emptier.

**Continues to:** `C24` (housekeeping)

---

### S8 · SCENE · The Reed House — Threshold

- **Incoming:** `D6`
- **Scene:** `reed-house-room`
- **State:** Continuous from D6 — same morning, moments later. The husband is still present but moving toward the door. Tension in the stillness. Light unchanged from S1.

**Player choices (branching):**

1. **DIALOGUE** — "…*sigh*. 'With no one to depend on, my woman's heart will know the extremities of sadness, wandering as though lost in the fields and mountains. Please do not forget me, morning or night, and come back soon. If only I live long enough, I tell myself, but in this life we cannot depend on the morrow, and so take pity on me in your stalwart heart.'" → `D9` (Dialogue)
2. **DIALOGUE** — "*tears in her eyes*. "In an age when a single rumor can turn calm fields into a battlefield, is it not folly to abandon the little certainty we have for dreams of distant profit? If the wind should rise and scatter us, I have no means to follow you, nor any promise that tomorrow will grant us another meeting. If you truly cherish this fragile life we share, let your steadfast heart remain here beside me."" → `D10` (Dialogue)

---

### D9 · DIALOGUE · Dialogue

- **Incoming:** `S8`, `S11`

**Script (play in order, no player input):**

- **HUSBAND:** "How could I linger in a strange land, riding on a drifting log? I shall return this autumn, when the arrowroot leaf turns over in the wind. Be confident and wait for me."

**Continues to:** `E14` (miyagi alone)

---

### D10 · DIALOGUE · Dialogue

- **Incoming:** `S8`

**Script (play in order, no player input):**

- **HUSBAND:** "…"

**Continues to:** `S11` (New scene)

---

### S11 · SCENE · New scene

- **Incoming:** `D10`
- **Scene:** `reed-house-room`
- **State:** A beat of silence after the husband's non-answer. He stands at the threshold, hand on the door frame, not quite gone. Light is the same morning grey — the moment stretches. This is the last chance.

**Player choices (branching):**

1. **DIALOGUE** — "If, even for a moment, your heart hesitates on the threshold, then heed that hesitation and let it root you here. Tomorrow's coins in the capital will not warm this bed or answer when I call your name in the dark. Stay, and let us be poor together under one leaky roof, rather than rich apart in a world where a single night's wind can sweep all our promises away." → `D12` (Dialogue)
2. **ACTION** — *[let him think]* → `D9` (Dialogue)

---

### D12 · DIALOGUE · Dialogue

- **Incoming:** `S11`

**Script (play in order, no player input):**

- **HUSBAND:** If I leave now, I cast you and this house aside for a profit that may never come. Rumors of war already stain the road; a drifting log should cling to shore, not seek the rapids. Better that I till these poor fields at your side than chase golden dreams that could cost me you.

**Continues to:** `E13` (Good ending)

---

### E13 · EVENT · Good ending

- **Incoming:** `D12`
- **Scene:** `reed-house-room`
- **State:** The husband sets down his pack. Soft light returns to the room. The reeds outside settle. **GOOD ENDING.**

**Event (non-interactive world beat):**

> Husband stays. He sets his pack down by the door. The room breathes again.

**Continues to:** _DEAD END_

---

### E14 · EVENT · miyagi alone

- **Incoming:** `D9`

**Event (non-interactive world beat):**

> The door closes. Time passes — a slow dissolve or title card signals *one year later*. The room is the same but quieter. His things are gone.

**Continues to:** `C4` (housekeeping)

---

### E15 · EVENT · burning house

- **Incoming:** `C4`
- **Scene:** `burning-reed-house`

**Event (non-interactive world beat):**

> Fire. The shoji screens ignite from outside — reeds catching first. The camera jolts upright from the sleeping mat. Smoke fills the upper frame. Miyagi moves to the door but the frame is warped — it will not open. Smoke thickens. Screen goes black.

**Continues to:** `S16` (Ghost Miyagi)

---

### S16 · SCENE · Ghost Miyagi

- **Incoming:** `E15`
- **Scene:** `reed-house-room`
- **State:** Ghost phase. The room is now ash and ruin — charred beams, collapsed shoji, reeds visible through the broken walls. Same geometry as the living scenes. Colour grade: cold grey, pale blue, silver. The Wife's POV drifts slightly above floor level — weightless. Years have passed.

**Player choices (branching):**

1. **ACTION** — *[open door and call for Katsushirō]* → `D17` (Dialogue)
2. **ACTION** — *[Go to the temple through the backdoor]* → `E20` (incomplete end)

---

### D17 · DIALOGUE · Dialogue

- **Incoming:** `S16`

**Script (play in order, no player input):**

- **HUSBAND:** I would never have let the years and months slip by had I thought that you were still living here like this. One day years ago, when I was in the capital, I heard of fighting in Kamakura—the shogun's deputy had been defeated and taken refuge in Shimōsa. The Uesugi were in eager pursuit, people said. The next day… *rambling*

**Continues to:** `S18` (Ghost Miyagi)

---

### S18 · SCENE · Ghost Miyagi

- **Incoming:** `D17`
- **Scene:** `reed-house-room`
- **State:** Same ruined room, ghost phase. The husband stands in the doorway — living, returned, older. He cannot fully see her but speaks into the space where she was. The Wife's POV is very still.

**Player choices (branching):**

1. **ACTION** — *[Flee to the temple]* → `E20` (incomplete end)
2. **DIALOGUE** — "After I bid you farewell, the world took a dreadful turn even before the arrival of the autumn I had relied on, leading the villagers to abandon their homes for the sea or the mountains." → `D19` (Dialogue)

---

### D19 · DIALOGUE · Dialogue

- **Incoming:** `S18`

**Script (play in order, no player input):**

- **WIFE:** Among the few who remained, most possessed the hearts of tigers or wolves and sought to exploit my solitude with deceptive words; however, I chose to be crushed like a piece of jade rather than imitate the hollow perfection of a common tile, enduring many bitter experiences to maintain my integrity.
- **WIFE:** Although the brilliance of the Milky Way heralded the autumn, you did not return, and I continued to wait through the winter and the New Year without receiving a single word of your whereabouts.
- **WIFE:** Though I longed to seek you out in the capital, I knew that the sealed barrier gates—which turned away even men—would be impassable for a woman, so I waited in vain at this house with only the pine at the eaves, foxes, and owls for company until today.
- **WIFE:** Now that you have returned, my long resentment has finally been dispelled, though no one else can truly understand the profound bitterness of one who dies of longing while waiting for another to come.

**Continues to:** `E21` (temple scene)

---

### E20 · EVENT · incomplete end

- **Incoming:** `S16`, `S18`
- **Scene:** `temple-scene`

**Event (non-interactive world beat):**

> The Wife's ghost drifts away through the ruined walls before she can speak. She arrives at the temple alone. The stone courtyard is empty. **INCOMPLETE END.**

**Continues to:** _DEAD END_

---

### E21 · EVENT · temple scene

- **Incoming:** `D19`
- **Scene:** `temple-scene`

**Event (non-interactive world beat):**

> The Wife's presence fades from the ruined house. She arrives at the temple at dawn. The husband is kneeling before the altar. An old monk stands nearby. Gold light fills the courtyard.

**Continues to:** `C22` (Checklist)

---

### C22 · CHECKLIST · Checklist

- **Incoming:** `E21`
- **Scene:** `temple-scene`

**Required tasks (player must complete ALL, in order, before advancing):**

- [ ] 1. **Ascend** → *The Wife's POV drifts slowly upward from the courtyard. The temple, the husband, the old monk grow small below. The sky opens.*

**On full completion → `E26` (Complete ending)**

---

### E23 · EVENT · burning house

- **Incoming:** `C24`
- **Scene:** `burning-reed-house`

**Event (non-interactive world beat):**

> Fire. Same sequence as E15 — shoji ignites, smoke fills the frame, door is jammed. But here there is no ghost chapter to follow. Screen goes black.

**Continues to:** `E25` (Incomplete end)

---

### C24 · CHECKLIST · housekeeping

- **Incoming:** `E7`
- **Scene (hub):** `reed-house-room`
- **State:** Same day the husband leaves, or shortly after. The room is intact but feels immediately hollowed. Each task teleports the player to its subscene; completing the action there marks it done and returns the player to this hub.

**Required tasks (player must complete ALL, in order, before advancing):**

- [ ] 1. **Open the door to check if he's there** → subscene: `reed-house-door-interior` — *Player drifts to the door and opens it. The path is empty. His footprints are still fresh in the dirt.*
- [ ] 2. **Sweep the floor** → subscene: `reed-house-floor` — *Player crouches low, moving a broom across the tatami. The room is enormous from down here.*
- [ ] 3. **Cooking** → subscene: `reed-house-kitchen-stove` — *Player stands before the stove. A pot steams. One portion. Already the habit of one.*
- [ ] 4. **Eat** → subscene: `reed-house-kitchen-table` — *Player sits at the low table. One bowl. The empty space across is new and sharp.*
- [ ] 5. **Wash the dishes** → subscene: `reed-house-kitchen-sink` — *Player stands at the washbasin. The reed field outside the window sways.*
- [ ] 6. **Light the lamp** → subscene: `reed-house-door-exterior` — *Player steps outside and lights the paper lamp on the eave. She lingers, looking down the road. No one comes.*
- [ ] 7. **Go to sleep** → subscene: `reed-house-bed` — *Player faces the sleeping mat. She lies down. The mat is wide. The shoji screens glow with moonlight.*

**On full completion → `E23` (burning house)**

---

### E25 · EVENT · Incomplete end

- **Incoming:** `E23`
- **Scene:** `temple-scene`

**Event (non-interactive world beat):**

> The Wife's presence flickers into the temple courtyard. It is empty. No husband. No monk. Stone lanterns, silence. She fades. **INCOMPLETE END.**

**Continues to:** _DEAD END_

---

### E26 · EVENT · Complete ending

- **Incoming:** `C22`
- **Scene:** `heaven`

**Event (non-interactive world beat):**

> The Wife ascends. The temple, the reed house, the road, the husband's face — all dissolve into light. The camera drifts upward until the frame is pure luminance. Silence. **COMPLETE ENDING.**

**Continues to:** _DEAD END_

---

## Adjacency List (machine-readable)

```
S1 -[DIALOGUE:"Stay, and let us face thin harvests together, rather than chase distant gold that may never bring you home."]-> D6
S1 -[DIALOGUE:"Then go, if you must—but do not pretend your heart is at ease in leaving me. Remember that it is by your own choice you turn your back on this house and on me."]-> E7
C4 -[ALL_TASKS_COMPLETE]-> E15
D5 -[CONTINUE]-> S1
D6 -[CONTINUE]-> S8
E7 -[CONTINUE]-> C24
S8 -[DIALOGUE:"…*sigh*. 'With no one to depend on, my woman's heart will know the extremities of sadness...'"]-> D9
S8 -[DIALOGUE:"*tears in her eyes*. In an age when a single rumor can turn calm fields into a battlefield..."]-> D10
D9 -[CONTINUE]-> E14
D10 -[CONTINUE]-> S11
S11 -[ACTION:"let him think"]-> D9
S11 -[DIALOGUE:"If, even for a moment, your heart hesitates on the threshold..."]-> D12
D12 -[CONTINUE]-> E13
E13: (terminal)
E14 -[CONTINUE]-> C4
E15 -[CONTINUE]-> S16
S16 -[ACTION:"open door and call for Katsushirō"]-> D17
S16 -[ACTION:"Go to the temple through the backdoor"]-> E20
D17 -[CONTINUE]-> S18
S18 -[DIALOGUE:"After I bid you farewell, the world took a dreadful turn..."]-> D19
S18 -[ACTION:"Flee to the temple"]-> E20
D19 -[CONTINUE]-> E21
E20: (terminal)
E21 -[CONTINUE]-> C22
C22 -[ALL_TASKS_COMPLETE]-> E26
E23 -[CONTINUE]-> E25
C24 -[ALL_TASKS_COMPLETE]-> E23
E25: (terminal)
E26: (terminal)
```

---

## Scene Reference Map

| Node | Scene ID | State / Notes |
|---|---|---|
| S1 | `reed-house-room` | Morning, husband present, muted warm grade |
| S8 | `reed-house-room` | Continuous — same morning, husband at door |
| S11 | `reed-house-room` | Same morning, threshold silence, last chance |
| E13 | `reed-house-room` | Husband sets pack down — relief, warmth restored |
| C4 (hub) | `reed-house-room` | One year later, alone, cool hollow grade |
| C4 task 1 | `reed-house-door-interior` | Empty road |
| C4 task 2 | `reed-house-floor` | Low angle, dust, vastness |
| C4 task 3 | `reed-house-kitchen-stove` | One pot, firelight |
| C4 task 4 | `reed-house-kitchen-table` | One bowl, empty place across |
| C4 task 5 | `reed-house-kitchen-sink` | Washbasin, reed field through window |
| C4 task 6 | `reed-house-door-exterior` | Lamp lit amber, dark road, waiting |
| C4 task 7 | `reed-house-bed` | Night, sleeping mat, moonlit reeds |
| C24 (hub) | `reed-house-room` | Day husband leaves, immediately hollow |
| C24 task 1 | `reed-house-door-interior` | His footprints still fresh |
| C24 task 2 | `reed-house-floor` | Same as C4 task 2 |
| C24 task 3 | `reed-house-kitchen-stove` | Same as C4 task 3 |
| C24 task 4 | `reed-house-kitchen-table` | Loss more immediate than C4 |
| C24 task 5 | `reed-house-kitchen-sink` | Same as C4 task 5 |
| C24 task 6 | `reed-house-door-exterior` | Lamp lit, no one comes |
| C24 task 7 | `reed-house-bed` | Same as C4 task 7 |
| E15 / E23 | `burning-reed-house` | Fire, smoke, jammed door, blackout |
| S16 | `reed-house-room` | Ghost phase — ruined, cold grey grade |
| S18 | `reed-house-room` | Ghost phase — husband in doorway |
| E20 / E25 | `temple-scene` | Empty courtyard, incomplete |
| E21 | `temple-scene` | Dawn, husband + monk, gold light |
| C22 | `temple-scene` | Ascent begins |
| E26 | `heaven` | Full luminance, dissolve upward |

---

## Build Instructions for Implementing Agent
1. Create one scene component per entry in the **Scene Library** table. Each scene ID is the reusable visual environment; state variants (tone, colour grade, prop/text differences) are applied on top per the **Scene Reference Map**.
2. At the end of each `SCENE` node, present its choices as on-screen buttons. The button label is the dialogue line (in quotes) or the action description (in brackets).
3. When the player selects a choice, transition to the node referenced by that choice's arrow.
4. `DIALOGUE` nodes auto-play their script lines in order, then advance to the referenced node with no player input.
5. `EVENT` nodes trigger their described world change (animation, sound, lighting cue), then advance to the referenced node.
6. `CHECKLIST` nodes display a visible task list. Each task teleports the player to its designated subscene. The task is marked complete when the player performs the described action in that subscene. The player is returned to the checklist hub. The outgoing edge MUST stay locked until every task is checked off; tasks complete top-to-bottom in order.
7. **DEAD END** nodes are terminal; show an end-of-branch beat and offer "restart" or "return to last scene".
8. Preserve the ghost-wife POV throughout: the Husband never directly addresses the camera, only speaks aloud as if to himself or to her remembered presence.
9. The `reed-house-room` scene is reused across many nodes — use the **Scene Reference Map** to apply the correct lighting state, colour grade, and prop configuration per node.