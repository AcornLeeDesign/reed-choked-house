// Audio engine — singleton, lazy.
//
// Four layers:
//
//   1. click  — pre-recorded mp3 (./click.mp3), fetched + decoded once on
//               first user gesture and replayed via AudioBufferSourceNode
//               so rapid clicks layer instead of cutting each other off.
//   2. whoosh — band-passed noise sweep, synthesised
//   3. music  — decoded mp3 (./pure-elegance-…mp3) looped quietly in the
//               background as the ambient theme. Plays during every scene
//               EXCEPT the burning scene; fades out (2s) when entering it
//               and fades back in (2s) when leaving it.
//   4. fire   — looping low-pass rumble + scheduled high-pass crackle
//               bursts; only active on the burning scene. Begins fading in
//               2s after the user enters the burning scene (i.e. once the
//               piano music has gone silent).
//
// Browser autoplay policy: AudioContext can be created any time but stays
// suspended until a user gesture. Every public method calls _resume() so
// the first click both unlocks audio AND plays the click. The first
// successful resume also starts the looping music for whatever scene is
// currently active.

import clickSoundUrl from './click.mp3'
import musicUrl from './pure-elegance-theo-gerard-main-version-25156-00-49-128k.mp3'

const FIRE_SCENE_ID = 'burning-reed-house'

const FIRE_TARGET_GAIN  = 0.55  // immersive but doesn't bury the script
const SFX_CLICK_GAIN    = 0.85  // mp3 is already mixed; just trim a hair
const SFX_WHOOSH_GAIN   = 0.16
const MUSIC_TARGET_GAIN = 0.20  // quiet background bed

const FIRE_FADE_IN_S    = 1.4
const FIRE_FADE_OUT_S   = 0.7

// Entering the burning scene: piano fades out over 2s, then the fire layer
// begins its 1.4s ramp up. The 2s music fade matches BurningScene's
// SMOKE_REVEAL_DELAY_MS so the audio and visual reveals land together.
const MUSIC_FADE_OUT_S  = 2.0
const MUSIC_FADE_IN_S   = 2.0
const FIRE_PRE_DELAY_S  = 2.0   // = MUSIC_FADE_OUT_S

// Initial unlock fade-in for the music (first time the player clicks anything
// and the AudioContext is allowed to resume). Long enough to not pop, short
// enough that the player notices the room has a tone.
const MUSIC_UNLOCK_FADE_S = 1.0

// Tiny corrective ramp when a normal (non-fire) scene swap happens — pulls
// the music gain back to target in case a prior fade was interrupted.
const MUSIC_NUDGE_FADE_S = 0.5

class AudioEngine {
  constructor() {
    this.ctx           = null
    this.master        = null
    this.fireBus       = null
    this.musicBus      = null

    this.activeSceneId = null

    this.clickBuffer   = null   // decoded AudioBuffer, set after first fetch
    this.clickLoading  = null   // Promise guarding concurrent fetches

    this.musicBuffer   = null   // decoded AudioBuffer for the looping theme
    this.musicLoading  = null
    this.musicSource   = null   // active looping AudioBufferSourceNode (or null)

    this.fireSchedTimer  = null
    this.fireRumble      = null

    // Deferred-start timers for the cross-fade choreography.
    this.fireStartTimer  = null
    this.musicStartTimer = null

    this._unlocked = false
  }

  // ── Lifecycle ───────────────────────────────────────────────────────

  _ensureCtx() {
    if (this.ctx) return
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return

    this.ctx = new Ctx()

    this.master = this.ctx.createGain()
    this.master.gain.value = 1
    this.master.connect(this.ctx.destination)

    this.fireBus = this.ctx.createGain()
    this.fireBus.gain.value = 0
    this.fireBus.connect(this.master)

    this.musicBus = this.ctx.createGain()
    this.musicBus.gain.value = 0
    this.musicBus.connect(this.master)

    this._loadClick()
    this._loadMusic()
  }

