// 3歳児向け知育ゲームのデータ定義

export interface Item {
  id: string;
  name: string;
  emoji: string;
  category: 'animal' | 'vehicle' | 'food' | 'nature';
  color: string;
  colorType?: 'red' | 'blue' | 'yellow' | 'green';
}

export const ALL_ITEMS: Record<string, Item> = {
  dog: { id: 'dog', name: 'いぬ', emoji: '🐶', category: 'animal', color: 'bg-amber-100 border-amber-300' },
  cat: { id: 'cat', name: 'ねこ', emoji: '🐱', category: 'animal', color: 'bg-orange-100 border-orange-300' },
  rabbit: { id: 'rabbit', name: 'うさぎ', emoji: '🐰', category: 'animal', color: 'bg-pink-100 border-pink-300' },
  bear: { id: 'bear', name: 'くま', emoji: '🐻', category: 'animal', color: 'bg-yellow-100 border-yellow-300' },
  lion: { id: 'lion', name: 'らいおん', emoji: '🦁', category: 'animal', color: 'bg-orange-100 border-orange-400' },
  panda: { id: 'panda', name: 'ぱんだ', emoji: '🐼', category: 'animal', color: 'bg-slate-100 border-slate-300' },
  elephant: { id: 'elephant', name: 'ぞう', emoji: '🐘', category: 'animal', color: 'bg-blue-100 border-blue-300' },
  chick: { id: 'chick', name: 'ひよこ', emoji: '🐥', category: 'animal', color: 'bg-yellow-100 border-yellow-400', colorType: 'yellow' },
  frog: { id: 'frog', name: 'かえる', emoji: '🐸', category: 'animal', color: 'bg-emerald-100 border-emerald-400', colorType: 'green' },
  monkey: { id: 'monkey', name: 'さる', emoji: '🐵', category: 'animal', color: 'bg-amber-100 border-amber-400' },

  car: { id: 'car', name: 'あかい くるま', emoji: '🚗', category: 'vehicle', color: 'bg-red-100 border-red-300', colorType: 'red' },
  blueCar: { id: 'blueCar', name: 'あおい くるま', emoji: '🚙', category: 'vehicle', color: 'bg-sky-100 border-sky-400', colorType: 'blue' },
  police: { id: 'police', name: 'ぱとかー', emoji: '🚓', category: 'vehicle', color: 'bg-blue-100 border-blue-400' },
  fire: { id: 'fire', name: 'しょうぼうしゃ', emoji: '🚒', category: 'vehicle', color: 'bg-red-100 border-red-400', colorType: 'red' },
  train: { id: 'train', name: 'でんしゃ', emoji: '🚃', category: 'vehicle', color: 'bg-emerald-100 border-emerald-300', colorType: 'green' },
  bullet: { id: 'bullet', name: 'しんかんせん', emoji: '🚅', category: 'vehicle', color: 'bg-indigo-100 border-indigo-300' },
  airplane: { id: 'airplane', name: 'ひこうき', emoji: '✈️', category: 'vehicle', color: 'bg-sky-100 border-sky-300', colorType: 'blue' },
  bus: { id: 'bus', name: 'きいろい ばす', emoji: '🚌', category: 'vehicle', color: 'bg-yellow-100 border-yellow-400', colorType: 'yellow' },
  ship: { id: 'ship', name: 'ふね', emoji: '🚢', category: 'vehicle', color: 'bg-cyan-100 border-cyan-400' },

  apple: { id: 'apple', name: 'りんご', emoji: '🍎', category: 'food', color: 'bg-red-100 border-red-300', colorType: 'red' },
  banana: { id: 'banana', name: 'ばなな', emoji: '🍌', category: 'food', color: 'bg-yellow-100 border-yellow-300', colorType: 'yellow' },
  strawberry: { id: 'strawberry', name: 'いちご', emoji: '🍓', category: 'food', color: 'bg-rose-100 border-rose-300', colorType: 'red' },
  grape: { id: 'grape', name: 'ぶどう', emoji: '🍇', category: 'food', color: 'bg-purple-100 border-purple-300' },
  watermelon: { id: 'watermelon', name: 'すいか', emoji: '🍉', category: 'food', color: 'bg-emerald-100 border-emerald-300', colorType: 'green' },
  orange: { id: 'orange', name: 'みかん', emoji: '🍊', category: 'food', color: 'bg-orange-100 border-orange-300' },
  icecream: { id: 'icecream', name: 'あいす', emoji: '🍦', category: 'food', color: 'bg-pink-100 border-pink-300' },
  bread: { id: 'bread', name: 'ぱん', emoji: '🍞', category: 'food', color: 'bg-amber-100 border-amber-300' },
  carrot: { id: 'carrot', name: 'にんじん', emoji: '🥕', category: 'food', color: 'bg-orange-100 border-orange-300' },
  fish: { id: 'fish', name: 'おさかな', emoji: '🐟', category: 'food', color: 'bg-sky-100 border-sky-300' },
  bamboo: { id: 'bamboo', name: 'ささの は', emoji: '🎋', category: 'food', color: 'bg-emerald-100 border-emerald-300' },
  candy: { id: 'candy', name: 'あめ', emoji: '🍬', category: 'food', color: 'bg-pink-100 border-pink-300' },

  sun: { id: 'sun', name: 'たいよう', emoji: '☀️', category: 'nature', color: 'bg-amber-100 border-amber-300' },
  star: { id: 'star', name: 'ほし', emoji: '⭐', category: 'nature', color: 'bg-yellow-100 border-yellow-300', colorType: 'yellow' },
  flower: { id: 'flower', name: 'おはな', emoji: '🌸', category: 'nature', color: 'bg-pink-100 border-pink-300' },
  rainbow: { id: 'rainbow', name: 'にじ', emoji: '🌈', category: 'nature', color: 'bg-teal-100 border-teal-300' },
  clover: { id: 'clover', name: 'くろーばー', emoji: '🍀', category: 'nature', color: 'bg-emerald-100 border-emerald-300', colorType: 'green' },
};

