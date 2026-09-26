import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { MATCH_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface MatchGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const MatchGame: React.FC<MatchGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongItem, setWrongItem] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = MATCH_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    // 設問が変わったら少し遅れて音声発話
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (item: Item) => {
    soundManager.playTap();

    if (item.id === currentQ.target.id) {
      // 正解！
      setSelectedItem(item.id);
      setIsCorrect(true);
      setWrongItem(null);
      soundManager.playSuccess();
      onAddStar();

      const compliments = ['せいかい！すごいね！', 'だいせいかい！やったね！', 'よくみつけたね！ぴったり！'];
      const text = compliments[Math.floor(Math.random() * compliments.length)];
      speechManager.speak(text);

      setTimeout(() => {
        if (currentIndex < MATCH_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedItem(null);
          setIsCorrect(null);
        } else {
          setShowReward(true);
        }
      }, 1400);
    } else {
      // 違うよ（優しく知らせてリトライ可能に）
      setWrongItem(item.id);
      soundManager.playTryAgain();
      speechManager.speak('あれれ？もういっかい えらんでみよう！');

      setTimeout(() => {
        setWrongItem(null);
      }, 800);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedItem(null);
    setIsCorrect(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 overflow-hidden">
      <Header
        title="おなじもの さがし"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンスカード（お手本） */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/90 backdrop-blur px-5 py-2.5 rounded-full shadow-md border-2 border-amber-300 text-amber-950 font-black text-lg sm:text-2xl mb-3 flex items-center gap-2">
            <span>これと おなじものは どーれ？</span>
          </div>

          {/* お手本アイテムの特大表示 */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-white shadow-xl border-4 border-amber-400 flex flex-col items-center justify-center animate-bounce-short p-2 relative">
            <span className="text-7xl sm:text-8xl select-none">
              {currentQ.target.emoji}
            </span>
            <span className="font-black text-amber-900 text-lg sm:text-xl mt-1">
              {currentQ.target.name}
            </span>
          </div>
        </div>

        {/* 下部：選択肢（3〜4個の大きなカード） */}
        <div className="w-full mb-3 sm:mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-6 justify-center items-center">
            {currentQ.options.map((item) => {
              const isSelected = selectedItem === item.id;
              const isWrong = wrongItem === item.id;

              return (
                <button
                  key={item.id}
                  disabled={isCorrect === true}
                  onClick={() => handleSelect(item)}
                  className={`kid-btn h-32 sm:h-44 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative ${
                    item.color
                  } ${
                    isSelected && isCorrect
                      ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                      : isWrong
                      ? 'border-rose-400 animate-wiggle bg-rose-50'
                      : 'border-white hover:border-amber-300 hover:shadow-xl'
                  }`}
                >
                  <span className="text-6xl sm:text-8xl select-none">
                    {item.emoji}
                  </span>
                  <span className="font-extrabold text-amber-950 text-base sm:text-xl mt-1">
                    {item.name}
                  </span>

                  {/* 正解のキラキラバッジ */}
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
        title="ぜんぶ おなじのを みつけられたね！"
        subtitle="よくみて えらべたね！はなまるだよ！"
        hasNext={false}
      />
    </div>
  );
};
