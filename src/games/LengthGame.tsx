import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { LENGTH_QUESTIONS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface LengthGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const LengthGame: React.FC<LengthGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongSide, setWrongSide] = useState<'A' | 'B' | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = LENGTH_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (side: 'A' | 'B') => {
    soundManager.playTap();

    const selectedItem = side === 'A' ? currentQ.itemA : currentQ.itemB;

    if (selectedItem.isCorrect) {
      setSelectedSide(side);
      setIsCorrect(true);
      setWrongSide(null);
      soundManager.playSuccess();
      onAddStar();

      const compliments =
        currentQ.type === 'longer'
          ? `せいかい！${selectedItem.name} のほうが なが〜いね！`
          : `せいかい！${selectedItem.name} のほうが みじかいね！`;
      speechManager.speak(compliments);

      setTimeout(() => {
        if (currentIndex < LENGTH_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedSide(null);
          setIsCorrect(null);
        } else {
          setShowReward(true);
        }
      }, 1800);
    } else {
      setWrongSide(side);
      soundManager.playTryAgain();
      const hint =
        currentQ.type === 'longer'
          ? 'こっちは みじかいほうだよ！ながいほうを えらんでね！'
          : 'こっちは ながいほうだよ！みじかいほうを えらんでね！';
      speechManager.speak(`あれれ？${hint}`);

      setTimeout(() => {
        setWrongSide(null);
      }, 900);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedSide(null);
    setIsCorrect(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-green-100 overflow-hidden">
      <Header
        title="ながさくらべ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-emerald-400 text-emerald-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-emerald-900 font-bold text-sm sm:text-base mt-2">
            ながさを よく みくらべて えらんでね
          </p>
        </div>

        {/* 2つのカード（上下または左右で長さを比較） */}
        <div className="w-full flex flex-col gap-4 sm:gap-6 my-auto max-w-2xl px-2">
          {/* 選択肢A */}
          <button
            disabled={isCorrect === true}
            onClick={() => handleSelect('A')}
            className={`kid-btn h-32 sm:h-40 rounded-3xl flex items-center justify-between px-6 sm:px-10 bg-white shadow-xl border-4 transition-all relative ${
              selectedSide === 'A' && isCorrect
                ? 'border-emerald-500 scale-102 ring-4 ring-emerald-300 bg-emerald-50'
                : wrongSide === 'A'
                ? 'border-rose-400 animate-wiggle bg-rose-50'
                : 'border-emerald-200 hover:border-emerald-400 hover:shadow-2xl'
            }`}
          >
            <span className="font-black text-emerald-950 text-base sm:text-xl shrink-0">
              {currentQ.itemA.name}
            </span>

            <div className="text-4xl sm:text-6xl tracking-widest select-none overflow-hidden truncate">
              {currentQ.itemA.emoji}
            </div>

            {selectedSide === 'A' && isCorrect && (
              <div className="absolute right-4 text-5xl animate-stamp">
                ⭕
              </div>
            )}
          </button>

          {/* 選択肢B */}
          <button
            disabled={isCorrect === true}
            onClick={() => handleSelect('B')}
            className={`kid-btn h-32 sm:h-40 rounded-3xl flex items-center justify-between px-6 sm:px-10 bg-white shadow-xl border-4 transition-all relative ${
              selectedSide === 'B' && isCorrect
                ? 'border-emerald-500 scale-102 ring-4 ring-emerald-300 bg-emerald-50'
                : wrongSide === 'B'
                ? 'border-rose-400 animate-wiggle bg-rose-50'
                : 'border-emerald-200 hover:border-emerald-400 hover:shadow-2xl'
            }`}
          >
            <span className="font-black text-emerald-950 text-base sm:text-xl shrink-0">
              {currentQ.itemB.name}
            </span>

            <div className="text-4xl sm:text-6xl tracking-widest select-none overflow-hidden truncate">
              {currentQ.itemB.emoji}
            </div>

            {selectedSide === 'B' && isCorrect && (
              <div className="absolute right-4 text-5xl animate-stamp">
                ⭕
              </div>
            )}
          </button>
        </div>

        <div className="h-4"></div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="ながさくらべ ばっちり！"
        subtitle="ながい・みじかいが よくわかったね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
