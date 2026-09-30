import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { ZOOM_QUIZ_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface ZoomQuizGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const ZoomQuizGame: React.FC<ZoomQuizGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = ZOOM_QUIZ_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(`${currentQ.promptVoice} ${currentQ.hintZoomText}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (item: Item) => {
    soundManager.playTap();

    if (item.id === currentQ.targetItem.id) {
      setSelectedId(item.id);
      setIsRevealed(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      speechManager.speak(`せいかい！${item.name} でしたー！よくわかったね！`);

      setTimeout(() => {
        if (currentIndex < ZOOM_QUIZ_QUESTIONS.length - 1) {
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
      speechManager.speak(`あれれ？${item.name} じゃないみたい。よくみてみてね！`);

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
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 overflow-hidden">
      <Header
        title="これな〜んだ？"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-purple-400 text-purple-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-purple-900 font-bold text-sm sm:text-base mt-2 bg-purple-100 px-4 py-1 rounded-full border border-purple-300">
            🔍 {currentQ.hintZoomText}
          </p>
        </div>

        {/* 中央：虫メガネ・拡大レンズサークル */}
        <div className="my-auto flex flex-col items-center">
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-white shadow-2xl border-8 border-purple-400 flex flex-col items-center justify-center relative overflow-hidden">
            {/* ズーム状態または全体表示 */}
            <div
              className={`transition-all duration-500 flex items-center justify-center ${
                isRevealed ? 'scale-100' : 'scale-250 sm:scale-300'
              }`}
            >
              <span className="text-8xl select-none">
                {currentQ.targetItem.emoji}
              </span>
            </div>

            {/* 正解時の名前 */}
            {isRevealed && (
              <div className="absolute bottom-2 font-black text-purple-950 text-xl sm:text-2xl animate-stamp bg-purple-100 px-4 py-1 rounded-full border border-purple-300">
                {currentQ.targetItem.name}！
              </div>
            )}

            {!isRevealed && (
              <div className="absolute top-2 right-4 text-2xl animate-pulse">
                🔍
              </div>
            )}
          </div>
        </div>

        {/* 選択肢（3個のカード） */}
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
        title="拡大クイズ ぜんぶせいかい！"
        subtitle="よくみて なにか わかったね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
