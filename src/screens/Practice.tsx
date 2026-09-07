import type { ShadoiApp } from '../hooks/useShadoiApp';
import { sentences } from '../lib/tts';
import { fmtElapsed, fmtClock } from '../lib/format';
import { colors, shadows } from '../lib/theme';

export function Practice({ app }: { app: ShadoiApp }) {
  const { state, currentMaterial, voiceOptions, takes, selectedTake } = app;
  const { toggleScript, toggleJa, setVoice, playRef, toggleRec, playAlt, cycleSpeed, selectTake, playTakeById, deleteTakeById, goResult } = app;

  const hasTake = takes.length > 0;
  const busy = state.speaking || state.playingMine;
  const lines = sentences(currentMaterial.en).map((text, i) => ({
    text: state.showScript ? text + ' ' : '• • • • • • • • • • • •  ',
    bg: state.speaking && state.line === i ? colors.accentSoftBg : 'transparent',
    color: !state.showScript ? colors.chevron : state.speaking && state.line === i ? colors.accentDarker : state.speaking ? colors.textSub : colors.text,
  }));

  const scChip = state.showScript ? { bg: colors.accentSoftBg, color: colors.accentDark } : { bg: colors.neutralBg, color: colors.textFaint2 };
  const jaChip = state.showJa ? { bg: colors.accentSoftBg, color: colors.accentDark } : { bg: colors.neutralBg, color: colors.textFaint2 };

  return (
    <>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '16px 16px calc(178px + env(safe-area-inset-bottom))', animation: 'riseIn .35s ease both' }}>
        {state.err && (
          <div style={{ background: colors.redBg, color: colors.redDark, borderRadius: 14, padding: '13px 16px', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
            {state.err}
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: colors.textMuted,
            background: 'rgba(20,24,31,.05)',
            borderRadius: 999,
            padding: '5px 12px',
            width: 'fit-content',
            margin: '0 auto 16px',
          }}
        >
          {`経過 ${fmtElapsed(state.sessionSec)} · 再生 ${state.plays}回 · 録音 ${takes.length}本`}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 13,
              background: colors.avaAqua,
              color: colors.textFaint5,
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            {(currentMaterial.speaker || currentMaterial.title).slice(0, 1)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, color: colors.textSub, marginBottom: 5 }}>
              {(currentMaterial.speaker ? currentMaterial.speaker + ' の' : '') + '元音声'}
            </div>
            <div style={{ background: colors.card, borderRadius: '20px 20px 20px 6px', padding: '18px 20px', boxShadow: shadows.cardStrong, animation: 'popIn .3s ease both' }}>
              <p className="tw-pretty" style={{ margin: 0, fontSize: 18, lineHeight: 1.85 }}>
                {lines.map((s, i) => (
                  <span
                    key={i}
                    style={{ background: s.bg, color: s.color, borderRadius: 7, padding: '2px 3px', boxDecorationBreak: 'clone', transition: 'background .25s ease, color .25s ease' }}
                  >
                    {s.text}
                  </span>
                ))}
              </p>
              {state.showJa && (
                <p className="tw-pretty" style={{ margin: '14px 0 0', paddingTop: 14, borderTop: `1px solid ${colors.borderSoft}`, fontSize: 13, color: colors.textFaint3, lineHeight: 1.85 }}>
                  {currentMaterial.ja || '和訳は登録されていません。'}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <button onClick={toggleScript} style={{ background: scChip.bg, color: scChip.color, border: 0, borderRadius: 999, padding: '6px 13px', fontSize: 12, fontWeight: 500 }}>
                英文
              </button>
              <button onClick={toggleJa} style={{ background: jaChip.bg, color: jaChip.color, border: 0, borderRadius: 999, padding: '6px 13px', fontSize: 12, fontWeight: 500 }}>
                和訳
              </button>
              <select
                value={state.voiceName}
                onChange={(e) => setVoice(e.target.value)}
                style={{ marginLeft: 'auto', maxWidth: 190, background: colors.neutralBg, color: colors.textFaint4, border: 0, borderRadius: 999, padding: '7px 12px', fontSize: 12 }}
              >
                {voiceOptions.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, marginTop: 20 }}>
          {takes.map((t, i) => {
            const playing = state.playingId === t.id;
            const isSel = selectedTake && selectedTake.id === t.id;
            return (
              <div key={t.id} style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 11, color: colors.textSub, marginBottom: 5 }}>{`テイク${i + 1} · ${fmtClock(t.at)} · ${t.sec}秒`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => deleteTakeById(t.id)}
                    style={{ background: 'transparent', color: colors.placeholder, border: 0, fontSize: 15, width: 26, height: 26, padding: 0, lineHeight: 1 }}
                  >
                    ×
                  </button>
                  <button
                    onClick={() => selectTake(t.id)}
                    style={{
                      background: isSel ? colors.accentSoftBg : 'transparent',
                      color: isSel ? colors.accentDark : colors.placeholder,
                      border: 0,
                      borderRadius: 999,
                      padding: '5px 11px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {isSel ? '比較対象' : '選ぶ'}
                  </button>
                  <button
                    onClick={() => playTakeById(t.id)}
                    style={{
                      background: playing ? colors.accentDark : colors.accent,
                      color: '#fff',
                      border: 0,
                      borderRadius: '20px 20px 6px 20px',
                      padding: '15px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      boxShadow: shadows.take,
                      animation: 'popIn .3s ease both',
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{playing ? '❙❙' : '▶'}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{playing ? '再生中…' : '聞く'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: colors.textSub }}>
          <span style={{ height: 6, width: 6, borderRadius: '50%', background: state.recording ? colors.redRec : busy ? colors.accent : colors.chevron }} />
          <span>
            {state.recording
              ? state.speaking
                ? '録音中 · 元音声を再生中'
                : '録音中'
              : state.speaking
                ? '元音声を再生中'
                : state.playingMine
                  ? '自分の録音を再生中'
                  : '待機中'}
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {state.recording ? 'イヤホン推奨 · 元音声に重ねて話す' : hasTake ? '交互に聞くと差が見つかる' : '録音を押すと元音声が流れます'}
          </span>
        </div>
        <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: colors.borderSofter, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(state.progress * 100).toFixed(1)}%`,
              background: state.playingMine ? colors.accentDark : colors.accent,
              borderRadius: 999,
              transition: 'width .2s linear',
            }}
          />
        </div>
      </main>

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px calc(14px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={playRef}
              style={{
                background: state.speaking ? colors.accentSoftBg : colors.accent,
                color: state.speaking ? colors.accentDark : '#fff',
                border: 0,
                borderRadius: 15,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>{state.speaking ? '❙❙' : '▶'}</span>元音声
            </button>
            <button
              onClick={toggleRec}
              style={{
                background: state.recording ? colors.redBg : colors.neutralBg,
                color: state.recording ? colors.redDark : colors.textFaint4,
                border: 0,
                borderRadius: 15,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors.redRec, animation: state.recording ? 'pulseRec 1s infinite' : 'none' }} />
              {state.recording ? '停止' : hasTake ? 'もう1本' : '録音'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={playAlt}
              disabled={!hasTake}
              style={{
                background: colors.neutralBg,
                color: hasTake ? colors.textFaint4 : colors.placeholder,
                border: 0,
                borderRadius: 11,
                padding: '0 14px',
                height: 40,
                fontSize: 13,
                fontWeight: 500,
                cursor: hasTake ? 'pointer' : 'default',
              }}
            >
              交互に聞く
            </button>
            <button
              onClick={cycleSpeed}
              style={{ background: colors.neutralBg, color: colors.textFaint4, border: 0, borderRadius: 11, padding: '0 14px', height: 40, fontSize: 13, fontWeight: 500 }}
            >
              速度 x{state.speed.toFixed(1)}
            </button>
            <button
              onClick={goResult}
              style={{ marginLeft: 'auto', background: 'transparent', color: colors.accentDark, border: 0, padding: '0 6px', height: 40, fontSize: 13, fontWeight: 700 }}
            >
              終える
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
