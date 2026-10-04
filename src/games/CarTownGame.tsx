import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Header } from '../components/Header';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface CarTownGameProps {
  onHome: () => void;
  starsCount: number;
}

// 道路ネットワークの交差点ノード定義（仮想座標系: 幅 1000 × 高さ 600）
interface RoadNode {
  id: string;
  x: number;
  y: number;
  neighbors: string[]; // 繋がっている交差点ID
}

const ROAD_NODES: Record<string, RoadNode> = {
  // 上段
  n1: { id: 'n1', x: 120, y: 100, neighbors: ['n2', 'n4'] },
  n2: { id: 'n2', x: 500, y: 100, neighbors: ['n1', 'n3', 'n5'] },
  n3: { id: 'n3', x: 880, y: 100, neighbors: ['n2', 'n6'] },

  // 中段
  n4: { id: 'n4', x: 120, y: 300, neighbors: ['n1', 'n5', 'n7'] },
  n5: { id: 'n5', x: 500, y: 300, neighbors: ['n2', 'n4', 'n6', 'n8'] }, // 中央交差点
  n6: { id: 'n6', x: 880, y: 300, neighbors: ['n3', 'n5', 'n9'] },

  // 下段
  n7: { id: 'n7', x: 120, y: 500, neighbors: ['n4', 'n8'] },
  n8: { id: 'n8', x: 500, y: 500, neighbors: ['n5', 'n7', 'n9'] },
  n9: { id: 'n9', x: 880, y: 500, neighbors: ['n6', 'n8'] },
};

interface CarTemplate {
  id: string;
  name: string;
  emoji: string;
  soundType: 'siren' | 'horn';
  speed: number;
  voiceText: string;
}

const CAR_TEMPLATES: CarTemplate[] = [
  { id: 'police', name: 'パトカー', emoji: '🚓', soundType: 'siren', speed: 2.6, voiceText: 'パトカー、しゅっぱつ！' },
  { id: 'fire', name: 'しょうぼうしゃ', emoji: '🚒', soundType: 'siren', speed: 2.4, voiceText: 'しょうぼうしゃ、しゅっぱつ！' },
  { id: 'ambulance', name: 'きゅうきゅうしゃ', emoji: '🚑', soundType: 'siren', speed: 2.5, voiceText: 'きゅうきゅうしゃ、しゅっぱつ！' },
  { id: 'bus', name: 'バス', emoji: '🚌', soundType: 'horn', speed: 1.8, voiceText: 'バス、しゅっぱつ！' },
  { id: 'car', name: 'あかい くるま', emoji: '🚗', soundType: 'horn', speed: 2.2, voiceText: 'くるま、しゅっぱつ！' },
  { id: 'truck', name: 'トラック', emoji: '🚚', soundType: 'horn', speed: 1.9, voiceText: 'トラック、しゅっぱつ！' },
  { id: 'taxi', name: 'タクシー', emoji: '🚕', soundType: 'horn', speed: 2.3, voiceText: 'タクシー、しゅっぱつ！' },
  { id: 'train', name: 'しんかんせん', emoji: '🚅', soundType: 'horn', speed: 3.0, voiceText: 'しんかんせん、しゅっぱつ！' },
];

interface ActiveCar {
  id: string;
  name: string;
  emoji: string;
  soundType: 'siren' | 'horn';
  speed: number;
  x: number;
  y: number;
  currentNodeId: string;
  targetNodeId: string;
  angle: number;
  isJumping: boolean;
}

