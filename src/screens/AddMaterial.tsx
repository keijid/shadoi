import type { ShadoiApp } from '../hooks/useShadoiApp';
import type { Level } from '../types';
import { wordCount } from '../lib/materials';
import { colors, shadows } from '../lib/theme';

const LEVELS: Level[] = ['A2', 'B1', 'B2', 'C1'];

const inputStyle = {
  width: '100%',
  height: 46,
  border: `1px solid ${colors.border}`,
  borderRadius: 13,
  background: '#FAFBFD',
  padding: '0 14px',
  fontSize: 14,
  color: colors.text,
} as const;

export function AddMaterial({ app }: { app: ShadoiApp }) {
  const { state, setDraftField, saveMaterial, goLibrary } = app;
  const d = state.draft;
  const wc = wordCount(d.en);
  const draftOk = !!d.title.trim() && wc >= 5;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '16px 16px 40px', animation: 'riseIn .35s ease both' }}>
      <section style={{ background: colors.card, borderRadius: 20, padding: '20px 18px', boxShadow: shadows.card, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.textFaint2, marginBottom: 7 }}>タイトル</div>
          <input
            value={d.title}
            onChange={(e) => setDraftField('title', e.target.value)}
            placeholder="例：チームの信頼をつくる"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.textFaint2, marginBottom: 7 }}>話者</div>
            <input
              value={d.speaker}
              onChange={(e) => setDraftField('speaker', e.target.value)}
              placeholder="例：Amy Clarke"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.textFaint2, marginBottom: 7 }}>レベル</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {LEVELS.map((l) => {
                const on = d.level === l;
                return (
                  <button
                    key={l}
                    onClick={() => setDraftField('level', l)}
                    style={{
                      background: on ? colors.accentSoftBg : colors.neutralBg,
                      color: on ? colors.accentDark : colors.textFaint2,
                      border: 0,
                      borderRadius: 11,
                      height: 46,
                      width: 46,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.textFaint2, marginBottom: 7 }}>英文スクリプト</div>
          <textarea
            value={d.en}
            onChange={(e) => setDraftField('en', e.target.value)}
            rows={7}
            placeholder="読み上げたい英文を貼り付けてください。60〜120 words 程度が10分の練習に向いています。"
            style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: 13, background: '#FAFBFD', padding: '13px 14px', fontSize: 14, lineHeight: 1.75, color: colors.text, resize: 'vertical' }}
          />
          <div style={{ marginTop: 6, fontSize: 11, color: colors.textSub }}>{d.en.trim() ? `${wc} words` : '英文は5語以上で登録できます'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.textFaint2, marginBottom: 7 }}>和訳（任意）</div>
          <textarea
            value={d.ja}
            onChange={(e) => setDraftField('ja', e.target.value)}
            rows={4}
            placeholder="意味の確認用。空欄でも登録できます。"
            style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: 13, background: '#FAFBFD', padding: '13px 14px', fontSize: 14, lineHeight: 1.8, color: colors.text, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={goLibrary}
            style={{ background: colors.neutralBg, color: colors.textFaint4, border: 0, borderRadius: 14, height: 52, padding: '0 20px', fontSize: 14, fontWeight: 500 }}
          >
            やめる
          </button>
          <button
            onClick={saveMaterial}
            disabled={!draftOk}
            style={{
              flex: 1,
              background: draftOk ? colors.accent : colors.weekOff,
              color: draftOk ? '#fff' : colors.textFaint,
              border: 0,
              borderRadius: 14,
              height: 52,
              fontSize: 15,
              fontWeight: 700,
              cursor: draftOk ? 'pointer' : 'default',
            }}
          >
            登録して練習する
          </button>
        </div>
      </section>
    </main>
  );
}