// 1. おなじものさがし（マッチング）
export interface MatchQuestion {
  id: number;
  promptVoice: string;
  target: Item;
  options: Item[];
}

export const MATCH_QUESTIONS: MatchQuestion[] = [
  {
    id: 1,
    promptVoice: 'これとおなじものはどれかな？',
    target: ALL_ITEMS.dog,
    options: [ALL_ITEMS.cat, ALL_ITEMS.dog, ALL_ITEMS.rabbit]
  },
  {
    id: 2,
    promptVoice: 'でんしゃとおなじものをえらんでね！',
    target: ALL_ITEMS.bullet,
    options: [ALL_ITEMS.car, ALL_ITEMS.airplane, ALL_ITEMS.bullet, ALL_ITEMS.bus]
  },
  {
    id: 3,
    promptVoice: 'あま〜い いちごとおなじものはどーれ？',
    target: ALL_ITEMS.strawberry,
    options: [ALL_ITEMS.strawberry, ALL_ITEMS.apple, ALL_ITEMS.banana]
  },
  {
    id: 4,
    promptVoice: 'ぱんださんとおなじものはどれかな？',
    target: ALL_ITEMS.panda,
    options: [ALL_ITEMS.bear, ALL_ITEMS.panda, ALL_ITEMS.elephant, ALL_ITEMS.chick]
  },
  {
    id: 5,
    promptVoice: 'パトカーとおなじものをえらんでね！',
    target: ALL_ITEMS.police,
    options: [ALL_ITEMS.fire, ALL_ITEMS.police, ALL_ITEMS.bus]
  }
];

// 2. まちがいさがし（なかまはずれ）
export interface OddOneOutQuestion {
  id: number;
  promptVoice: string;
  title: string;
  options: {
    id: string;
    emoji: string;
    name: string;
    isOdd: boolean;
    style?: string;
  }[];
}

export const ODD_QUESTIONS: OddOneOutQuestion[] = [
  {
    id: 1,
    title: 'ひとつだけ ちがうの ど〜れだ？',
    promptVoice: 'ひとつだけ ちがうの どーれだ？',
    options: [
      { id: '1', emoji: '🍎', name: 'あかいりんご', isOdd: false },
      { id: '2', emoji: '🍎', name: 'あかいりんご', isOdd: false },
      { id: '3', emoji: '🍏', name: 'あおりんご', isOdd: true },
      { id: '4', emoji: '🍎', name: 'あかいりんご', isOdd: false },
    ]
  },
  {
    id: 2,
    title: 'なかまはずれは だ〜れ？',
    promptVoice: 'なかまはずれは だーれ？',
    options: [
      { id: '1', emoji: '🚗', name: 'くるま', isOdd: false },
      { id: '2', emoji: '🚗', name: 'くるま', isOdd: false },
      { id: '3', emoji: '🚗', name: 'くるま', isOdd: false },
      { id: '4', emoji: '🚒', name: 'しょうぼうしゃ', isOdd: true },
    ]
  },
  {
    id: 3,
    title: 'ひとりだけ むきが ちがうよ！',
    promptVoice: 'ひとりだけ むきが ちがうよ！',
    options: [
      { id: '1', emoji: '🐥', name: 'ひよこ', isOdd: false, style: 'scale-x-100' },
      { id: '2', emoji: '🐥', name: 'ひよこ', isOdd: true, style: '-scale-x-100' },
      { id: '3', emoji: '🐥', name: 'ひよこ', isOdd: false, style: 'scale-x-100' },
      { id: '4', emoji: '🐥', name: 'ひよこ', isOdd: false, style: 'scale-x-100' },
    ]
  },
  {
    id: 4,
    title: 'どうぶつさんの なかまはずれは？',
    promptVoice: 'どうぶつさんの なかまはずれは？',
    options: [
      { id: '1', emoji: '🐰', name: 'うさぎ', isOdd: false },
      { id: '2', emoji: '🐱', name: 'ねこ', isOdd: false },
      { id: '3', emoji: '🐶', name: 'いぬ', isOdd: false },
      { id: '4', emoji: '🚗', name: 'くるま', isOdd: true },
    ]
  }
];

