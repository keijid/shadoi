import { useEffect, useRef, useState } from 'react';
import type { AppConfig, Draft, HistoryEntry, Level, LevelFilter, Material, MaterialWithWords, Screen, Take } from '../types';
import { BUILTIN_MATERIALS, buildHistory, wordCount } from '../lib/materials';
import * as tts from '../lib/tts';
import { dayGap, dayKey, loadPersisted, savePersisted, shortLabel } from '../lib/storage';
import { loopGapMs } from '../lib/config';

interface State {
  screen: Screen;
  mid: string;
  level: LevelFilter;
  query: string;
  custom: Material[];
  speed: number;
  showScript: boolean;
  showJa: boolean;
  speaking: boolean;
  /** The readout is repeating until stopped (practice mode). */
  looping: boolean;
  playingMine: boolean;
  recording: boolean;
  err: string;
  plays: number;
  takeCount: number;
  playingId: string | null;
  progress: number;
  sessionSec: number;
  voiceName: string;
  line: number;
  todayMin: number;
  streak: number;
  history: HistoryEntry[];
  draft: Draft;
}

interface SpeakOpts {
  /** Override the current speed (used when the rate changes mid-playback). */
  rate?: number;
  /** Repeat the script until stopped. */
  loop?: boolean;
}

function emptyDraft(): Draft {
  return { title: '', speaker: '', level: 'B1', en: '', ja: '' };
}

function buildInitialState(config: AppConfig): State {
  const saved = loadPersisted();
  const today = dayKey(new Date());
  let history = saved.history || buildHistory();
  let todayMin = saved.todayMin ?? 4;
  let streak = saved.streak ?? 12;
  if (saved.day && saved.day !== today) {
    const gap = dayGap(saved.day, today);
    if (gap > 1 || todayMin < config.dailyGoalMin) {
      streak = todayMin >= config.dailyGoalMin && gap === 1 ? streak : 0;
    }
    for (let i = 0; i < Math.min(gap, 14); i++) {
      history = history
        .slice(1)
        .concat([{ label: shortLabel(new Date()), min: 0, today: true }])
        .map((d, idx, arr) => ({ ...d, today: idx === arr.length - 1 }));
    }
    todayMin = 0;
  }
  return {
    screen: 'home',
    mid: 'm1',
    level: saved.level || 'all',
    query: '',
    custom: saved.custom || [],
    speed: config.defaultSpeed,
    showScript: !config.hideScriptFirst,
    showJa: false,
    speaking: false,
    looping: false,
    playingMine: false,
    recording: false,
    err: '',
    plays: 0,
    takeCount: 0,
    playingId: null,
    progress: 0,
    sessionSec: 0,
    voiceName: saved.voiceName || '',
    line: -1,
    todayMin,
    streak,
    history,
    draft: emptyDraft(),
  };
}

