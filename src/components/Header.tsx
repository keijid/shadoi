import type { ShadoiApp } from '../hooks/useShadoiApp';
import { colors } from '../lib/theme';

export function Header({ app }: { app: ShadoiApp }) {
  const { state, currentMaterial, goBack } = app;
  const screen = state.screen;
  const showBack = screen === 'practice' || screen === 'result' || screen === 'add';
  const barTitle =
    screen === 'home' ? 'Shadoi' : screen === 'library' ? '教材' : screen === 'add' ? '教材を追加' : screen === 'result' ? 'セッション結果' : currentMaterial.title;
  const barSub = screen === 'practice' ? `${currentMaterial.speaker} · CEFR ${currentMaterial.level} · ${currentMaterial.words} words` : '';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        // Installed to the home screen the app runs full-screen, so the bar
        // has to clear the status bar itself. Zero in a browser tab.
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button
            onClick={goBack}
            style={{
              background: 'transparent',
              border: 0,
              color: colors.text,
              fontSize: 22,
              lineHeight: 1,
              width: 32,
              height: 32,
              marginLeft: -6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ‹
          </button>
        )}
        <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{barTitle}</div>
          {barSub && (
            <div style={{ fontSize: 11, color: colors.textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{barSub}</div>
          )}
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: colors.accentSoftBg,
            borderRadius: 999,
            padding: '6px 12px',
            flex: 'none',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.accent }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.accentDark }}>{state.streak}</span>
          <span style={{ fontSize: 11, color: '#4FA97A' }}>日連続</span>
        </div>
      </div>
    </header>
  );
}