// 3. なかまわけ（カテゴリ集め）
export interface CategoryQuestion {
  id: number;
  category: 'vehicle' | 'food' | 'animal';
  title: string;
  promptVoice: string;
  targetCount: number;
  items: (Item & { isTarget: boolean })[];
}

export const CATEGORY_QUESTIONS: CategoryQuestion[] = [
  {
    id: 1,
    category: 'vehicle',
    title: 'のりものを ぜんぶ タッチしてね！',
    promptVoice: 'のりものを ぜんぶ タッチしてね！',
    targetCount: 3,
    items: [
      { ...ALL_ITEMS.police, isTarget: true },
      { ...ALL_ITEMS.apple, isTarget: false },
      { ...ALL_ITEMS.bullet, isTarget: true },
      { ...ALL_ITEMS.cat, isTarget: false },
      { ...ALL_ITEMS.airplane, isTarget: true },
      { ...ALL_ITEMS.banana, isTarget: false }
    ]
  },
  {
    id: 2,
    category: 'food',
    title: 'たべものを あつめてね！',
    promptVoice: 'たべものを あつめてね！',
    targetCount: 3,
    items: [
      { ...ALL_ITEMS.dog, isTarget: false },
      { ...ALL_ITEMS.strawberry, isTarget: true },
      { ...ALL_ITEMS.car, isTarget: false },
      { ...ALL_ITEMS.watermelon, isTarget: true },
      { ...ALL_ITEMS.orange, isTarget: true },
      { ...ALL_ITEMS.bear, isTarget: false }
    ]
  },
  {
    id: 3,
    category: 'animal',
    title: 'どうぶつさんを タッチしてね！',
    promptVoice: 'どうぶつさんを タッチしてね！',
    targetCount: 4,
    items: [
      { ...ALL_ITEMS.lion, isTarget: true },
      { ...ALL_ITEMS.ship, isTarget: false },
      { ...ALL_ITEMS.rabbit, isTarget: true },
      { ...ALL_ITEMS.bread, isTarget: false },
      { ...ALL_ITEMS.elephant, isTarget: true },
      { ...ALL_ITEMS.panda, isTarget: true }
    ]
  }
];

// 4. シルエットクイズ（かたちあわせ）
export interface SilhouetteQuestion {
  id: number;
  title: string;
  promptVoice: string;
  target: Item;
  options: Item[];
}

export const SILHOUETTE_QUESTIONS: SilhouetteQuestion[] = [
  {
    id: 1,
    title: 'この かげは だ〜れだ？',
    promptVoice: 'この かげは だーれだ？',
    target: ALL_ITEMS.elephant,
    options: [ALL_ITEMS.cat, ALL_ITEMS.elephant, ALL_ITEMS.bear]
  },
  {
    id: 2,
    title: 'この かげは な〜んだ？',
    promptVoice: 'この かげは なーんだ？',
    target: ALL_ITEMS.airplane,
    options: [ALL_ITEMS.car, ALL_ITEMS.ship, ALL_ITEMS.airplane]
  },
  {
    id: 3,
    title: 'この かげは だ〜れだ？',
    promptVoice: 'この かげは だーれだ？',
    target: ALL_ITEMS.lion,
    options: [ALL_ITEMS.lion, ALL_ITEMS.rabbit, ALL_ITEMS.dog]
  },
  {
    id: 4,
    title: 'この おいしい かげは な〜んだ？',
    promptVoice: 'この おいしい かげは なーんだ？',
    target: ALL_ITEMS.banana,
    options: [ALL_ITEMS.apple, ALL_ITEMS.banana, ALL_ITEMS.grape]
  }
];

// 5. おおきいのは どっち？（大小くらべ）
export interface SizeQuestion {
  id: number;
  type: 'bigger' | 'smaller';
  title: string;
  promptVoice: string;
  items: {
    id: string;
    name: string;
    emoji: string;
    isCorrect: boolean;
    sizeDisplay: 'big' | 'small';
  }[];
}

export const SIZE_QUESTIONS: SizeQuestion[] = [
  {
    id: 1,
    type: 'bigger',
    title: 'おおきいのは どっち？',
    promptVoice: 'おおきいのは どっちかな？',
    items: [
      { id: 'elephant', name: 'おおきい ぞう', emoji: '🐘', isCorrect: true, sizeDisplay: 'big' },
      { id: 'chick', name: 'ちいさい ひよこ', emoji: '🐥', isCorrect: false, sizeDisplay: 'small' }
    ]
  },
  {
    id: 2,
    type: 'bigger',
    title: 'おおきいのは どっち？',
    promptVoice: 'おおきいのは どっちかな？',
    items: [
      { id: 'strawberry', name: 'ちいさい いちご', emoji: '🍓', isCorrect: false, sizeDisplay: 'small' },
      { id: 'watermelon', name: 'おおきい すいか', emoji: '🍉', isCorrect: true, sizeDisplay: 'big' }
    ]
  },
  {
    id: 3,
    type: 'smaller',
    title: 'ちいさいのは どっち？',
    promptVoice: 'ちいさいのは どっちかな？',
    items: [
      { id: 'rabbit', name: 'ちいさい うさぎ', emoji: '🐰', isCorrect: true, sizeDisplay: 'small' },
      { id: 'bear', name: 'おおきい くま', emoji: '🐻', isCorrect: false, sizeDisplay: 'big' }
    ]
  },
  {
    id: 4,
    type: 'smaller',
    title: 'ちいさいのは どっち？',
    promptVoice: 'ちいさいのは どっちかな？',
    items: [
      { id: 'airplane', name: 'おおきい ひこうき', emoji: '✈️', isCorrect: false, sizeDisplay: 'big' },
      { id: 'car', name: 'ちいさい くるま', emoji: '🚗', isCorrect: true, sizeDisplay: 'small' }
    ]
  }
];

