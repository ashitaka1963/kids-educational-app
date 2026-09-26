import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { COUNT_QUESTIONS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface CountGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const CountGame: React.FC<CountGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const [showReward, setShowReward] = useState(false);

  const currentQ = COUNT_QUESTIONS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentQ.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const japaneseNumbers = ['いち！', 'に！', 'さん！', 'よん！', 'ご！'];

  const handleTapItem = (index: number) => {
    if (tappedIndices.includes(index)) return; // 既にカウント済み

    soundManager.playTap();
    const nextTapped = [...tappedIndices, index];
    setTappedIndices(nextTapped);

    const countNumber = nextTapped.length;
    soundManager.playGlitter();
    speechManager.speak(japaneseNumbers[countNumber - 1]);

    // 全てタップしたかチェック
    if (nextTapped.length === currentQ.count) {
      setTimeout(() => {
        soundManager.playSuccess();
        onAddStar();
        speechManager.speak(`ぜんぶで ${currentQ.count}こ！せいかい！すごいね！`);

        setTimeout(() => {
          if (currentIndex < COUNT_QUESTIONS.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setTappedIndices([]);
          } else {
            setShowReward(true);
          }
        }, 1800);
      }, 500);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setTappedIndices([]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-sky-100 overflow-hidden">
      <Header
        title="かずかぞえ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-2 sm:mt-4">
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-full shadow-md border-3 border-teal-400 text-teal-950 font-black text-xl sm:text-3xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-teal-900 font-bold text-sm sm:text-base mt-2">
            ゆびで ひとつずつ タッチしてみてね
          </p>
        </div>

        {/* アイテム一覧（タップして数える） */}
        <div className="w-full flex flex-wrap justify-center items-center gap-4 sm:gap-8 my-auto max-w-2xl px-2">
          {Array.from({ length: currentQ.count }).map((_, index) => {
            const isTapped = tappedIndices.includes(index);
            const tapOrder = tappedIndices.indexOf(index) + 1;

            return (
              <button
                key={index}
                onClick={() => handleTapItem(index)}
                className={`kid-btn w-36 h-36 sm:w-44 sm:h-44 rounded-3xl flex flex-col items-center justify-center p-3 shadow-xl border-4 transition-all relative ${
                  isTapped
                    ? 'border-teal-500 bg-teal-50 scale-105 ring-4 ring-teal-300'
                    : 'bg-white border-teal-200 hover:border-teal-400 hover:shadow-2xl'
                }`}
              >
                <span className="text-6xl sm:text-8xl select-none animate-bounce-short">
                  {currentQ.item.emoji}
                </span>

                {/* タップされた順番の数字バッジ */}
                {isTapped && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 text-white rounded-full flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg border-2 border-white animate-stamp">
                    {tapOrder}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 下部のカウントメーター */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl py-3 px-6 border-2 border-teal-300 shadow-md mb-2 flex items-center justify-around">
          <span className="text-base sm:text-lg font-black text-teal-900">
            かぞえた かず:
          </span>
          <div className="flex gap-2">
            {Array.from({ length: currentQ.count }).map((_, i) => (
              <span
                key={i}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  i < tappedIndices.length
                    ? 'bg-teal-500 text-white animate-pop-in'
                    : 'bg-teal-100 text-teal-300'
                }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="じょうずに かぞえられたね！"
        subtitle="1、2、3！すうじマスターだね！"
        hasNext={false}
      />
    </div>
  );
};