  _resume() {
    this._ensureCtx()
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
        .then(() => this._unlock())
        .catch(() => {})
    } else {
      this._unlock()
    }
  }

  // First time the AudioContext is actually running, apply whatever scene
  // is already active so the music kicks in (or, if the player somehow
  // unlocked while already on the burning scene, the fire starts).
  _unlock() {
    if (this._unlocked) return
    if (!this.ctx || this.ctx.state !== 'running') return
    this._unlocked = true
    if (this.activeSceneId) this._applyScene(null, this.activeSceneId)
  }

  // ── Public scene routing ────────────────────────────────────────────

  setScene(sceneId) {
    const prev = this.activeSceneId
    this.activeSceneId = sceneId
    // Ensure the ctx exists even before the first gesture so decodeAudioData
    // (which works in suspended state) can run on the click + music mp3s in
    // the background — by the time the user first clicks, both buffers are
    // ready and the music layer can start without waiting for I/O.
    this._ensureCtx()
    if (!this.ctx || this.ctx.state !== 'running' || !this._unlocked) return
    this._applyScene(prev, sceneId)
  }

  // Drive the music ↔ fire choreography. `prev` is null on the very first
  // application (i.e. the unlock-time call), which we treat as a gentle
  // first fade-in rather than a normal mid-story scene swap.
  _applyScene(prev, scene) {
    this._clearAmbienceTimers()

    if (scene === FIRE_SCENE_ID) {
      if (prev === FIRE_SCENE_ID) return
      this._fadeMusic(0, MUSIC_FADE_OUT_S)
      this.fireStartTimer = setTimeout(() => {
        this.fireStartTimer = null
        if (this.activeSceneId === FIRE_SCENE_ID) this._startFire()
      }, FIRE_PRE_DELAY_S * 1000)
      return
    }

    const fireWasUp = this.fireRumble != null
    if (prev === FIRE_SCENE_ID || fireWasUp) {
      this._stopFire()
      // Wait for the fire to fade before bringing the piano back up; if the
      // fire never actually started (we navigated away mid pre-delay), skip
      // the wait and fade the music in immediately.
      const delayMs = fireWasUp ? FIRE_FADE_OUT_S * 1000 : 0
      this.musicStartTimer = setTimeout(() => {
        this.musicStartTimer = null
        if (this.activeSceneId !== FIRE_SCENE_ID) {
          this._fadeMusic(MUSIC_TARGET_GAIN, MUSIC_FADE_IN_S)
        }
      }, delayMs)
      return
    }

    // Normal non-fire scene swap (or the very first unlock-time application).
    const dur = prev == null ? MUSIC_UNLOCK_FADE_S : MUSIC_NUDGE_FADE_S
    this._fadeMusic(MUSIC_TARGET_GAIN, dur)
  }

  _clearAmbienceTimers() {
    if (this.fireStartTimer)  { clearTimeout(this.fireStartTimer);  this.fireStartTimer  = null }
    if (this.musicStartTimer) { clearTimeout(this.musicStartTimer); this.musicStartTimer = null }
  }

  // ── Public SFX ──────────────────────────────────────────────────────

  click() {
    this._resume()
    if (!this.ctx || !this.clickBuffer) return  // buffer not decoded yet

    const t = this.ctx.currentTime
    const src = this.ctx.createBufferSource()
    src.buffer = this.clickBuffer

    const g = this.ctx.createGain()
    g.gain.value = SFX_CLICK_GAIN

    src.connect(g).connect(this.master)
    src.start(t)
  }

  whoosh() {
    this._resume()
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const dur = 0.55

    const noise = this._makeNoiseSource(false, dur)
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.1
    filter.frequency.setValueAtTime(280, t)
    filter.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.45)
    filter.frequency.exponentialRampToValueAtTime(380, t + dur)

    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(SFX_WHOOSH_GAIN, t + 0.07)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)

    noise.connect(filter).connect(g).connect(this.master)
    noise.start(t)
    noise.stop(t + dur + 0.02)
  }

  // ── Click sample loading ────────────────────────────────────────────

  _loadClick() {
    if (this.clickBuffer || this.clickLoading) return
    this.clickLoading = fetch(clickSoundUrl)
      .then(r => r.arrayBuffer())
      .then(buf => this.ctx.decodeAudioData(buf))
      .then(decoded => { this.clickBuffer = decoded })
      .catch(() => { /* swallow — clicks just stay silent */ })
  }

  // ── Music ───────────────────────────────────────────────────────────

  _loadMusic() {
    if (this.musicBuffer || this.musicLoading) return
    this.musicLoading = fetch(musicUrl)
      .then(r => r.arrayBuffer())
      .then(buf => this.ctx.decodeAudioData(buf))
      .then(decoded => {
        this.musicBuffer = decoded
        // If the player has already unlocked audio (and isn't currently in
        // the fire scene), start the buffer source now and freshly fade in —
        // any earlier _fadeMusic call ramped a silent bus to target, so
        // restart from 0 to avoid popping in at full volume.
        if (this._unlocked && this.activeSceneId !== FIRE_SCENE_ID && this.ctx && this.musicBus) {
          const t = this.ctx.currentTime
          this.musicBus.gain.cancelScheduledValues(t)
          this.musicBus.gain.setValueAtTime(0, t)
          this._ensureMusicSource()
          this._fadeMusic(MUSIC_TARGET_GAIN, MUSIC_UNLOCK_FADE_S)
        }
      })
      .catch(() => { /* swallow — music just stays silent */ })
  }

  _ensureMusicSource() {
    if (!this.ctx || !this.musicBuffer || !this.musicBus) return
    if (this.musicSource) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.musicBuffer
    src.loop = true
    src.connect(this.musicBus)
    src.start(this.ctx.currentTime)
    this.musicSource = src
  }

  _fadeMusic(target, durationS) {
    if (!this.ctx || !this.musicBus) return
    // Spin up the source on demand the first time we try to make it audible.
    // If the buffer hasn't loaded yet, _ensureMusicSource is a no-op and the
    // gain ramp still scheduled below will line up silently — _loadMusic's
    // .then() will reset the bus and refade once the buffer arrives.
    if (target > 0) this._ensureMusicSource()
    const t = this.ctx.currentTime
    const dur = Math.max(0.01, durationS)
    this.musicBus.gain.cancelScheduledValues(t)
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t)
    this.musicBus.gain.linearRampToValueAtTime(target, t + dur)
  }

  // ── Fire ────────────────────────────────────────────────────────────

  _startFire() {
    if (!this.ctx) return
    const t = this.ctx.currentTime

    if (!this.fireRumble) {
      const rumble = this._makeNoiseSource(true)
      const lp = this.ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 220
      const rg = this.ctx.createGain()
      rg.gain.value = 0.32
      rumble.connect(lp).connect(rg).connect(this.fireBus)
      rumble.start(t)
      this.fireRumble = rumble
    }

    this.fireBus.gain.cancelScheduledValues(t)
    this.fireBus.gain.setValueAtTime(this.fireBus.gain.value, t)
    this.fireBus.gain.linearRampToValueAtTime(FIRE_TARGET_GAIN, t + FIRE_FADE_IN_S)

    if (!this.fireSchedTimer) this._scheduleNextCrackle()
  }

  _stopFire() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.fireBus.gain.cancelScheduledValues(t)
    this.fireBus.gain.setValueAtTime(this.fireBus.gain.value, t)
    this.fireBus.gain.linearRampToValueAtTime(0, t + FIRE_FADE_OUT_S)

    clearTimeout(this.fireSchedTimer)
    this.fireSchedTimer = null

    if (this.fireRumble) {
      const rumble = this.fireRumble
      this.fireRumble = null
      // Let the gain ramp finish first, then cut the source.
      setTimeout(() => { try { rumble.stop() } catch (_) {} }, FIRE_FADE_OUT_S * 1000 + 60)
    }
  }

  _scheduleNextCrackle() {
    if (!this.ctx) return
    const next = 50 + Math.random() * 240
    this.fireSchedTimer = setTimeout(() => {
      if (this.activeSceneId === FIRE_SCENE_ID) this._playCrackle()
      this._scheduleNextCrackle()
    }, next)
  }

  _playCrackle() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const dur = 0.025 + Math.random() * 0.07
    const noise = this._makeNoiseSource(false, dur + 0.05)

    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 700 + Math.random() * 1800

    const peak = 0.10 + Math.random() * 0.22
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(peak, t + 0.002)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)

    noise.connect(hp).connect(g).connect(this.fireBus)
    noise.start(t)
    noise.stop(t + dur + 0.04)
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  _makeNoiseSource(loop, durSec) {
    const sr = this.ctx.sampleRate
    const length = Math.max(1, Math.floor((durSec || 1) * sr))
    const buf = this.ctx.createBuffer(1, length, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.loop = !!loop
    return src
  }
}

const audio = new AudioEngine()
export default audio
