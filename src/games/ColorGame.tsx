import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { COLOR_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface ColorGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const ColorGame: React.FC<ColorGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = COLOR_QUESTIONS[currentIndex];

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

    if (item.id === currentQ.targetId) {
      setSelectedId(item.id);
      setIsCorrect(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      speechManager.speak(`ピンポン！${currentQ.colorName}の ${item.name}！せいかい！`);

      setTimeout(() => {
        if (currentIndex < COLOR_QUESTIONS.length - 1) {
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

      const colorNames: Record<string, string> = {
        red: 'あかい',
        blue: 'あおい',
        yellow: 'きいろい',
        green: 'みどりの',
      };
      const itemColor = item.colorType ? colorNames[item.colorType] : '';
      speechManager.speak(`これは ${itemColor} ${item.name} だよ！${currentQ.colorName}のものを さがしてみてね`);

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

  // カラーごとのパステル背景スタイル
  const colorBadgeStyle: Record<string, string> = {
    あか: 'bg-red-500 text-white shadow-red-200',
    あお: 'bg-blue-500 text-white shadow-blue-200',
    きいろ: 'bg-yellow-400 text-yellow-950 shadow-yellow-200',
    みどり: 'bg-emerald-500 text-white shadow-emerald-200',
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 overflow-hidden">
      <Header
        title="いろあわせ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し＆色見本 */}
        <div className="w-full flex flex-col items-center mt-2 sm:mt-4">
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-full shadow-md border-3 border-pink-300 text-pink-950 font-black text-xl sm:text-3xl flex items-center gap-3">
            <span>{currentQ.title}</span>
            <span
              className={`px-4 py-1 rounded-full text-base sm:text-xl font-black shadow-md ${
                colorBadgeStyle[currentQ.colorName] || 'bg-amber-400'
              }`}
            >
              {currentQ.colorName}
            </span>
          </div>
          <p className="text-pink-900 font-bold text-sm sm:text-base mt-2">
            おなじ いろのものを タッチしてね
          </p>
        </div>

        {/* 選択肢（3個並び） */}
        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 my-auto max-w-2xl px-2">
          {currentQ.options.map((item) => {
            const isSelected = selectedId === item.id;
            const isWrong = wrongId === item.id;

            return (
              <button
                key={item.id}
                disabled={isCorrect === true}
                onClick={() => handleSelect(item)}
                className={`kid-btn h-40 sm:h-52 rounded-3xl flex flex-col items-center justify-center p-3 shadow-xl border-4 transition-all relative ${
                  item.color
                } ${
                  isSelected && isCorrect
                    ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                    : isWrong
                    ? 'border-rose-400 animate-wiggle bg-rose-50'
                    : 'border-white hover:border-pink-300 hover:shadow-2xl'
                }`}
              >
                <span className="text-6xl sm:text-8xl select-none">
                  {item.emoji}
                </span>
                <span className="font-extrabold text-amber-950 text-base sm:text-lg mt-2">
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
        title="いろあわせ ぜんぶできたね！"
        subtitle="いろんな いろが よくわかったね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
