import React, { useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

export type GameMode =
  | 'menu'
  | 'match'
  | 'odd'
  | 'category'
  | 'silhouette'
  | 'size'
  | 'color'
  | 'count'
  | 'hideseek'
  | 'feed'
  | 'soundquiz'
  | 'halfpuzzle'
  | 'more'
  | 'face'
  | 'weather'
  | 'parentchild'
  | 'cleanup'
  | 'drum'
  | 'length'
  | 'wash'
  | 'zoomquiz';

interface MainMenuProps {
  onSelectGame: (game: GameMode) => void;
  starsCount: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectGame, starsCount }) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());

  useEffect(() => {
    const timer = setTimeout(() => {
      speechManager.speak('すきな あそびを えらんでね！');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleSound = () => {
    soundManager.playTap();
    const muted = soundManager.toggleMute();
    speechManager.setMuted(muted);
    setIsMuted(muted);
  };

  const handleGameSelect = (game: GameMode, title: string) => {
    soundManager.playTap();
    speechManager.speak(`${title} スタート！`);
    onSelectGame(game);
  };

  const games = [
    {
      id: 'match' as GameMode,
      title: 'おなじものさがし',
      subtitle: 'いっしょの えを みつけよう',
      emoji: '🐶',
      badge: 'あわせっこ',
      bgColor: 'bg-gradient-to-br from-amber-400 to-orange-400',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-950',
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'odd' as GameMode,
      title: 'まちがいさがし',
      subtitle: 'ひとつだけ ちがうの どーれ？',
      emoji: '🧐',
      badge: 'なかまはずれ',
      bgColor: 'bg-gradient-to-br from-sky-400 to-blue-500',
      borderColor: 'border-blue-600',
      textColor: 'text-sky-950',
      badgeColor: 'bg-sky-100 text-sky-900',
    },
    {
      id: 'category' as GameMode,
      title: 'なかまわけ',
      subtitle: 'のりもの・くだものを あつめよう',
      emoji: '🧺',
      badge: 'あつまれ',
      bgColor: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-600',
      textColor: 'text-emerald-950',
      badgeColor: 'bg-emerald-100 text-emerald-900',
    },
    {
      id: 'silhouette' as GameMode,
      title: 'シルエットクイズ',
      subtitle: 'このかげは だれかな？',
      emoji: '❓',
      badge: 'かたちあわせ',
      bgColor: 'bg-gradient-to-br from-purple-400 to-pink-500',
      borderColor: 'border-purple-600',
      textColor: 'text-purple-950',
      badgeColor: 'bg-purple-100 text-purple-900',
    },
    {
      id: 'size' as GameMode,
      title: 'おおきい・ちいさい',
      subtitle: 'おおきいのは どっちかな？',
      emoji: '🐘',
      badge: 'くらべっこ',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      borderColor: 'border-amber-600',
      textColor: 'text-amber-950',
      badgeColor: 'bg-yellow-100 text-yellow-900',
    },
    {
      id: 'color' as GameMode,
      title: 'いろあわせ',
      subtitle: 'あか・あお・きいろを さがそう',
      emoji: '🎨',
      badge: 'カラーハント',
      bgColor: 'bg-gradient-to-br from-rose-400 to-red-500',
      borderColor: 'border-red-600',
      textColor: 'text-rose-950',
      badgeColor: 'bg-rose-100 text-rose-900',
    },
    {
      id: 'count' as GameMode,
      title: 'かずかぞえ',
      subtitle: 'タッチして 1・2・3！',
      emoji: '🔢',
      badge: 'かぞえっこ',
      bgColor: 'bg-gradient-to-br from-teal-400 to-cyan-500',
      borderColor: 'border-cyan-600',
      textColor: 'text-teal-950',
      badgeColor: 'bg-teal-100 text-teal-900',
    },
    {
      id: 'hideseek' as GameMode,
      title: 'かくれんぼクイズ',
      subtitle: 'くさむらに だれがいる？',
      emoji: '🙈',
      badge: 'のぞきみ',
      bgColor: 'bg-gradient-to-br from-lime-400 to-green-500',
      borderColor: 'border-green-600',
      textColor: 'text-green-950',
      badgeColor: 'bg-lime-100 text-lime-900',
    },
    {
      id: 'feed' as GameMode,
      title: 'ごはんをあげよう',
      subtitle: 'すきな ごはんを もぐもぐ！',
      emoji: '🍽️',
      badge: 'もぐもぐ',
      bgColor: 'bg-gradient-to-br from-orange-400 to-amber-500',
      borderColor: 'border-orange-600',
      textColor: 'text-orange-950',
      badgeColor: 'bg-orange-100 text-orange-900',
    },
    {
      id: 'soundquiz' as GameMode,
      title: 'なきごえクイズ',
      subtitle: 'このこえは だれかな？',
      emoji: '🔊',
      badge: 'おとあて',
      bgColor: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      borderColor: 'border-indigo-600',
      textColor: 'text-blue-950',
      badgeColor: 'bg-blue-100 text-blue-900',
    },
    {
      id: 'halfpuzzle' as GameMode,
      title: 'はんぶんこパズル',
      subtitle: 'がったいして ひとつのえに！',
      emoji: '🧩',
      badge: '2ピース',
      bgColor: 'bg-gradient-to-br from-fuchsia-400 to-purple-500',
      borderColor: 'border-purple-600',
      textColor: 'text-purple-950',
      badgeColor: 'bg-purple-100 text-purple-900',
    },
    {
      id: 'more' as GameMode,
      title: 'どっちがおおい？',
      subtitle: 'いっぱい あるのは どっち？',
      emoji: '🍬',
      badge: 'りょうくらべ',
      bgColor: 'bg-gradient-to-br from-pink-400 to-rose-500',
      borderColor: 'border-rose-600',
      textColor: 'text-rose-950',
      badgeColor: 'bg-pink-100 text-pink-900',
    },
    {
      id: 'face' as GameMode,
      title: 'どんなおかお？',
      subtitle: 'にこにこ？ えんえん？',
      emoji: '😊',
      badge: 'きもち',
      bgColor: 'bg-gradient-to-br from-yellow-300 to-amber-400',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-950',
      badgeColor: 'bg-yellow-100 text-yellow-900',
    },
    {
      id: 'weather' as GameMode,
      title: 'おそらのおてんき',
      subtitle: 'あめのひは なにもっていく？',
      emoji: '☀️',
      badge: 'おてんき',
      bgColor: 'bg-gradient-to-br from-sky-400 to-teal-500',
      borderColor: 'border-teal-600',
      textColor: 'text-sky-950',
      badgeColor: 'bg-sky-100 text-sky-900',
    },
    {
      id: 'parentchild' as GameMode,
      title: 'おやこあわせ',
      subtitle: 'おかあさんは だれかな？',
      emoji: '🐣',
      badge: 'なかよし',
      bgColor: 'bg-gradient-to-br from-amber-300 to-orange-400',
      borderColor: 'border-orange-500',
      textColor: 'text-amber-950',
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'cleanup' as GameMode,
      title: 'おもちゃおかたづけ',
      subtitle: 'タッチして はこにぽいっ！',
      emoji: '📦',
      badge: 'せいかつ',
      bgColor: 'bg-gradient-to-br from-emerald-400 to-green-500',
      borderColor: 'border-green-600',
      textColor: 'text-emerald-950',
      badgeColor: 'bg-emerald-100 text-emerald-900',
    },
    {
      id: 'drum' as GameMode,
      title: 'ポンポンたいこ',
      subtitle: 'ドンドン！カッカッ！',
      emoji: '🥁',
      badge: 'リズム',
      bgColor: 'bg-gradient-to-br from-red-400 to-rose-500',
      borderColor: 'border-rose-600',
      textColor: 'text-red-950',
      badgeColor: 'bg-red-100 text-red-900',
    },
    {
      id: 'length' as GameMode,
      title: 'ながいのはどっち？',
      subtitle: 'なが〜いでんしゃは どっち？',
      emoji: '📏',
      badge: 'ながさ',
      bgColor: 'bg-gradient-to-br from-teal-400 to-emerald-500',
      borderColor: 'border-emerald-600',
      textColor: 'text-teal-950',
      badgeColor: 'bg-teal-100 text-teal-900',
    },
    {
      id: 'wash' as GameMode,
      title: 'あわあわぴかぴか',
      subtitle: 'タッチして ピッカピカ！',
      emoji: '🧼',
      badge: 'てあらい',
      bgColor: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      borderColor: 'border-blue-600',
      textColor: 'text-cyan-950',
      badgeColor: 'bg-cyan-100 text-cyan-900',
    },
    {
      id: 'zoomquiz' as GameMode,
      title: 'これな〜んだ？',
      subtitle: 'どアップの これ、だれかな？',
      emoji: '🔍',
      badge: 'すいり',
      bgColor: 'bg-gradient-to-br from-violet-400 to-purple-500',
      borderColor: 'border-purple-600',
      textColor: 'text-purple-950',
      badgeColor: 'bg-purple-100 text-purple-900',
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-100 overflow-hidden">
      {/* トップバー（固定） */}
      <header className="w-full px-4 py-3 sm:px-8 sm:py-3.5 flex items-center justify-between bg-white/80 backdrop-blur-md border-b-2 border-amber-200 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-3xl sm:text-4xl animate-wiggle">🌈</span>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-wide">
            キッズ ちえあそび
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 星バッジ */}
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-yellow-200 border-2 border-yellow-400 text-yellow-950 font-black text-lg sm:text-xl shadow-sm">
            <span className="text-2xl">⭐</span>
            <span>{starsCount}</span>
          </div>

          {/* 音声切替 */}
          <button
            onClick={toggleSound}
            className={`kid-btn p-2.5 rounded-2xl shadow-md border-2 ${
              isMuted
                ? 'bg-rose-100 border-rose-300 text-rose-600'
                : 'bg-emerald-100 border-emerald-400 text-emerald-800'
            }`}
            title={isMuted ? 'おとをだす' : 'おとをけす'}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>
        </div>
      </header>

      {/* スクロール可能なメインコンテンツ（全20ゲーム） */}
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 max-w-5xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 border-2 border-amber-300 shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
            <span className="text-lg sm:text-2xl font-black text-amber-950">
              すきな あそびを えらんでね！（ぜんぶで 20しゅるい！）
            </span>
          </div>
        </div>

        {/* 2列の大型カードグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 w-full pb-10">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id, game.title)}
              className={`kid-btn relative rounded-3xl p-4 sm:p-5 shadow-lg border-4 ${game.borderColor} ${game.bgColor} flex items-center justify-between text-left overflow-hidden group hover:scale-[1.01] hover:shadow-xl transition-all`}
            >
              {/* カード背景の装飾サークル */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 rounded-full blur-sm pointer-events-none" />

              {/* 左側：タイトルと説明 */}
              <div className="flex-1 z-10 pr-2">
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-xs font-black mb-1.5 shadow-sm ${game.badgeColor}`}
                >
                  {game.badge}
                </span>
                <h2
                  className={`text-xl sm:text-2xl font-black ${game.textColor} drop-shadow-sm mb-0.5 leading-tight`}
                >
                  {game.title}
                </h2>
                <p className="text-white font-extrabold text-xs sm:text-sm drop-shadow">
                  {game.subtitle}
                </p>
              </div>

              {/* 右側：大きなイラスト・アイコン */}
              <div className="z-10 flex items-center justify-center shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/95 shadow-md flex items-center justify-center border-2 border-white/60 group-hover:rotate-6 transition-transform">
                  <span className="text-4xl sm:text-5xl select-none">
                    {game.emoji}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* 下部のサポートメッセージ */}
      <footer className="py-2 text-center text-xs sm:text-sm text-amber-900/80 font-bold bg-white/60 shrink-0 border-t border-amber-200">
        💡 たくさんあそんで ⭐星をあつめよう！
      </footer>
    </div>
  );
};
