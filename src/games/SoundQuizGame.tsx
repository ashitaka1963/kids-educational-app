import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { SOUND_QUIZ_QUESTIONS, Item } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface SoundQuizGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const SoundQuizGame: React.FC<SoundQuizGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const currentQ = SOUND_QUIZ_QUESTIONS[currentIndex];

  const playSoundPrompt = () => {
    setIsPlayingSound(true);
    speechManager.speak(currentQ.voiceText);
    setTimeout(() => {
      setIsPlayingSound(false);
    }, 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playSoundPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSelect = (item: Item) => {
    soundManager.playTap();

    if (item.id === currentQ.animal.id) {
      setSelectedId(item.id);
      setIsCorrect(true);
      setWrongId(null);
      soundManager.playSuccess();
      onAddStar();

      speechManager.speak(`せいかい！${currentQ.animal.name} でしたー！${currentQ.soundText}`);

      setTimeout(() => {
        if (currentIndex < SOUND_QUIZ_QUESTIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedId(null);
          setIsCorrect(null);
        } else {
          setShowReward(true);
        }
      }, 1800);
    } else {
      setWrongId(item.id);
      soundManager.playTryAgain();
      speechManager.speak(`あれれ？${item.name} の こえじゃないみたい。もういっかい きいてみよう！`);

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
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-blue-50 via-sky-50 to-indigo-100 overflow-hidden">
      <Header
        title="なきごえクイズ"
        onHome={onHome}
        onRepeatPrompt={playSoundPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-blue-400 text-blue-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentQ.title}</span>
          </div>
          <p className="text-blue-900 font-bold text-sm sm:text-base mt-2">
            こえを きいて だれか あててね
          </p>
        </div>

        {/* 中央：大きなスピーカー・なきごえボックス */}
        <div className="my-auto flex flex-col items-center">
          <button
            onClick={playSoundPrompt}
            className={`kid-btn w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-white shadow-2xl border-4 border-blue-400 flex flex-col items-center justify-center p-4 relative ${
              isPlayingSound ? 'ring-4 ring-blue-300 animate-wiggle' : ''
            }`}
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-inner">
              <Volume2 className="w-14 h-14 sm:w-20 sm:h-20 text-blue-600 stroke-[2.5]" />
            </div>

            <span className="font-black text-blue-950 text-xl sm:text-2xl">
              {currentQ.soundText}
            </span>

            <span className="text-xs font-bold text-blue-600 mt-1 bg-blue-50 px-3 py-0.5 rounded-full">
              タッチして もういっかい きく
            </span>
          </button>
        </div>

        {/* 選択肢（3個並び） */}
        <div className="w-full mb-3 sm:mb-6 max-w-xl">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 justify-center">
            {currentQ.options.map((item) => {
              const isSelected = selectedId === item.id;
              const isWrong = wrongId === item.id;

              return (
                <button
                  key={item.id}
                  disabled={isCorrect === true}
                  onClick={() => handleSelect(item)}
                  className={`kid-btn h-32 sm:h-40 rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all relative ${
                    item.color
                  } ${
                    isSelected && isCorrect
                      ? 'border-emerald-500 scale-105 ring-4 ring-emerald-300 bg-emerald-50'
                      : isWrong
                      ? 'border-rose-400 animate-wiggle bg-rose-50'
                      : 'border-white hover:border-blue-300 hover:shadow-xl'
                  }`}
                >
                  <span className="text-6xl sm:text-8xl select-none">
                    {item.emoji}
                  </span>
                  <span className="font-extrabold text-blue-950 text-base sm:text-lg mt-1">
                    {item.name}
                  </span>

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
        title="なきごえクイズ ぜんぶせいかい！"
        subtitle="みみを すまして よくきけたね！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
