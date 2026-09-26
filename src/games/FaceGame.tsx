import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { FACE_QUESTIONS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface FaceGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const FaceGame: React.FC<FaceGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = FACE_QUESTIONS[currentIndex];

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

      speechManager.speak(`せいかい！${option.label} の おかお だね！`);

      setTimeout(() => {
        if (currentIndex < FACE_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsCorrect(null);
        } else {
          setShowReward(true);
        }
      }, 1600);
    } else {
      setWrongId(option.id);
      soundManager.playTryAgain();
      speechManager.speak(`あれれ？これは ${option.label} の おかお だよ！${currentQ.emotion} を さがしてみよう！`);

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
        title="どんなおかお？"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-2 sm:mt-4">
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-full shadow-md border-3 border-amber-400 text-amber-950 font-black text-xl sm:text-3xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-amber-800 font-bold text-sm sm:text-base mt-2">
            きもちに ぴったりの おかおを タッチしてね
          </p>
        </div>

        {/* 選択肢（3個の表情カード） */}
        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 my-auto max-w-2xl px-2">
          {currentQ.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isWrong = wrongId === option.id;

            return (
              <button
                key={option.id}
                disabled={isCorrect === true}
                onClick={() => handleSelect(option)}
                className={`kid-btn h-44 sm:h-56 rounded-3xl flex flex-col items-center justify-center p-3 bg-white shadow-xl border-4 transition-all relative ${
                  isSelected && isCorrect
                    ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                    : isWrong
                    ? 'border-rose-400 animate-wiggle bg-rose-50'
                    : 'border-amber-200 hover:border-amber-400 hover:shadow-2xl'
                }`}
              >
                <span className="text-7xl sm:text-9xl select-none animate-bounce-short">
                  {option.emoji}
                </span>

                <span className="font-black text-amber-950 text-base sm:text-xl mt-2">
                  {option.label}
                </span>

                {/* 正解の丸印 */}
                {isSelected && isCorrect && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-3xl">
                    <span className="text-7xl sm:text-9xl animate-stamp">⭕</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-4"></div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="おかおクイズ ぜんぶせいかい！"
        subtitle="きもちが よくわかったね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
