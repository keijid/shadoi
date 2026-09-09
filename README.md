# Shadoi

英語シャドーイング練習アプリの MVP。人による添削機能は持たず、**聞く → 重ねて話す → 録る → 聞き比べる** の4ステップに絞った学習ループを提供する。

- 元音声はブラウザ内蔵の音声合成（Web Speech API）で読み上げ
- 録音は `MediaRecorder`（ブラウザにマイク許可が必要、HTTPS または localhost 必須）
- 練習履歴・連続記録・自作教材・選択中の音声は `localStorage` に保存
- 教材は4本を同梱（TED的なビジネススピーチ調、A2〜C1）に加え、自作教材を追加可能

デザイン仕様は Claude Design のハンドオフバンドル（`Shadoi.dc.html` / `tts.js` / `design_handoff_shadoi_mvp/README.md`）を元に、React + TypeScript + Vite で実装している。

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 型チェック + 本番ビルド
npm run lint      # oxlint
```

## ホーム画面に追加（iPhone）

Safari で https://keijid.github.io/shadoi/ を開き、共有 → 「ホーム画面に追加」。
アドレスバーのない全画面（standalone）で起動する。

アイコンは `public/icons/`。モチーフは「声を影のように追いかける」＝シャドーイングそのもので、
波形の後ろに同じ波形の影がずれて重なる。`tools/icon/make_icons.py` で再生成できる
（`pip install playwright pillow` が必要）。波の形・影のオフセットはスクリプト冒頭の定数で調整する。

## 既知の制約

- 読み上げ音声はOS/ブラウザ依存で、任意位置へのシークはできない（一時停止・再開のみ）
- 録音は教材ごとに直近のテイクのみメモリ上に保持し、リロードで消える（音声ファイル自体は永続化していない）
- スピーカー再生だとマイクが元音声を拾うため、録音時はイヤホン推奨
