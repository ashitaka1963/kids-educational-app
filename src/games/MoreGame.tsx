import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { MORE_QUESTIONS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface MoreGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const MoreGame: React.FC<MoreGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongSide, setWrongSide] = useState<'A' | 'B' | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = MORE_QUESTIONS[currentIndex];

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

    if (side === currentQ.correctSide) {
      setSelectedSide(side);
      setIsCorrect(true);
      setWrongSide(null);
      soundManager.playSuccess();
      onAddStar();

      const count = side === 'A' ? currentQ.countA : currentQ.countB;
      const cheers =
        currentQ.type === 'more'
          ? `せいかい！こっちが いっぱいで ${count}こ あるね！`
          : `せいかい！こっちが すくなくて ${count}こ だね！`;
      speechManager.speak(cheers);

      setTimeout(() => {
        if (currentIndex < MORE_QUESTIONS.length - 1) {
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
        currentQ.type === 'more'
          ? 'こっちは すくないほうだよ！いっぱいのほうを えらんでね！'
          : 'こっちは いっぱいのほうだよ！すくないほうを えらんでね！';
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
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 overflow-hidden">
      <Header
        title="どっちがおおい？"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-rose-400 text-rose-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-rose-900 font-bold text-sm sm:text-base mt-2">
            お皿の なかを みくらべて えらんでね
          </p>
        </div>

        {/* 2つのお皿（左右比較） */}
        <div className="w-full grid grid-cols-2 gap-4 sm:gap-8 my-auto max-w-2xl px-2">
          {/* お皿A */}
          <button
            disabled={isCorrect === true}
            onClick={() => handleSelect('A')}
            className={`kid-btn h-52 sm:h-72 rounded-3xl flex flex-col items-center justify-center p-4 bg-white shadow-xl border-4 transition-all relative ${
              selectedSide === 'A' && isCorrect
                ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                : wrongSide === 'A'
                ? 'border-rose-400 animate-wiggle bg-rose-50'
                : 'border-pink-200 hover:border-pink-400 hover:shadow-2xl'
            }`}
          >
            <div className="text-xs font-bold text-pink-700 bg-pink-100 px-3 py-0.5 rounded-full mb-2">
              おさら １
            </div>

            {/* お皿の中のアイテムたち */}
            <div className="flex flex-wrap justify-center items-center gap-2 max-w-[180px] min-h-[100px]">
              {Array.from({ length: currentQ.countA }).map((_, i) => (
                <span
                  key={i}
                  className="text-4xl sm:text-6xl select-none animate-bounce-short"
                >
                  {currentQ.item.emoji}
                </span>
              ))}
            </div>

            {/* 正解の丸印 */}
            {selectedSide === 'A' && isCorrect && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-3xl">
                <span className="text-7xl sm:text-9xl animate-stamp">⭕</span>
              </div>
            )}
          </button>

          {/* お皿B */}
          <button
            disabled={isCorrect === true}
            onClick={() => handleSelect('B')}
            className={`kid-btn h-52 sm:h-72 rounded-3xl flex flex-col items-center justify-center p-4 bg-white shadow-xl border-4 transition-all relative ${
              selectedSide === 'B' && isCorrect
                ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                : wrongSide === 'B'
                ? 'border-rose-400 animate-wiggle bg-rose-50'
                : 'border-pink-200 hover:border-pink-400 hover:shadow-2xl'
            }`}
          >
            <div className="text-xs font-bold text-pink-700 bg-pink-100 px-3 py-0.5 rounded-full mb-2">
              おさら ２
            </div>

            {/* お皿の中のアイテムたち */}
            <div className="flex flex-wrap justify-center items-center gap-2 max-w-[180px] min-h-[100px]">
              {Array.from({ length: currentQ.countB }).map((_, i) => (
                <span
                  key={i}
                  className="text-4xl sm:text-6xl select-none animate-bounce-short"
                >
                  {currentQ.item.emoji}
                </span>
              ))}
            </div>

            {/* 正解の丸印 */}
            {selectedSide === 'B' && isCorrect && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-3xl">
                <span className="text-7xl sm:text-9xl animate-stamp">⭕</span>
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
        title="りょうのくらべっこ ばっちり！"
        subtitle="おおい・すくないが よくわかったね！すごい！"
        hasNext={false}
      />
    </div>
  );
};
