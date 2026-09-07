import type { ShadoiApp } from '../hooks/useShadoiApp';
import { fmtElapsed } from '../lib/format';
import { colors, shadows } from '../lib/theme';

export function Result({ app }: { app: ShadoiApp }) {
  const { state, currentMaterial, takes, backToPractice, saveSession } = app;

  const rows = [
    { label: '練習時間', value: `${Math.max(1, Math.round(state.sessionSec / 60))}分`, color: colors.accentDark },
    { label: '元音声の再生', value: `${state.plays}回`, color: colors.text },
    { label: '録音テイク', value: `${takes.length}本`, color: colors.text },
  ];

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '34px 16px 40px', animation: 'riseIn .4s ease both' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: colors.accent,
            color: '#fff',
            fontSize: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: shadows.check,
          }}
        >
          ✓
        </div>
        <h1 style={{ margin: '18px 0 0', fontSize: 22, fontWeight: 700 }}>今日のシャドーイング完了</h1>
        <p className="tw-pretty" style={{ margin: '8px 0 0', fontSize: 13, color: colors.textSub, lineHeight: 1.7 }}>
          {`${currentMaterial.title} を ${fmtElapsed(state.sessionSec)} 練習しました`}
        </p>
      </div>
      <section style={{ marginTop: 24, background: colors.card, borderRadius: 20, padding: '6px 18px', boxShadow: shadows.card }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderTop: i === 0 ? '0' : `1px solid ${colors.borderSoft}` }}>
            <span style={{ fontSize: 13, color: colors.textFaint2 }}>{r.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 700, color: r.color }}>{r.value}</span>
          </div>
        ))}
      </section>
      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <button
          onClick={backToPractice}
          style={{ background: colors.neutralBg, color: colors.textFaint4, border: 0, borderRadius: 14, height: 52, padding: '0 18px', fontSize: 14, fontWeight: 500 }}
        >
          練習に戻る
        </button>
        <button
          onClick={saveSession}
          style={{ flex: 1, background: colors.accent, color: '#fff', border: 0, borderRadius: 14, height: 52, fontSize: 15, fontWeight: 700, boxShadow: shadows.primaryBtn }}
        >
          記録して終了
        </button>
      </div>
    </main>
  );
}
