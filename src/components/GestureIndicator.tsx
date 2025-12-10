import { GestureState } from '@/hooks/useHandTracking';
import { Hand, Maximize2, RotateCcw } from 'lucide-react';

interface GestureIndicatorProps {
  gesture: GestureState;
  isTracking: boolean;
}

const GestureIndicator = ({ gesture, isTracking }: GestureIndicatorProps) => {
  if (!isTracking) return null;

  const activeGesture = gesture.isPinching
    ? { icon: Maximize2, label: 'ZOOM', color: 'text-secondary' }
    : gesture.isOpenHand
    ? { icon: Hand, label: 'ROTATE', color: 'text-primary' }
    : gesture.isFist
    ? { icon: RotateCcw, label: 'RESET', color: 'text-destructive' }
    : null;

  if (!activeGesture) return null;

  const Icon = activeGesture.icon;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm border border-border/20">
        <Icon className={`w-4 h-4 ${activeGesture.color}`} />
        <span className={`text-xs font-display tracking-widest ${activeGesture.color}`}>
          {activeGesture.label}
        </span>
      </div>
    </div>
  );
};

export default GestureIndicator;
