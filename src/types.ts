export type Level = 'A2' | 'B1' | 'B2' | 'C1';
export type LevelFilter = 'all' | Level;
export type Screen = 'home' | 'library' | 'add' | 'practice' | 'result';

export interface Material {
  id: string;
  title: string;
  speaker: string;
  level: Level;
  done: number;
  en: string;
  ja: string;
  custom?: boolean;
}

export interface MaterialWithWords extends Material {
  words: number;
}

export interface HistoryEntry {
  label: string;
  min: number;
  today: boolean;
}

export interface Take {
  id: string;
  url: string;
  sec: number;
  at: Date;
}

export interface Draft {
  title: string;
  speaker: string;
  level: Level;
  en: string;
  ja: string;
}

export interface PersistedState {
  history?: HistoryEntry[];
  todayMin?: number;
  streak?: number;
  custom?: Material[];
  level?: LevelFilter;
  voiceName?: string;
  day?: string;
}

/** Design-time config; in production these would come from a settings screen. */
export interface AppConfig {
  dailyGoalMin: number;
  defaultSpeed: number;
  hideScriptFirst: boolean;
  ttsVoice: 'en-US' | 'en-GB' | 'en-AU';
}
