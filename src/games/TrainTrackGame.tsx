import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../components/Header';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface TrainTrackGameProps {
  onHome: () => void;
  starsCount: number;
}

// 10×7 グリッド（仮想解像度 1000 × 700）
const COLS = 10;
const ROWS = 7;
const CELL_SIZE = 100;
const STAGE_WIDTH = COLS * CELL_SIZE;   // 1000
const STAGE_HEIGHT = ROWS * CELL_SIZE; // 700
const MAX_TRAINS = 5;

// セルの接続方向
type Dir = 'N' | 'S' | 'E' | 'W';
type CellConnections = Set<Dir>;

interface Cell {
  connections: CellConnections;
  switchExit?: Dir; // 分岐セルでの優先進行方向
}

// 電車の状態
interface ActiveTrain {
  id: string;
  typeIndex: number;  // TRAINSのインデックス (0〜4)
  cellIndex: number;  // 現在いるセル
  enterDir: Dir;      // どの辺から入ってきたか
  exitDir: Dir;       // どの辺へ抜けるか
  progress: number;   // 0〜1
  speedScale: number; // 速度の微細な個性
  isJumping?: boolean; // タッチされた時のアクション
}

const opposite: Record<Dir, Dir> = { N: 'S', S: 'N', E: 'W', W: 'E' };

const dirOffset: Record<Dir, { dc: number; dr: number }> = {
  N: { dc: 0, dr: -1 },
  S: { dc: 0, dr: 1 },
  E: { dc: 1, dr: 0 },
  W: { dc: -1, dr: 0 },
};

const dirAngle: Record<Dir, number> = {
  E: 0, S: 90, W: 180, N: 270,
};

// 電車の種類（モノレール含む5車種）
const TRAINS = [
  { id: 'monorail', emoji: '🚝', label: 'モノレール', desc: 'くうちゅうを はしるよ', color: '#0284c7', bodyColor: '#ffffff', stripeColor: '#0ea5e9' },
  { id: 'shinkansen', emoji: '🚄', label: 'しんかんせん', desc: 'はやぶさ風', color: '#0284c7', bodyColor: '#f0f9ff', stripeColor: '#0284c7' },
  { id: 'yellow', emoji: '🟡', label: 'ドクターイエロー', desc: 'しあわせのきいろ', color: '#ca8a04', bodyColor: '#fefce8', stripeColor: '#ca8a04' },
  { id: 'local', emoji: '🚃', label: 'でんしゃ', desc: 'みどりのやまのてせん', color: '#16a34a', bodyColor: '#f0fdf4', stripeColor: '#16a34a' },
  { id: 'steam', emoji: '🚂', label: 'SLきかんしゃ', desc: 'ぽっぽー！くろいきかんしゃ', color: '#1c1917', bodyColor: '#f5f5f4', stripeColor: '#57534e' },
];

function cellIdx(col: number, row: number) {
  return row * COLS + col;
}
function cellColRow(idx: number) {
  return { col: idx % COLS, row: Math.floor(idx / COLS) };
}

// 2つのセルを繋ぐ
function connectCells(cells: Cell[], fromIdx: number, toIdx: number) {
  const { col: fc, row: fr } = cellColRow(fromIdx);
  const { col: tc, row: tr } = cellColRow(toIdx);
  const dc = tc - fc;
  const dr = tr - fr;

  let fromDir: Dir | null = null;
  let toDir: Dir | null = null;

  if (dc === 1 && dr === 0) { fromDir = 'E'; toDir = 'W'; }
  else if (dc === -1 && dr === 0) { fromDir = 'W'; toDir = 'E'; }
  else if (dc === 0 && dr === 1) { fromDir = 'S'; toDir = 'N'; }
  else if (dc === 0 && dr === -1) { fromDir = 'N'; toDir = 'S'; }

  if (!fromDir || !toDir) return false;

  cells[fromIdx].connections.add(fromDir);
  cells[toIdx].connections.add(toDir);
  return true;
}

