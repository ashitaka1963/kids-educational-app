import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Eraser, Undo2 } from 'lucide-react';
import { Header } from '../components/Header';
import { soundManager } from '../utils/sound';
import { speechManager } from '../utils/speech';

interface DrawingCanvasProps {
  onHome: () => void;
  starsCount: number;
}

type ToolMode = 'pen' | 'eraser' | 'stamp';

interface ColorOption {
  name: string;
  hex: string;
  voiceName: string;
}

const COLORS: ColorOption[] = [
  { name: 'あか', hex: '#ef4444', voiceName: 'あか' },
  { name: 'あお', hex: '#3b82f6', voiceName: 'あお' },
  { name: 'きいろ', hex: '#eab308', voiceName: 'きいろ' },
  { name: 'みどり', hex: '#22c55e', voiceName: 'みどり' },
  { name: 'おれんじ', hex: '#f97316', voiceName: 'おれんじ' },
  { name: 'ぴんく', hex: '#ec4899', voiceName: 'ぴんく' },
  { name: 'むらさき', hex: '#a855f7', voiceName: 'むらさき' },
  { name: 'くろ', hex: '#1e293b', voiceName: 'くろ' },
];

const PEN_SIZES = [
  { label: 'ほそい', size: 6 },
  { label: 'ふつう', size: 14 },
  { label: 'ふとい', size: 28 },
];