// 6. いろあわせ（カラーハント）
export interface ColorQuestion {
  id: number;
  colorName: string;
  colorHex: string;
  title: string;
  promptVoice: string;
  targetId: string;
  options: Item[];
}

export const COLOR_QUESTIONS: ColorQuestion[] = [
  {
    id: 1,
    colorName: 'あか',
    colorHex: 'text-red-500',
    title: 'あかい ものは ど〜れ？',
    promptVoice: 'あかい ものは どれかな？',
    targetId: 'apple',
    options: [ALL_ITEMS.banana, ALL_ITEMS.apple, ALL_ITEMS.frog]
  },
  {
    id: 2,
    colorName: 'あお',
    colorHex: 'text-blue-500',
    title: 'あおい ものは ど〜れ？',
    promptVoice: 'あおい ものは どれかな？',
    targetId: 'blueCar',
    options: [ALL_ITEMS.fire, ALL_ITEMS.blueCar, ALL_ITEMS.bus]
  },
  {
    id: 3,
    colorName: 'きいろ',
    colorHex: 'text-amber-500',
    title: 'きいろい ものは ど〜れ？',
    promptVoice: 'きいろい ものは どれかな？',
    targetId: 'banana',
    options: [ALL_ITEMS.banana, ALL_ITEMS.strawberry, ALL_ITEMS.grape]
  },
  {
    id: 4,
    colorName: 'みどり',
    colorHex: 'text-emerald-500',
    title: 'みどりの ものは ど〜れ？',
    promptVoice: 'みどりの ものは どれかな？',
    targetId: 'frog',
    options: [ALL_ITEMS.dog, ALL_ITEMS.frog, ALL_ITEMS.cat]
  }
];

// 7. かずを かぞえよう（1〜5のカウント）
export interface CountQuestion {
  id: number;
  count: number;
  item: Item;
  title: string;
  promptVoice: string;
}

export const COUNT_QUESTIONS: CountQuestion[] = [
  {
    id: 1,
    count: 2,
    item: ALL_ITEMS.apple,
    title: 'りんごは なんこ あるかな？',
    promptVoice: 'りんごは なんこ あるかな？ タッチして かぞえてみよう！'
  },
  {
    id: 2,
    count: 3,
    item: ALL_ITEMS.star,
    title: 'おほしさまは なんこ あるかな？',
    promptVoice: 'おほしさまは なんこ あるかな？ タッチして かぞえてみよう！'
  },
  {
    id: 3,
    count: 1,
    item: ALL_ITEMS.panda,
    title: 'ぱんださんは なんびき いるかな？',
    promptVoice: 'ぱんださんは なんびき いるかな？ タッチして かぞえてみよう！'
  },
  {
    id: 4,
    count: 4,
    item: ALL_ITEMS.car,
    title: 'くるまは なんたい あるかな？',
    promptVoice: 'くるまは なんたい あるかな？ タッチして かぞえてみよう！'
  }
];

// 8. かくれんぼクイズ（一部分あて）
export interface HideSeekQuestion {
  id: number;
  title: string;
  promptVoice: string;
  hintDescription: string;
  target: Item;
  revealedEmoji: string;
  peekEmoji: string;
  options: Item[];
}

export const HIDE_SEEK_QUESTIONS: HideSeekQuestion[] = [
  {
    id: 1,
    title: 'だれが かくれているかな？',
    promptVoice: 'くさむらに だれが かくれているかな？',
    hintDescription: 'なが〜い おみみが チラリ！',
    target: ALL_ITEMS.rabbit,
    revealedEmoji: '🐰',
    peekEmoji: '👂🐰',
    options: [ALL_ITEMS.bear, ALL_ITEMS.rabbit, ALL_ITEMS.dog]
  },
  {
    id: 2,
    title: 'だれが かくれているかな？',
    promptVoice: 'だれが かくれているかな？',
    hintDescription: 'なが〜い おはなが チラリ！',
    target: ALL_ITEMS.elephant,
    revealedEmoji: '🐘',
    peekEmoji: '👃🐘',
    options: [ALL_ITEMS.elephant, ALL_ITEMS.lion, ALL_ITEMS.cat]
  },
  {
    id: 3,
    title: 'だれが かくれているかな？',
    promptVoice: 'だれが かくれているかな？',
    hintDescription: 'しろくろの まるいおみみが チラリ！',
    target: ALL_ITEMS.panda,
    revealedEmoji: '🐼',
    peekEmoji: '🐼',
    options: [ALL_ITEMS.chick, ALL_ITEMS.panda, ALL_ITEMS.rabbit]
  },
  {
    id: 4,
    title: 'だれが かくれているかな？',
    promptVoice: 'だれが かくれているかな？',
    hintDescription: 'かっこいい たてがみが チラリ！',
    target: ALL_ITEMS.lion,
    revealedEmoji: '🦁',
    peekEmoji: '🦁',
    options: [ALL_ITEMS.lion, ALL_ITEMS.cat, ALL_ITEMS.bear]
  }
];

