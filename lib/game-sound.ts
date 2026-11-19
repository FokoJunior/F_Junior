"use client"

const SOUND_KEY = "fj_game_sound_enabled"

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!isSoundEnabled()) return null
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
