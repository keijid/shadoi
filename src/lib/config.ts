import type { AppConfig } from '../types';

// Design-time defaults (see design_handoff README "設定値"). A settings
// screen can expose these later; for the MVP they're fixed constants.
export const APP_CONFIG: AppConfig = {
  dailyGoalMin: 10,
  defaultSpeed: 1,
  hideScriptFirst: false,
  ttsVoice: 'en-US',
};

export const SPEED_OPTIONS = [0.6, 0.8, 1, 1.2] as const;

/**
 * Pause between repeats of the looping reference readout — long enough to
 * hear the boundary and reset your breath, wider at slow speeds.
 */
export const loopGapMs = (rate: number) => (rate < 0.9 ? 1600 : 1200);