// 9. ごはんを あげよう（もぐもぐタイム）
export interface FeedQuestion {
  id: number;
  animal: Item;
  targetFood: Item;
  title: string;
  promptVoice: string;
  options: Item[];
}

export const FEED_QUESTIONS: FeedQuestion[] = [
  {
    id: 1,
    animal: ALL_ITEMS.rabbit,
    targetFood: ALL_ITEMS.carrot,
    title: 'うさぎさんに ごはんをあげよう！',
    promptVoice: 'うさぎさんが すきな ごはんは どれかな？',
    options: [ALL_ITEMS.carrot, ALL_ITEMS.fish, ALL_ITEMS.car]
  },
  {
    id: 2,
    animal: ALL_ITEMS.monkey,
    targetFood: ALL_ITEMS.banana,
    title: 'おさるさんに ごはんをあげよう！',
    promptVoice: 'おさるさんが すきな ごはんは どれかな？',
    options: [ALL_ITEMS.bread, ALL_ITEMS.banana, ALL_ITEMS.apple]
  },
  {
    id: 3,
    animal: ALL_ITEMS.panda,
    targetFood: ALL_ITEMS.bamboo,
    title: 'ぱんださんに ごはんをあげよう！',
    promptVoice: 'ぱんださんが すきな ごはんは どれかな？',
    options: [ALL_ITEMS.bamboo, ALL_ITEMS.strawberry, ALL_ITEMS.watermelon]
  },
  {
    id: 4,
    animal: ALL_ITEMS.cat,
    targetFood: ALL_ITEMS.fish,
    title: 'ねこちゃんに ごはんをあげよう！',
    promptVoice: 'ねこちゃんが すきな ごはんは どれかな？',
    options: [ALL_ITEMS.candy, ALL_ITEMS.fish, ALL_ITEMS.carrot]
  }
];

// 10. だれの こえかな？（なきごえクイズ）
export interface SoundQuizQuestion {
  id: number;
  animal: Item;
  soundText: string;
  voiceText: string;
  title: string;
  promptVoice: string;
  options: Item[];
}

export const SOUND_QUIZ_QUESTIONS: SoundQuizQuestion[] = [
  {
    id: 1,
    animal: ALL_ITEMS.dog,
    soundText: 'ワンワン！ ワンワン！',
    voiceText: 'ワンワン！ワンワン！って なくのは だーれだ？',
    title: 'だれの こえかな？',
    promptVoice: 'ワンワン！ワンワン！って なくのは だーれだ？',
    options: [ALL_ITEMS.dog, ALL_ITEMS.cat, ALL_ITEMS.elephant]
  },
  {
    id: 2,
    animal: ALL_ITEMS.cat,
    soundText: 'ニャーオ！ ニャーオ！',
    voiceText: 'ニャーオ！ニャーオ！って なくのは だーれだ？',
    title: 'だれの こえかな？',
    promptVoice: 'ニャーオ！ニャーオ！って なくのは だーれだ？',
    options: [ALL_ITEMS.bear, ALL_ITEMS.cat, ALL_ITEMS.rabbit]
  },
  {
    id: 3,
    animal: ALL_ITEMS.elephant,
    soundText: 'パオーン！ パオーン！',
    voiceText: 'パオーン！パオーン！って なくのは だーれだ？',
    title: 'だれの こえかな？',
    promptVoice: 'パオーン！パオーン！って なくのは だーれだ？',
    options: [ALL_ITEMS.lion, ALL_ITEMS.elephant, ALL_ITEMS.chick]
  },
  {
    id: 4,
    animal: ALL_ITEMS.lion,
    soundText: 'ガオー！ ガオー！',
    voiceText: 'ガオー！ガオー！って なくのは だーれだ？',
    title: 'だれの こえかな？',
    promptVoice: 'ガオー！ガオー！って なくのは だーれだ？',
    options: [ALL_ITEMS.panda, ALL_ITEMS.lion, ALL_ITEMS.monkey]
  }
];

// 11. はんぶんこ パズル（2ピース絵合わせ）
export interface HalfPuzzleQuestion {
  id: number;
  item: Item;
  title: string;
  promptVoice: string;
  options: Item[];
}

