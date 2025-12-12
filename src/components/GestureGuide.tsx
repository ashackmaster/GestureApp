import { Hand, ZoomIn, ZoomOut, Move, Snowflake, RotateCcw } from 'lucide-react';

const GestureGuide = () => {
  return (
    <div className="absolute top-20 right-4 z-20">
      <div className="p-3 rounded-xl bg-background/40 backdrop-blur-md border border-border/30 shadow-lg">
        <h4 className="text-[10px] font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Gestures</h4>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-cyan-400">
            <Hand className="w-3.5 h-3.5" />
            <span className="text-[10px]">Open Hand - Rotate</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="text-[10px]">Thumb+Index - Zoom In</span>
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <ZoomOut className="w-3.5 h-3.5" />
            <span className="text-[10px]">Index Only - Zoom Out</span>
          </div>
          <div className="flex items-center gap-2 text-pink-400">
            <Move className="w-3.5 h-3.5" />
            <span className="text-[10px]">Peace Sign - Move</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <Snowflake className="w-3.5 h-3.5" />
            <span className="text-[10px]">Fist - Freeze</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px]">Thumb+Pinky - Reset</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureGuide;
