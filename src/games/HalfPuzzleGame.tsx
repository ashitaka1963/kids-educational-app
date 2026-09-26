import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { HALF_PUZZLE_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface HalfPuzzleGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const HalfPuzzleGame: React.FC<HalfPuzzleGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = HALF_PUZZLE_QUESTIONS[currentIndex];

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

    if (item.id === currentQ.item.id) {
      setSelectedId(item.id);
      setIsJoined(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      speechManager.speak(`パチン！がったい！せいかい！${item.name} になったね！`);

      setTimeout(() => {
        if (currentIndex < HALF_PUZZLE_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsJoined(false);
        } else {
          setShowReward(true);
        }
      }, 1800);
    } else {
      setWrongId(item.id);
      soundManager.playTryAgain();
      speechManager.speak('あれ？かたちが あわないみたい。もういっかい えらんでみよう！');

      setTimeout(() => {
        setWrongId(null);
      }, 900);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsJoined(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-purple-50 via-pink-50 to-indigo-50 overflow-hidden">
      <Header
        title="はんぶんこパズル"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-purple-400 text-purple-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-purple-900 font-bold text-sm sm:text-base mt-2">
            みぎがわの ピースを えらんで がったいさせよう！
          </p>
        </div>

        {/* 中央：パズルボード（左半分 ＋ 右半分） */}
        <div className="my-auto flex flex-col items-center">
          <div
            className={`w-64 h-48 sm:w-80 sm:h-56 rounded-3xl bg-white shadow-2xl border-4 border-purple-400 flex items-center justify-center p-3 relative transition-all duration-300 ${
              isJoined ? 'ring-4 ring-emerald-400 scale-105' : ''
            }`}
          >
            {/* 左半分ピース */}
            <div className="w-1/2 h-full flex items-center justify-end overflow-hidden border-r-2 border-dashed border-purple-300 pr-1">
              <span className="text-8xl sm:text-9xl select-none translate-x-[40%]">
                {currentQ.item.emoji}
              </span>
            </div>

            {/* 右半分ピース（点線枠または合体後の絵） */}
            <div className="w-1/2 h-full flex items-center justify-start overflow-hidden pl-1 relative">
              {isJoined ? (
                <span className="text-8xl sm:text-9xl select-none -translate-x-[40%] animate-stamp">
                  {currentQ.item.emoji}
                </span>
              ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/50">
                  <span className="text-3xl text-purple-300 font-black animate-pulse">
                    ？
                  </span>
                </div>
              )}
            </div>

            {/* 合体成功時の花丸 */}
            {isJoined && (
              <div className="absolute -top-3 -right-3 text-4xl animate-stamp">
                💮
              </div>
            )}
          </div>
        </div>

        {/* 選択肢（右半分ピースたち） */}
        <div className="w-full mb-3 sm:mb-6 max-w-xl">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 justify-center">
            {currentQ.options.map((item) => {
              const isSelected = selectedId === item.id;
              const isWrong = wrongId === item.id;

              return (
                <button
                  key={item.id}
                  disabled={isJoined}
                  onClick={() => handleSelect(item)}
                  className={`kid-btn h-32 sm:h-40 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative ${
                    item.color
                  } ${
                    isSelected && isJoined
                      ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                      : isWrong
                      ? 'border-rose-400 animate-wiggle bg-rose-50'
                      : 'border-white hover:border-purple-300 hover:shadow-xl'
                  }`}
                >
                  {/* 右半分だけを強調して見せる */}
                  <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-start overflow-hidden border border-purple-200 rounded-xl bg-white shadow-inner pl-0.5">
                    <span className="text-6xl sm:text-7xl select-none -translate-x-[40%]">
                      {item.emoji}
                    </span>
                  </div>

                  <span className="font-extrabold text-purple-950 text-xs sm:text-sm mt-1">
                    みぎがわ
                  </span>

                  {isSelected && isJoined && (
                    <div className="absolute -top-3 -right-3 text-3xl animate-stamp">
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
        title="パズル ぜんぶ完成！"
        subtitle="ぴったり がったいできたね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
