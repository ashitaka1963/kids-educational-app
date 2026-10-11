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

// セルの接続方向
type Dir = 'N' | 'S' | 'E' | 'W';
type CellConnections = Set<Dir>;

interface Cell {
  connections: CellConnections;
  switchExit?: Dir; // 分岐セルでの優先進行方向
}

// 電車の座標（進行方向）
interface TrainPos {
  cellIndex: number;  // 現在いるセル
  progress: number;   // セル内の進捗 0〜1
  enterDir: Dir;      // どの辺から入ってきたか
  exitDir: Dir;       // どの辺へ抜けるか
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

// 電車の種類（モノレール追加！）
const TRAINS = [
  { id: 'monorail', emoji: '🚝', label: 'モノレール', desc: 'くうちゅうを はしるよ', color: '#0284c7', bodyColor: '#ffffff', stripeColor: '#0ea5e9', isMonorail: true },
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

  // 3方向以上（分岐ポイントや十字交差）：中心から各辺へ接続
  return dirs.map((d) => {
    const e = getEnd(d);
    return `M${cx},${cy} L${e.x},${e.y}`;
  }).join(' ');
}

// 電車の仮想ピクセル座標を計算
function getTrainPixelPos(
  trainPos: TrainPos,
  cellSize: number
): { x: number; y: number; angle: number } {
  const { col, row } = cellColRow(trainPos.cellIndex);
  const cx = col * cellSize + cellSize / 2;
  const cy = row * cellSize + cellSize / 2;
  const half = cellSize / 2;
  const p = Math.max(0, Math.min(1, trainPos.progress));

  const enter = trainPos.enterDir;
  const exit = trainPos.exitDir;

  const getEdge = (d: Dir) => ({
    x: cx + (d === 'E' ? half : d === 'W' ? -half : 0),
    y: cy + (d === 'S' ? half : d === 'N' ? -half : 0),
  });

  const entryEdge = getEdge(enter);
  const exitEdge = getEdge(exit);

  let x: number, y: number, angle: number;
  if ((enter === 'W' && exit === 'E') || (enter === 'E' && exit === 'W') ||
      (enter === 'N' && exit === 'S') || (enter === 'S' && exit === 'N')) {
    // 直線補間：入り口から出口へ一直線
    x = entryEdge.x + (exitEdge.x - entryEdge.x) * p;
    y = entryEdge.y + (exitEdge.y - entryEdge.y) * p;
    angle = dirAngle[exit];
  } else if (enter === exit) {
    // 折り返し（同じ辺から戻る場合）
    x = entryEdge.x;
    y = entryEdge.y;
    angle = dirAngle[exit];
  } else {
    // カーブ補間（2次ベジェ曲線）
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
  const [selectedTrain, setSelectedTrain] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [trainPos, setTrainPos] = useState<TrainPos | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCell, setLastCell] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState('指でなぞって 線路をかこう！');

  const gridRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number>(0);
  const cellsRef = useRef<Cell[]>(cells);
  const trainPosRef = useRef<TrainPos | null>(null);
  const isRunningRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => { cellsRef.current = cells; }, [cells]);
  useEffect(() => { trainPosRef.current = trainPos; }, [trainPos]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      speechManager.speak('せんろをかいて でんしゃを はしらせよう！');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // 電車の走行アニメーションループ
  const animate = useCallback(() => {
    if (!isRunningRef.current) return;

    const currentCells = cellsRef.current;
    const tp = trainPosRef.current;

    if (!tp) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const speedFactor = speedRef.current * 0.022;
    const newProgress = tp.progress + speedFactor;

    if (newProgress >= 1) {
      // 現在のセルから exitDir 方向へ抜ける
      const { col, row } = cellColRow(tp.cellIndex);
      const offset = dirOffset[tp.exitDir];
      const nc = col + offset.dc;
      const nr = row + offset.dr;

      // 次のセルがグリッド内か確認
      if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
        const nextIdx = cellIdx(nc, nr);
        const nextCell = currentCells[nextIdx];
        const nextEnterDir = opposite[tp.exitDir]; // 次のセルにとっての入口

        // 次のセルが線路を持っており、かつ入口が開いているか確認
        if (nextCell.connections.has(nextEnterDir)) {
          // 次のセルの出口を探す（入ってきた方向以外の接続）
          const candidateExits = Array.from(nextCell.connections).filter(d => d !== nextEnterDir);

          let nextExitDir: Dir;
          if (candidateExits.length > 1) {
            // 分岐！優先方向が設定されていればそれを採用
            if (nextCell.switchExit && candidateExits.includes(nextCell.switchExit)) {
              nextExitDir = nextCell.switchExit;
            } else {
              // 直進方向を優先し、なければ先頭
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
            // 行き止まりセル（出口がないので折り返し）
            nextExitDir = nextEnterDir;
          }

          const newTp: TrainPos = {
            cellIndex: nextIdx,
            enterDir: nextEnterDir,
            exitDir: nextExitDir,
            progress: newProgress - 1,
          };
          trainPosRef.current = newTp;
          setTrainPos(newTp);
          animFrameRef.current = requestAnimationFrame(animate);
          return;
        }
      }

      // 次のセルがない、または線路がつながっていない場合：終点（行き止まり）で折り返し（Uターン）
      const currentCell = currentCells[tp.cellIndex];
      if (currentCell.connections.has(tp.enterDir)) {
        const newTp: TrainPos = {
          cellIndex: tp.cellIndex,
          enterDir: tp.exitDir,
          exitDir: tp.enterDir,
          progress: 0,
        };
        trainPosRef.current = newTp;
        setTrainPos(newTp);
      } else {
        setIsRunning(false);
        isRunningRef.current = false;
        setStatusMsg('ゆきどまり！せんろを のばしてね');
        speechManager.speak('ゆきどまりだよ！せんろを のばしてね');
        return;
      }
    } else {
      const newTp = { ...tp, progress: newProgress };
      trainPosRef.current = newTp;
      setTrainPos(newTp);
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // GO / STOP 切り替え
  const toggleRun = () => {
    if (!isRunning) {
      const currentCells = cellsRef.current;
      // 端点（接続が1つのセル）を優先して始点にする
      let startIdx = -1;
      for (let i = 0; i < currentCells.length; i++) {
        if (currentCells[i].connections.size === 1) {
          startIdx = i;
          break;
        }
      }
      if (startIdx === -1) {
        // ループ線路など端点がない場合は、線路がある最初のセル
        for (let i = 0; i < currentCells.length; i++) {
          if (currentCells[i].connections.size > 0) {
            startIdx = i;
            break;
          }
        }
      }

      if (startIdx === -1) {
        setStatusMsg('まず せんろを かいてね！');
        speechManager.speak('まず せんろを かいてね！');
        soundManager.playTryAgain();
        return;
      }

      const startCell = currentCells[startIdx];
      const dirs = Array.from(startCell.connections);
      let enterDir: Dir;
      let exitDir: Dir;

      if (dirs.length === 1) {
        exitDir = dirs[0];
        enterDir = opposite[exitDir];
      } else {
        enterDir = dirs[0];
        exitDir = dirs[1];
      }

      const tp: TrainPos = {
        cellIndex: startIdx,
        enterDir,
        exitDir,
        progress: 0,
      };
      trainPosRef.current = tp;
      setTrainPos(tp);
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
    if (isRunning) {
      const interval = setInterval(() => {
        if (isRunningRef.current) soundManager.playTrainRoll();
      }, 550 / speed);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed]);

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

  // 線路を全消し
  const clearTracks = () => {
    if (isRunning) {
      setIsRunning(false);
      isRunningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
    }
    const newCells: Cell[] = Array.from({ length: COLS * ROWS }, () => ({ connections: new Set<Dir>() }));
    setCells(newCells);
    cellsRef.current = newCells;
    setTrainPos(null);
    trainPosRef.current = null;
    setStatusMsg('指でなぞって 線路をかこう！');
    speechManager.speak('せんろを ぜんぶけしたよ！また かいてね！');
    soundManager.playTap();
  };

  // 電車の描画座標
  let trainScreenX = -999, trainScreenY = -999, trainAngle = 0;
  if (trainPos) {
    const pos = getTrainPixelPos(trainPos, CELL_SIZE);
    trainScreenX = pos.x;
    trainScreenY = pos.y;
    trainAngle = pos.angle;
  }

  const train = TRAINS[selectedTrain];
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

            {/* 線路描画SVG（親コンテナいっぱいに広がるレスポンシブSVG） */}
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

                    {/* 分岐切り替えスイッチ（3方向以上ある場合） */}
                    {cell.connections.size >= 3 && (
                      <g
                        className="cursor-pointer"
                        onPointerDown={(e) => handleToggleSwitch(idx, e)}
                        style={{ pointerEvents: 'auto' }}
                      >
                        {/* 外側の光るリング */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={CELL_SIZE * 0.22}
                          fill="#fef08a"
                          stroke="#eab308"
                          strokeWidth="3.5"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                        />
                        {/* 矢印アイコン */}
                        <text
                          x={cx}
                          y={cy + 6}
                          textAnchor="middle"
                          fontSize={CELL_SIZE * 0.24}
                          className="select-none pointer-events-none"
                        >
                          🔀
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 走行中の電車（SVGパーツ） */}
              {trainPos && (
                <g transform={`translate(${trainScreenX}, ${trainScreenY}) rotate(${trainAngle})`}>
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

                  {train.id === 'monorail' ? (
                    /* モノレール車体（流線型の近未来ボディ） */
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
              )}
            </svg>

            {/* 線路未敷設時のガイド吹き出し */}
            {!hasTrack && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                <div className="bg-white/95 backdrop-blur px-6 py-4 rounded-3xl border-4 border-emerald-400 shadow-2xl text-center animate-bounce-short">
                  <span className="text-4xl block mb-1">👆</span>
                  <span className="text-emerald-950 font-black text-lg sm:text-xl block">
                    ゆびで なぞって せんろを かこう！
                  </span>
                  <span className="text-emerald-700 font-bold text-xs mt-1 block">
                    つなげたら みぎの「しゅっぱつ！」をおしてね
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドメニュー：車タウン風のコントローラーパネル */}
        <div className="w-full md:w-80 bg-white/95 backdrop-blur-md border-t-2 md:border-t-0 md:border-l-2 border-emerald-200 p-3 sm:p-4 flex flex-row md:flex-col justify-between md:justify-start gap-2.5 sm:gap-3.5 shrink-0 overflow-x-auto md:overflow-y-auto">
          {/* ヘッダー・ステータス */}
          <div className="hidden md:flex items-center justify-between pb-2 border-b border-emerald-100">
            <span className="font-black text-emerald-950 text-base flex items-center gap-1.5">
              <span>🚄</span>
              <span>でんしゃえらび</span>
            </span>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                isRunning
                  ? 'bg-green-100 text-green-800 border-green-300 animate-pulse'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {isRunning ? 'そうこう中 ⚡' : 'ていしゃ中 🛑'}
            </span>
          </div>

          {/* 車種選択（モノレール含む5台） */}
          <div className="grid grid-cols-5 md:grid-cols-2 gap-1.5 sm:gap-2.5 w-full">
            {TRAINS.map((t, i) => {
              const isSelected = selectedTrain === i;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTrain(i);
                    soundManager.playTap();
                    speechManager.speak(t.label);
                  }}
                  className={`kid-btn p-2 sm:p-2.5 rounded-2xl border-3 flex flex-col items-center justify-center gap-1 transition-all shadow-md ${
                    isSelected
                      ? 'bg-blue-100 border-blue-500 scale-105 ring-3 ring-blue-300'
                      : 'bg-white border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{t.emoji}</span>
                  <span className="text-xs sm:text-sm font-black text-gray-800 leading-tight">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 運転コントローラー（出発/ストップ、汽笛、スピード、全消し） */}
          <div className="flex md:flex-col gap-2 mt-auto w-full">
            {/* GO / STOP メインボタン */}
            <button
              onClick={toggleRun}
              className={`kid-btn w-full py-3 sm:py-3.5 rounded-2xl border-4 text-base sm:text-lg font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-gradient-to-r from-red-400 to-rose-500 border-rose-600 text-white'
                  : 'bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-600 text-white'
              }`}
            >
              <span className="text-2xl">{isRunning ? '🛑' : '🚀'}</span>
              <span>{isRunning ? 'ストップ！' : 'しゅっぱつ！'}</span>
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
                title="線路を全部けす"
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
