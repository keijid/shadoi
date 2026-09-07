// Browser TTS tuned for shadowing practice: quality-ranked voices,
// sentence chunking (better prosody + avoids Safari's long-utterance cutoff),
// real word-boundary progress, and rate calibration from measured speech.

let cachedVoices: SpeechSynthesisVoice[] | null = null;
const wpmByVoice: Record<string, number> = {};

export function supported(): boolean {
  return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
}

export function voices(): SpeechSynthesisVoice[] {
  if (!window.speechSynthesis) return [];
  const all = speechSynthesis.getVoices() || [];
  if (all.length) cachedVoices = all;
  return cachedVoices || [];
}

export function ready(): Promise<SpeechSynthesisVoice[]> {
  if (!window.speechSynthesis) return Promise.resolve([]);
  const now = voices();
  if (now.length) return Promise.resolve(now);
  return new Promise((res) => {
    let settled = false;
    const fin = () => {
      if (!settled) {
        settled = true;
        res(voices());
      }
    };
    const poll = setInterval(() => {
      if (voices().length) {
        clearInterval(poll);
        fin();
      }
    }, 120);
    setTimeout(() => {
      clearInterval(poll);
      fin();
    }, 2500);
    speechSynthesis.onvoiceschanged = () => {
      clearInterval(poll);
      fin();
    };
  });
}

const PREMIUM = /natural|neural|online|enhanced|premium|siri|google|wavenet|studio/i;
const NOVELTY =
  /albert|bad ?news|bahh|bells|boing|bubbles|cellos|good ?news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|princess|deranged|hysterical|grandma|grandpa|rocko|shelley|sandy|eddy|flo|reed/i;
// Legacy Apple voices are reported with LOCALIZED names (ベル, 道化…), so the
// English novelty list must be matched against the URI too.
const GOOD_LEGACY =
  /samantha|alex|daniel|karen|moira|rishi|tessa|fiona|serena|veena|nicky|aaron|allison|ava|susan|tom|zoe|siri|premium|enhanced|neural|natural/i;

function isNovelty(v: SpeechSynthesisVoice): boolean {
  const uri = v.voiceURI || '';
  const name = v.name || '';
  if (NOVELTY.test(name) || NOVELTY.test(uri)) return true;
  // Any other legacy com.apple.speech.synthesis.voice.* that isn't a known good one.
  if (/com\.apple\.speech\.synthesis\.voice\./i.test(uri) && !GOOD_LEGACY.test(uri) && !GOOD_LEGACY.test(name)) {
    return true;
  }
  return false;
}

function accentOf(v: SpeechSynthesisVoice): string {
  const lang = (v.lang || '').replace('_', '-');
  return lang || 'en-US';
}

function score(v: SpeechSynthesisVoice, prefer?: string): number {
  let s = 0;
  if (PREMIUM.test(v.name || '')) s += 40;
  if (v.localService === false) s += 25;
  if (accentOf(v) === (prefer || 'en-US')) s += 30;
  if (/^en-US|^en-GB/.test(accentOf(v))) s += 5;
  if (v.default) s += 3;
  if (/com\.apple\.(voice|ttsbundle)/i.test(v.voiceURI || '')) s += 15;
  if (isNovelty(v)) s -= 200;
  return s;
}

export interface EnglishVoiceInfo {
  voice: SpeechSynthesisVoice;
  name: string;
  accent: string;
  novelty: boolean;
  premium: boolean;
  s: number;
}

export function englishVoices(prefer?: string): EnglishVoiceInfo[] {
  return voices()
    .filter((v) => /^en(-|_|$)/i.test(v.lang || ''))
    .map((v) => ({
      voice: v,
      name: v.name,
      accent: accentOf(v),
      novelty: isNovelty(v),
      premium: PREMIUM.test(v.name || '') || v.localService === false,
      s: score(v, prefer),
    }))
    .sort((a, b) => b.s - a.s)
    .filter((v, _, all) => !v.novelty || all.every((x) => x.novelty));
}

export function pickVoice(prefer?: string, name?: string): SpeechSynthesisVoice | null {
  const list = englishVoices(prefer);
  if (!list.length) return null;
  if (name) {
    const hit = list.find((x) => x.name === name);
    if (hit) return hit.voice;
  }
  return list[0].voice;
}

