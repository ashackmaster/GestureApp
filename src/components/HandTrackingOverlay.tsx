import { RefObject } from 'react';
import { GestureState } from '@/hooks/useHandTracking';

interface HandTrackingOverlayProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isTracking: boolean;
  gesture: GestureState;
}

const HandTrackingOverlay = ({
  videoRef,
  canvasRef,
  isTracking,
  gesture,
}: HandTrackingOverlayProps) => {
  return (
    <div className="absolute bottom-6 left-6 z-20">
      <div className="glass-panel p-4 w-80">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isTracking ? 'bg-primary animate-pulse-glow' : 'bg-muted-foreground'
            }`}
          />
          <span className="font-display text-sm tracking-wider">
            {isTracking ? 'TRACKING ACTIVE' : 'TRACKING INACTIVE'}
          </span>
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-background/50">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          />
          {!isTracking && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <span className="text-muted-foreground text-sm">Camera Off</span>
            </div>
          )}
        </div>

        {isTracking && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Gesture</span>
              <span className="font-display text-xs text-primary">
                {gesture.isPinching
                  ? 'PINCH (Zoom)'
                  : gesture.isOpenHand
                  ? 'OPEN HAND (Rotate)'
                  : gesture.isFist
                  ? 'FIST (Reset)'
                  : 'NONE'}
              </span>
            </div>
            <div className="flex gap-2">
              <div
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  gesture.isPinching ? 'bg-secondary' : 'bg-muted'
                }`}
              />
              <div
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  gesture.isOpenHand ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  gesture.isFist ? 'bg-destructive' : 'bg-muted'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandTrackingOverlay;
