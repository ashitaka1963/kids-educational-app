import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { ODD_QUESTIONS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface OddOneOutGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const OddOneOutGame: React.FC<OddOneOutGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = ODD_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (option: { id: string; isOdd: boolean; name: string }) => {
    soundManager.playTap();

    if (option.isOdd) {
      setSelectedId(option.id);
      setIsCorrect(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      const compliments = ['みつけた！せいかい！', 'すごい！ちがいが わかったね！', 'よくきづいたね！はなまる！'];
      const text = compliments[Math.floor(Math.random() * compliments.length)];
      speechManager.speak(text);

      setTimeout(() => {
        if (currentIndex < ODD_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsCorrect(null);
        } else {
          setShowReward(true);
        }
      }, 1400);
    } else {
      setWrongId(option.id);
      soundManager.playTryAgain();
      speechManager.speak('これは おなじ仲間だよ！ちがうのをさがしてみてね');

      setTimeout(() => {
        setWrongId(null);
      }, 800);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsCorrect(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-blue-100 overflow-hidden">
      <Header
        title="まちがいさがし"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-3xl mx-auto w-full">
        {/* ガイダンステキスト */}
        <div className="w-full flex flex-col items-center mt-2 sm:mt-4">
          <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-md border-2 border-sky-300 text-sky-950 font-black text-xl sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-sky-800 font-bold text-sm sm:text-base mt-2">
            ひとつだけ ちがうものを タッチしてね
          </p>
        </div>

        {/* 4分割カード（2×2レイアウトでタブレットでもスマホでも押しやすい） */}
        <div className="w-full grid grid-cols-2 gap-4 sm:gap-6 my-auto max-w-xl">
          {currentQ.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isWrong = wrongId === option.id;

            return (
              <button
                key={option.id}
                disabled={isCorrect === true}
                onClick={() => handleSelect(option)}
                className={`kid-btn aspect-square rounded-3xl flex flex-col items-center justify-center p-4 bg-white shadow-xl border-4 transition-all relative ${
                  isSelected && isCorrect
                    ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                    : isWrong
                    ? 'border-rose-400 animate-wiggle bg-rose-50'
                    : 'border-sky-200 hover:border-sky-400 hover:shadow-2xl'
                }`}
              >
                <span
                  className={`text-7xl sm:text-9xl transition-transform select-none ${
                    option.style || ''
                  }`}
                >
                  {option.emoji}
                </span>

                {/* 正解の丸印 */}
                {isSelected && isCorrect && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-3xl">
                    <span className="text-6xl sm:text-8xl animate-stamp">⭕</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 下部の余白調整 */}
        <div className="h-4"></div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="まちがいを ぜんぶ みつけられたね！"
        subtitle="よくみて ちがいが わかったね！すごい！"
        hasNext={false}
      />
    </div>
  );
};