export function useShadoiApp(config: AppConfig) {
  const [state, setState] = useState<State>(() => buildInitialState(config));
  const [voiceOptions, setVoiceOptions] = useState<{ name: string; label: string }[]>([]);

  const takesRef = useRef<Record<string, Take[]>>({});
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const spRef = useRef<tts.SpeakHandle | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const recAutoPlayRef = useRef(true);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakOptsRef = useRef<SpeakOpts>({});
  const screenRef = useRef<Screen>(state.screen);
  useEffect(() => {
    screenRef.current = state.screen;
  }, [state.screen]);

  function patch(update: Partial<State> | ((s: State) => Partial<State>)) {
    setState((s) => ({ ...s, ...(typeof update === 'function' ? update(s) : update) }));
  }

  function persist(extra?: Partial<{ history: HistoryEntry[]; todayMin: number; streak: number; custom: Material[]; level: LevelFilter; voiceName: string }>) {
    const merged = { ...state, ...(extra || {}) };
    savePersisted({
      history: merged.history,
      todayMin: merged.todayMin,
      streak: merged.streak,
      custom: merged.custom,
      level: merged.level,
      voiceName: merged.voiceName,
      day: dayKey(new Date()),
    });
  }

  // --- Session timer: ticks once per second while on the practice screen. ---
  useEffect(() => {
    const id = setInterval(() => {
      if (screenRef.current === 'practice') patch((s) => ({ sessionSec: s.sessionSec + 1 }));
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- TTS setup: pick the best available English voice once on mount. ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tts.supported()) {
        patch({ err: 'このブラウザは音声読み上げに対応していません。Chrome / Safari / Edge の最新版をお試しください。' });
        return;
      }
      await tts.ready();
      if (cancelled) return;
      const list = tts.englishVoices(config.ttsVoice);
      const voice = tts.pickVoice(config.ttsVoice, state.voiceName);
      voiceRef.current = voice;
      setVoiceOptions(list.map((v) => ({ name: v.name, label: (v.premium ? '★ ' : '') + v.name + ' (' + v.accent + ')' })));
      patch({
        voiceName: voice ? voice.name : '',
        err: voice ? '' : '英語の読み上げ音声が見つかりませんでした。OSの音声設定で英語ボイスを追加してください。',
      });
    })().catch(() => {
      if (!cancelled) patch({ err: '読み上げエンジンの読み込みに失敗しました。ページを再読み込みしてください。' });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Unmount: stop everything and release recorded blob URLs. ---
  useEffect(() => {
    return () => {
      if (spRef.current) spRef.current.stop();
      tts.cancel();
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          /* ignore */
        }
      }
      if (recRef.current) {
        recAutoPlayRef.current = false;
        try {
          recRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      Object.values(takesRef.current)
        .flat()
        .forEach((t) => URL.revokeObjectURL(t.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function allMaterials(): MaterialWithWords[] {
    return BUILTIN_MATERIALS.concat(state.custom).map((d) => ({ ...d, words: wordCount(d.en) }));
  }

  function findMaterial(id?: string): MaterialWithWords {
    const all = allMaterials();
    return all.find((m) => m.id === (id || state.mid)) || all[0];
  }

  function takeArr(mid?: string): Take[] {
    return takesRef.current[mid || state.mid] || [];
  }

  /** Stop the reference readout, including a pending repeat. Leaves recording alone. */
  function stopSpeech() {
    if (spRef.current) {
      spRef.current.stop();
      spRef.current = null;
    }
    tts.cancel();
    // Cancels a repeat that is waiting out the gap between passes.
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    patch((s) => (s.speaking || s.line >= 0 ? { speaking: false, looping: false, progress: 0, line: -1 } : {}));
  }

  /** Stop playback of a recorded take. */
  function stopMine() {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        /* ignore */
      }
      audioRef.current = null;
    }
    patch((s) => (s.playingMine ? { playingMine: false, playingId: null, progress: 0 } : {}));
  }

  /**
   * Stop the in-flight recording; its onstop handler stores the take.
   * `autoPlay` replays it straight away (what the stop button does) — off when
   * we are only tearing down, so navigating away can't start audio.
   */
  function stopRecording(autoPlay: boolean) {
    recAutoPlayRef.current = autoPlay;
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {
        /* ignore */
      }
    } else {
      patch((s) => (s.recording ? { recording: false } : {}));
    }
  }

  function stopAll() {
    stopSpeech();
    stopMine();
    stopRecording(false);
  }

  /**
   * Read the script aloud. `loop` repeats it until something stops it, which
   * is the normal practice mode — shadowing is repetition, and tapping play
   * between every pass is the thing you least want to do while speaking.
   */
  function speakScript(opts: SpeakOpts = {}) {
    if (!tts.supported() || !voiceRef.current) {
      patch({ err: '読み上げ音声が使えません。' });
      return;
    }
    speakOptsRef.current = opts;
    const { loop } = opts;
    const m = findMaterial();
    const rate = opts.rate ?? state.speed;

    const runOnce = () => {
      patch((s) => ({ speaking: true, looping: !!loop, plays: s.plays + 1, progress: 0, line: 0 }));
      const sp = tts.speak(m.en, {
        rate,
        voice: voiceRef.current,
        gap: rate < 0.9 ? 420 : 260,
        onSentence: (i) => patch({ line: i }),
        onProgress: (p) => patch({ progress: p }),
      });
      spRef.current = sp;
      sp.promise.then(() => {
        if (spRef.current !== sp) return;
        spRef.current = null;
        if (loop) {
          // `speaking` stays true across the pause so the transport doesn't
          // flicker between repeats.
          patch({ progress: 0, line: -1 });
          loopTimerRef.current = setTimeout(runOnce, loopGapMs(rate));
          return;
        }
        patch({ speaking: false, looping: false, progress: 0, line: -1 });
      });
    };

    runOnce();
  }

  function playTake(t: Take) {
    tts.cancel();
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        /* ignore */
      }
    }
    const a = new Audio(t.url);
    audioRef.current = a;
    a.ontimeupdate = () => {
      if (a.duration && isFinite(a.duration)) patch({ progress: a.currentTime / a.duration });
    };
    a.onended = () => patch({ playingMine: false, playingId: null, progress: 0 });
    a.onerror = () => patch({ playingMine: false, playingId: null, err: '録音の再生に失敗しました。' });
    patch({ playingMine: true, playingId: t.id, progress: 0 });
    a.play().catch(() => patch({ playingMine: false, playingId: null, err: '録音の再生に失敗しました。' }));
  }

  async function startRec() {
    // Shadowing means speaking over the reference, so the readout runs
    // alongside the recorder rather than being stopped by it.
    stopSpeech();
    stopMine();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      const type = types.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: BlobPart[] = [];
      const mid = state.mid;
      const t0 = Date.now();
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        const take: Take = { id: 't' + t0, url: URL.createObjectURL(blob), sec: Math.max(1, Math.round((Date.now() - t0) / 1000)), at: new Date() };
        takesRef.current[mid] = (takesRef.current[mid] || []).concat([take]);
        recRef.current = null;
        patch((s) => ({ recording: false, takeCount: s.takeCount + 1 }));
        if (recAutoPlayRef.current) playTake(take);
      };
      recRef.current = rec;
      recAutoPlayRef.current = true;
      rec.start();
      patch({ recording: true, err: '' });
      // Without an English voice the take is still worth recording — just
      // without a reference to shadow.
      if (voiceRef.current) speakScript({ loop: true });
    } catch {
      patch({ err: 'マイクを使用できませんでした。ブラウザのマイク許可を確認してください。' });
    }
  }

  function deleteTake(t: Take) {
    const mid = state.mid;
    if (state.playingId === t.id) stopAll();
    URL.revokeObjectURL(t.url);
    takesRef.current[mid] = takeArr(mid).filter((x) => x.id !== t.id);
    patch((s) => ({ takeCount: Math.max(0, s.takeCount - 1) }));
  }

  function openMat(id: string) {
    stopAll();
    patch({ screen: 'practice', mid: id, sessionSec: 0, plays: 0 });
  }

  // --- Navigation ---
  function goBack() {
    stopAll();
    patch({ screen: state.screen === 'result' ? 'practice' : 'library' });
  }
  function goHome() {
    stopAll();
    patch({ screen: 'home' });
  }
  function goLibrary() {
    stopAll();
    patch({ screen: 'library' });
  }
  function goAdd() {
    patch({ screen: 'add' });
  }

  // --- Library ---
  function setLevel(l: LevelFilter) {
    patch({ level: l });
    persist({ level: l });
  }
  function setQuery(q: string) {
    patch({ query: q });
  }
  function clearQuery() {
    patch({ query: '' });
  }
  function deleteCustomMaterial(id: string) {
    const custom = state.custom.filter((c) => c.id !== id);
    patch({ custom, mid: state.mid === id ? 'm1' : state.mid });
    persist({ custom });
  }

  // --- Add material ---
  function setDraftField<K extends keyof Draft>(key: K, value: Draft[K]) {
    patch((s) => ({ draft: { ...s.draft, [key]: value } }));
  }
  function saveMaterial() {
    const d = state.draft;
    const ok = !!d.title.trim() && wordCount(d.en) >= 5;
    if (!ok) return;
    const id = 'c' + Date.now();
    const item: Material = { id, title: d.title.trim(), speaker: d.speaker.trim(), level: d.level, en: d.en.trim(), ja: d.ja.trim(), done: 0, custom: true };
    const custom = state.custom.concat([item]);
    patch({ custom, draft: emptyDraft() });
    persist({ custom });
    openMat(id);
  }

  // --- Practice: script visibility ---
  function toggleScript() {
    patch((s) => ({ showScript: !s.showScript }));
  }
  function toggleJa() {
    patch((s) => ({ showJa: !s.showJa }));
  }
  function setVoice(name: string) {
    voiceRef.current = tts.pickVoice(config.ttsVoice, name);
    stopAll();
    patch({ voiceName: name });
    persist({ voiceName: name });
  }

  // --- Practice: transport ---
  function playRef() {
    if (state.speaking) {
      stopSpeech();
      return;
    }
    stopSpeech();
    stopMine();
    speakScript({ loop: true });
  }
  function toggleRec() {
    if (state.recording) {
      // The take is over: silence the reference so it can't bleed into the
      // replay that follows.
      stopSpeech();
      stopRecording(true);
    } else {
      startRec();
    }
  }
  function setSpeed(next: number) {
    // Re-tapping the current speed shouldn't interrupt a pass in progress.
    if (next === state.speed) return;
    const wasSpeaking = state.speaking;
    const current = speakOptsRef.current;
    patch({ speed: next });
    // The readout can't change rate mid-utterance, so restart it at the new
    // speed, in whichever mode it was already running. A recording in
    // progress keeps running.
    if (wasSpeaking) {
      stopSpeech();
      speakScript({ ...current, rate: next });
    }
  }
  function playTakeById(id: string) {
    const t = takeArr().find((x) => x.id === id);
    if (!t) return;
    if (state.playingId === id) {
      stopAll();
      return;
    }
    stopAll();
    playTake(t);
  }
  function deleteTakeById(id: string) {
    const t = takeArr().find((x) => x.id === id);
    if (t) deleteTake(t);
  }

  // --- Result ---
  function goResult() {
    stopAll();
    patch({ screen: 'result' });
  }
  function backToPractice() {
    patch({ screen: 'practice' });
  }
  function saveSession() {
    const goalMin = config.dailyGoalMin;
    const min = Math.max(1, Math.round(state.sessionSec / 60));
    const history = state.history.map((h, i) => (i === state.history.length - 1 ? { ...h, min: h.min + min } : h));
    const todayMin = state.todayMin + min;
    const streak = todayMin >= goalMin && state.todayMin < goalMin ? state.streak + 1 : state.streak;
    stopAll();
    patch({ history, todayMin, streak, screen: 'home' });
    persist({ history, todayMin, streak });
  }

  const currentMaterial = findMaterial();
  const todayMaterial = findMaterial('m1');
  const q = state.query.trim().toLowerCase();
  const filteredMaterials = allMaterials().filter(
    (x) =>
      (state.level === 'all' || x.level === state.level) &&
      (!q || (x.title + ' ' + x.speaker + ' ' + x.en + ' ' + (x.ja || '')).toLowerCase().includes(q)),
  );
  const takes = takeArr();

  return {
    config,
    state,
    voiceOptions,
    currentMaterial,
    todayMaterial,
    allMaterials: allMaterials(),
    filteredMaterials,
    takes,

    goBack,
    goHome,
    goLibrary,
    goAdd,
    openMat,

    setLevel,
    setQuery,
    clearQuery,
    deleteCustomMaterial,

    setDraftField,
    saveMaterial,

    toggleScript,
    toggleJa,
    setVoice,

    playRef,
    toggleRec,
    setSpeed,
    playTakeById,
    deleteTakeById,

    goResult,
    backToPractice,
    saveSession,
  };
}

export type ShadoiApp = ReturnType<typeof useShadoiApp>;
export type { Level };