// SVGで線路を描画するpath
function getRailPath(connections: CellConnections, cx: number, cy: number, size: number): string {
  const half = size / 2;
  const dirs = Array.from(connections);

  if (dirs.length === 0) return '';
  const getEnd = (d: Dir) => ({
    x: cx + (d === 'E' ? half : d === 'W' ? -half : 0),
    y: cy + (d === 'S' ? half : d === 'N' ? -half : 0),
  });

  if (dirs.length === 1) {
    const e = getEnd(dirs[0]);
    return `M${cx},${cy} L${e.x},${e.y}`;
  }

  // 2方向（直線またはカーブ）
  if (dirs.length === 2) {
    const [d1, d2] = dirs;
    const e1 = getEnd(d1);
    const e2 = getEnd(d2);
    if ((d1 === 'N' && d2 === 'S') || (d1 === 'S' && d2 === 'N') ||
        (d1 === 'E' && d2 === 'W') || (d1 === 'W' && d2 === 'E')) {
      return `M${e1.x},${e1.y} L${e2.x},${e2.y}`;
    } else {
      return `M${e1.x},${e1.y} Q${cx},${cy} ${e2.x},${e2.y}`;
    }
  }

  // 3方向以上（分岐・交差）：中心から各辺へ接続
  return dirs.map((d) => {
    const e = getEnd(d);
    return `M${cx},${cy} L${e.x},${e.y}`;
  }).join(' ');
}

// 電車の仮想ピクセル座標を計算
function getTrainPixelPos(
  train: ActiveTrain,
  cellSize: number
): { x: number; y: number; angle: number } {
  const { col, row } = cellColRow(train.cellIndex);
  const cx = col * cellSize + cellSize / 2;
  const cy = row * cellSize + cellSize / 2;
  const half = cellSize / 2;
  const p = Math.max(0, Math.min(1, train.progress));

  const enter = train.enterDir;
  const exit = train.exitDir;

  const getEdge = (d: Dir) => ({
    x: cx + (d === 'E' ? half : d === 'W' ? -half : 0),
    y: cy + (d === 'S' ? half : d === 'N' ? -half : 0),
  });

  const entryEdge = getEdge(enter);
  const exitEdge = getEdge(exit);

  let x: number, y: number, angle: number;
  if ((enter === 'W' && exit === 'E') || (enter === 'E' && exit === 'W') ||
      (enter === 'N' && exit === 'S') || (enter === 'S' && exit === 'N')) {
    x = entryEdge.x + (exitEdge.x - entryEdge.x) * p;
    y = entryEdge.y + (exitEdge.y - entryEdge.y) * p;
    angle = dirAngle[exit];
  } else if (enter === exit) {
    x = entryEdge.x;
    y = entryEdge.y;
    angle = dirAngle[exit];
  } else {
    const t = p;
    x = (1 - t) * (1 - t) * entryEdge.x + 2 * (1 - t) * t * cx + t * t * exitEdge.x;
    y = (1 - t) * (1 - t) * entryEdge.y + 2 * (1 - t) * t * cy + t * t * exitEdge.y;
    const dx = 2 * (1 - t) * (cx - entryEdge.x) + 2 * t * (exitEdge.x - cx);
    const dy = 2 * (1 - t) * (cy - entryEdge.y) + 2 * t * (exitEdge.y - cy);
    angle = Math.atan2(dy, dx) * (180 / Math.PI);
  }

  return { x, y, angle };
}

