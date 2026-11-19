"use client"

const SOUND_KEY = "fj_game_sound_enabled"
const AMBIANCE_KEY = "fj_game_ambiance_enabled"

let audioCtx: AudioContext | null = null
let ambianceTimer: number | null = null
let ambianceActive = false
let ambianceStep = 0

function getRawCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return null
      audioCtx = new Ctx()
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {})
    }
    return audioCtx
  } catch {
    return null
  }
}

function getCtx(): AudioContext | null {
  if (!isSoundEnabled()) return null
  return getRawCtx()
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true
  try {
    const val = window.localStorage.getItem(SOUND_KEY)
    return val === null ? true : val === "1"
  } catch {
    return true
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(SOUND_KEY, enabled ? "1" : "0")
    window.dispatchEvent(new CustomEvent("fj-sound-toggled", { detail: enabled }))
  } catch {}
}

function tone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  gainPeak = 0.14,
  endFreq?: number,
) {
  const now = ctx.currentTime + startOffset
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration)
  }
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(gainPeak, now + Math.min(0.015, duration * 0.25))
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

function noiseBurst(ctx: AudioContext, startOffset: number, duration: number, gainPeak = 0.08, highpassHz = 600) {
  const now = ctx.currentTime + startOffset
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35))
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = "highpass"
  filter.frequency.setValueAtTime(highpassHz, now)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(gainPeak, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(now)
}

/** Crisp wooden tactile piece move (Chess, Ludo, Tic-Tac-Toe, 2048, Puzzle, Memory) */
export function playMove(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 260, 0, 0.075, "triangle", 0.16, 135)
  noiseBurst(ctx, 0, 0.035, 0.07, 900)
}

/** Punchy capture / disc drop impact (Chess capture, Ludo capture, Connect 4 drop) */
export function playCapture(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 190, 0, 0.13, "sawtooth", 0.13, 68)
  tone(ctx, 340, 0.01, 0.09, "triangle", 0.14, 120)
  noiseBurst(ctx, 0, 0.06, 0.11, 500)
}

/** Dramatic alert chime (Chess Check!) */
export function playCheck(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 587.33, 0, 0.14, "triangle", 0.15) // D5
  tone(ctx, 880, 0.11, 0.22, "triangle", 0.16) // A5
}

/** Warm tactile wooden draughts disc slide & click */
export function playDraughtsMove(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 310, 0, 0.07, "triangle", 0.17, 160)
  noiseBurst(ctx, 0, 0.03, 0.07, 1100)
}

/** Crisp draughts capture impact (supports multi-jump rafle) */
export function playDraughtsCapture(count = 1): void {
  const ctx = getCtx()
  if (!ctx) return
  const loops = Math.min(Math.max(1, count), 4)
  for (let i = 0; i < loops; i++) {
    const delay = i * 0.085
    tone(ctx, 380 + i * 40, delay, 0.075, "triangle", 0.18, 140)
    tone(ctx, 210, delay + 0.015, 0.09, "sine", 0.16, 85)
    noiseBurst(ctx, delay, 0.04, 0.11, 650)
  }
}

/** Royal fanfare when a pawn is crowned King / Dame (C5 -> E5 -> G5) */
export function playDraughtsKing(): void {
  const ctx = getCtx()
  if (!ctx) return
  const notes = [
    { f: 523.25, t: 0, d: 0.12 }, // C5
    { f: 659.25, t: 0.09, d: 0.14 }, // E5
    { f: 783.99, t: 0.18, d: 0.28 }, // G5
  ]
  for (const n of notes) {
    tone(ctx, n.f, n.t, n.d, "triangle", 0.17)
    tone(ctx, n.f * 2, n.t, n.d * 0.7, "sine", 0.06)
  }
}

/** Subtle tactile selection click */
export function playDraughtsSelect(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 520, 0, 0.035, "sine", 0.09, 360)
}

/** Rapid wooden dice rattle (Ludo roll) */
export function playDice(): void {
  const ctx = getCtx()
  if (!ctx) return
  const clicks = [0, 0.045, 0.095, 0.155, 0.22]
  clicks.forEach((offset, i) => {
    tone(ctx, 340 + i * 35, offset, 0.04, "triangle", 0.1, 180)
    noiseBurst(ctx, offset, 0.025, 0.06, 1200)
  })
}

