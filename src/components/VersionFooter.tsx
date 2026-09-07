import { useCallback, useEffect, useState } from 'react';
import { BUILD, applyUpdate, fetchDeployedVersion, formatBuiltAt } from '../lib/version';
import { colors } from '../lib/theme';

type Status = 'checking' | 'current' | 'outdated' | 'failed';

export function VersionFooter() {
  // Starts out checking: the mount effect below runs one immediately.
  const [status, setStatus] = useState<Status>('checking');
  const [latest, setLatest] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    const deployed = await fetchDeployedVersion();
    if (deployed === null) {
      setStatus('failed');
      return;
    }
    setLatest(deployed);
    setStatus(deployed === BUILD.version ? 'current' : 'outdated');
  }, []);

  useEffect(() => {
    // Fetching the deployed version is exactly the external-system sync an
    // effect is for, and every setState in runCheck happens after an await,
    // so nothing cascades synchronously.
    // eslint-disable-next-line react/set-state-in-effect
    runCheck();
    // Coming back to the app is exactly when a deploy may have landed. This
    // one doesn't flash the checking state — it would just be a flicker.
    const onVisible = () => {
      if (document.visibilityState === 'visible') runCheck();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [runCheck]);

  const check = () => {
    setStatus('checking');
    runCheck();
  };

  const note =
    status === 'checking'
      ? '更新を確認中…'
      : status === 'outdated'
        ? '新しいバージョンがあります'
        : status === 'current'
          ? '最新です'
          : status === 'failed'
            ? '更新を確認できませんでした'
            : '';

  return (
    <footer style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: colors.textSub }}>
          バージョン {formatBuiltAt(BUILD.builtAt)}
          <span style={{ color: colors.textFaint }}> · {BUILD.version}</span>
        </div>
        {note && (
          <div style={{ marginTop: 2, fontSize: 11, color: status === 'outdated' ? colors.accentDark : colors.textFaint }}>{note}</div>
        )}
      </div>
      {status === 'outdated' && latest ? (
        <button
          onClick={() => applyUpdate(latest)}
          style={{
            marginLeft: 'auto',
            flex: 'none',
            background: colors.accent,
            color: '#fff',
            border: 0,
            borderRadius: 12,
            height: 40,
            padding: '0 16px',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          最新版に更新
        </button>
      ) : (
        <button
          onClick={check}
          disabled={status === 'checking'}
          style={{
            marginLeft: 'auto',
            flex: 'none',
            background: colors.neutralBg,
            color: status === 'checking' ? colors.placeholder : colors.textFaint4,
            border: 0,
            borderRadius: 12,
            height: 40,
            padding: '0 16px',
            fontSize: 13,
            fontWeight: 500,
            cursor: status === 'checking' ? 'default' : 'pointer',
          }}
        >
          更新を確認
        </button>
      )}
    </footer>
  );
}