export const TrainTrackGame: React.FC<TrainTrackGameProps> = ({ onHome, starsCount }) => {
  const [cells, setCells] = useState<Cell[]>(() =>
    Array.from({ length: COLS * ROWS }, () => ({ connections: new Set<Dir>() }))
  );
  const [activeTrains, setActiveTrains] = useState<ActiveTrain[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCell, setLastCell] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState('指でなぞって 線路をかこう！');

  const gridRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number>(0);
  const cellsRef = useRef<Cell[]>(cells);
  const activeTrainsRef = useRef<ActiveTrain[]>(activeTrains);
  const isRunningRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => { cellsRef.current = cells; }, [cells]);
  useEffect(() => { activeTrainsRef.current = activeTrains; }, [activeTrains]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speechManager.speak('せんろをかいて でんしゃを えらんでね！さいだい5だい はしるよ！');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // 複数電車の走行アニメーションループ
  const animate = useCallback(() => {
    if (!isRunningRef.current) return;

    const currentCells = cellsRef.current;
    const currentTrains = activeTrainsRef.current;

    if (currentTrains.length === 0) {
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const baseSpeed = speedRef.current * 0.022;

    const nextTrains = currentTrains.map((tp) => {
      const speedFactor = baseSpeed * tp.speedScale;
      const newProgress = tp.progress + speedFactor;

      if (newProgress >= 1) {
        // 現在のセルから exitDir 方向へ抜ける
        const { col, row } = cellColRow(tp.cellIndex);
        const offset = dirOffset[tp.exitDir];
        const nc = col + offset.dc;
        const nr = row + offset.dr;

        if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
          const nextIdx = cellIdx(nc, nr);
          const nextCell = currentCells[nextIdx];
          const nextEnterDir = opposite[tp.exitDir];

          if (nextCell.connections.has(nextEnterDir)) {
            const candidateExits = Array.from(nextCell.connections).filter(d => d !== nextEnterDir);

            let nextExitDir: Dir;
            if (candidateExits.length > 1) {
              // 分岐！優先出口があれば採用
              if (nextCell.switchExit && candidateExits.includes(nextCell.switchExit)) {
                nextExitDir = nextCell.switchExit;
              } else {
                const straightDir = opposite[nextEnterDir];
                if (candidateExits.includes(straightDir)) {
                  nextExitDir = straightDir;
                } else {
                  nextExitDir = candidateExits[0];
                }
              }
            } else if (candidateExits.length === 1) {
              nextExitDir = candidateExits[0];
            } else {
              nextExitDir = nextEnterDir;
            }

            return {
              ...tp,
              cellIndex: nextIdx,
              enterDir: nextEnterDir,
              exitDir: nextExitDir,
              progress: newProgress - 1,
            };
          }
        }

        // 行き止まり（終点）でのUターン
        const currentCell = currentCells[tp.cellIndex];
        if (currentCell.connections.has(tp.enterDir)) {
          return {
            ...tp,
            enterDir: tp.exitDir,
            exitDir: tp.enterDir,
            progress: 0,
          };
        }
        return tp;
      }

      return { ...tp, progress: newProgress };
    });

    activeTrainsRef.current = nextTrains;
    setActiveTrains(nextTrains);

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // 電車を追加する（最大5台）
  const handleAddTrain = (typeIndex: number) => {
    soundManager.playTap();
    const trainInfo = TRAINS[typeIndex];

    const currentCells = cellsRef.current;
    const trackCellIndices: number[] = [];
    currentCells.forEach((c, idx) => {
      if (c.connections.size > 0) trackCellIndices.push(idx);
    });

    if (trackCellIndices.length === 0) {
      setStatusMsg('まず ゆびで せんろを かいてね！');
      speechManager.speak('まず ゆびで せんろを かいてね！');
      soundManager.playTryAgain();
      return;
    }

    if (activeTrains.length >= MAX_TRAINS) {
      setStatusMsg('でんしゃが いっぱいだよ！（さいだい5だい）');
      speechManager.speak('でんしゃが いっぱいだよ！さいだい5だいまでだよ！');
      soundManager.playTryAgain();
      return;
    }

    // 既に他の電車がいるセルを避けて配置
    const occupiedCells = new Set(activeTrains.map(t => t.cellIndex));
    const availableCells = trackCellIndices.filter(idx => !occupiedCells.has(idx));
    const targetCellIdx = availableCells.length > 0
      ? availableCells[Math.floor(Math.random() * availableCells.length)]
      : trackCellIndices[Math.floor(Math.random() * trackCellIndices.length)];

    const cell = currentCells[targetCellIdx];
    const dirs = Array.from(cell.connections);
    let enterDir: Dir;
    let exitDir: Dir;

    if (dirs.length === 1) {
      exitDir = dirs[0];
      enterDir = opposite[exitDir];
    } else {
      enterDir = dirs[0];
      exitDir = dirs[1];
    }

    const newTrain: ActiveTrain = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      typeIndex,
      cellIndex: targetCellIdx,
      enterDir,
      exitDir,
      progress: 0,
      speedScale: 0.96 + Math.random() * 0.08,
      isJumping: false,
    };

    const nextList = [...activeTrains, newTrain];
    setActiveTrains(nextList);
    activeTrainsRef.current = nextList;

    soundManager.playWhistle();
    speechManager.speak(`${trainInfo.label} しゅっぱつ！`);
    setStatusMsg(`${trainInfo.label}が 出発したよ！（${nextList.length}/${MAX_TRAINS}だい）🚄`);

    // 自動で走らせる
    if (!isRunning) {
      setIsRunning(true);
      isRunningRef.current = true;
      animFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // GO / STOP 切り替え
  const toggleRun = () => {
    if (!isRunning) {
      if (activeTrains.length === 0) {
        setStatusMsg('右のでんしゃを 選んで 線路に出してね！');
        speechManager.speak('すきな でんしゃを えらんでね！');
        return;
      }
      setIsRunning(true);
      isRunningRef.current = true;
      soundManager.playWhistle();
      speechManager.speak('しゅっぱつしんこう！');
      setStatusMsg('しゅっぱつしんこう！🚄');
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
      isRunningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      setStatusMsg('ていしゃしました！');
      speechManager.speak('ていしゃ！');
    }
  };

  // 電車をタップした時：車庫にもどす
  const handleTapTrain = (trainId: string, e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    const target = activeTrains.find(t => t.id === trainId);
    if (!target) return;

    const trainInfo = TRAINS[target.typeIndex];
    soundManager.playBubble();

    const nextList = activeTrains.filter(t => t.id !== trainId);
    setActiveTrains(nextList);
    activeTrainsRef.current = nextList;

    speechManager.speak(`${trainInfo.label}、しゃこに もどるよ！`);
    setStatusMsg(`${trainInfo.label}が 車庫にもどったよ！🏠（そうこう中: ${nextList.length}/${MAX_TRAINS}だい）`);

    if (nextList.length === 0) {
      setIsRunning(false);
      isRunningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  // 分岐ポイントの切り替え
  const handleToggleSwitch = (idx: number, e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    const currentCells = cellsRef.current;
    const cell = currentCells[idx];
    if (cell.connections.size < 3) return;

    const dirs = Array.from(cell.connections);
    const curIdx = cell.switchExit ? dirs.indexOf(cell.switchExit) : 0;
    const nextDir = dirs[(curIdx + 1) % dirs.length];

    const newCells = currentCells.map((c, i) =>
      i === idx ? { ...c, switchExit: nextDir } : c
    );
    setCells(newCells);
    cellsRef.current = newCells;
    soundManager.playSwitch();

    const dirNames: Record<Dir, string> = {
      N: 'うえ', S: 'した', E: 'みぎ', W: 'ひだり',
    };
    speechManager.speak(`ポイントきりかえ！${dirNames[nextDir]}へ すすむよ！`);
    setStatusMsg(`ポイントを切り替えたよ！（${dirNames[nextDir]}へ）🔀`);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ガタンゴトン音
  useEffect(() => {
    if (isRunning && activeTrains.length > 0) {
      const interval = setInterval(() => {
        if (isRunningRef.current) soundManager.playTrainRoll();
      }, 550 / speed);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed, activeTrains.length]);

  // タッチ座標を仮想ステージ座標（1000×700）へ変換
  const getCellFromEvent = useCallback((e: React.PointerEvent<SVGSVGElement>): number | null => {
    const svg = gridRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const scaleX = STAGE_WIDTH / rect.width;
    const scaleY = STAGE_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return cellIdx(col, row);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isRunning) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const idx = getCellFromEvent(e);
    if (idx !== null) {
      setLastCell(idx);
      soundManager.playTap();
    }
  }, [isRunning, getCellFromEvent]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || isRunning) return;
    const idx = getCellFromEvent(e);
    if (idx !== null && idx !== lastCell && lastCell !== null) {
      const newCells = cellsRef.current.map(c => ({ ...c, connections: new Set(c.connections) as CellConnections }));
      if (connectCells(newCells, lastCell, idx)) {
        setCells(newCells);
        cellsRef.current = newCells;
        setLastCell(idx);
        soundManager.playTap();
        setStatusMsg('せんろが のびたよ！');
      }
    }
  }, [isDrawing, isRunning, lastCell, getCellFromEvent]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
    setLastCell(null);
  }, []);

  // 線路と電車を全消し
  const clearTracks = () => {
    if (isRunning) {
      setIsRunning(false);
      isRunningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
    }
    const newCells: Cell[] = Array.from({ length: COLS * ROWS }, () => ({ connections: new Set<Dir>() }));
    setCells(newCells);
    cellsRef.current = newCells;
    setActiveTrains([]);
    activeTrainsRef.current = [];
    setStatusMsg('指でなぞって 線路をかこう！');
    speechManager.speak('せんろと でんしゃを ぜんぶけしたよ！');
    soundManager.playTap();
  };

  const hasTrack = cells.some(c => c.connections.size > 0);

  return (
    <div className="flex flex-col h-screen w-screen bg-sky-100 select-none overflow-hidden touch-none">
      <Header
        title="せんろをつくろう 🚄"
        onHome={onHome}
        starsCount={starsCount}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* メイン線路ステージ（車タウン風の大画面ジオラマ） */}
        <div className="flex-1 h-full w-full relative bg-amber-50/60 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
          {/* 大画面ステージコンテナ（アスペクト比 10:7） */}
          <div className="w-full h-full max-w-[1100px] max-h-[770px] bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 rounded-3xl shadow-2xl border-4 border-emerald-400 relative overflow-hidden flex items-center justify-center">

            {/* --- ジオラマの風景・装飾（背景） --- */}
            {/* 駅 */}
            <div className="absolute top-[8%] left-[10%] flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-2xl border-2 border-emerald-300 shadow-sm pointer-events-none">
              <span className="text-3xl">🚉</span>
              <span className="text-xs sm:text-sm font-black text-emerald-900">さくら えき</span>
            </div>

            {/* 山 */}
            <div className="absolute top-[6%] right-[10%] flex flex-col items-center pointer-events-none">
              <span className="text-4xl sm:text-5xl drop-shadow">⛰️</span>
              <span className="text-xs font-black text-emerald-800 -mt-1">やま</span>
            </div>

            {/* トンネル */}
            <div className="absolute bottom-[8%] left-[8%] flex items-center gap-1 pointer-events-none">
              <span className="text-4xl drop-shadow">🚇</span>
              <span className="text-xs font-black text-stone-700 bg-stone-100/90 px-2 py-0.5 rounded-full border border-stone-300">
                トンネル
              </span>
            </div>

            {/* 公園・木々 */}
            <div className="absolute bottom-[8%] right-[12%] flex gap-1 text-3xl pointer-events-none">
              <span>🌲</span>
              <span>🌸</span>
              <span>🌳</span>
            </div>

            {/* 街・ビル */}
            <div className="absolute top-[48%] left-[4%] flex flex-col items-center pointer-events-none opacity-80">
              <span className="text-3xl">🏢</span>
            </div>
            <div className="absolute top-[48%] right-[4%] flex flex-col items-center pointer-events-none opacity-80">
              <span className="text-3xl">🏪</span>
            </div>

            {/* 線路描画SVG */}
            <svg
              ref={gridRef}
              viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
              className="w-full h-full touch-none select-none cursor-crosshair relative z-10"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* グリッドガイド線（薄い点線） */}
              {Array.from({ length: ROWS + 1 }).map((_, r) => (
                <line
                  key={`hr${r}`}
                  x1={0} y1={r * CELL_SIZE}
                  x2={STAGE_WIDTH} y2={r * CELL_SIZE}
                  stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.6"
                />
              ))}
              {Array.from({ length: COLS + 1 }).map((_, c) => (
                <line
                  key={`vc${c}`}
                  x1={c * CELL_SIZE} y1={0}
                  x2={c * CELL_SIZE} y2={STAGE_HEIGHT}
                  stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.6"
                />
              ))}

              {/* 線路（枕木 ＆ レール） */}
              {cells.map((cell, idx) => {
                if (cell.connections.size === 0) return null;
                const { col, row } = cellColRow(idx);
                const cx = col * CELL_SIZE + CELL_SIZE / 2;
                const cy = row * CELL_SIZE + CELL_SIZE / 2;

                const dirs = Array.from(cell.connections);
                const ties: React.ReactNode[] = [];
                for (let i = 0; i < dirs.length; i += 2) {
                  if (i + 1 >= dirs.length) break;
                  const d1 = dirs[i], d2 = dirs[i + 1];
                  const isHoriz = (d1 === 'E' || d1 === 'W') && (d2 === 'E' || d2 === 'W');
                  const isVert = (d1 === 'N' || d1 === 'S') && (d2 === 'N' || d2 === 'S');
                  if (isHoriz || isVert) {
                    const tieCount = 4;
                    const half = CELL_SIZE / 2;
                    for (let t = 0; t < tieCount; t++) {
                      const frac = (t + 1) / (tieCount + 1);
                      const tx = isHoriz ? cx - half + CELL_SIZE * frac : cx;
                      const ty = isVert ? cy - half + CELL_SIZE * frac : cy;
                      ties.push(
                        <rect
                          key={`tie-${idx}-${t}`}
                          x={isHoriz ? tx - 2 : tx - 12}
                          y={isHoriz ? ty - 12 : ty - 2}
                          width={isHoriz ? 4 : 24}
                          height={isHoriz ? 24 : 4}
                          fill="#854d0e"
                          rx="1.5"
                        />
                      );
                    }
                  }
                }

                const path = getRailPath(cell.connections, cx, cy, CELL_SIZE);
                return (
                  <g key={idx}>
                    {ties}
                    {/* レール台木（濃いグレー） */}
                    <path
                      d={path}
                      stroke="#57534e"
                      strokeWidth={CELL_SIZE * 0.16}
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* 鉄レール（シルバーの2本筋） */}
                    <path
                      d={path}
                      stroke="#f5f5f4"
                      strokeWidth={CELL_SIZE * 0.08}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${CELL_SIZE * 0.22},${CELL_SIZE * 0.12}`}
                    />

                    {/* 分岐切り替えスイッチ（3方向以上ある場合：開通方向を視覚的に明示） */}
                    {cell.connections.size >= 3 && (() => {
                      const activeDir = cell.switchExit || Array.from(cell.connections)[0];
                      const half = CELL_SIZE / 2;
                      const arrowEndX = cx + (activeDir === 'E' ? half * 0.85 : activeDir === 'W' ? -half * 0.85 : 0);
                      const arrowEndY = cy + (activeDir === 'S' ? half * 0.85 : activeDir === 'N' ? -half * 0.85 : 0);

                      return (
                        <g key={`switch_${idx}`}>
                          {/* 1. 現在開通している方向の光るグリーンレール（太いハイライト） */}
                          <line
                            x1={cx}
                            y1={cy}
                            x2={arrowEndX}
                            y2={arrowEndY}
                            stroke="#22c55e"
                            strokeWidth={CELL_SIZE * 0.14}
                            strokeLinecap="round"
                            opacity="0.85"
                            className="animate-pulse"
                          />
                          <line
                            x1={cx}
                            y1={cy}
                            x2={arrowEndX}
                            y2={arrowEndY}
                            stroke="#86efac"
                            strokeWidth={CELL_SIZE * 0.06}
                            strokeLinecap="round"
                          />

                          {/* 2. タップできるポイント切り替え矢印ボタン */}
                          <g
                            className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                            onPointerDown={(e) => handleToggleSwitch(idx, e)}
                            style={{ pointerEvents: 'auto' }}
                          >
                            {/* 黄色い光る円盤 */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={CELL_SIZE * 0.24}
                              fill="#fef08a"
                              stroke="#ca8a04"
                              strokeWidth="4"
                              filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
                            />

                            {/* 開通方向を指す大きなグリーン矢印（回転） */}
                            <g transform={`translate(${cx}, ${cy}) rotate(${dirAngle[activeDir]})`}>
                              {/* 矢印の軸 */}
                              <line
                                x1={-CELL_SIZE * 0.12}
                                y1={0}
                                x2={CELL_SIZE * 0.08}
                                y2={0}
                                stroke="#15803d"
                                strokeWidth={CELL_SIZE * 0.08}
                                strokeLinecap="round"
                              />
                              {/* 矢印の頭部 */}
                              <polygon
                                points={`${CELL_SIZE * 0.05},${-CELL_SIZE * 0.12} ${CELL_SIZE * 0.19},0 ${CELL_SIZE * 0.05},${CELL_SIZE * 0.12}`}
                                fill="#15803d"
                              />
                            </g>
                          </g>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}

              {/* --- 走行中の電車たち（最大5台） --- */}
              {activeTrains.map((trainItem) => {
                const train = TRAINS[trainItem.typeIndex];
                const { x, y, angle } = getTrainPixelPos(trainItem, CELL_SIZE);

                return (
                  <g
                    key={trainItem.id}
                    transform={`translate(${x}, ${y}) rotate(${angle})`}
                    className="cursor-pointer pointer-events-auto select-none"
                    onPointerDown={(e) => handleTapTrain(trainItem.id, e)}
                  >
                    {/* 電車の影 */}
                    <rect
                      x={-CELL_SIZE * 0.44}
                      y={-CELL_SIZE * 0.18}
                      width={CELL_SIZE * 0.88}
                      height={CELL_SIZE * 0.44}
                      rx={CELL_SIZE * 0.12}
                      fill="black"
                      opacity="0.25"
                    />

                    {/* タッチ時のホップ（ジャンプ） */}
                    <g transform={trainItem.isJumping ? 'scale(1.2) translate(0, -10)' : undefined}>
                      {train.id === 'monorail' ? (
                        /* モノレール車体（流線型） */
                        <>
                          <rect
                            x={-CELL_SIZE * 0.44}
                            y={-CELL_SIZE * 0.24}
                            width={CELL_SIZE * 0.88}
                            height={CELL_SIZE * 0.48}
                            rx={CELL_SIZE * 0.16}
                            fill="#ffffff"
                            stroke="#0284c7"
                            strokeWidth={CELL_SIZE * 0.05}
                          />
                          <rect
                            x={-CELL_SIZE * 0.44}
                            y={-CELL_SIZE * 0.04}
                            width={CELL_SIZE * 0.88}
                            height={CELL_SIZE * 0.12}
                            fill="#0ea5e9"
                          />
                          <ellipse
                            cx={CELL_SIZE * 0.4}
                            cy={0}
                            rx={CELL_SIZE * 0.1}
                            ry={CELL_SIZE * 0.18}
                            fill="#0284c7"
                          />
                          <rect
                            x={-CELL_SIZE * 0.32}
                            y={-CELL_SIZE * 0.18}
                            width={CELL_SIZE * 0.52}
                            height={CELL_SIZE * 0.12}
                            rx={CELL_SIZE * 0.03}
                            fill="#bae6fd"
                            stroke="#0284c7"
                            strokeWidth={1.5}
                          />
                        </>
                      ) : (
                        /* 通常の新幹線・でんしゃ・SL */
                        <>
                          <rect
                            x={-CELL_SIZE * 0.42}
                            y={-CELL_SIZE * 0.22}
                            width={CELL_SIZE * 0.84}
                            height={CELL_SIZE * 0.44}
                            rx={CELL_SIZE * 0.12}
                            fill={train.bodyColor}
                            stroke={train.color}
                            strokeWidth={CELL_SIZE * 0.05}
                          />
                          <rect
                            x={-CELL_SIZE * 0.42}
                            y={-CELL_SIZE * 0.06}
                            width={CELL_SIZE * 0.84}
                            height={CELL_SIZE * 0.14}
                            fill={train.stripeColor}
                          />
                          <ellipse
                            cx={CELL_SIZE * 0.42}
                            cy={0}
                            rx={CELL_SIZE * 0.12}
                            ry={CELL_SIZE * 0.2}
                            fill={train.color}
                          />
                          <rect
                            x={-CELL_SIZE * 0.3}
                            y={-CELL_SIZE * 0.16}
                            width={CELL_SIZE * 0.2}
                            height={CELL_SIZE * 0.14}
                            rx={CELL_SIZE * 0.04}
                            fill="#7dd3fc"
                            stroke="#0284c7"
                            strokeWidth={1.5}
                          />
                          <rect
                            x={-CELL_SIZE * 0.04}
                            y={-CELL_SIZE * 0.16}
                            width={CELL_SIZE * 0.2}
                            height={CELL_SIZE * 0.14}
                            rx={CELL_SIZE * 0.04}
                            fill="#7dd3fc"
                            stroke="#0284c7"
                            strokeWidth={1.5}
                          />
                        </>
                      )}
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* ガイド吹き出し */}
            {!hasTrack && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                <div className="bg-white/95 backdrop-blur px-6 py-4 rounded-3xl border-4 border-emerald-400 shadow-2xl text-center animate-bounce-short">
                  <span className="text-4xl block mb-1">👆</span>
                  <span className="text-emerald-950 font-black text-lg sm:text-xl block">
                    ゆびで なぞって せんろを かこう！
                  </span>
                  <span className="text-emerald-700 font-bold text-xs mt-1 block">
                    せんろができたら 右の電車をえらんで 走らせてね！
                  </span>
                </div>
              </div>
            )}
            {hasTrack && activeTrains.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-3xl border-3 border-emerald-400 shadow-xl text-center animate-bounce-short">
                  <span className="text-3xl block mb-1">👉</span>
                  <span className="text-emerald-950 font-black text-base sm:text-lg">
                    すきな でんしゃを えらんでね！（最大5台）
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドメニュー：くるまタウン風パネル */}
        <div className="w-full md:w-80 bg-white/95 backdrop-blur-md border-t-2 md:border-t-0 md:border-l-2 border-emerald-200 p-3 sm:p-4 flex flex-row md:flex-col justify-between md:justify-start gap-2.5 sm:gap-3.5 shrink-0 overflow-x-auto md:overflow-y-auto">
          {/* ヘッダー・台数表示 */}
          <div className="hidden md:flex items-center justify-between pb-2 border-b border-emerald-100">
            <span className="font-black text-emerald-950 text-base flex items-center gap-1.5">
              <span>🚄</span>
              <span>でんしゃえらび</span>
            </span>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                activeTrains.length > 0 && isRunning
                  ? 'bg-green-100 text-green-800 border-green-300 animate-pulse'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {activeTrains.length} / {MAX_TRAINS} だい そうこう中
            </span>
          </div>

          {/* 車種選択（タップすると追加される！） */}
          <div className="grid grid-cols-5 md:grid-cols-2 gap-1.5 sm:gap-2.5 w-full">
            {TRAINS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => handleAddTrain(i)}
                className="kid-btn p-2 sm:p-2.5 rounded-2xl border-3 border-emerald-200 bg-white hover:bg-emerald-50 active:scale-95 flex flex-col items-center justify-center gap-1 transition-all shadow-md group"
                title={`${t.label}を出発させる`}
              >
                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">{t.emoji}</span>
                <span className="text-xs sm:text-sm font-black text-gray-800 leading-tight">
                  {t.label}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full hidden md:inline-block">
                  ＋ はしらせる
                </span>
              </button>
            ))}
          </div>

          {/* 運転コントローラー */}
          <div className="flex md:flex-col gap-2 mt-auto w-full">
            {/* GO / STOP メインボタン */}
            <button
              onClick={toggleRun}
              className={`kid-btn w-full py-3 sm:py-3.5 rounded-2xl border-4 text-base sm:text-lg font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isRunning && activeTrains.length > 0
                  ? 'bg-gradient-to-r from-red-400 to-rose-500 border-rose-600 text-white'
                  : 'bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-600 text-white'
              }`}
            >
              <span className="text-2xl">{isRunning && activeTrains.length > 0 ? '🛑' : '🚀'}</span>
              <span>{isRunning && activeTrains.length > 0 ? 'ストップ！' : 'しゅっぱつ！'}</span>
            </button>

            {/* サブ操作列（汽笛・スピード・消しゴム） */}
            <div className="flex gap-2 w-full">
              {/* 汽笛ボタン */}
              <button
                onClick={() => {
                  soundManager.playWhistle();
                  speechManager.speak('ポッポー！');
                }}
                className="kid-btn flex-1 py-2 sm:py-2.5 bg-gradient-to-b from-amber-300 to-yellow-400 border-3 border-amber-500 rounded-2xl flex items-center justify-center gap-1 shadow-md font-black active:scale-95 text-amber-950"
                title="汽笛をならす"
              >
                <span className="text-xl">📯</span>
                <span className="text-xs sm:text-sm">ポッポー</span>
              </button>

              {/* スピード切り替え */}
              <button
                onClick={() => {
                  const nextSpeed = (speed % 3) + 1;
                  setSpeed(nextSpeed);
                  speedRef.current = nextSpeed;
                  soundManager.playTap();
                  speechManager.speak(`スピード ${nextSpeed}！`);
                }}
                className="kid-btn flex-1 py-2 sm:py-2.5 bg-gradient-to-b from-orange-300 to-amber-400 border-3 border-orange-500 rounded-2xl flex items-center justify-center gap-1 shadow-md font-black active:scale-95 text-orange-950"
                title="スピード切り替え"
              >
                <span className="text-xl">⚡</span>
                <span className="text-xs sm:text-sm">{'⚡'.repeat(speed)}</span>
              </button>

              {/* 線路全消し */}
              <button
                onClick={clearTracks}
                className="kid-btn px-3 py-2 sm:py-2.5 bg-white border-3 border-gray-300 rounded-2xl flex items-center justify-center shadow-md font-black active:scale-95 text-gray-700 hover:bg-rose-50 hover:border-rose-300"
                title="線路と電車をぜんぶ消す"
              >
                <span className="text-xl">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 下部メッセージバー */}
      <div className="py-1 px-4 text-center text-xs font-black text-emerald-900 bg-white/70 border-t border-emerald-200 shrink-0">
        💡 {statusMsg}
      </div>
    </div>
  );
};
