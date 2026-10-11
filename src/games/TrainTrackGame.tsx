import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../components/Header';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface TrainTrackGameProps {
  onHome: () => void;
  starsCount: number;
}

// 8×6 グリッド
const COLS = 8;
const ROWS = 6;

// セルの接続方向
type Dir = 'N' | 'S' | 'E' | 'W';
type CellConnections = Set<Dir>;

// セルの状態
interface Cell {
  connections: CellConnections; // どの辺に接続しているか
}

// 電車の座標（連続値）
interface TrainPos {
  cellIndex: number;  // 現在いるセル
  progress: number;   // セル内の進捗 0〜1
  fromDir: Dir;       // どこから入ってきたか
  toDir: Dir | null;  // どこへ出るか
  x: number;         // ピクセルX（描画用）
  y: number;         // ピクセルY（描画用）
  angle: number;     // 向き（度）
}

// 逆方向
const opposite: Record<Dir, Dir> = { N: 'S', S: 'N', E: 'W', W: 'E' };

// 方向→隣接セルのオフセット
const dirOffset: Record<Dir, { dc: number; dr: number }> = {
  N: { dc: 0, dr: -1 },
  S: { dc: 0, dr: 1 },
  E: { dc: 1, dr: 0 },
  W: { dc: -1, dr: 0 },
};

// 方向→角度
const dirAngle: Record<Dir, number> = {
  E: 0, S: 90, W: 180, N: 270,
};

// 電車の種類
const TRAINS = [
  { id: 'shinkansen', emoji: '🚄', label: 'しんかんせん', color: '#3b82f6', bodyColor: '#eff6ff', stripeColor: '#2563eb' },
  { id: 'yellow', emoji: '🟡', label: 'ドクターイエロー', color: '#eab308', bodyColor: '#fefce8', stripeColor: '#ca8a04' },
  { id: 'local', emoji: '🚃', label: 'でんしゃ', color: '#22c55e', bodyColor: '#f0fdf4', stripeColor: '#16a34a' },
  { id: 'steam', emoji: '🚂', label: 'SLきかんしゃ', color: '#292524', bodyColor: '#f5f5f4', stripeColor: '#57534e' },
];

function cellIdx(col: number, row: number) {
  return row * COLS + col;
}
function cellColRow(idx: number) {
  return { col: idx % COLS, row: Math.floor(idx / COLS) };
}

// 2つのセルを繋ぐ（互いに接続）
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

// 線路を辿って次のセルへ
function getNextCell(cells: Cell[], currentIdx: number, fromDir: Dir): { nextIdx: number; fromDir: Dir } | null {
  const cell = cells[currentIdx];
  const { col, row } = cellColRow(currentIdx);

  // fromDir の逆方向（入ってきた方向）以外の接続方向を探す
  const entranceDir = opposite[fromDir]; // 入ってきた方向
  const exits = Array.from(cell.connections).filter(d => d !== entranceDir);

  if (exits.length === 0) return null;

  // 複数出口があれば最初のもの（単純な1本線路想定）
  const exitDir = exits[0];
  const offset = dirOffset[exitDir];
  const nc = col + offset.dc;
  const nr = row + offset.dr;

  if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) return null;

  const nextIdx = cellIdx(nc, nr);
  const nextCell = cells[nextIdx];

  // 次のセルが入ってくる方向を持っているか確認
  if (!nextCell.connections.has(opposite[exitDir])) return null;

  return { nextIdx, fromDir: exitDir };
}