export const HALF_PUZZLE_QUESTIONS: HalfPuzzleQuestion[] = [
  {
    id: 1,
    item: ALL_ITEMS.police,
    title: 'はんぶんこ パズル',
    promptVoice: 'パトカーの もう はんぶんは どれかな？',
    options: [ALL_ITEMS.police, ALL_ITEMS.apple, ALL_ITEMS.airplane]
  },
  {
    id: 2,
    item: ALL_ITEMS.apple,
    title: 'はんぶんこ パズル',
    promptVoice: 'りんごの もう はんぶんは どれかな？',
    options: [ALL_ITEMS.dog, ALL_ITEMS.apple, ALL_ITEMS.car]
  },
  {
    id: 3,
    item: ALL_ITEMS.airplane,
    title: 'はんぶんこ パズル',
    promptVoice: 'ひこうきの もう はんぶんは どれかな？',
    options: [ALL_ITEMS.banana, ALL_ITEMS.airplane, ALL_ITEMS.cat]
  },
  {
    id: 4,
    item: ALL_ITEMS.dog,
    title: 'はんぶんこ パズル',
    promptVoice: 'わんちゃんの もう はんぶんは どれかな？',
    options: [ALL_ITEMS.elephant, ALL_ITEMS.strawberry, ALL_ITEMS.dog]
  }
];

// 12. どっちが おおい？（りょうのくらべっこ）
export interface MoreQuestion {
  id: number;
  type: 'more' | 'less';
  title: string;
  promptVoice: string;
  item: Item;
  countA: number;
  countB: number;
  correctSide: 'A' | 'B';
}

export const MORE_QUESTIONS: MoreQuestion[] = [
  {
    id: 1,
    type: 'more',
    title: 'いっぱい あるのは どっち？',
    promptVoice: 'あめが いっぱい あるのは どっちかな？',
    item: ALL_ITEMS.candy,
    countA: 1,
    countB: 4,
    correctSide: 'B'
  },
  {
    id: 2,
    type: 'more',
    title: 'いっぱい あるのは どっち？',
    promptVoice: 'ほしが いっぱい あるのは どっちかな？',
    item: ALL_ITEMS.star,
    countA: 5,
    countB: 2,
    correctSide: 'A'
  },
  {
    id: 3,
    type: 'less',
    title: 'すくないのは どっち？',
    promptVoice: 'すくないのは どっちかな？ ひとつだけのほうは どれ？',
    item: ALL_ITEMS.apple,
    countA: 1,
    countB: 3,
    correctSide: 'A'
  },
  {
    id: 4,
    type: 'more',
    title: 'いっぱい いるのは どっち？',
    promptVoice: 'ひよこが いっぱい いるのは どっちかな？',
    item: ALL_ITEMS.chick,
    countA: 2,
    countB: 5,
    correctSide: 'B'
  }
];

// 13. どんな おかお？（きもち・ひょうじょう）
export interface FaceQuestion {
  id: number;
  emotion: string;
  title: string;
  promptVoice: string;
  options: {
    id: string;
    emoji: string;
    label: string;
    isCorrect: boolean;
  }[];
}

export const FACE_QUESTIONS: FaceQuestion[] = [
  {
    id: 1,
    emotion: 'にこにこ',
    title: 'にこにこ えがおは ど〜れ？',
    promptVoice: 'にこにこ わらっているのは どーれ？',
    options: [
      { id: 'happy', emoji: '😊', label: 'にこにこ', isCorrect: true },
      { id: 'sad', emoji: '😢', label: 'えんえん', isCorrect: false },
      { id: 'angry', emoji: '😡', label: 'ぷんぷん', isCorrect: false },
    ]
  },
  {
    id: 2,
    emotion: 'えんえん',
    title: 'ないているのは ど〜れ？',
    promptVoice: 'えんえん ないているのは どーれ？',
    options: [
      { id: 'surprised', emoji: '😲', label: 'びっくり', isCorrect: false },
      { id: 'sad', emoji: '😢', label: 'えんえん', isCorrect: true },
      { id: 'happy', emoji: '😊', label: 'にこにこ', isCorrect: false },
    ]
  },
  {
    id: 3,
    emotion: 'ぷんぷん',
    title: 'おこっているのは ど〜れ？',
    promptVoice: 'ぷんぷん おこっているのは どーれ？',
    options: [
      { id: 'angry', emoji: '😡', label: 'ぷんぷん', isCorrect: true },
      { id: 'happy', emoji: '😊', label: 'にこにこ', isCorrect: false },
      { id: 'sleepy', emoji: '😴', label: 'ねむねむ', isCorrect: false },
    ]
  },
  {
    id: 4,
    emotion: 'びっくり',
    title: 'びっくりしているのは ど〜れ？',
    promptVoice: 'おめめ まるく びっくりしているのは どーれ？',
    options: [
      { id: 'sad', emoji: '😢', label: 'えんえん', isCorrect: false },
      { id: 'surprised', emoji: '😲', label: 'びっくり', isCorrect: true },
      { id: 'angry', emoji: '😡', label: 'ぷんぷん', isCorrect: false },
    ]
  }
];

// 14. おそらの おてんき（てんきと もちもの）
export interface WeatherQuestion {
  id: number;
  weatherEmoji: string;
  weatherName: string;
  title: string;
  promptVoice: string;
  correctItem: { id: string; name: string; emoji: string };
  options: { id: string; name: string; emoji: string; isCorrect: boolean }[];
}

