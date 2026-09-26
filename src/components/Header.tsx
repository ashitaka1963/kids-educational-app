import React, { useState } from 'react';
import { Home, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface HeaderProps {
  title?: string;
  onHome: () => void;
  onRepeatPrompt?: () => void;
  starsCount?: number;
  showHomeButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onHome,
  onRepeatPrompt,
  starsCount = 0,
  showHomeButton = true,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showConfirmHome, setShowConfirmHome] = useState(false);

  const toggleSound = () => {
    soundManager.playTap();
    const muted = soundManager.toggleMute();
    speechManager.setMuted(muted);
    setIsMuted(muted);
  };

  const handleHomeClick = () => {
    soundManager.playTap();
    // 誤操作防止: ゲーム中なら確認ポップアップ、または直接遷移
    setShowConfirmHome(true);
  };

  const confirmExit = () => {
    soundManager.playTap();
    setShowConfirmHome(false);
    onHome();
  };

  return (
    <>
      <header className="w-full px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between bg-white/80 backdrop-blur-md shadow-sm border-b-2 border-amber-100 z-30 select-none">
        {/* 左: おうちに戻るボタン */}
        <div className="flex items-center gap-2">
          {showHomeButton && (
            <button
              onClick={handleHomeClick}
              className="kid-btn flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-base sm:text-lg shadow-md active:shadow-inner border-2 border-amber-500 transition-colors"
              title="おうちへもどる"
            >
              <Home className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              <span className="hidden sm:inline">おうち</span>
            </button>
          )}

          {/* もう一度聞くボタン（子供が音声を聞き直せる） */}
          {onRepeatPrompt && (
            <button
              onClick={() => {
                soundManager.playTap();
                onRepeatPrompt();
              }}
              className="kid-btn flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-sky-400 hover:bg-sky-500 text-sky-950 font-bold text-sm sm:text-base shadow-md border-2 border-sky-500 transition-colors"
              title="もういちどきく"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              <span>もういっかい</span>
            </button>
          )}
        </div>

        {/* 中央: タイトル / ヘッダーメッセージ */}
        {title && (
          <div className="text-center font-black text-amber-900 text-lg sm:text-2xl tracking-wide drop-shadow-sm truncate max-w-[200px] sm:max-w-md">
            {title}
          </div>
        )}

        {/* 右: 星の数 ＆ ミュート切替 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 星バッジ */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-yellow-100 border-2 border-yellow-400 text-yellow-800 font-extrabold text-base sm:text-xl shadow-sm">
            <span className="text-xl sm:text-2xl animate-wiggle inline-block">⭐</span>
            <span>{starsCount}</span>
          </div>

          {/* 音声切替 */}
          <button
            onClick={toggleSound}
            className={`kid-btn p-2 sm:p-2.5 rounded-2xl shadow-md border-2 transition-colors ${
              isMuted
                ? 'bg-rose-100 border-rose-300 text-rose-600'
                : 'bg-emerald-100 border-emerald-400 text-emerald-800'
            }`}
            title={isMuted ? 'おとをだす' : 'おとをけす'}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>
        </div>
      </header>

      {/* 3歳児向け誤操作防止モーダル: 「おうちにもどる？」 */}
      {showConfirmHome && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-300 animate-pop-in">
            <div className="text-5xl sm:text-6xl mb-3">🏠</div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-2">
              おうちへ もどる？
            </h3>
            <p className="text-gray-500 font-bold mb-6 text-sm sm:text-base">
              いまのあそびを おしまいにします
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  soundManager.playTap();
                  setShowConfirmHome(false);
                }}
                className="kid-btn flex-1 py-3.5 px-4 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-lg border-2 border-gray-400 shadow-md"
              >
                つづける
              </button>
              <button
                onClick={confirmExit}
                className="kid-btn flex-1 py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-lg border-2 border-amber-500 shadow-md"
              >
                もどる！
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
