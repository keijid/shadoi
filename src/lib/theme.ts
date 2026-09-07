import type { CSSProperties } from 'react';

// Design tokens lifted from the Shadoi.dc.html design reference (light,
// message-app-inspired theme). Keep in sync with index.css's global rules.
export const colors = {
  bg: '#EEF1F5',
  card: '#fff',
  text: '#14181F',
  textSub: '#8B93A1',
  textMuted: '#97A0AC',
  textFaint: '#A2A9B5',
  textFaint2: '#6C7480',
  textFaint3: '#7C8492',
  textFaint4: '#4A525F',
  textFaint5: '#5A6473',
  placeholder: '#B6BCC7',
  chevron: '#C4CAD4',

  accent: '#14BE64',
  accentHover: '#0FAC59',
  accentDark: '#0F9E52',
  accentDarker: '#0B7A40',
  accentSoftBg: '#E9F9EF',
  accentSoftBorder: '#A9E9C6',
  accentBarMuted: '#C9E9D8',

  border: '#E3E7ED',
  borderSoft: '#EDF0F4',
  borderSofter: '#E4E8EE',

  neutralBg: '#F1F3F7',
  neutralBgHover: '#E7EAF0',
  weekOff: '#E4E8EE',

  blue: '#4C7BD9',
  blueBg: '#EEF3FF',

  red: '#D2564F',
  redDark: '#C4443F',
  redRec: '#E5544E',
  redBg: '#FFF0EF',

  avaAqua: '#DDE3EC',
} as const;

export const shadows = {
  card: '0 1px 2px rgba(20,24,31,.05)',
  cardStrong: '0 1px 2px rgba(20,24,31,.06)',
  primaryBtn: '0 4px 14px rgba(20,190,100,.28)',
  primaryBtnSmall: '0 3px 12px rgba(20,190,100,.26)',
  take: '0 2px 10px rgba(20,190,100,.22)',
  check: '0 8px 22px rgba(20,190,100,.3)',
} as const;

export const cardStyle: CSSProperties = {
  background: colors.card,
  borderRadius: 20,
  boxShadow: shadows.card,
};
