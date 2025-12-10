import { GestureState } from '@/hooks/useHandTracking';
import { Maximize2, Hand, RotateCcw } from 'lucide-react';

interface GestureIndicatorProps {
  gesture: GestureState;
  isTracking: boolean;
}

const GestureIndicator = ({ gesture, isTracking }: GestureIndicatorProps) => {
  if (!isTracking) return null;

  const activeGesture = gesture.isPinching
    ? 'pinch'
    : gesture.isOpenHand
    ? 'rotate'
    : gesture.isFist
    ? 'reset'
    : null;

  if (!activeGesture) return null;

  const gestureConfig = {
    pinch: {
      icon: Maximize2,
      label: 'ZOOMING',
      color: 'text-secondary',
      bg: 'bg-secondary/20',
      border: 'border-secondary',
    },
    rotate: {
      icon: Hand,
      label: 'ROTATING',
      color: 'text-primary',
      bg: 'bg-primary/20',
      border: 'border-primary',
    },
    reset: {
      icon: RotateCcw,
      label: 'RESETTING',
      color: 'text-destructive',
      bg: 'bg-destructive/20',
      border: 'border-destructive',
    },
  };

  const config = gestureConfig[activeGesture];
  const Icon = config.icon;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
      <div
        className={`flex items-center gap-3 px-6 py-3 rounded-full border ${config.bg} ${config.border} backdrop-blur-sm animate-pulse-glow`}
      >
        <Icon className={`w-6 h-6 ${config.color}`} />
        <span className={`font-display text-lg tracking-wider ${config.color}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

export default GestureIndicator;