const STAMPS = ['⭐', '💖', '🌸', '🚗', '🐶'];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onHome, starsCount }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(COLORS[0].hex);
  const [currentSize, setCurrentSize] = useState<number>(PEN_SIZES[1].size);
  const [toolMode, setToolMode] = useState<ToolMode>('pen');
  const [currentStamp, setCurrentStamp] = useState<string>(STAMPS[0]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // 初期アナウンス
  useEffect(() => {
    const timer = setTimeout(() => {
      speechManager.speak('しろい キャンバスに すきな えを かいてみてね！');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // キャンバスのリサイズと初期化（白背景で塗りつぶす）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;

    // Retinaディスプレイ対応の高解像度調整
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      saveState();
    }
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), imgData]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    soundManager.playTap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // 現在の状態を捨てる
    const prevState = newHistory[newHistory.length - 1];
    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
      setHistory(newHistory);
    }
  };

  // 描画開始（タッチ / マウス / ペン共通）
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (toolMode === 'stamp') {
      soundManager.playGlitter();
      ctx.font = `${currentSize * 3.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentStamp, x, y);
      saveState();
      return;
    }

    soundManager.playTap();
    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = toolMode === 'eraser' ? '#ffffff' : currentColor;
  };

  // 描画中
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || toolMode === 'stamp') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // 描画終了
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    saveState();
  };

  const handleSelectColor = (color: ColorOption) => {
    soundManager.playTap();
    setCurrentColor(color.hex);
    setToolMode('pen');
    speechManager.speak(color.voiceName);
  };

  const handleSelectSize = (size: number, label: string) => {
    soundManager.playTap();
    setCurrentSize(size);
    speechManager.speak(label);
  };

  const handleSelectStamp = (stamp: string) => {
    soundManager.playTap();
    setCurrentStamp(stamp);
    setToolMode('stamp');
    speechManager.speak('スタンプ！');
  };

  const handleClearCanvas = () => {
    soundManager.playTap();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    setShowClearConfirm(false);
    speechManager.speak('まっしろに なったよ！また かいてね！');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-amber-50 select-none overflow-hidden touch-none">
      <Header
        title="おえかきキャンバス"
        onHome={onHome}
        starsCount={starsCount}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* キャンバスエリア（白色の大きな用紙） */}
        <div className="flex-1 h-full w-full relative bg-amber-100/50 p-2 sm:p-4 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-3xl shadow-xl border-4 border-amber-300 overflow-hidden relative">
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              className="w-full h-full touch-none cursor-crosshair"
            />
          </div>
        </div>

        {/* ツールパネル（スマホ・タブレット対応の操作バー） */}
        <div className="w-full md:w-80 bg-white/95 backdrop-blur-md border-t-2 md:border-t-0 md:border-l-2 border-amber-200 p-3 sm:p-4 flex flex-row md:flex-col justify-between md:justify-start gap-3 sm:gap-4 shrink-0 overflow-x-auto md:overflow-y-auto">
          {/* カラーパレット */}
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-amber-950 mb-1.5 hidden md:block">
              🎨 すきな いろ
            </span>
            <div className="grid grid-cols-4 md:grid-cols-4 gap-2 sm:gap-2.5">
              {COLORS.map((c) => {
                const isSelected = toolMode === 'pen' && currentColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    onClick={() => handleSelectColor(c)}
                    className={`kid-btn w-9 h-9 sm:w-11 sm:h-11 rounded-2xl shadow-md border-3 transition-transform ${
                      isSelected ? 'scale-115 ring-4 ring-amber-400 border-white' : 'border-white/80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                );
              })}
            </div>
          </div>

          {/* えんぴつの太さ */}
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-amber-950 mb-1.5 hidden md:block">
              ✏️ ペンの ふとさ
            </span>
            <div className="flex gap-2">
              {PEN_SIZES.map((p) => {
                const isSelected = currentSize === p.size && toolMode !== 'stamp';
                return (
                  <button
                    key={p.size}
                    onClick={() => handleSelectSize(p.size, p.label)}
                    className={`kid-btn flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center border-2 shadow-sm ${
                      isSelected
                        ? 'bg-amber-400 border-amber-500 text-amber-950 font-black'
                        : 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                    }`}
                  >
                    <div
                      className="rounded-full bg-amber-950 mb-1"
                      style={{ width: p.size, height: p.size }}
                    />
                    <span className="text-xs">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ポンポンスタンプ */}
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-amber-950 mb-1.5 hidden md:block">
              ✨ スタンプ
            </span>
            <div className="flex gap-1.5 justify-around">
              {STAMPS.map((stamp) => {
                const isSelected = toolMode === 'stamp' && currentStamp === stamp;
                return (
                  <button
                    key={stamp}
                    onClick={() => handleSelectStamp(stamp)}
                    className={`kid-btn w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm border-2 ${
                      isSelected
                        ? 'bg-yellow-200 border-yellow-500 scale-110 ring-2 ring-yellow-400'
                        : 'bg-white border-amber-200'
                    }`}
                  >
                    {stamp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ツールボタン（消しゴム、1つ戻る、ぜんぶ消す） */}
          <div className="flex md:flex-col gap-2 mt-auto">
            <button
              onClick={() => {
                soundManager.playTap();
                setToolMode('eraser');
                speechManager.speak('けしごむ！');
              }}
              className={`kid-btn flex-1 py-2 sm:py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 border-2 shadow-md ${
                toolMode === 'eraser'
                  ? 'bg-rose-400 border-rose-500 text-white font-black'
                  : 'bg-white border-gray-300 text-gray-700 font-bold'
              }`}
            >
              <Eraser className="w-5 h-5 stroke-[2.5]" />
              <span className="text-xs sm:text-sm">けしごむ</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="kid-btn flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-white border-2 border-gray-300 text-gray-700 font-bold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40"
              title="ひとつ もどす"
            >
              <Undo2 className="w-5 h-5 stroke-[2.5]" />
              <span className="text-xs sm:text-sm">もどす</span>
            </button>

            <button
              onClick={() => {
                soundManager.playTap();
                setShowClearConfirm(true);
              }}
              className="kid-btn flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-rose-100 hover:bg-rose-200 border-2 border-rose-400 text-rose-800 font-black flex items-center justify-center gap-1.5 shadow-md"
              title="ぜんぶ けす"
            >
              <Trash2 className="w-5 h-5 stroke-[2.5]" />
              <span className="text-xs sm:text-sm">ぜんぶけす</span>
            </button>
          </div>
        </div>
      </div>

      {/* 誤操作防止ダイアログ：「ぜんぶ けしちゃう？」 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-rose-300 animate-pop-in">
            <div className="text-5xl mb-3">🗑️</div>
            <h3 className="text-xl sm:text-2xl font-black text-rose-950 mb-2">
              ぜんぶ けしちゃう？
            </h3>
            <p className="text-gray-500 font-bold mb-6 text-sm">
              かいた えが まっしろに なります
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  soundManager.playTap();
                  setShowClearConfirm(false);
                }}
                className="kid-btn flex-1 py-3 px-4 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-base border-2 border-gray-400 shadow-md"
              >
                やめる
              </button>
              <button
                onClick={handleClearCanvas}
                className="kid-btn flex-1 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-base border-2 border-rose-600 shadow-md"
              >
                けす！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
