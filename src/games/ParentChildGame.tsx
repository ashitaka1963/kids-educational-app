import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { PARENT_CHILD_QUESTIONS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface ParentChildGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const ParentChildGame: React.FC<ParentChildGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = PARENT_CHILD_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (option: typeof currentQ.options[0]) => {
    soundManager.playTap();

    if (option.isCorrect) {
      setSelectedId(option.id);
      setIsCorrect(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      speechManager.speak(`せいかい！${currentQ.babyName}の おかあさんは ${option.name}！ぎゅーっ！`);

      setTimeout(() => {
        if (currentIndex < PARENT_CHILD_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsCorrect(null);
        } else {
          setShowReward(true);
        }
      }, 1800);
    } else {
      setWrongId(option.id);
      soundManager.playTryAgain();
      speechManager.speak(`あれれ？${option.name} じゃないみたい。もういっかい さがしてあげよう！`);

      setTimeout(() => {
        setWrongId(null);
      }, 900);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsCorrect(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-100 overflow-hidden">
      <Header
        title="おやこあわせ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-amber-400 text-amber-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-amber-800 font-bold text-sm sm:text-base mt-2">
            おかあさんを みつけて タッチしてあげてね
          </p>
        </div>

        {/* 中央：赤ちゃん動物 */}
        <div className="my-auto flex flex-col items-center">
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-white shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center p-4 relative">
            <span className="text-8xl sm:text-9xl select-none animate-bounce-short">
              {currentQ.babyEmoji}
            </span>
            <span className="font-black text-amber-950 text-xl sm:text-2xl mt-2">
              {currentQ.babyName}
            </span>
            {isCorrect && (
              <div className="absolute -top-3 -right-3 text-4xl animate-stamp">
                💖
              </div>
            )}
          </div>
        </div>

        {/* 選択肢（3個のお母さん候補） */}
        <div className="w-full mb-3 sm:mb-6 max-w-xl">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 justify-center">
            {currentQ.options.map((option) => {
              const isSelected = selectedId === option.id;
              const isWrong = wrongId === option.id;

              return (
                <button
                  key={option.id}
                  disabled={isCorrect === true}
                  onClick={() => handleSelect(option)}
                  className={`kid-btn h-32 sm:h-40 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative bg-white ${
                    isSelected && isCorrect
                      ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                      : isWrong
                      ? 'border-rose-400 animate-wiggle bg-rose-50'
                      : 'border-amber-200 hover:border-amber-400 hover:shadow-xl'
                  }`}
                >
                  <span className="text-6xl sm:text-8xl select-none">
                    {option.emoji}
                  </span>
                  <span className="font-extrabold text-amber-950 text-base sm:text-lg mt-1">
                    {option.name}
                  </span>

                  {isSelected && isCorrect && (
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
        title="みんな おかあさんに あえたね！"
        subtitle="やさしく さがしてあげられたね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
