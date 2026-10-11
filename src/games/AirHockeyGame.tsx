import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../components/Header';
import { RewardModal } from '../components/RewardModal';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface AirHockeyGameProps {
  onHome: () => void;
  starsCount: number;
  onAddStar?: () => void;
}

// 対戦相手
const OPPONENTS = [
  { id: 'bear', name: 'くまさん', emoji: '🐻', speed: 2.2, color: 'bg-amber-100 border-amber-400' },
  { id: 'rabbit', name: 'うさぎさん', emoji: '🐰', speed: 2.8, color: 'bg-pink-100 border-pink-400' },
  { id: 'lion', name: 'らいおんさん', emoji: '🦁', speed: 3.4, color: 'bg-orange-100 border-orange-400' },
];

export const AirHockeyGame: React.FC<AirHockeyGameProps> = ({ onHome, starsCount, onAddStar }) => {
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedOpponent, setSelectedOpponent] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [goalBanner, setGoalBanner] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  // ゲーム状態（RefsでRAF内でも高速管理）
  const stateRef = useRef({
    width: 360,
    height: 520,
    puck: { x: 180, y: 260, vx: 0, vy: 0, radius: 18 },
    player: { x: 180, y: 440, radius: 28 },
    opponent: { x: 180, y: 80, radius: 28 },
    isTouching: false,
    goalWidth: 140,
    pScore: 0,
    oScore: 0,
    gameOver: false,
  });

  // リセット
  const resetPuck = useCallback((toPlayer: boolean) => {
    const s = stateRef.current;
    const scale = Math.max(1.0, s.width / 380);
    s.puck.x = s.width / 2;
    s.puck.y = s.height / 2;
    // ゆっくり発射
    const angle = toPlayer ? Math.PI / 2 : -Math.PI / 2;
    const speed = 2.8 * scale;
    s.puck.vx = (Math.random() - 0.5) * 2.5 * scale;
    s.puck.vy = Math.sin(angle) * speed;
  }, []);

  // スタート・初期化
  const startGame = useCallback(() => {
    stateRef.current.pScore = 0;
    stateRef.current.oScore = 0;
    stateRef.current.gameOver = false;
    setPlayerScore(0);
    setOpponentScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setGoalBanner(null);
    resetPuck(true);
    soundManager.playTap();
    speechManager.speak('しあいが はじまるよ！パックを はじいてね！');
  }, [resetPuck]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speechManager.speak('わくわくホッケー！あいてのゴールを ねらおう！');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // キャンバスサイズ調整（画面いっぱい大迫力サイズ）
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      const availW = parent.clientWidth - 16;
      const availH = parent.clientHeight - 16;
      if (availW <= 0 || availH <= 0) return;

      // アスペクト比 約 1 : 1.45
      const aspect = 1.45;
      let w = availW;
      let h = w * aspect;

      if (h > availH) {
        h = availH;
        w = h / aspect;
      }

      // 上限を従来の420pxから900pxへ大幅拡大（タブレットやPCでも大迫力）
      w = Math.floor(Math.min(w, 900));
      h = Math.floor(w * aspect);

      canvas.width = w;
      canvas.height = h;

      const s = stateRef.current;
      s.width = w;
      s.height = h;
      s.goalWidth = Math.max(130, w * 0.45);
      s.player.x = w / 2;
      s.player.y = h - Math.max(65, h * 0.12);
      s.opponent.x = w / 2;
      s.opponent.y = Math.max(65, h * 0.12);
      s.puck.radius = Math.max(18, w * 0.052);
      s.player.radius = Math.max(30, w * 0.088);
      s.opponent.radius = Math.max(30, w * 0.088);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ゲームループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 16.66, 2.0); // デルタタイム
      lastTime = currentTime;

      const s = stateRef.current;
      const { width, height, puck, player, opponent, goalWidth } = s;

      if (isPlaying && !s.gameOver) {
        // --- 1. パック移動 ---
        puck.x += puck.vx * dt;
        puck.y += puck.vy * dt;

        const scale = Math.max(1.0, width / 380);

        // 摩擦（自然な減速だが止まらないように）
        puck.vx *= 0.995;
        puck.vy *= 0.995;

        // 最低速度保証（ゲームが止まらないように）
        const curSpeed = Math.hypot(puck.vx, puck.vy);
        const minSpeed = 2.2 * scale;
        const maxSpeed = 10.0 * scale;

        if (curSpeed > 0 && curSpeed < minSpeed) {
          puck.vx *= 1.02;
          puck.vy *= 1.02;
        } else if (curSpeed > maxSpeed) {
          // 最高速度制限（早すぎ防止）
          puck.vx = (puck.vx / curSpeed) * maxSpeed;
          puck.vy = (puck.vy / curSpeed) * maxSpeed;
        }

        // --- 2. 壁との衝突 ---
        // 左右の壁
        if (puck.x - puck.radius < 0) {
          puck.x = puck.radius;
          puck.vx = -puck.vx * 0.9;
          soundManager.playPuckWall();
        } else if (puck.x + puck.radius > width) {
          puck.x = width - puck.radius;
          puck.vx = -puck.vx * 0.9;
          soundManager.playPuckWall();
        }

        // 上下の壁（ゴールエリア以外）
        const goalLeft = (width - goalWidth) / 2;
        const goalRight = (width + goalWidth) / 2;

        // 上壁（相手側）
        if (puck.y - puck.radius < 0) {
          if (puck.x >= goalLeft && puck.x <= goalRight) {
            // プレイヤーのゴール！！
            soundManager.playGoal();
            s.pScore += 1;
            setPlayerScore(s.pScore);
            setGoalBanner('やったー！ゴーーール！🎉');
            speechManager.speak('ゴーーール！かっこいい！');

            if (s.pScore >= 3) {
              s.gameOver = true;
              setTimeout(() => {
                setIsGameOver(true);
                soundManager.playFanfare();
                speechManager.speak('だいしょうり！おめでとう！');
                if (onAddStar) onAddStar();
              }, 1000);
            } else {
              setTimeout(() => {
                setGoalBanner(null);
                resetPuck(false);
              }, 1200);
            }
          } else {
            puck.y = puck.radius;
            puck.vy = -puck.vy * 0.9;
            soundManager.playPuckWall();
          }
        }

        // 下壁（自分側）
        if (puck.y + puck.radius > height) {
          if (puck.x >= goalLeft && puck.x <= goalRight) {
            // 相手のゴール
            soundManager.playTryAgain();
            s.oScore += 1;
            setOpponentScore(s.oScore);
            setGoalBanner('あいての ゴール！ドンマイ！');
            speechManager.speak('あいてのゴール！つぎは がんばろう！');

            if (s.oScore >= 3) {
              s.gameOver = true;
              setTimeout(() => {
                setIsGameOver(true);
                speechManager.speak('また ちょうせんしてみてね！');
              }, 1000);
            } else {
              setTimeout(() => {
                setGoalBanner(null);
                resetPuck(true);
              }, 1200);
            }
          } else {
            puck.y = height - puck.radius;
            puck.vy = -puck.vy * 0.9;
            soundManager.playPuckWall();
          }
        }

        // --- 3. 相手AI（くまさんなど）の移動 ---
        const oppData = OPPONENTS[selectedOpponent];
        const targetX = puck.y < height * 0.65 ? puck.x : width / 2;
        const targetY = puck.y < height * 0.4 ? Math.min(puck.y - 10, height * 0.35) : 80;

        const oppDx = targetX - opponent.x;
        const oppDy = targetY - opponent.y;
        opponent.x += Math.sign(oppDx) * Math.min(Math.abs(oppDx), oppData.speed * scale * dt);
        opponent.y += Math.sign(oppDy) * Math.min(Math.abs(oppDy), (oppData.speed * 0.8) * scale * dt);

        // 相手の行動範囲制限（上半分のみ）
        opponent.x = Math.max(opponent.radius, Math.min(width - opponent.radius, opponent.x));
        opponent.y = Math.max(opponent.radius, Math.min(height * 0.45, opponent.y));

        // --- 4. マレットとパックの衝突判定 ---
        const checkCollision = (mallet: { x: number; y: number; radius: number }, isOpponent: boolean) => {
          const dx = puck.x - mallet.x;
          const dy = puck.y - mallet.y;
          const dist = Math.hypot(dx, dy);
          const minDist = puck.radius + mallet.radius;

          if (dist < minDist && dist > 0) {
            // 衝突！
            const nx = dx / dist;
            const ny = dy / dist;

            // 位置補正（めり込み防止）
            puck.x = mallet.x + nx * minDist;
            puck.y = mallet.y + ny * minDist;

            // 弾き返し
            const bounceSpeed = (isOpponent ? 4.8 : 6.2) * scale;
            puck.vx = nx * bounceSpeed + (isOpponent ? 0 : (Math.random() - 0.5) * 1.5 * scale);
            puck.vy = ny * bounceSpeed;

            soundManager.playPuckHit();
          }
        };

        checkCollision(player, false);
        checkCollision(opponent, true);
      }

      // --- 5. 描画 ---
      ctx.clearRect(0, 0, width, height);

      // リンク背景（ポップな氷のリンク）
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(0, 0, width, height);

      // 外枠
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      // センターライン
      ctx.beginPath();
      ctx.moveTo(8, height / 2);
      ctx.lineTo(width - 8, height / 2);
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // センターサークル
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width * 0.18, 0, Math.PI * 2);
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 4;
      ctx.stroke();

      // ゴールエリア（上）
      const goalLeft = (width - goalWidth) / 2;
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(goalLeft, 0, goalWidth, 16);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(goalLeft, 0, goalWidth, 16);

      // ゴールエリア（下）
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(goalLeft, height - 16, goalWidth, 16);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.strokeRect(goalLeft, height - 16, goalWidth, 16);

      // 相手マレット（上）
      ctx.beginPath();
      ctx.arc(opponent.x, opponent.y, opponent.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f87171';
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.stroke();
      // 相手の顔アイコン描画
      ctx.font = `${opponent.radius * 1.2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(OPPONENTS[selectedOpponent].emoji, opponent.x, opponent.y);

      // プレイヤーマレット（下）
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#60a5fa';
      ctx.fill();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 5;
      ctx.stroke();
      // 内側のグリップリング
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#1d4ed8';
      ctx.fill();

      // パック（円盤）
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.stroke();
      // パックの中央マーク
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, selectedOpponent, resetPuck, onAddStar]);

  // タッチ・ドラッグでプレイヤーマレットを操作
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = stateRef.current;
    // プレイヤーの可動範囲（下半分のみ）
    s.player.x = Math.max(s.player.radius, Math.min(s.width - s.player.radius, x));
    s.player.y = Math.max(s.height * 0.52, Math.min(s.height - s.player.radius - 8, y));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    stateRef.current.isTouching = true;
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    stateRef.current.isTouching = false;
  };

  const isPlayerWinner = playerScore >= 3;

  return (
    <div className="flex flex-col h-screen w-screen bg-sky-100 select-none overflow-hidden touch-none">
      <Header title="わくわくホッケー 🏑" onHome={onHome} starsCount={starsCount} />

      {/* スコア・相手選択バー */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/90 border-b-2 border-sky-300 shadow-sm shrink-0">
        {/* 相手側スコア */}
        <div className="flex items-center gap-2">
          <div className="text-2xl">{OPPONENTS[selectedOpponent].emoji}</div>
          <div className="text-left">
            <div className="text-xs font-black text-gray-500">{OPPONENTS[selectedOpponent].name}</div>
            <div className="text-xl font-black text-rose-500">{opponentScore} てん</div>
          </div>
        </div>

        {/* 相手切り替え（試合前のみ） */}
        {!isPlaying && (
          <div className="flex gap-1">
            {OPPONENTS.map((opp, i) => (
              <button
                key={opp.id}
                onClick={() => {
                  soundManager.playTap();
                  setSelectedOpponent(i);
                  speechManager.speak(`${opp.name}と しょうぶ！`);
                }}
                className={`px-2 py-1 rounded-xl text-xs font-black border-2 transition-transform ${
                  selectedOpponent === i
                    ? 'bg-amber-300 border-amber-500 scale-105 shadow'
                    : 'bg-white border-gray-200 opacity-60'
                }`}
              >
                {opp.emoji}
              </button>
            ))}
          </div>
        )}

        {/* プレイヤースコア */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-black text-blue-600">きみ（あお）</div>
            <div className="text-xl font-black text-blue-600">{playerScore} てん</div>
          </div>
          <div className="text-2xl">👶</div>
        </div>
      </div>

      {/* メインゲームリンク */}
      <div className="flex-1 flex items-center justify-center p-1 sm:p-2 relative overflow-hidden w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-400 bg-white">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="touch-none cursor-grab active:cursor-grabbing block"
          />

          {/* ゴール時のポップアップバナー */}
          {goalBanner && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none animate-bounce-short z-20">
              <div className="bg-white/95 px-6 py-4 rounded-3xl border-4 border-amber-400 shadow-2xl text-center">
                <p className="text-2xl sm:text-3xl font-black text-amber-950">{goalBanner}</p>
              </div>
            </div>
          )}

          {/* スタート前オーバーレイ */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-sky-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-10">
              <div className="bg-white/95 rounded-3xl p-6 max-w-xs text-center border-4 border-sky-300 shadow-2xl">
                <div className="text-5xl mb-2">🏑</div>
                <h3 className="text-xl font-black text-sky-950 mb-1">わくわくホッケー</h3>
                <p className="text-xs font-bold text-gray-600 mb-4">
                  あおの まるを ゆびで うごかして<br />
                  きいろの パックを はじこう！<br />
                  ３てん さきにとったら かち！
                </p>
                <button
                  onClick={startGame}
                  className="kid-btn w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-green-600 rounded-2xl text-white font-black text-lg shadow-xl active:scale-95"
                >
                  あそぶ！ 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 下部サポートメッセージ */}
      <div className="py-1 px-4 text-center text-xs font-black text-sky-800 bg-white/70 border-t border-sky-200 shrink-0">
        💡 ゆびで あおの まるを スライドして パックを はじいてね！
      </div>

      {/* ゲーム終了時のリワードモーダル */}
      <RewardModal
        isOpen={isGameOver}
        title={isPlayerWinner ? 'かちました！すごーい！🎉' : 'おしい！またちょうせんしよう！'}
        subtitle={
          isPlayerWinner
            ? `${OPPONENTS[selectedOpponent].name}に かったよ！⭐ほしを ゲット！`
            : 'もういっかい やってみる？'
        }
        hasNext={true}
        onNext={startGame}
        onHome={onHome}
      />
    </div>
  );
};