/** Bright positive point / match / food / home arrival chime */
export function playScore(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 523.25, 0, 0.11, "sine", 0.13) // C5
  tone(ctx, 783.99, 0.075, 0.16, "sine", 0.14) // G5
}

/** Subtle crisp UI tap */
export function playClick(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 480, 0, 0.04, "sine", 0.08, 320)
}

/** Urgent turn timer countdown tick */
export function playTick(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 920, 0, 0.045, "square", 0.05, 760)
}

/** Triumphant victory fanfare (C5 -> E5 -> G5 -> C6 with warm harmonic) */
export function playWin(): void {
  const ctx = getCtx()
  if (!ctx) return
  const notes = [
    { f: 523.25, t: 0, d: 0.16 }, // C5
    { f: 659.25, t: 0.11, d: 0.16 }, // E5
    { f: 783.99, t: 0.22, d: 0.18 }, // G5
    { f: 1046.5, t: 0.34, d: 0.48 }, // C6
  ]
  for (const n of notes) {
    tone(ctx, n.f, n.t, n.d, "triangle", 0.16)
    tone(ctx, n.f * 1.5, n.t, n.d * 0.85, "sine", 0.06)
  }
}

/** Expressive descending defeat / game-over cadence */
export function playLose(): void {
  const ctx = getCtx()
  if (!ctx) return
  const notes = [
    { f: 392.0, t: 0, d: 0.18 }, // G4
    { f: 349.23, t: 0.15, d: 0.18 }, // F4
    { f: 311.13, t: 0.3, d: 0.22 }, // Eb4
    { f: 261.63, t: 0.46, d: 0.42 }, // C4
  ]
  for (const n of notes) {
    tone(ctx, n.f, n.t, n.d, "sawtooth", 0.075, n.f * 0.96)
    tone(ctx, n.f, n.t, n.d, "triangle", 0.1)
  }
}

/** Balanced neutral chime for Draw / Forfeit / Ended */
export function playDraw(): void {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 440, 0, 0.16, "triangle", 0.12) // A4
  tone(ctx, 523.25, 0.14, 0.26, "triangle", 0.12) // C5
}

export function isAmbianceEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(AMBIANCE_KEY) === "1"
  } catch {
    return false
  }
}

export function setAmbianceEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AMBIANCE_KEY, enabled ? "1" : "0")
  } catch {}
  if (enabled) startAmbiance()
  else stopAmbiance()
}

// Warm chill lo-fi ambient chord progression (Cmaj9 -> Am9 -> Fmaj9 -> G6)
const AMBIENT_CHORDS = [
  [130.81, 196.0, 246.94, 293.66], // Cmaj9
  [110.0, 164.81, 246.94, 261.63], // Am9
  [87.31, 164.81, 220.0, 261.63], // Fmaj9
  [98.0, 196.0, 246.94, 329.63], // G6
]
const SPARKLE_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0]

function playAmbientBar() {
  if (!ambianceActive) return
  const ctx = getRawCtx()
  if (!ctx) return

  const chord = AMBIENT_CHORDS[ambianceStep % AMBIENT_CHORDS.length]
  const now = ctx.currentTime

  // Soft low-pass filter for warm dreamy studio pad
  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.setValueAtTime(680, now)
  filter.connect(ctx.destination)

  for (const freq of chord) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.022, now + 1.1)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.1)
    osc.connect(gain)
    gain.connect(filter)
    osc.start(now)
    osc.stop(now + 4.2)
  }

  // Gentle pentatonic sparkle note mid-bar
  const sparkle = SPARKLE_NOTES[(ambianceStep * 2 + 1) % SPARKLE_NOTES.length]
  tone(ctx, sparkle, 1.8, 1.3, "triangle", 0.018)

  ambianceStep += 1
}

export function startAmbiance(): void {
  if (typeof window === "undefined") return
  if (ambianceActive) return
  ambianceActive = true
  playAmbientBar()
  ambianceTimer = window.setInterval(playAmbientBar, 3800)
}

export function stopAmbiance(): void {
  ambianceActive = false
  if (ambianceTimer !== null && typeof window !== "undefined") {
    window.clearInterval(ambianceTimer)
    ambianceTimer = null
  }
}
