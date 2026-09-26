import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Home, ArrowRight, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface RewardModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  onNext?: () => void;
  onRetry?: () => void;
  onHome: () => void;
  hasNext?: boolean;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  title = 'たいへん よくできました！',
  subtitle = 'すごい！ぜんぶ せいかいだよ！',
  onNext,
  onRetry,
  onHome,
  hasNext = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playFanfare();
      speechManager.speak('たいへんよくできました！すごーい！');

      // 画面全体に豪華な紙吹雪
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full text-center shadow-2xl border-4 border-amber-300 relative overflow-hidden animate-pop-in">
        {/* 背景のキラキラ装飾 */}
        <div className="absolute top-2 left-4 text-3xl animate-bounce">✨</div>
        <div className="absolute top-4 right-4 text-3xl animate-bounce delay-150">🎉</div>
        <div className="absolute bottom-4 left-6 text-3xl animate-wiggle">⭐</div>

        {/* 花丸スタンプ演出 */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            {/* 赤い二重丸風のはなまるデザイン */}
            <div className="w-full h-full rounded-full border-8 border-rose-500 flex flex-col items-center justify-center bg-rose-50 shadow-inner animate-stamp">
              <span className="text-4xl sm:text-5xl">💮</span>
              <span className="text-rose-600 font-black text-sm sm:text-base mt-1">
                はなまる
              </span>
            </div>
          </div>
        </div>

        {/* テキストメッセージ */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mb-2">
          {title}
        </h2>
        <p className="text-amber-800 font-bold text-base sm:text-lg mb-8">
          {subtitle}
        </p>

        {/* ボタン一覧（大きく押しやすい） */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {hasNext && onNext ? (
            <button
              onClick={() => {
                soundManager.playTap();
                onNext();
              }}
              className="kid-btn flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xl shadow-lg border-2 border-emerald-600 order-1 sm:order-2 flex-1"
            >
              <span>つぎの もんだい</span>
              <ArrowRight className="w-7 h-7 stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playTap();
                if (onRetry) onRetry();
              }}
              className="kid-btn flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-xl shadow-lg border-2 border-amber-600 order-1 sm:order-2 flex-1"
            >
              <RotateCcw className="w-6 h-6 stroke-[3]" />
              <span>もういっかい！</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playTap();
              onHome();
            }}
            className="kid-btn flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-lg border-2 border-amber-300 shadow-md order-2 sm:order-1"
          >
            <Home className="w-6 h-6 stroke-[2.5]" />
            <span>おうち</span>
          </button>
        </div>
      </div>
    </div>
  );
};