// SVGで線路を描画するpathを計算
function getRailPath(connections: CellConnections, cx: number, cy: number, size: number): string {
  const half = size / 2;
  const dirs = Array.from(connections);

  if (dirs.length === 0) return '';
  if (dirs.length === 1) {
    // 行き止まり：中心からその方向へ
    const d = dirs[0];
    const ex = cx + (d === 'E' ? half : d === 'W' ? -half : 0);
    const ey = cy + (d === 'S' ? half : d === 'N' ? -half : 0);
    return `M${cx},${cy} L${ex},${ey}`;
  }

  // 2方向以上: 2つずつペアにして線を引く
  const paths: string[] = [];
  const remaining = [...dirs];
  while (remaining.length >= 2) {
    const d1 = remaining.shift()!;
    const d2 = remaining.shift()!;
    const getEnd = (d: Dir) => ({
      x: cx + (d === 'E' ? half : d === 'W' ? -half : 0),
      y: cy + (d === 'S' ? half : d === 'N' ? -half : 0),
    });
    const e1 = getEnd(d1);
    const e2 = getEnd(d2);

    // 直線か曲線か
    if ((d1 === 'N' && d2 === 'S') || (d1 === 'S' && d2 === 'N') ||
        (d1 === 'E' && d2 === 'W') || (d1 === 'W' && d2 === 'E')) {
      // 直線
      paths.push(`M${e1.x},${e1.y} L${cx},${cy} L${e2.x},${e2.y}`);
    } else {
      // 曲線（2次ベジェ）
      paths.push(`M${e1.x},${e1.y} Q${cx},${cy} ${e2.x},${e2.y}`);
    }
  }
  return paths.join(' ');
}

