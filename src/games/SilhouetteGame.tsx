import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { SILHOUETTE_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface SilhouetteGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const SilhouetteGame: React.FC<SilhouetteGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = SILHOUETTE_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (item: Item) => {
    soundManager.playTap();

    if (item.id === currentQ.target.id) {
      setSelectedId(item.id);
      setIsRevealed(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      speechManager.speak(`ばぁ！せいかい！${item.name} でしたー！`);

      setTimeout(() => {
        if (currentIndex < SILHOUETTE_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsRevealed(false);
        } else {
          setShowReward(true);
        }
      }, 1600);
    } else {
      setWrongId(item.id);
      soundManager.playTryAgain();
      speechManager.speak('あれ？ちがうみたい。かたちを よくみてみよう！');

      setTimeout(() => {
        setWrongId(null);
      }, 800);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsRevealed(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-100 overflow-hidden">
      <Header
        title="シルエットクイズ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-3xl mx-auto w-full">
        {/* ガイダンス */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/90 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-2 border-purple-300 text-purple-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
        </div>

        {/* 中央：シルエット表示ボックス */}
        <div className="my-auto flex flex-col items-center">
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-white shadow-2xl border-4 border-purple-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* 正体が現れるアニメーション */}
            <div
              className={`transition-all duration-500 transform ${
                isRevealed
                  ? 'scale-110 filter-none'
                  : 'brightness-0 opacity-80'
              }`}
            >
              <span className="text-8xl sm:text-9xl select-none">
                {currentQ.target.emoji}
              </span>
            </div>

            {/* 当たったときの名前表示 */}
            {isRevealed && (
              <div className="absolute bottom-2 font-black text-purple-900 text-xl sm:text-2xl animate-bounce-short bg-purple-100 px-4 py-1 rounded-full border border-purple-300">
                {currentQ.target.name}！
              </div>
            )}

            {!isRevealed && (
              <div className="absolute top-2 right-3 text-2xl animate-pulse">
                ❓
              </div>
            )}
          </div>
        </div>

        {/* 選択肢カード（3個並び） */}
        <div className="w-full mb-3 sm:mb-6 max-w-xl">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 justify-center">
            {currentQ.options.map((item) => {
              const isSelected = selectedId === item.id;
              const isWrong = wrongId === item.id;

              return (
                <button
                  key={item.id}
                  disabled={isRevealed}
                  onClick={() => handleSelect(item)}
                  className={`kid-btn h-32 sm:h-40 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative ${
                    item.color
                  } ${
                    isSelected && isRevealed
                      ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                      : isWrong
                      ? 'border-rose-400 animate-wiggle bg-rose-50'
                      : 'border-white hover:border-purple-300 hover:shadow-xl'
                  }`}
                >
                  <span className="text-6xl sm:text-8xl select-none">
                    {item.emoji}
                  </span>
                  <span className="font-extrabold text-purple-950 text-base sm:text-lg mt-1">
                    {item.name}
                  </span>

                  {isSelected && isRevealed && (
                    <div className="absolute -top-3 -right-3 text-4xl animate-stamp">
                      ⭕
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="シルエットぜんぶ あてられたね！"
        subtitle="かたちを みるめが ばっちり！すごーい！"
        hasNext={false}
      />
    </div>
  );
};
