import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { CLEAN_UP_ITEMS, CleanUpItem } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface CleanUpGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const CleanUpGame: React.FC<CleanUpGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const items = CLEAN_UP_ITEMS;
  const [cleanedIds, setCleanedIds] = useState<string[]>([]);
  const [showReward, setShowReward] = useState(false);

  const promptVoice = 'おへやの おもちゃを タッチして はこに おかたづけしよう！';

  const playPrompt = () => {
    speechManager.speak(promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCleanItem = (item: CleanUpItem) => {
    if (cleanedIds.includes(item.id)) return;

    soundManager.playTap();
    soundManager.playGlitter();
    const nextCleaned = [...cleanedIds, item.id];
    setCleanedIds(nextCleaned);

    const compliments = ['ないす！', 'ぽいっ！', '上手！', 'ぴかぴか！'];
    speechManager.speak(`${item.name}、${compliments[Math.floor(Math.random() * compliments.length)]}`);

    if (nextCleaned.length === items.length) {
      setTimeout(() => {
        soundManager.playSuccess();
        onAddStar();
        speechManager.speak('おへやが ぜんぶ ぴかぴかになったね！おかたづけ めいじん！');
        setTimeout(() => {
          setShowReward(true);
        }, 1500);
      }, 500);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCleanedIds([]);
  };

  const remaining = items.length - cleanedIds.length;

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 overflow-hidden">
      <Header
        title="おもちゃおかたづけ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-2">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-amber-400 text-amber-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>おもちゃを タッチして おかたづけ！</span>
          </div>
          <div className="flex items-center gap-2 mt-2 bg-amber-100 px-4 py-1.5 rounded-2xl border border-amber-300">
            <span className="text-amber-900 font-bold text-sm sm:text-base">
              のこり <strong className="text-amber-700 text-xl font-black">{remaining}</strong> こ！
            </span>
          </div>
        </div>

        {/* 散らかったお部屋エリア */}
        <div className="w-full grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 my-auto max-w-2xl px-2">
          {items.map((item) => {
            const isCleaned = cleanedIds.includes(item.id);

            return (
              <button
                key={item.id}
                disabled={isCleaned}
                onClick={() => handleCleanItem(item)}
                className={`kid-btn h-28 sm:h-36 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative ${
                  isCleaned
                    ? 'opacity-20 scale-75 bg-gray-100 border-gray-300 grayscale'
                    : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-xl'
                }`}
              >
                <span className="text-5xl sm:text-7xl select-none animate-bounce-short">
                  {item.emoji}
                </span>
                <span className="font-extrabold text-amber-950 text-xs sm:text-sm mt-1">
                  {item.name}
                </span>

                {isCleaned && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-stamp">✨</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 下部：おもちゃばこ */}
        <div className="w-full max-w-lg bg-amber-200/80 backdrop-blur rounded-3xl p-3 sm:p-4 border-4 border-amber-400 shadow-xl mb-2 flex flex-col items-center">
          <div className="text-sm sm:text-base font-black text-amber-950 mb-1 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span>おもちゃばこ</span>
          </div>
          <div className="flex justify-center items-center gap-2 min-h-[48px] flex-wrap">
            {cleanedIds.map((id) => {
              const it = items.find((i) => i.id === id);
              if (!it) return null;
              return (
                <span
                  key={id}
                  className="text-2xl sm:text-3xl animate-stamp bg-white/80 p-1.5 rounded-xl shadow-inner border border-amber-300"
                >
                  {it.emoji}
                </span>
              );
            })}
            {Array.from({ length: Math.max(0, items.length - cleanedIds.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-dashed border-amber-400/60 flex items-center justify-center text-amber-500 font-bold"
                >
                  空
                </div>
              )
            )}
          </div>
        </div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="おへや ピッカピカ！"
        subtitle="おかたづけ じょうずにできたね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
