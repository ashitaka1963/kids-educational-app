import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { CATEGORY_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface CategoryGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const CategoryGame: React.FC<CategoryGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = CATEGORY_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleTapItem = (item: Item & { isTarget: boolean }) => {
    if (collectedIds.includes(item.id)) return; // 既に集めた

    soundManager.playTap();

    if (item.isTarget) {
      // 正解！集める
      soundManager.playSuccess();
      const nextCollected = [...collectedIds, item.id];
      setCollectedIds(nextCollected);

      const cheers = ['ピンポン！', 'あったー！', 'みつけたね！', 'いいね！'];
      speechManager.speak(`${cheers[Math.floor(Math.random() * cheers.length)]} ${item.name}！`);

      // 全て集めたかチェック
      if (nextCollected.length >= currentQ.targetCount) {
        onAddStar();
        setTimeout(() => {
          if (currentIndex < CATEGORY_QUESTIONS.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setCollectedIds([]);
          } else {
            setShowReward(true);
          }
        }, 1400);
      }
    } else {
      // 違うカテゴリ
      setWrongId(item.id);
      soundManager.playTryAgain();

      const categoryNames: Record<string, string> = {
        animal: 'どうぶつ',
        vehicle: 'のりもの',
        food: 'たべもの',
        nature: 'しぜん',
      };
      const catName = categoryNames[item.category] || '';
      speechManager.speak(`これは ${catName} だよ！${currentQ.category === 'vehicle' ? 'のりもの' : currentQ.category === 'food' ? 'たべもの' : 'どうぶつ'}をさがそう！`);

      setTimeout(() => {
        setWrongId(null);
      }, 900);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setCollectedIds([]);
  };

  const remainingCount = currentQ.targetCount - collectedIds.length;

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-green-100 overflow-hidden">
      <Header
        title="なかまわけ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 max-w-4xl mx-auto w-full">
        {/* ガイダンス＆残り個数 */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-2">
          <div className="bg-white/90 backdrop-blur px-5 py-2.5 rounded-full shadow-md border-2 border-emerald-400 text-emerald-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>

          <div className="flex items-center gap-2 mt-2 bg-emerald-100 px-4 py-1.5 rounded-2xl border border-emerald-300">
            <span className="text-emerald-900 font-bold text-sm sm:text-base">
              あと <strong className="text-emerald-700 text-xl font-black">{remainingCount}</strong> こ！
            </span>
          </div>
        </div>

        {/* アイテムグリッド（6個：3×2） */}
        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 my-auto max-w-2xl">
          {currentQ.items.map((item) => {
            const isCollected = collectedIds.includes(item.id);
            const isWrong = wrongId === item.id;

            return (
              <button
                key={item.id}
                disabled={isCollected}
                onClick={() => handleTapItem(item)}
                className={`kid-btn h-28 sm:h-36 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative ${
                  isCollected
                    ? 'opacity-30 scale-90 bg-gray-100 border-gray-300 grayscale'
                    : isWrong
                    ? 'border-rose-400 animate-wiggle bg-rose-50'
                    : `${item.color} hover:shadow-xl`
                }`}
              >
                <span className="text-5xl sm:text-7xl select-none">
                  {item.emoji}
                </span>
                <span className="font-extrabold text-emerald-950 text-sm sm:text-lg mt-1">
                  {item.name}
                </span>

                {isCollected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl animate-stamp">✨</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 集めたカゴ（あつまれボックス） */}
        <div className="w-full max-w-xl bg-white/80 backdrop-blur rounded-3xl p-3 sm:p-4 border-3 border-emerald-300 shadow-md mb-2">
          <div className="text-xs sm:text-sm font-bold text-emerald-800 text-center mb-1 flex items-center justify-center gap-1">
            <span>🧺 あつめたボックス</span>
          </div>
          <div className="flex justify-center items-center gap-2 sm:gap-3 min-h-[50px] sm:min-h-[64px]">
            {collectedIds.map((id) => {
              const it = currentQ.items.find((i) => i.id === id);
              if (!it) return null;
              return (
                <div
                  key={id}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shadow-inner animate-stamp text-2xl sm:text-4xl"
                >
                  {it.emoji}
                </div>
              );
            })}
            {Array.from({ length: Math.max(0, currentQ.targetCount - collectedIds.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-300 text-xl font-black"
                >
                  ？
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
        title="ぜんぶの なかまを あつめられたね！"
        subtitle="カテゴリわけ ばっちり！たいへんよくできました！"
        hasNext={false}
      />
    </div>
  );
};
