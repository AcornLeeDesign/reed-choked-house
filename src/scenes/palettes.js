// Named tonal ramps for AsciiScene. Every palette is exactly four tiers:
// AsciiScene buckets each cell of the source image into one of light / mid /
// shadow / dark by luminance, so anything more granular than four hex values
// would just be ignored. Tune values here to reshade across scenes.

// Warm interior (cream-lit walls → tan → dark wood → near-black). Sampled
// from public/room.png so the entire reed-house phase reads as a single
// continuous space rather than a different room per scene. Used by every
// indoor / domestic scene: the main room, kitchen, floor, sink, eat, the
// closed-door beat, and the lamp scene.
export const ROOM = {
  light:  '#ead4ad',
  mid:    '#8a6a48',
  shadow: '#3a2618',
  dark:   '#0a0604',
}

// Door-interior view onto the road / reed field. Bright tier shifts to a
// sage-yellow so the centre of the frame (the window opening Miyagi peers
// out of, hoping for Katsushirō) reads as outside light — green reeds and
// late-day sky — while the surrounding shutters/walls fall back to the
// same dark wood as ROOM, keeping the house contiguous.
export const LOOK_OUTSIDE = {
  light:  '#c4c870',
  mid:    '#6e7448',
  shadow: '#3a2618',
  dark:   '#0a0604',
}

// Ember + crimson ramp for the burning-house beat. Light tier is the live
// flame highlight; mid is burning red-orange; shadow is dark crimson; dark
// keeps a faint red bias rather than neutral black so the deepest cells
// still feel hot, not absent. Reads as fire on top of BurningScene's dark
// radial wash + grain noise overlay.
export const FIRE = {
  light:  '#ff8a3c',
  mid:    '#b83018',
  shadow: '#3a0c04',
  dark:   '#0a0302',
}

// Dawn-gold temple courtyard. Pale stone highlights, warm ochre mid, deep
// umber shadow, near-black wood. Tuned for the temple-scene image.
export const TEMPLE = {
  light:  '#e8e4dc',
  mid:    '#a89880',
  shadow: '#5c4a36',
  dark:   '#1a1208',
}

// Ascension. Cream highlights, peach mid, slate shadow, slate-blue "dark"
// (deliberately *not* true black) so the densest cells still read as cloud
// rather than silhouette — keeps the heaven beat airborne.
export const HEAVEN = {
  light:  '#fdf6e8',
  mid:    '#e8c89a',
  shadow: '#9aa4b4',
  dark:   '#3d4860',
}
