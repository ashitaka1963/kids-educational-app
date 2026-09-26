import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { SIZE_QUESTIONS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface SizeGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const SizeGame: React.FC<SizeGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = SIZE_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (item: typeof currentQ.items[0]) => {
    soundManager.playTap();

    if (item.isCorrect) {
      setSelectedId(item.id);
      setIsCorrect(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      const compliments = [
        'せいかい！おおきさが よくわかったね！',
        'だいせいかい！ぴったり！',
        'すごい！よくみくらべられたね！'
      ];
      speechManager.speak(compliments[Math.floor(Math.random() * compliments.length)]);

      setTimeout(() => {
        if (currentIndex < SIZE_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsCorrect(null);
        } else {
          setShowReward(true);
        }
      }, 1500);
    } else {
      setWrongId(item.id);
      soundManager.playTryAgain();
      const hint = currentQ.type === 'bigger' ? 'こっちは ちいさいほうだよ！' : 'こっちは おおきいほうだよ！';
      speechManager.speak(`あれれ？${hint} もういっかい えらんでみよう！`);

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
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-100 overflow-hidden">
      <Header
        title="おおきい・ちいさい"
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
            おおきさを よく みくらべて えらんでね
          </p>
        </div>

        {/* 2つのカードを左右に並べて比較 */}
        <div className="w-full grid grid-cols-2 gap-4 sm:gap-8 my-auto max-w-2xl px-2">
          {currentQ.items.map((item) => {
            const isSelected = selectedId === item.id;
            const isWrong = wrongId === item.id;
            const isBig = item.sizeDisplay === 'big';

            return (
              <button
                key={item.id}
                disabled={isCorrect === true}
                onClick={() => handleSelect(item)}
                className={`kid-btn h-52 sm:h-72 rounded-3xl flex flex-col items-center justify-center p-4 bg-white shadow-xl border-4 transition-all relative ${
                  isSelected && isCorrect
                    ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                    : isWrong
                    ? 'border-rose-400 animate-wiggle bg-rose-50'
                    : 'border-amber-200 hover:border-amber-400 hover:shadow-2xl'
                }`}
              >
                {/* 大小のサイズ感の違いを表現 */}
                <div
                  className={`transition-transform duration-300 flex items-center justify-center ${
                    isBig ? 'scale-125 sm:scale-150 my-auto' : 'scale-75 sm:scale-90 my-auto'
                  }`}
                >
                  <span className="text-6xl sm:text-8xl select-none">
                    {item.emoji}
                  </span>
                </div>

                <span className="font-black text-amber-950 text-base sm:text-xl mt-2">
                  {item.name}
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
        title="おおきさくらべ ばっちり！"
        subtitle="おおきい・ちいさいが よくわかったね！すごい！"
        hasNext={false}
      />
    </div>
  );
};
