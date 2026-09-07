import type { ShadoiApp } from '../hooks/useShadoiApp';
import { colors, shadows } from '../lib/theme';

const WEEK_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

export function Home({ app }: { app: ShadoiApp }) {
  const { state, todayMaterial, config, openMat, goLibrary } = app;
  const goalMin = config.dailyGoalMin;
  const pct = Math.min(1, state.todayMin / goalMin);
  const done = state.todayMin >= goalMin;
  const maxHist = Math.max(...state.history.map((d) => d.min), 12);
  const totalMin = state.history.reduce((a, b) => a + b.min, 0);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '18px 16px calc(96px + env(safe-area-inset-bottom))', animation: 'riseIn .4s ease both' }}>
      <section style={{ ...cardBase, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: colors.textSub }}>今日の練習</div>
            <div style={{ marginTop: 4, fontSize: 30, fontWeight: 700, lineHeight: 1 }}>
              {state.todayMin}
              <span style={{ fontSize: 14, fontWeight: 500, color: colors.textSub }}> / {goalMin}分</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: done ? colors.accentDark : colors.textSub, fontWeight: 700 }}>
            {done ? '目標達成' : `あと${goalMin - state.todayMin}分`}
          </div>
        </div>
        <div style={{ marginTop: 14, height: 8, borderRadius: 999, background: colors.borderSoft, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(pct * 100).toFixed(0)}%`, background: colors.accent, borderRadius: 999, transition: 'width .5s ease' }} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
          {WEEK_LABELS.map((label, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 26, borderRadius: 9, background: i < 5 ? colors.accent : i === 5 ? colors.accentSoftBorder : colors.weekOff }} />
              <div style={{ marginTop: 5, fontSize: 10, color: colors.textFaint }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ margin: '22px 4px 8px', fontSize: 13, fontWeight: 700, color: colors.textFaint2 }}>今日の教材</div>
      <section style={{ ...cardBase, padding: 18 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              background: colors.accentSoftBg,
              color: colors.accentDark,
              fontSize: 17,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            {todayMaterial.speaker.slice(0, 1) || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="tw-pretty" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>{todayMaterial.title}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: colors.textSub }}>
              {(todayMaterial.speaker || '自分の教材') + ' · CEFR ' + todayMaterial.level + ' · ' + todayMaterial.words + ' words'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button
            onClick={() => openMat(todayMaterial.id)}
            style={{
              flex: 1,
              background: colors.accent,
              color: '#fff',
              border: 0,
              borderRadius: 14,
              height: 50,
              fontSize: 15,
              fontWeight: 700,
              boxShadow: shadows.primaryBtn,
            }}
          >
            練習をはじめる
          </button>
          <button
            onClick={goLibrary}
            style={{ background: colors.neutralBg, color: colors.textFaint4, border: 0, borderRadius: 14, height: 50, padding: '0 18px', fontSize: 14, fontWeight: 500 }}
          >
            教材を選ぶ
          </button>
        </div>
      </section>

      <div style={{ margin: '22px 4px 8px', fontSize: 13, fontWeight: 700, color: colors.textFaint2 }}>記録</div>
      <section style={{ ...cardBase, padding: '20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 92 }}>
          {state.history.map((d, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div
                title={`${d.label} · ${d.min}分`}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  background: d.today ? colors.accent : colors.accentBarMuted,
                  height: `${Math.max(8, Math.round((d.min / maxHist) * 100))}%`,
                  transition: 'height .4s',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: colors.textFaint }}>
          <span>{state.history[0].label}</span>
          <span>今日</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${colors.borderSoft}` }}>
          {[
            { v: totalMin, unit: '分', label: '累計練習時間' },
            { v: (totalMin / state.history.length).toFixed(1), unit: '分', label: '1日あたり平均' },
            { v: state.streak, unit: '日', label: '連続記録' },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>
                {s.v}
                <span style={{ fontSize: 11, fontWeight: 500, color: colors.textSub }}>{s.unit}</span>
              </div>
              <div style={{ marginTop: 2, fontSize: 11, color: colors.textSub }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const cardBase = { background: colors.card, borderRadius: 20, boxShadow: shadows.card } as const;