// Split into speakable sentences, keeping punctuation for natural intonation.
export function sentences(text: string): string[] {
  const parts = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?;]+[.!?;]*\s*/g) || [];
  const out: string[] = [];
  parts
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((s) => {
      // Merge very short fragments into the previous sentence.
      if (out.length && s.split(/\s+/).length < 3) out[out.length - 1] += ' ' + s;
      else out.push(s);
    });
  return out.length ? out : [String(text).trim()];
}

function wpmFor(voice: SpeechSynthesisVoice | null | undefined): number {
  const key = voice ? voice.name : 'default';
  return wpmByVoice[key] || 160;
}

// Estimated spoken duration in seconds, calibrated by past measurements.
export function estimate(text: string, rate: number, voice?: SpeechSynthesisVoice | null): number {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  const wpm = wpmFor(voice) * Math.max(0.4, rate);
  return Math.max(0.9, words / (wpm / 60));
}

export function cancel(): void {
  if (!window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice | null;
  gap?: number;
  onSentence?: (index: number, total: number) => void;
  onProgress?: (progress: number) => void;
}

export interface SpeakHandle {
  promise: Promise<void>;
  stop: () => void;
}

/**
 * Speak text sentence by sentence.
 */
export function speak(text: string, opts: SpeakOptions = {}): SpeakHandle {
  const { rate = 1, pitch = 1, voice = null, gap = 260, onSentence, onProgress } = opts;
  const list = sentences(text);
  const wordCounts = list.map((s) => s.split(/\s+/).filter(Boolean).length);
  const totalWords = wordCounts.reduce((a, b) => a + b, 0) || 1;
  const before = wordCounts.map((_, i) => wordCounts.slice(0, i).reduce((a, b) => a + b, 0));
  const safeRate = Math.max(0.4, Math.min(1.6, rate));

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  const t0 = performance.now();

  cancel();

  const stop = () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    if (keepAlive) clearInterval(keepAlive);
    cancel();
  };

  // Safari/Chrome sometimes leave synthesis paused after tab churn.
  keepAlive = setInterval(() => {
    if (stopped) return;
    try {
      if (speechSynthesis.paused) speechSynthesis.resume();
    } catch {
      /* ignore */
    }
  }, 1500);

  const promise = new Promise<void>((resolve) => {
    const finish = () => {
      if (keepAlive) clearInterval(keepAlive);
      if (!stopped) {
        const secs = (performance.now() - t0) / 1000;
        if (secs > 1) {
          const key = voice ? voice.name : 'default';
          const measured = totalWords / (secs / 60) / safeRate;
          if (measured > 60 && measured < 320) {
            wpmByVoice[key] = wpmByVoice[key] ? wpmByVoice[key] * 0.6 + measured * 0.4 : measured;
          }
        }
      }
      resolve();
    };

    const runOne = (i: number) => {
      if (stopped) return resolve();
      if (i >= list.length) {
        if (onProgress) onProgress(1);
        return finish();
      }
      if (onSentence) onSentence(i, list.length);

      const u = new SpeechSynthesisUtterance(list[i]);
      u.rate = safeRate;
      u.pitch = pitch;
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = 'en-US';
      }

      let words = 0;
      let done = false;
      const fin = () => {
        if (done) return;
        done = true;
        if (timer) clearTimeout(timer);
        if (onProgress) onProgress(Math.min(1, (before[i] + wordCounts[i]) / totalWords));
        if (stopped) return resolve();
        timer = setTimeout(() => runOne(i + 1), gap);
      };

      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return;
        words += 1;
        if (onProgress) onProgress(Math.min(1, (before[i] + Math.min(words, wordCounts[i])) / totalWords));
      };
      u.onend = fin;
      u.onerror = fin;

      // Fallback: some engines never fire onend.
      const cap = (estimate(list[i], safeRate, voice) + 2.5) * 1000;
      timer = setTimeout(fin, cap);

      // Smooth progress between boundary events (engines without onboundary).
      const s0 = performance.now();
      const est = estimate(list[i], safeRate, voice);
      const smooth = () => {
        if (done || stopped) return;
        if (!words && onProgress) {
          const p = Math.min(1, (performance.now() - s0) / 1000 / est);
          onProgress(Math.min(1, (before[i] + p * wordCounts[i]) / totalWords));
        }
        if (!done && !stopped) requestAnimationFrame(smooth);
      };
      requestAnimationFrame(smooth);

      speechSynthesis.speak(u);
    };

    runOne(0);
  });

  return { promise, stop };
}
