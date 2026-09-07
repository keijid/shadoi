import type { ShadoiApp } from '../hooks/useShadoiApp';
import { colors } from '../lib/theme';

export function TabBar({ app }: { app: ShadoiApp }) {
  const { state, goHome, goLibrary } = app;
  const homeColor = state.screen === 'home' ? colors.accent : colors.textFaint;
  const libColor = state.screen === 'library' ? colors.accent : colors.textFaint;

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        background: 'rgba(255,255,255,.96)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${colors.border}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <button
          onClick={goHome}
          style={{
            background: 'transparent',
            border: 0,
            height: 62,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            color: homeColor,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>◉</span>
          <span style={{ fontSize: 11, fontWeight: 700 }}>ホーム</span>
        </button>
        <button
          onClick={goLibrary}
          style={{
            background: 'transparent',
            border: 0,
            height: 62,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            color: libColor,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
          <span style={{ fontSize: 11, fontWeight: 700 }}>教材</span>
        </button>
      </div>
    </nav>
  );
}
