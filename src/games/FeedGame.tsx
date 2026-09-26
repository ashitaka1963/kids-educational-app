import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { FEED_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface FeedGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const FeedGame: React.FC<FeedGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFed, setIsFed] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const currentQ = FEED_QUESTIONS[currentIndex];

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

    if (item.id === currentQ.targetFood.id) {
      setSelectedId(item.id);
      setIsFed(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      speechManager.speak(`もぐもぐもぐ！おいしい！${item.name} だいすき！ありがとう！`);

      setTimeout(() => {
        if (currentIndex < FEED_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsFed(false);
        } else {
          setShowReward(true);
        }
      }, 1800);
    } else {
      setWrongId(item.id);
      soundManager.playTryAgain();
      speechManager.speak(`あれ？${item.name} は たべられないよ〜。すきなものを あげてね！`);

      setTimeout(() => {
        setWrongId(null);
      }, 900);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setSelectedId(null);
    setIsFed(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-100 overflow-hidden">
      <Header
        title="ごはんをあげよう"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-orange-400 text-orange-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-orange-900 font-bold text-sm sm:text-base mt-2">
            すきな ごはんを タッチして おくちに いれてあげてね
          </p>
        </div>

        {/* 中央：おなかをすかせた動物 */}
        <div className="my-auto flex flex-col items-center relative">
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-white shadow-2xl border-4 border-orange-300 flex flex-col items-center justify-center p-4 relative overflow-visible">
            {/* 動物のアイコン */}
            <span
              className={`text-8xl sm:text-9xl select-none transition-all duration-300 ${
                isFed ? 'scale-125 rotate-6' : 'animate-bounce-short'
              }`}
            >
              {currentQ.animal.emoji}
            </span>

            {/* ごはんを食べているときのハートやもぐもぐ */}
            {isFed && (
              <div className="absolute -top-4 -right-2 text-4xl animate-stamp">
                💖
              </div>
            )}
            {isFed && (
              <div className="absolute -bottom-2 bg-rose-500 text-white font-black text-sm sm:text-base px-4 py-1 rounded-full shadow-md animate-pop-in">
                もぐもぐ！おいしい！
              </div>
            )}
            {!isFed && (
              <div className="absolute -bottom-2 bg-orange-400 text-white font-bold text-xs sm:text-sm px-3 py-0.5 rounded-full shadow">
                おなかすいたな〜
              </div>
            )}
          </div>
        </div>

        {/* 選択肢（3個のごはん） */}
        <div className="w-full mb-3 sm:mb-6 max-w-xl">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 justify-center">
            {currentQ.options.map((item) => {
              const isSelected = selectedId === item.id;
              const isWrong = wrongId === item.id;

              return (
                <button
                  key={item.id}
                  disabled={isFed}
                  onClick={() => handleSelect(item)}
                  className={`kid-btn h-32 sm:h-40 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative ${
                    item.color
                  } ${
                    isSelected && isFed
                      ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                      : isWrong
                      ? 'border-rose-400 animate-wiggle bg-rose-50'
                      : 'border-white hover:border-orange-300 hover:shadow-xl'
                  }`}
                >
                  <span className="text-6xl sm:text-8xl select-none">
                    {item.emoji}
                  </span>
                  <span className="font-extrabold text-orange-950 text-base sm:text-lg mt-1">
                    {item.name}
                  </span>

                  {isSelected && isFed && (
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
        title="みんな おなかいっぱい！"
        subtitle="やさしく ごはんをあげられたね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
