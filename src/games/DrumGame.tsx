import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface DrumGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar: () => void;
}

export const DrumGame: React.FC<DrumGameProps> = ({
  onHome,
  starsCount,
  onAddStar,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [notes, setNotes] = useState<{ id: number; char: string; x: number; y: number }[]>([]);
  const [showReward, setShowReward] = useState(false);
  const targetTaps = 5;

  const playPrompt = () => {
    speechManager.speak('たいこを ポンポン たたいてみよう！');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playPrompt();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const addVisualNote = (type: 'center' | 'rim') => {
    const symbols = type === 'center' ? ['🎵', '⭐', '✨'] : ['🎶', '💥', '🌟'];
    const char = symbols[Math.floor(Math.random() * symbols.length)];
    const id = Date.now() + Math.random();
    const x = (Math.random() - 0.5) * 120;
    const y = -40 - Math.random() * 60;

    setNotes((prev) => [...prev.slice(-6), { id, char, x, y }]);
    setTimeout(() => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }, 700);
  };

  const handleHitCenter = () => {
    soundManager.playDrumLow();
    addVisualNote('center');
    handleCount();
  };

  const handleHitRim = () => {
    soundManager.playDrumHigh();
    addVisualNote('rim');
    handleCount();
  };

  const handleCount = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount === targetTaps) {
      setTimeout(() => {
        soundManager.playSuccess();
        onAddStar();
        speechManager.speak('ドンドン カッカッ！たいこ めいじん！じょうずだね！');
        setTimeout(() => {
          setShowReward(true);
        }, 1200);
      }, 300);
    }
  };

  const handleNext = () => {
    setShowReward(false);
    setTapCount(0);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-red-50 via-rose-50 to-amber-100 overflow-hidden">
      <Header
        title="ポンポンたいこ"
        onHome={onHome}
        onRepeatPrompt={playPrompt}
        starsCount={starsCount}
      />

      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
        {/* ガイダンス */}
        <div className="w-full flex flex-col items-center mt-1 sm:mt-3">
          <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border-3 border-rose-400 text-rose-950 font-black text-lg sm:text-2xl flex items-center gap-2">
            <span>たいこを たたこう！</span>
          </div>
          <div className="flex items-center gap-2 mt-2 bg-rose-100 px-4 py-1.5 rounded-2xl border border-rose-300">
            <span className="text-rose-900 font-bold text-sm sm:text-base">
              あと <strong className="text-rose-700 text-xl font-black">{Math.max(0, targetTaps - tapCount)}</strong> かい！
            </span>
          </div>
        </div>

        {/* 中央：大きな和太鼓 */}
        <div className="my-auto flex flex-col items-center relative">
          {/* 飛び出す音符・星 */}
          {notes.map((note) => (
            <div
              key={note.id}
              className="absolute pointer-events-none text-4xl sm:text-5xl animate-bounce-short z-30"
              style={{
                transform: `translate(${note.x}px, ${note.y}px)`,
              }}
            >
              {note.char}
            </div>
          ))}

          {/* 太鼓の外枠（フチ：カッ！） */}
          <button
            onClick={handleHitRim}
            className="kid-btn w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-b from-amber-800 to-amber-950 p-4 sm:p-6 shadow-2xl border-4 border-amber-900 flex items-center justify-center relative active:scale-95 transition-transform"
            title="フチをたたく（カッ！）"
          >
            {/* 太鼓の鋲 */}
            <div className="absolute inset-2 border-2 border-dashed border-amber-600 rounded-full pointer-events-none opacity-60" />

            {/* 太鼓の膜面（中央：ドン！） */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleHitCenter();
              }}
              className="w-full h-full rounded-full bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-300 shadow-inner flex flex-col items-center justify-center cursor-pointer hover:bg-amber-100 active:scale-90 transition-transform"
              title="まんなかをたたく（ドン！）"
            >
              {/* 巴紋風デザイン */}
              <div className="text-5xl sm:text-7xl select-none mb-1 opacity-80 animate-wiggle">
                🥁
              </div>
              <span className="font-black text-amber-950 text-xl sm:text-2xl drop-shadow">
                ドン！
              </span>
              <span className="text-xs font-bold text-amber-800 mt-1">
                まんなか：ドン / ふち：カッ
              </span>
            </div>
          </button>
        </div>

        {/* 下部のサポート */}
        <div className="w-full max-w-sm flex justify-center gap-3 mb-3">
          <button
            onClick={handleHitCenter}
            className="kid-btn flex-1 py-3 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-base shadow-md"
          >
            ドン！
          </button>
          <button
            onClick={handleHitRim}
            className="kid-btn flex-1 py-3 bg-rose-400 border-2 border-rose-500 rounded-2xl font-black text-white text-base shadow-md"
          >
            カッ！
          </button>
        </div>
      </main>

      <RewardModal
        isOpen={showReward}
        onNext={handleNext}
        onHome={onHome}
        title="じょうずに たたけたね！"
        subtitle="ドンドン カッカッ！たいこ めいじん！"
        hasNext={false}
      />
    </div>
  );
};