export const WEATHER_QUESTIONS: WeatherQuestion[] = [
  {
    id: 1,
    weatherEmoji: '🌧️',
    weatherName: 'あめ',
    title: 'あめが ふってきたよ！',
    promptVoice: 'あめが ふってきたよ！もっていくのは どれかな？',
    correctItem: { id: 'umbrella', name: 'かさ', emoji: '🌂' },
    options: [
      { id: 'umbrella', name: 'かさ', emoji: '🌂', isCorrect: true },
      { id: 'swim', name: 'みずぎ', emoji: '🩳', isCorrect: false },
      { id: 'fan', name: 'せんぷうき', emoji: '🌀', isCorrect: false },
    ]
  },
  {
    id: 2,
    weatherEmoji: '☀️',
    weatherName: 'はれ',
    title: 'ぽかぽか いいおてんき！',
    promptVoice: 'おひさま ぽかぽか！あたまに かぶるのは どれかな？',
    correctItem: { id: 'hat', name: 'ぼうし', emoji: '🧢' },
    options: [
      { id: 'boots', name: 'ながぐつ', emoji: '👢', isCorrect: false },
      { id: 'hat', name: 'ぼうし', emoji: '🧢', isCorrect: true },
      { id: 'muffler', name: 'まふらー', emoji: '🧣', isCorrect: false },
    ]
  },
  {
    id: 3,
    weatherEmoji: '❄️',
    weatherName: 'ゆき',
    title: 'さむ〜い ゆきの ひ！',
    promptVoice: 'ゆきが ふってきたよ！てに つけるのは どれかな？',
    correctItem: { id: 'gloves', name: 'てぶくろ', emoji: '🧤' },
    options: [
      { id: 'gloves', name: 'てぶくろ', emoji: '🧤', isCorrect: true },
      { id: 'fan', name: 'うちわ', emoji: '🪭', isCorrect: false },
      { id: 'sandal', name: 'さんだる', emoji: '🩴', isCorrect: false },
    ]
  }
];

// 15. おやこ あわせ（あかちゃんとお母さん）
export interface ParentChildQuestion {
  id: number;
  babyEmoji: string;
  babyName: string;
  title: string;
  promptVoice: string;
  options: { id: string; name: string; emoji: string; isCorrect: boolean }[];
}

export const PARENT_CHILD_QUESTIONS: ParentChildQuestion[] = [
  {
    id: 1,
    babyEmoji: '🐥',
    babyName: 'ひよこちゃん',
    title: 'ひよこちゃんの おかあさんは？',
    promptVoice: 'ひよこちゃんの おかあさんは だーれだ？',
    options: [
      { id: 'hen', name: 'にわとり', emoji: '🐔', isCorrect: true },
      { id: 'frog', name: 'かえる', emoji: '🐸', isCorrect: false },
      { id: 'cow', name: 'うし', emoji: '🐮', isCorrect: false },
    ]
  },
  {
    id: 2,
    babyEmoji: '🫧',
    babyName: 'おたまじゃくし',
    title: 'おたまじゃくしの おかあさんは？',
    promptVoice: 'おたまじゃくしの おかあさんは だーれだ？',
    options: [
      { id: 'duck', name: 'あひる', emoji: '🦆', isCorrect: false },
      { id: 'frog', name: 'かえる', emoji: '🐸', isCorrect: true },
      { id: 'monkey', name: 'さる', emoji: '🐵', isCorrect: false },
    ]
  },
  {
    id: 3,
    babyEmoji: '🐶',
    babyName: 'こいぬちゃん',
    title: 'こいぬちゃんの おかあさんは？',
    promptVoice: 'こいぬちゃんの おかあさんは だーれだ？',
    options: [
      { id: 'dog', name: 'いぬ', emoji: '🐕', isCorrect: true },
      { id: 'tiger', name: 'とら', emoji: '🐯', isCorrect: false },
      { id: 'pig', name: 'ぶた', emoji: '🐷', isCorrect: false },
    ]
  },
  {
    id: 4,
    babyEmoji: '🐛',
    babyName: 'あおむしちゃん',
    title: 'おおきくなったら なにになる？',
    promptVoice: 'あおむしちゃんが おおきくなったら なにになるかな？',
    options: [
      { id: 'bee', name: 'はち', emoji: '🐝', isCorrect: false },
      { id: 'butterfly', name: 'ちょうちょ', emoji: '🦋', isCorrect: true },
      { id: 'spider', name: 'くも', emoji: '🕷️', isCorrect: false },
    ]
  }
];

// 16. おもちゃ おかたづけ（おそうじ・せいかつ）
export interface CleanUpItem {
  id: string;
  name: string;
  emoji: string;
}

export const CLEAN_UP_ITEMS: CleanUpItem[] = [
  { id: '1', name: 'くるま', emoji: '🚗' },
  { id: '2', name: 'くまちゃん', emoji: '🧸' },
  { id: '3', name: 'ぼーる', emoji: '⚽' },
  { id: '4', name: 'ろぼっと', emoji: '🤖' },
  { id: '5', name: 'ひこうき', emoji: '✈️' },
];