export const CarTownGame: React.FC<CarTownGameProps> = ({ onHome, starsCount }) => {
  const [activeCars, setActiveCars] = useState<ActiveCar[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 初期案内
  useEffect(() => {
    const timer = setTimeout(() => {
      speechManager.speak('すきな くるまを えらんで、まちを はしらせてみよう！');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // 車を追加する
  const handleAddCar = (template: CarTemplate) => {
    soundManager.playTap();
    if (template.soundType === 'siren') {
      soundManager.playSiren();
    } else {
      soundManager.playHorn();
    }
    speechManager.speak(template.voiceText);

    // ランダムな交差点からスタート
    const nodeKeys = Object.keys(ROAD_NODES);
    const startNodeId = nodeKeys[Math.floor(Math.random() * nodeKeys.length)];
    const startNode = ROAD_NODES[startNodeId];
    const targetNodeId = startNode.neighbors[Math.floor(Math.random() * startNode.neighbors.length)];
    const targetNode = ROAD_NODES[targetNodeId];

    const dx = targetNode.x - startNode.x;
    const dy = targetNode.y - startNode.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const newCar: ActiveCar = {
      id: `${template.id}_${Date.now()}_${Math.random()}`,
      name: template.name,
      emoji: template.emoji,
      soundType: template.soundType,
      speed: template.speed,
      x: startNode.x,
      y: startNode.y,
      currentNodeId: startNodeId,
      targetNodeId: targetNodeId,
      angle: angle,
      isJumping: false,
    };

    setActiveCars((prev) => [...prev, newCar]);
  };

  // 車をタッチしたときのリアクション
  const handleTapCar = (carId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const car = activeCars.find((c) => c.id === carId);
    if (!car) return;

    if (car.soundType === 'siren') {
      soundManager.playSiren();
    } else {
      soundManager.playHorn();
    }

    // ピョンと跳ねる演出
    setActiveCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, isJumping: true } : c))
    );
    setTimeout(() => {
      setActiveCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, isJumping: false } : c))
      );
    }, 400);
  };

  // 車庫に戻す（リセット）
  const handleClearCars = () => {
    soundManager.playTap();
    setActiveCars([]);
    speechManager.speak('くるまを 車庫に もどしたよ！また えらんでね！');
  };

  // アニメーションループ（車の走行）
  useEffect(() => {
    let animId: number;

    const update = () => {
      setActiveCars((prevCars) =>
        prevCars.map((car) => {
          const targetNode = ROAD_NODES[car.targetNodeId];
          const dx = targetNode.x - car.x;
          const dy = targetNode.y - car.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < car.speed + 1) {
            // 目標ノードに到着！次の交差点をランダム選択
            const nextNodeId = car.targetNodeId;
            const nextNode = ROAD_NODES[nextNodeId];
            // 直前いたノード以外の接続先を優先
            const otherNeighbors = nextNode.neighbors.filter((n) => n !== car.currentNodeId);
            const candidates = otherNeighbors.length > 0 ? otherNeighbors : nextNode.neighbors;
            const chosenTargetId = candidates[Math.floor(Math.random() * candidates.length)];
            const chosenTarget = ROAD_NODES[chosenTargetId];

            const nextDx = chosenTarget.x - nextNode.x;
            const nextDy = chosenTarget.y - nextNode.y;
            const nextAngle = (Math.atan2(nextDy, nextDx) * 180) / Math.PI;

            return {
              ...car,
              x: nextNode.x,
              y: nextNode.y,
              currentNodeId: nextNodeId,
              targetNodeId: chosenTargetId,
              angle: nextAngle,
            };
          } else {
            // 前進
            const moveX = (dx / dist) * car.speed;
            const moveY = (dy / dist) * car.speed;
            return {
              ...car,
              x: car.x + moveX,
              y: car.y + moveY,
            };
          }
        })
      );

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-emerald-100 select-none overflow-hidden touch-none">
      <Header
        title="くるまタウン"
        onHome={onHome}
        starsCount={starsCount}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* 町のマップ画面（道路と街並み） */}
        <div
          ref={containerRef}
          className="flex-1 h-full w-full relative bg-lime-100 p-2 sm:p-4 flex items-center justify-center overflow-hidden"
        >
          {/* マップコンテナ（アスペクト比 1000:600 の仮想座標系） */}
          <div className="w-full h-full max-w-[1000px] max-h-[600px] bg-emerald-50 rounded-3xl shadow-2xl border-4 border-emerald-400 relative overflow-hidden">
            {/* --- 街の建物や公園の配置 --- */}
            {/* 街区1: 警察署・ビル */}
            <div className="absolute top-[18%] left-[20%] flex flex-col items-center">
              <span className="text-4xl sm:text-5xl drop-shadow">🏢</span>
              <span className="text-3xl sm:text-4xl -mt-2">👮</span>
            </div>

            {/* 街区2: 消防署 */}
            <div className="absolute top-[18%] left-[60%] flex flex-col items-center">
              <span className="text-4xl sm:text-5xl drop-shadow">🚒</span>
              <span className="text-2xl sm:text-3xl font-black text-rose-700 bg-rose-100 px-2 rounded-full border border-rose-300">
                しょうぼう
              </span>
            </div>

            {/* 街区3: 病院 */}
            <div className="absolute top-[55%] left-[20%] flex flex-col items-center">
              <span className="text-4xl sm:text-5xl drop-shadow">🏥</span>
              <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-100 px-2 rounded-full border border-blue-300">
                びょういん
              </span>
            </div>

            {/* 街区4: 公園（噴水と木） */}
            <div className="absolute top-[55%] left-[60%] flex flex-col items-center">
              <div className="flex gap-1 text-3xl sm:text-4xl">
                <span>🌲</span>
                <span className="animate-bounce-short">⛲</span>
                <span>🌳</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-100 px-2 rounded-full">
                こうえん
              </span>
            </div>

            {/* 街角のおうち・ガソリンスタンド */}
            <span className="absolute top-[4%] left-[3%] text-3xl sm:text-4xl">🏡</span>
            <span className="absolute top-[4%] right-[3%] text-3xl sm:text-4xl">🏪</span>
            <span className="absolute bottom-[4%] left-[3%] text-3xl sm:text-4xl">⛽</span>
            <span className="absolute bottom-[4%] right-[3%] text-3xl sm:text-4xl">🚉</span>

            {/* --- 道路ネットワークのSVG描画 --- */}
            <svg
              viewBox="0 0 1000 600"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* 道路の土台（ダークグレーのアスファルト） */}
              {/* 横の道路 3本 */}
              <line x1="120" y1="100" x2="880" y2="100" stroke="#475569" strokeWidth="54" strokeLinecap="round" />
              <line x1="120" y1="300" x2="880" y2="300" stroke="#475569" strokeWidth="54" strokeLinecap="round" />
              <line x1="120" y1="500" x2="880" y2="500" stroke="#475569" strokeWidth="54" strokeLinecap="round" />

              {/* 縦の道路 3本 */}
              <line x1="120" y1="100" x2="120" y2="500" stroke="#475569" strokeWidth="54" strokeLinecap="round" />
              <line x1="500" y1="100" x2="500" y2="500" stroke="#475569" strokeWidth="54" strokeLinecap="round" />
              <line x1="880" y1="100" x2="880" y2="500" stroke="#475569" strokeWidth="54" strokeLinecap="round" />

              {/* 道路の白線センターライン（破線） */}
              <line x1="120" y1="100" x2="880" y2="100" stroke="#ffffff" strokeWidth="3" strokeDasharray="16, 16" />
              <line x1="120" y1="300" x2="880" y2="300" stroke="#ffffff" strokeWidth="3" strokeDasharray="16, 16" />
              <line x1="120" y1="500" x2="880" y2="500" stroke="#ffffff" strokeWidth="3" strokeDasharray="16, 16" />

              <line x1="120" y1="100" x2="120" y2="500" stroke="#ffffff" strokeWidth="3" strokeDasharray="16, 16" />
              <line x1="500" y1="100" x2="500" y2="500" stroke="#ffffff" strokeWidth="3" strokeDasharray="16, 16" />
              <line x1="880" y1="100" x2="880" y2="500" stroke="#ffffff" strokeWidth="3" strokeDasharray="16, 16" />

              {/* 交差点の横断歩道（ゼブラ） */}
              {Object.values(ROAD_NODES).map((node) => (
                <circle
                  key={`cross_${node.id}`}
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill="#334155"
                  opacity="0.4"
                />
              ))}
            </svg>

            {/* --- 走っている車たちのレンダリング --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {activeCars.map((car) => {
                // 1000×600 の座標系をパーセンテージに換算
                const leftPct = (car.x / 1000) * 100;
                const topPct = (car.y / 600) * 100;

                return (
                  <div
                    key={car.id}
                    onClick={(e) => handleTapCar(car.id, e)}
                    className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 select-none"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                    }}
                    title={`${car.name}をタッチしてね！`}
                  >
                    <div
                      className={`text-4xl sm:text-5xl drop-shadow-lg transition-transform ${
                        car.isJumping ? 'scale-150 -translate-y-4 animate-bounce' : 'hover:scale-125'
                      }`}
                      style={{
                        transform: `rotate(${car.angle}deg)`,
                      }}
                    >
                      {car.emoji}
                    </div>

                    {/* タッチされた時のクラクションフキダシ */}
                    {car.isJumping && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black text-xs px-2 py-0.5 rounded-full shadow-md whitespace-nowrap animate-pop-in">
                        {car.soundType === 'siren' ? 'ウ〜〜！' : 'プップー！'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 車がゼロのときのメッセージ */}
            {activeCars.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-3xl border-3 border-emerald-400 shadow-xl text-center animate-bounce-short">
                  <span className="text-3xl sm:text-4xl block mb-1">👈</span>
                  <span className="text-emerald-950 font-black text-base sm:text-xl">
                    すきな くるまを えらんでね！
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドメニュー：くるまえらびパネル */}
        <div className="w-full md:w-80 bg-white/95 backdrop-blur-md border-t-2 md:border-t-0 md:border-l-2 border-emerald-200 p-3 sm:p-4 flex flex-row md:flex-col justify-between md:justify-start gap-2.5 sm:gap-3 shrink-0 overflow-x-auto md:overflow-y-auto">
          {/* ヘッダー・台数表示 */}
          <div className="hidden md:flex items-center justify-between pb-2 border-b border-emerald-100">
            <span className="font-black text-emerald-950 text-base flex items-center gap-1.5">
              <span>🚗</span>
              <span>くるまえらび</span>
            </span>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              {activeCars.length} だい そうこう中
            </span>
          </div>

          {/* 車一覧ボタン（2列グリッド） */}
          <div className="grid grid-cols-4 md:grid-cols-2 gap-2 sm:gap-2.5 w-full">
            {CAR_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleAddCar(tmpl)}
                className="kid-btn p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-white to-emerald-50 hover:to-emerald-100 border-2 border-emerald-300 shadow-md flex flex-col items-center justify-center active:scale-90 transition-all group"
              >
                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                  {tmpl.emoji}
                </span>
                <span className="font-black text-emerald-950 text-xs mt-1 truncate max-w-full">
                  {tmpl.name}
                </span>
              </button>
            ))}
          </div>

          {/* 下部：車庫にもどす（リセット）ボタン */}
          <div className="mt-auto pt-2 flex flex-col gap-2">
            <button
              onClick={handleClearCars}
              disabled={activeCars.length === 0}
              className="kid-btn py-2.5 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40"
              title="くるまを 車庫にもどす"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>車庫にもどす</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
