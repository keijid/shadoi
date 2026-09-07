import type { Material } from '../types';

export const BUILTIN_MATERIALS: Material[] = [
  {
    id: 'm1',
    title: '小さな習慣が組織を変える',
    speaker: 'Dana Okonjo',
    level: 'B2',
    done: 3,
    en: 'When we talk about change, we picture a single dramatic moment. But in every organization I studied, change arrived quietly. It arrived as a five-minute habit that nobody bothered to defend. The teams that improved fastest were not the most talented ones. They were simply the teams that repeated the boring part longer.',
    ja: '変化と言うと、私たちは劇的な一瞬を思い描きます。けれど私が調べたどの組織でも、変化は静かに訪れました。誰もわざわざ守ろうとしない、5分の習慣として現れたのです。最も速く伸びたチームは、最も才能のあるチームではありませんでした。ただ、地味な部分を長く繰り返したチームだったのです。',
  },
  {
    id: 'm2',
    title: 'AIと働く未来の設計図',
    speaker: 'Ravi Menon',
    level: 'B1',
    done: 1,
    en: 'Most people ask what AI will take away from their job. A better question is which part of your work deserves your attention. Tools change the shape of work, not the reason we do it. So start by naming the one task you would never delegate.',
    ja: '多くの人は、AIが自分の仕事から何を奪うのかを尋ねます。より良い問いは、自分の仕事のどの部分に注意を向けるべきか、です。道具は仕事の形を変えますが、働く理由は変えません。だからまず、絶対に人に任せない仕事を一つ挙げてみてください。',
  },
  {
    id: 'm3',
    title: '沈黙が生む創造性',
    speaker: 'Marta Lindqvist',
    level: 'C1',
    done: 0,
    en: 'Silence is not the absence of ideas; it is the room they need. We have engineered our days so that nothing is ever unfinished. Creativity, unfortunately, only grows in unfinished places. Protect one hour where nothing is expected of you.',
    ja: '沈黙はアイデアの不在ではなく、アイデアに必要な余白です。私たちは、何も未完成のまま残らないように一日を設計してしまいました。残念ながら創造性は、未完成な場所でしか育ちません。何も期待されない1時間を、守ってください。',
  },
  {
    id: 'm4',
    title: 'はじめての1on1',
    speaker: 'Tom Beckett',
    level: 'A2',
    done: 5,
    en: 'A good one-on-one starts with a question, not a report. Ask how the week felt, and then wait ten seconds. The best answers usually come after the silence.',
    ja: '良い1on1は報告ではなく、質問から始まります。今週はどう感じたか尋ねて、10秒待ちましょう。最良の答えは、たいてい沈黙のあとに来ます。',
  },
];

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Seeded PRNG (mulberry32) so the demo history is stable across reloads. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildHistory() {
  const rand = rng(42);
  const labels = ['8/24', '25', '26', '27', '28', '29', '30', '31', '9/1', '2', '3', '4', '5', '今日'];
  return labels.map((label, i) => ({
    label,
    min: i === 13 ? 4 : Math.round(6 + rand() * 9),
    today: i === 13,
  }));
}