// 17. ポンポン たいこ（音とリズムあそび）
export interface DrumQuestion {
  targetTaps: number;
  title: string;
  promptVoice: string;
}

// 18. ながいのは どっち？（ながさくらべ）
export interface LengthQuestion {
  id: number;
  type: 'longer' | 'shorter';
  title: string;
  promptVoice: string;
  itemA: { id: string; name: string; emoji: string; visualLength: 'long' | 'short'; isCorrect: boolean };
  itemB: { id: string; name: string; emoji: string; visualLength: 'long' | 'short'; isCorrect: boolean };
}

export const LENGTH_QUESTIONS: LengthQuestion[] = [
  {
    id: 1,
    type: 'longer',
    title: 'ながいのは どっち？',
    promptVoice: 'ながい でんしゃは どっちかな？',
    itemA: { id: 'train_long', name: 'ながい でんしゃ', emoji: '🚃🚃🚃', visualLength: 'long', isCorrect: true },
    itemB: { id: 'train_short', name: 'みじかい でんしゃ', emoji: '🚃', visualLength: 'short', isCorrect: false }
  },
  {
    id: 2,
    type: 'longer',
    title: 'ながいのは どっち？',
    promptVoice: 'ながい へびさんは どっちかな？',
    itemA: { id: 'worm_short', name: 'みみずさん', emoji: '🪱', visualLength: 'short', isCorrect: false },
    itemB: { id: 'snake_long', name: 'ながい へびさん', emoji: '🐍', visualLength: 'long', isCorrect: true }
  },
  {
    id: 3,
    type: 'shorter',
    title: 'みじかいのは どっち？',
    promptVoice: 'みじかい えんぴつは どっちかな？',
    itemA: { id: 'pencil_short', name: 'みじかい えんぴつ', emoji: '✏️', visualLength: 'short', isCorrect: true },
    itemB: { id: 'pencil_long', name: 'ながい えんぴつ', emoji: '✏️✏️✏️', visualLength: 'long', isCorrect: false }
  }
];

// 19. あわあわ ぴかぴか（よごれおとし・手洗い）
export interface WashTarget {
  id: number;
  name: string;
  dirtyEmoji: string;
  cleanEmoji: string;
  title: string;
  promptVoice: string;
  tapsNeeded: number;
}

export const WASH_TARGETS: WashTarget[] = [
  {
    id: 1,
    name: 'て',
    dirtyEmoji: '🖐️', // どろんこ
    cleanEmoji: '✨🖐️✨',
    title: 'おててを あらおう！',
    promptVoice: 'どろんこの おててを タッチして あわあわ ぴかぴかにしよう！',
    tapsNeeded: 3
  },
  {
    id: 2,
    name: 'くるま',
    dirtyEmoji: '🚙',
    cleanEmoji: '✨🚙✨',
    title: 'くるまを あらおう！',
    promptVoice: 'くるまを タッチして あわあわ ぴかぴかにしよう！',
    tapsNeeded: 3
  },
  {
    id: 3,
    name: 'おさら',
    dirtyEmoji: '🍽️',
    cleanEmoji: '✨🍽️✨',
    title: 'おさらを あらおう！',
    promptVoice: 'おさらを タッチして あわあわ ぴかぴかにしよう！',
    tapsNeeded: 3
  }
];

// 20. これ なーんだ？（どアップ拡大クイズ）
export interface ZoomQuizQuestion {
  id: number;
  title: string;
  promptVoice: string;
  hintZoomText: string;
  zoomEmoji: string;
  zoomColor: string;
  targetItem: Item;
  options: Item[];
}

export const ZOOM_QUIZ_QUESTIONS: ZoomQuizQuestion[] = [
  {
    id: 1,
    title: 'これ な〜んだ？',
    promptVoice: 'どアップの これ なーんだ？',
    hintZoomText: 'あかい つぶつぶ！',
    zoomEmoji: '🍓',
    zoomColor: 'bg-rose-100',
    targetItem: ALL_ITEMS.strawberry,
    options: [ALL_ITEMS.apple, ALL_ITEMS.strawberry, ALL_ITEMS.watermelon]
  },
  {
    id: 2,
    title: 'これ な〜んだ？',
    promptVoice: 'みどりの しましま！これ なーんだ？',
    hintZoomText: 'みどりと くろの しましま！',
    zoomEmoji: '🍉',
    zoomColor: 'bg-emerald-100',
    targetItem: ALL_ITEMS.watermelon,
    options: [ALL_ITEMS.watermelon, ALL_ITEMS.banana, ALL_ITEMS.grape]
  },
  {
    id: 3,
    title: 'これ な〜んだ？',
    promptVoice: 'きいろい みずたま！これ なーんだ？',
    hintZoomText: 'きいろくて あま〜い！',
    zoomEmoji: '🍌',
    zoomColor: 'bg-yellow-100',
    targetItem: ALL_ITEMS.banana,
    options: [ALL_ITEMS.chick, ALL_ITEMS.orange, ALL_ITEMS.banana]
  }
];

