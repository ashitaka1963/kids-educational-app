import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { HIDE_SEEK_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface HideSeekGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const HideSeekGame: React.FC<HideSeekGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = HIDE_SEEK_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(`${currentQ.promptVoice} ${currentQ.hintDescription}`);
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

      speechManager.speak(`ばぁ！せいかい！${item.name} でしたー！みつかっちゃった！`);

      setTimeout(() => {
        if (currentIndex < HIDE_SEEK_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsRevealed(false);
        } else {
          setShowReward(true);
        }
      }, 1800);
    } else {
      setWrongId(item.id);
      soundManager.playTryAgain();
      speechManager.speak(`あれ？${item.name} じゃないみたい。よくみてみてね！`);

      setTimeout(() => {
        setWrongId(null);
      }, 900);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsRevealed(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-lime-50 via-emerald-50 to-green-100 overflow-hidden">
      <Header
        title="かくれんぼクイズ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-lime-400 text-lime-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-lime-900 font-bold text-sm sm:text-base mt-2 bg-lime-100 px-4 py-1 rounded-full border border-lime-300">
            🔍 {currentQ.hintDescription}
          </p>
        </div>

        {/* 中央：草むらかくれんぼボックス */}
        <div className="my-auto flex flex-col items-center">
          <div className="w-56 h-48 sm:w-72 sm:h-56 rounded-3xl bg-white shadow-2xl border-4 border-lime-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* かくれている動物 / 現れた動物 */}
            <div
              className={`transition-all duration-500 transform ${
                isRevealed ? 'scale-125 z-20' : 'scale-95 translate-y-3 z-0'
              }`}
            >
              <span className="text-8xl sm:text-9xl select-none">
                {currentQ.revealedEmoji}
              </span>
            </div>

            {/* 手前にかぶさる草むら（正解すると左右に開いて消える） */}
            <div
              className={`absolute inset-x-0 bottom-0 h-28 sm:h-32 bg-gradient-to-t from-emerald-500 to-lime-400 flex items-center justify-center transition-all duration-500 z-10 ${
                isRevealed ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
              }`}
            >
              <div className="text-4xl sm:text-5xl flex gap-1 animate-wiggle">
                <span>🌿</span>
                <span>🌾</span>
                <span>🌿</span>
              </div>
            </div>

            {/* 正解時の名前バッジ */}
            {isRevealed && (
              <div className="absolute top-2 font-black text-emerald-950 text-xl sm:text-2xl animate-stamp bg-emerald-100 px-5 py-1.5 rounded-full border-2 border-emerald-400 z-30">
                {currentQ.target.name}！
              </div>
            )}
          </div>
        </div>

        {/* 選択肢（3個並び） */}
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
                      : 'border-white hover:border-lime-300 hover:shadow-xl'
                  }`}
                >
                  <span className="text-6xl sm:text-8xl select-none">
                    {item.emoji}
                  </span>
                  <span className="font-extrabold text-lime-950 text-base sm:text-lg mt-1">
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
        title="かくれんぼ ぜんぶみつけたね！"
        subtitle="よくみて みつけられたね！すごい！"
        hasNext={false}
      />
    </div>
  );
};
