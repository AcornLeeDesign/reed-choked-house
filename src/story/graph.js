// Canonical story graph — derived from claude-docs/script.md.
// Node types: 'dialogue' | 'event' | 'scene' | 'checklist'
// Speakers:   'wife' | 'husband'

export const ENTRY = 'D5'

export const GRAPH = {

  // ── DIALOGUE NODES ────────────────────────────────────────────────────

  D5: {
    type: 'dialogue',
    lines: [
      { speaker: 'husband', text: 'I must leave' },
    ],
    next: 'S1',
  },

  D6: {
    type: 'dialogue',
    lines: [
      { speaker: 'husband', text: "But don't you see" },
      { speaker: 'wife',    text: '…no, really I don\'t. *tearing up*' },
      { speaker: 'husband', text: "There's so much out there — our lives could be so much better. Without this business, we would have nothing, nothing. This is for our future — you know this." },
      { speaker: 'wife',    text: 'When will you be back?' },
      { speaker: 'husband', text: '….' },
      { speaker: 'wife',    text: "See, you don't know." },
    ],
    next: 'S8',
  },

  D9: {
    type: 'dialogue',
    lines: [
      { speaker: 'husband', text: 'How could I linger in a strange land, riding on a drifting log? I shall return this autumn, when the arrowroot leaf turns over in the wind. Be confident and wait for me.' },
    ],
    next: 'E14',
  },

  D10: {
    type: 'dialogue',
    lines: [
      { speaker: 'husband', text: '…' },
    ],
    next: 'S11',
  },

  D12: {
    type: 'dialogue',
    lines: [
      { speaker: 'husband', text: 'If I leave now, I cast you and this house aside for a profit that may never come. Rumors of war already stain the road; a drifting log should cling to shore, not seek the rapids. Better that I till these poor fields at your side than chase golden dreams that could cost me you.' },
    ],
    next: 'E13',
  },

  D17: {
    type: 'dialogue',
    sceneId: 'door',
    lines: [
      { speaker: 'husband', text: 'I would never have let the years and months slip by had I thought that you were still living here like this. One day years ago, when I was in the capital, I heard of fighting in Kamakura — the shogun\'s deputy had been defeated and taken refuge in Shimōsa. The Uesugi were in eager pursuit, people said. The next day… *rambling*' },
    ],
    next: 'S18',
  },

  D19: {
    type: 'dialogue',
    lines: [
      { speaker: 'wife', text: 'Among the few who remained, most possessed the hearts of tigers or wolves and sought to exploit my solitude with deceptive words; however, I chose to be crushed like a piece of jade rather than imitate the hollow perfection of a common tile, enduring many bitter experiences to maintain my integrity.' },
      { speaker: 'wife', text: 'Although the brilliance of the Milky Way heralded the autumn, you did not return, and I continued to wait through the winter and the New Year without receiving a single word of your whereabouts.' },
      { speaker: 'wife', text: 'Though I longed to seek you out in the capital, I knew that the sealed barrier gates — which turned away even men — would be impassable for a woman, so I waited in vain at this house with only the pine at the eaves, foxes, and owls for company until today.' },
      { speaker: 'wife', text: 'Now that you have returned, my long resentment has finally been dispelled, though no one else can truly understand the profound bitterness of one who dies of longing while waiting for another to come.' },
    ],
    next: 'E21',
  },

  // ── EVENT NODES ───────────────────────────────────────────────────────

  E7: {
    type: 'event',
    sceneId: 'room-closed',
    description: 'Husband leaves. The door closes. The room is the same — but emptier. The reeds outside begin to rustle.',
    next: 'C24',
  },

  E13: {
    type: 'event',
    sceneId: 'reed-house-room',
    description: 'Husband stays. He sets his pack down by the door. The room breathes again.',
    ending: 'good',
    next: null,
  },

  E14: {
    type: 'event',
    sceneId: 'room-closed',
    description: 'The door closes. Time passes — one year later. The room is the same but quieter. His things are gone.',
    next: 'C4',
  },

  E15: {
    type: 'event',
    sceneId: 'burning-reed-house',
    description: 'Fire. The shoji screens ignite from outside — reeds catching first. Smoke fills the upper frame. The door is warped — it will not open. Screen goes black.',
    next: 'S16',
  },

  E20: {
    type: 'event',
    sceneId: 'temple-scene',
    description: "The Wife's ghost drifts away through the ruined walls before she can speak. She arrives at the temple alone. The stone courtyard is empty.",
    ending: 'incomplete',
    next: null,
  },

  E21: {
    type: 'event',
    sceneId: 'temple-scene',
    description: "The Wife's presence fades from the ruined house. She arrives at the temple at dawn. The husband is kneeling before the altar. An old monk stands nearby. Gold light fills the courtyard.",
    next: 'C22',
  },

  E23: {
    type: 'event',
    sceneId: 'burning-reed-house',
    description: 'Fire. Same sequence — shoji ignites, smoke fills the frame, door jammed. Screen goes black.',
    next: 'E25',
  },

  E25: {
    type: 'event',
    sceneId: 'temple-scene',
    description: "The Wife's presence flickers into the temple courtyard. It is empty. No husband. No monk. Stone lanterns, silence. She fades.",
    ending: 'incomplete',
    next: null,
  },

  E26: {
    type: 'event',
    sceneId: 'heaven',
    description: "The Wife ascends. The temple, the reed house, the road, the husband's face — all dissolve into light. The camera drifts upward until the frame is pure luminance. Silence.",
    ending: 'complete',
    next: null,
  },

  // ── SCENE NODES ───────────────────────────────────────────────────────

  S1: {
    type: 'scene',
    sceneId: 'reed-house-room',
    choices: [
      {
        kind: 'dialogue',
        text: 'Stay, and let us face thin harvests together, rather than chase distant gold that may never bring you home.',
        next: 'D6',
      },
      {
        kind: 'dialogue',
        text: 'Then go, if you must—but do not pretend your heart is at ease in leaving me. Remember that it is by your own choice you turn your back on this house and on me.',
        next: 'E7',
      },
    ],
  },

  S8: {
    type: 'scene',
    sceneId: 'reed-house-room',
    choices: [
      {
        kind: 'dialogue',
        text: '…*sigh*. "With no one to depend on, my woman\'s heart will know the extremities of sadness, wandering as though lost in the fields and mountains. Please do not forget me, morning or night, and come back soon. If only I live long enough, I tell myself, but in this life we cannot depend on the morrow, and so take pity on me in your stalwart heart."',
        next: 'D9',
      },
      {
        kind: 'dialogue',
        text: '*tears in her eyes*. "In an age when a single rumor can turn calm fields into a battlefield, is it not folly to abandon the little certainty we have for dreams of distant profit? If the wind should rise and scatter us, I have no means to follow you, nor any promise that tomorrow will grant us another meeting. If you truly cherish this fragile life we share, let your steadfast heart remain here beside me."',
        next: 'D10',
      },
    ],
  },

  S11: {
    type: 'scene',
    sceneId: 'reed-house-room',
    choices: [
      {
        kind: 'dialogue',
        text: 'If, even for a moment, your heart hesitates on the threshold, then heed that hesitation and let it root you here. Tomorrow\'s coins in the capital will not warm this bed or answer when I call your name in the dark. Stay, and let us be poor together under one leaky roof, rather than rich apart in a world where a single night\'s wind can sweep all our promises away.',
        next: 'D12',
      },
      {
        kind: 'action',
        text: '[let him think]',
        next: 'D9',
      },
    ],
  },

  S16: {
    type: 'scene',
    sceneId: 'reed-house-room',
    choices: [
      {
        kind: 'action',
        text: '[open door and call for Katsushirō]',
        next: 'D17',
      },
      {
        kind: 'action',
        text: '[go to the temple through the backdoor]',
        next: 'E20',
      },
    ],
  },

  S18: {
    type: 'scene',
    sceneId: 'reed-house-room',
    choices: [
      {
        kind: 'action',
        text: '[flee to the temple]',
        next: 'E20',
      },
      {
        kind: 'dialogue',
        text: 'After I bid you farewell, the world took a dreadful turn even before the arrival of the autumn I had relied on, leading the villagers to abandon their homes for the sea or the mountains.',
        next: 'D19',
      },
    ],
  },

  // ── CHECKLIST NODES ───────────────────────────────────────────────────

  // C4: one year later — same routines, heavier absence
  C4: {
    type: 'checklist',
    sceneId: 'reed-house-room',
    tasks: [
      { id: 'door',  text: 'Open the door to check if he\'s there', description: 'The road is empty. Wind moves the reeds.',                                  sceneId: 'door'    },
      { id: 'sweep', text: 'Sweep the floor',                       description: 'Dust lifts and drifts. The room looks vast from down here.',                sceneId: 'floor'   },
      { id: 'cook',  text: 'Cooking',                               description: 'A single pot steams. Firelight flickers. One portion. Always one.',         sceneId: 'kitchen' },
      { id: 'eat',   text: 'Eat',                                   description: 'One bowl. The empty place across the table holds the scene.',               sceneId: 'eat'     },
      { id: 'wash',  text: 'Wash the dishes',                       description: 'Water is still. The reed field is visible through the small window above.', sceneId: 'sink'    },
      { id: 'lamp',  text: 'Light the lamp',                        description: 'The paper lamp glows amber against the darkening sky. She waits, looking down the road.', sceneId: 'lamp'    },
      // sleep transitions immediately into the burning scene; the 4s
      // breath of stillness now lives inside BurningScene itself, where
      // it lands on the dark wash instead of the bed.
      { id: 'sleep', text: 'Go to sleep',                           description: 'She lies down. The shoji screens glow faintly with reed-filtered moonlight.', requires: 'all-others', completionDelayMs: 0 },
    ],
    next: 'E15',
  },

  C22: {
    type: 'checklist',
    sceneId: 'temple-scene',
    tasks: [
      { id: 'ascend', text: 'Ascend', description: "The Wife's POV drifts slowly upward from the courtyard. The temple, the husband, the old monk grow small below. The sky opens." },
    ],
    next: 'E26',
  },

  // C24: same day the husband leaves — routines beginning immediately
  C24: {
    type: 'checklist',
    sceneId: 'reed-house-room',
    tasks: [
      { id: 'door',  text: 'Open the door to check if he\'s there', description: "The path is empty. His footprints are still fresh in the dirt.", sceneId: 'door'    },
      { id: 'sweep', text: 'Sweep the floor',                       description: 'The room is enormous from down here.',                          sceneId: 'floor'   },
      { id: 'cook',  text: 'Cooking',                               description: 'One portion. Already the habit of one.',                        sceneId: 'kitchen' },
      { id: 'eat',   text: 'Eat',                                   description: 'One bowl. The empty space across is new and sharp.',            sceneId: 'eat'     },
      { id: 'wash',  text: 'Wash the dishes',                       description: 'The reed field outside the window sways.',                      sceneId: 'sink'    },
      { id: 'lamp',  text: 'Light the lamp',                        description: 'She lingers, looking down the road. No one comes.',             sceneId: 'lamp'    },
      // sleep transitions immediately into the burning scene; the 4s
      // breath of stillness now lives inside BurningScene itself, where
      // it lands on the dark wash instead of the bed.
      { id: 'sleep', text: 'Go to sleep',                           description: 'The mat is wide. The shoji screens glow with moonlight.', requires: 'all-others', completionDelayMs: 0 },
    ],
    next: 'E23',
  },
}
