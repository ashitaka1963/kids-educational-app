import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { WASH_TARGETS } from '../data/gameData';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface WashGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const WashGame: React.FC<WashGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [taps, setTaps] = useState(0);
  const [isClean, setIsClean] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showReward, setShowReward] = useState(false);

  const currentTarget = WASH_TARGETS[currentIndex];

  const playPrompt = () => {
    speechManager.speak(currentTarget.promptVoice);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleWashTap = () => {
    if (isClean) return;

    soundManager.playBubble();
    const nextTaps = taps + 1;
    setTaps(nextTaps);

    // 泡エフェクト追加
    const id = Date.now() + Math.random();
    const x = (Math.random() - 0.5) * 140;
    const y = (Math.random() - 0.5) * 140;
    setBubbles((prev) => [...prev, { id, x, y }]);

    if (nextTaps >= currentTarget.tapsNeeded) {
      setIsClean(true);
      soundManager.playSuccess();
      onAddStar();
      speechManager.speak(`ぴっかぴか！きれいになったね！きもちいい〜！`);

      setTimeout(() => {
        if (currentIndex < WASH_TARGETS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setTaps(0);
          setIsClean(false);
          setBubbles([]);
        } else {
          setShowReward(true);
        }
      }, 1800);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setCurrentIndex(0);
    setTaps(0);
    setIsClean(false);
    setBubbles([]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-cyan-50 via-teal-50 to-blue-100 overflow-hidden">
      <Header
        title="あわあわぴかぴか"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス見出し */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-cyan-400 text-cyan-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>{currentTarget.title}</span>
          </div>
          <p className="text-cyan-900 font-bold text-sm sm:text-base mt-2">
            タッチして あわあわ ぴかぴかにしよう！
          </p>
        </div>

        {/* 中央：洗うターゲット */}
        <div className="my-auto flex flex-col items-center relative">
          {/* 泡のアニメーション */}
          {bubbles.map((b) => (
            <div
              key={b.id}
              className="absolute pointer-events-none text-4xl sm:text-5xl animate-bounce-short z-30"
              style={{
                transform: `translate(${b.x}px, ${b.y}px)`,
              }}
            >
              🫧
            </div>
          ))}

          <button
            onClick={handleWashTap}
            disabled={isClean}
            className={`kid-btn w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-white shadow-2xl border-4 transition-all relative flex flex-col items-center justify-center p-4 active:scale-95 ${
              isClean
                ? 'border-cyan-400 ring-8 ring-cyan-200 bg-cyan-50'
                : 'border-cyan-300 hover:border-cyan-400'
            }`}
          >
            {/* アイテム本体 */}
            <span
              className={`text-8xl sm:text-9xl select-none transition-transform duration-300 ${
                isClean ? 'scale-110 rotate-6' : 'scale-100'
              }`}
            >
              {isClean ? currentTarget.cleanEmoji : currentTarget.dirtyEmoji}
            </span>

            {/* ピカピカ装飾 */}
            {isClean && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-6xl animate-stamp">✨</span>
              </div>
            )}

            {!isClean && (
              <span className="text-xs sm:text-sm font-black text-cyan-700 bg-cyan-100 px-4 py-1 rounded-full mt-2 border border-cyan-300">
                タッチして あわあわ！
              </span>
            )}
          </button>
        </div>

        {/* 下部のプログレスバー */}
        <div className="w-full max-w-xs bg-white/80 rounded-full h-4 border border-cyan-300 overflow-hidden mb-4 shadow-inner">
          <div
            className="bg-cyan-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (taps / currentTarget.tapsNeeded) * 100)}%` }}
          />
        </div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="ぜんぶ ぴっかぴか！"
        subtitle="きれいに あらえたね！てあらい名人！はなまる！"
        hasNext={false}
      />
    </div>
  );
};