// 電車のピクセル座標を計算
function getTrainPixelPos(
  trainPos: TrainPos,
  cellSize: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number; angle: number } {
  const { col, row } = cellColRow(trainPos.cellIndex);
  const cx = offsetX + col * cellSize + cellSize / 2;
  const cy = offsetY + row * cellSize + cellSize / 2;
  const half = cellSize / 2;
  const p = trainPos.progress;

  if (!trainPos.toDir) {
    return { x: cx, y: cy, angle: trainPos.angle };
  }

  const from = trainPos.fromDir; // 入ってきた元の辺（逆方向が電車の先頭を示す）
  const to = trainPos.toDir;    // 出ていく辺

  // fromDir = 'E'なら西から来た（x: cx + half → cx）
  const getEdge = (d: Dir) => ({
    x: cx + (d === 'E' ? half : d === 'W' ? -half : 0),
    y: cy + (d === 'S' ? half : d === 'N' ? -half : 0),
  });

  // 入り口（fromDirの逆側の端）
  const entryEdge = getEdge(opposite[from]);
  // 出口（toDir の端）
  const exitEdge = getEdge(to);

  // 直線か曲線で補間
  let x: number, y: number, angle: number;
  if ((from === 'N' && to === 'S') || (from === 'S' && to === 'N') ||
      (from === 'E' && to === 'W') || (from === 'W' && to === 'E')) {
    // 直線補間
    x = entryEdge.x + (exitEdge.x - entryEdge.x) * p;
    y = entryEdge.y + (exitEdge.y - entryEdge.y) * p;
    angle = dirAngle[to];
  } else {
    // ベジェ曲線補間
    const t = p;
    x = (1 - t) * (1 - t) * entryEdge.x + 2 * (1 - t) * t * cx + t * t * exitEdge.x;
    y = (1 - t) * (1 - t) * entryEdge.y + 2 * (1 - t) * t * cy + t * t * exitEdge.y;

    // 接線方向を角度に
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
  const [speed, setSpeed] = useState(1); // 1, 2, 3
  const [trainPos, setTrainPos] = useState<TrainPos | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCell, setLastCell] = useState<number | null>(null);
  const [cellSize, setCellSize] = useState(60);
  const [statusMsg, setStatusMsg] = useState('せんろを かいてね！');

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

  // グリッドサイズ計算
  useEffect(() => {
    const calc = () => {
      const w = Math.min(window.innerWidth - 16, 560);
      const h = window.innerHeight - 260;
      const byCols = Math.floor(w / COLS);
      const byRows = Math.floor(h / ROWS);
      setCellSize(Math.max(44, Math.min(byCols, byRows, 72)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    setTimeout(() => speechManager.speak('せんろをかいて でんしゃを はしらせよう！'), 400);
  }, []);

  // 電車の走行アニメーション
  const animate = useCallback(() => {
    if (!isRunningRef.current) return;

    const cells = cellsRef.current;
    let tp = trainPosRef.current;

    if (!tp) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const speedFactor = speedRef.current * 0.018;
    const newProgress = tp.progress + speedFactor;

    if (newProgress >= 1) {
      // 次のセルへ
      if (tp.toDir) {
        const result = getNextCell(cells, tp.cellIndex, tp.toDir);
        if (result) {
          const { nextIdx, fromDir } = result;
          const nextCell = cells[nextIdx];
          const exits = Array.from(nextCell.connections).filter(d => d !== opposite[fromDir]);
          const toDir = exits.length > 0 ? exits[0] : null;

          const newTp: TrainPos = {
            cellIndex: nextIdx,
            progress: newProgress - 1,
            fromDir,
            toDir,
            x: tp.x,
            y: tp.y,
            angle: tp.angle,
          };
          trainPosRef.current = newTp;
          setTrainPos({ ...newTp });
        } else {
          // 行き止まり：折り返し
          const newTp: TrainPos = {
            ...tp,
            progress: 0,
            fromDir: tp.toDir!,
            toDir: opposite[tp.fromDir] as Dir,
          };
          // ちゃんと逆方向があるか確認
          if (cells[tp.cellIndex].connections.has(newTp.toDir!)) {
            trainPosRef.current = newTp;
            setTrainPos({ ...newTp });
          } else {
            setIsRunning(false);
            setStatusMsg('ゆきどまり！せんろを のばしてね');
            speechManager.speak('ゆきどまりだよ！せんろを のばしてね');
            return;
          }
        }
      }
    } else {
      const newTp = { ...tp, progress: newProgress };
      trainPosRef.current = newTp;
      setTrainPos(newTp);
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // 走行ON/OFF
  const toggleRun = () => {
    if (!isRunning) {
      // 発車！まず線路上の発車地点を探す
      const cells = cellsRef.current;
      let startIdx = -1;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].connections.size > 0) { startIdx = i; break; }
      }
      if (startIdx === -1) {
        setStatusMsg('まず せんろを かいてね！');
        speechManager.speak('まず せんろを かいてね');
        soundManager.playTryAgain();
        return;
      }

      const startCell = cells[startIdx];
      const dirs = Array.from(startCell.connections);
      const fromDir = dirs.length >= 2 ? dirs[0] : dirs[0];
      const exits = dirs.filter(d => d !== opposite[fromDir]);
      const toDir = exits.length > 0 ? exits[0] : dirs[0];

      const tp: TrainPos = {
        cellIndex: startIdx,
        progress: 0,
        fromDir,
        toDir,
        x: 0, y: 0, angle: 0,
      };
      trainPosRef.current = tp;
      setTrainPos(tp);
      setIsRunning(true);
      isRunningRef.current = true;
      soundManager.playWhistle();
      speechManager.speak('はっしゃ！');
      setStatusMsg('しゅっぱつしんこう！🚄');
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
      isRunningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      setStatusMsg('ていしゃ！');
      speechManager.speak('ていしゃ！');
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ガタンゴトン音の定期再生
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        if (isRunningRef.current) soundManager.playTrainRoll();
      }, 600 / speed);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed]);

  // グリッドクリックによる線路敷設
  const getCell = useCallback((e: React.PointerEvent<SVGSVGElement>): number | null => {
    const svg = gridRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return cellIdx(col, row);
  }, [cellSize]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isRunning) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const idx = getCell(e);
    if (idx !== null) {
      setLastCell(idx);
      soundManager.playTap();
    }
  }, [isRunning, getCell]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || isRunning) return;
    const idx = getCell(e);
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
  }, [isDrawing, isRunning, lastCell, getCell]);

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
    setStatusMsg('せんろを かいてね！');
    speechManager.speak('せんろを けしたよ！あたらしく かいてね');
    soundManager.playTap();
  };

  const svgWidth = cellSize * COLS;
  const svgHeight = cellSize * ROWS;

  // 電車の描画位置
  let trainScreenX = -999, trainScreenY = -999, trainAngle = 0;
  if (trainPos) {
    const pos = getTrainPixelPos(trainPos, cellSize, 0, 0);
    trainScreenX = pos.x;
    trainScreenY = pos.y;
    trainAngle = pos.angle;
  }

  const train = TRAINS[selectedTrain];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 overflow-hidden">
      <Header title="せんろをつくろう 🚄" onHome={onHome} starsCount={starsCount} />

      {/* ステータスメッセージ */}
      <div className="text-center py-1.5 px-4 bg-white/70 border-b border-sky-200">
        <p className="text-sm font-black text-sky-700">{statusMsg}</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* メインエリア：線路グリッド */}
        <div className="flex-1 flex flex-col items-center justify-start pt-2 overflow-auto">
          <div className="relative" style={{ width: svgWidth, height: svgHeight }}>
            <svg
              ref={gridRef}
              width={svgWidth}
              height={svgHeight}
              className="touch-none select-none cursor-crosshair rounded-2xl border-4 border-sky-300 bg-gradient-to-br from-green-100 to-green-200 shadow-lg"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* グリッド線 */}
              {Array.from({ length: ROWS + 1 }).map((_, r) => (
                <line
                  key={`hr${r}`}
                  x1={0} y1={r * cellSize}
                  x2={svgWidth} y2={r * cellSize}
                  stroke="#a7f3d0" strokeWidth="1" strokeDasharray="4,4"
                />
              ))}
              {Array.from({ length: COLS + 1 }).map((_, c) => (
                <line
                  key={`vc${c}`}
                  x1={c * cellSize} y1={0}
                  x2={c * cellSize} y2={svgHeight}
                  stroke="#a7f3d0" strokeWidth="1" strokeDasharray="4,4"
                />
              ))}

              {/* 線路（SVGパス） */}
              {cells.map((cell, idx) => {
                if (cell.connections.size === 0) return null;
                const { col, row } = cellColRow(idx);
                const cx = col * cellSize + cellSize / 2;
                const cy = row * cellSize + cellSize / 2;

                // 枕木の描画
                const dirs = Array.from(cell.connections);
                const ties: React.ReactNode[] = [];
                for (let i = 0; i < dirs.length; i += 2) {
                  if (i + 1 >= dirs.length) break;
                  const d1 = dirs[i], d2 = dirs[i + 1];
                  const isHoriz = (d1 === 'E' || d1 === 'W') && (d2 === 'E' || d2 === 'W');
                  const isVert = (d1 === 'N' || d1 === 'S') && (d2 === 'N' || d2 === 'S');
                  if (isHoriz || isVert) {
                    // 直線：枕木を垂直方向に
                    const tieCount = 3;
                    const half = cellSize / 2;
                    for (let t = 0; t < tieCount; t++) {
                      const frac = (t + 1) / (tieCount + 1);
                      const tx = isHoriz ? cx - half + cellSize * frac : cx;
                      const ty = isVert ? cy - half + cellSize * frac : cy;
                      ties.push(
                        <rect
                          key={`tie-${idx}-${t}`}
                          x={isHoriz ? tx - 1 : tx - 6}
                          y={isHoriz ? ty - 6 : ty - 1}
                          width={isHoriz ? 2 : 12}
                          height={isHoriz ? 12 : 2}
                          fill="#a16207"
                          rx="1"
                        />
                      );
                    }
                  }
                }

                const path = getRailPath(cell.connections, cx, cy, cellSize);
                return (
                  <g key={idx}>
                    {ties}
                    <path
                      d={path}
                      stroke="#78716c"
                      strokeWidth={cellSize * 0.12}
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d={path}
                      stroke="#e7e5e4"
                      strokeWidth={cellSize * 0.06}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${cellSize * 0.15},${cellSize * 0.1}`}
                    />
                  </g>
                );
              })}

              {/* 電車本体（SVGで描画） */}
              {trainPos && (
                <g transform={`translate(${trainScreenX}, ${trainScreenY}) rotate(${trainAngle})`}>
                  {/* 車体 */}
                  <rect
                    x={-cellSize * 0.38}
                    y={-cellSize * 0.18}
                    width={cellSize * 0.76}
                    height={cellSize * 0.36}
                    rx={cellSize * 0.08}
                    fill={train.bodyColor}
                    stroke={train.color}
                    strokeWidth={cellSize * 0.04}
                  />
                  {/* 帯 */}
                  <rect
                    x={-cellSize * 0.38}
                    y={-cellSize * 0.06}
                    width={cellSize * 0.76}
                    height={cellSize * 0.12}
                    fill={train.stripeColor}
                  />
                  {/* 先頭（右側） */}
                  <ellipse
                    cx={cellSize * 0.38}
                    cy={0}
                    rx={cellSize * 0.08}
                    ry={cellSize * 0.18}
                    fill={train.color}
                  />
                  {/* 窓（2つ） */}
                  <rect
                    x={-cellSize * 0.28}
                    y={-cellSize * 0.12}
                    width={cellSize * 0.18}
                    height={cellSize * 0.12}
                    rx={cellSize * 0.03}
                    fill="#bae6fd"
                    stroke="#7dd3fc"
                    strokeWidth={1}
                  />
                  <rect
                    x={-cellSize * 0.05}
                    y={-cellSize * 0.12}
                    width={cellSize * 0.18}
                    height={cellSize * 0.12}
                    rx={cellSize * 0.03}
                    fill="#bae6fd"
                    stroke="#7dd3fc"
                    strokeWidth={1}
                  />
                </g>
              )}
            </svg>

            {/* 操作ヒント */}
            {cells.every(c => c.connections.size === 0) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/80 rounded-2xl px-6 py-4 text-center shadow">
                  <p className="text-2xl mb-1">👆</p>
                  <p className="font-black text-sky-700 text-sm">ゆびで なぞって せんろを かこう！</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドメニュー */}
        <div className="w-20 sm:w-24 flex flex-col gap-2 p-2 bg-white/60 border-l border-sky-200 overflow-y-auto">
          <p className="text-center text-xs font-black text-sky-700 py-1">でんしゃ</p>
          {TRAINS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTrain(i);
                soundManager.playTap();
                speechManager.speak(t.label);
              }}
              className={`rounded-xl p-1.5 border-4 transition-all ${
                selectedTrain === i
                  ? 'border-blue-500 bg-blue-100 scale-105 shadow-md'
                  : 'border-transparent bg-white/80 hover:bg-blue-50'
              }`}
            >
              <div className="text-2xl text-center">{t.emoji}</div>
              <p className="text-center text-xs font-bold text-gray-600 mt-0.5 leading-tight">{t.label}</p>
            </button>
          ))}

          <div className="border-t border-sky-200 mt-1 pt-1">
            <p className="text-center text-xs font-black text-sky-700 py-1">スピード</p>
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  speedRef.current = s;
                  soundManager.playTap();
                }}
                className={`w-full rounded-xl py-1 mb-1 text-xs font-black border-2 transition-all ${
                  speed === s
                    ? 'bg-orange-400 border-orange-500 text-white shadow-md'
                    : 'bg-white border-orange-200 text-orange-700'
                }`}
              >
                {'⚡'.repeat(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 下部コントローラー */}
      <div className="bg-white/80 border-t-4 border-sky-300 p-2 flex gap-2 justify-center items-center shrink-0">
        {/* 汽笛ボタン */}
        <button
          onClick={() => {
            soundManager.playWhistle();
            speechManager.speak('ポッポー！');
          }}
          className="kid-btn bg-gradient-to-b from-yellow-300 to-yellow-400 border-4 border-yellow-500 rounded-2xl px-3 py-2 text-2xl shadow-md font-black active:scale-95"
          title="きてき"
        >
          📯
        </button>

        {/* GO / STOP ボタン */}
        <button
          onClick={toggleRun}
          className={`kid-btn flex-1 max-w-xs rounded-2xl py-3 border-4 text-lg font-black shadow-xl transition-all active:scale-95 ${
            isRunning
              ? 'bg-gradient-to-b from-red-400 to-red-500 border-red-600 text-white'
              : 'bg-gradient-to-b from-green-400 to-green-500 border-green-600 text-white'
          }`}
        >
          {isRunning ? '🛑 ストップ！' : '🚄 しゅっぱつ！'}
        </button>

        {/* 消しゴムボタン */}
        <button
          onClick={clearTracks}
          className="kid-btn bg-gradient-to-b from-gray-200 to-gray-300 border-4 border-gray-400 rounded-2xl px-3 py-2 text-2xl shadow-md font-black active:scale-95"
          title="せんろをけす"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
