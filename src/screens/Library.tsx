import type { ShadoiApp } from '../hooks/useShadoiApp';
import type { LevelFilter } from '../types';
import { colors, shadows } from '../lib/theme';

const LEVELS: LevelFilter[] = ['all', 'A2', 'B1', 'B2', 'C1'];

export function Library({ app }: { app: ShadoiApp }) {
  const { state, filteredMaterials, setLevel, setQuery, clearQuery, deleteCustomMaterial, openMat, goAdd } = app;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '14px 16px calc(96px + env(safe-area-inset-bottom))', animation: 'riseIn .35s ease both' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: colors.card,
            borderRadius: 14,
            padding: '0 14px',
            height: 44,
            boxShadow: shadows.card,
          }}
        >
          <span style={{ fontSize: 14, color: colors.placeholder }}>⌕</span>
          <input
            value={state.query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・話者・本文で検索"
            style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', fontSize: 14, color: colors.text, height: 42 }}
          />
          {state.query && (
            <button
              onClick={clearQuery}
              style={{ background: colors.borderSoft, color: colors.textFaint2, border: 0, borderRadius: 999, width: 20, height: 20, fontSize: 12, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={goAdd}
          style={{
            flex: 'none',
            background: colors.accent,
            color: '#fff',
            border: 0,
            borderRadius: 14,
            height: 44,
            padding: '0 16px',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: shadows.primaryBtnSmall,
          }}
        >
          ＋ 追加
        </button>
      </div>

      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '12px 0 4px' }}>
        {LEVELS.map((l) => {
          const on = state.level === l;
          return (
            <button
              key={l}
              onClick={() => setLevel(l)}
              style={{
                flex: 'none',
                background: on ? colors.accentSoftBg : colors.neutralBg,
                color: on ? colors.accentDark : colors.textFaint2,
                border: 0,
                borderRadius: 999,
                padding: '8px 15px',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {l === 'all' ? 'すべて' : l}
            </button>
          );
        })}
      </div>

      <section style={{ marginTop: 8, background: colors.card, borderRadius: 20, overflow: 'hidden', boxShadow: shadows.card }}>
        {filteredMaterials.map((m, i) => (
          <div
            key={m.id}
            onClick={() => openMat(m.id)}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              padding: '16px 18px',
              borderTop: i === 0 ? '0' : `1px solid ${colors.borderSoft}`,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: m.level === 'C1' ? colors.redBg : m.level === 'A2' ? colors.blueBg : colors.accentSoftBg,
                color: m.level === 'C1' ? colors.red : m.level === 'A2' ? colors.blue : colors.accentDark,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              {m.level}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</span>
                {m.custom && (
                  <span style={{ flex: 'none', fontSize: 10, fontWeight: 700, color: colors.blue, background: colors.blueBg, borderRadius: 5, padding: '2px 6px' }}>
                    自分の教材
                  </span>
                )}
              </div>
              <div style={{ marginTop: 3, fontSize: 12, color: colors.textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(m.speaker || '話者なし') + ' · ' + m.words + ' words'}
              </div>
            </div>
            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: m.done ? colors.textSub : colors.placeholder }}>{m.done ? `${m.done}回` : '未着手'}</span>
              {m.custom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomMaterial(m.id);
                  }}
                  style={{ background: colors.neutralBg, color: colors.textSub, border: 0, borderRadius: 999, width: 24, height: 24, fontSize: 13, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              )}
              <span style={{ fontSize: 18, color: colors.chevron }}>›</span>
            </div>
          </div>
        ))}
        {filteredMaterials.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.textFaint2 }}>該当する教材がありません</div>
            <div style={{ marginTop: 6, fontSize: 12, color: colors.textSub, lineHeight: 1.7 }}>検索語やレベルを変えるか、自分の教材を追加してください。</div>
            <button
              onClick={goAdd}
              style={{ marginTop: 16, background: colors.accentSoftBg, color: colors.accentDark, border: 0, borderRadius: 12, height: 42, padding: '0 18px', fontSize: 13, fontWeight: 700 }}
            >
              ＋ 教材を追加
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
