import React, { useState, useEffect } from 'react';
import { MainMenu, GameMode } from './components/MainMenu';
import { MatchGame } from './games/MatchGame';
import { OddOneOutGame } from './games/OddOneOutGame';
import { CategoryGame } from './games/CategoryGame';
import { SilhouetteGame } from './games/SilhouetteGame';
import { SizeGame } from './games/SizeGame';
import { ColorGame } from './games/ColorGame';
import { CountGame } from './games/CountGame';
import { HideSeekGame } from './games/HideSeekGame';
import { FeedGame } from './games/FeedGame';
import { SoundQuizGame } from './games/SoundQuizGame';
import { HalfPuzzleGame } from './games/HalfPuzzleGame';
import { MoreGame } from './games/MoreGame';
import { soundManager } from './utils/sound';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>('menu');
  const [starsCount, setStarsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kids_app_stars');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleAddStar = () => {
    setStarsCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('kids_app_stars', next.toString());
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleHome = () => {
    setCurrentMode('menu');
  };

  // 画面の初回タッチ時にオーディオコンテキストをアンロック
  useEffect(() => {
    const handleFirstTouch = () => {
      soundManager.playTap();
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };

    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    window.addEventListener('click', handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, []);

  return (
    <div className="w-full h-full select-none">
      {currentMode === 'menu' && (
        <MainMenu
          onSelectGame={(game) => setCurrentMode(game)}
          starsCount={starsCount}
        />
      )}

      {currentMode === 'match' && (
        <MatchGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'odd' && (
        <OddOneOutGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'category' && (
        <CategoryGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'silhouette' && (
        <SilhouetteGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'size' && (
        <SizeGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'color' && (
        <ColorGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'count' && (
        <CountGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'hideseek' && (
        <HideSeekGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'feed' && (
        <FeedGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'soundquiz' && (
        <SoundQuizGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'halfpuzzle' && (
        <HalfPuzzleGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}

      {currentMode === 'more' && (
        <MoreGame
          onHome={handleHome}
          starsCount={starsCount}
          onAddStar={handleAddStar}
        />
      )}
    </div>
  );
};

export default App;
