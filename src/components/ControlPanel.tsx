import { Button } from '@/components/ui/button';
import { Hand, Power, RotateCcw, Maximize2, Circle, Box, Triangle } from 'lucide-react';

interface ControlPanelProps {
  isTracking: boolean;
  isLoading: boolean;
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron';
  onStartTracking: () => void;
  onStopTracking: () => void;
  onModelChange: (type: 'torus' | 'sphere' | 'cube' | 'icosahedron') => void;
}

const ControlPanel = ({
  isTracking,
  isLoading,
  modelType,
  onStartTracking,
  onStopTracking,
  onModelChange,
}: ControlPanelProps) => {
  const models = [
    { type: 'torus' as const, icon: Circle, label: 'Torus' },
    { type: 'sphere' as const, icon: Circle, label: 'Sphere' },
    { type: 'cube' as const, icon: Box, label: 'Cube' },
    { type: 'icosahedron' as const, icon: Triangle, label: 'Icosa' },
  ];

  return (
    <div className="absolute top-6 right-6 z-20">
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Hand className="w-5 h-5 text-primary" />
          <span className="font-display text-sm tracking-wider">CONTROLS</span>
        </div>

        <Button
          variant={isTracking ? 'destructive' : 'default'}
          className={`w-full ${
            !isTracking
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 neon-border'
              : ''
          }`}
          onClick={isTracking ? onStopTracking : onStartTracking}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Initializing...
            </>
          ) : isTracking ? (
            <>
              <Power className="w-4 h-4 mr-2" />
              Stop Tracking
            </>
          ) : (
            <>
              <Hand className="w-4 h-4 mr-2" />
              Start Tracking
            </>
          )}
        </Button>

        <div className="border-t border-border/30 pt-4">
          <span className="text-xs text-muted-foreground mb-2 block">Select Model</span>
          <div className="grid grid-cols-2 gap-2">
            {models.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className={`${
                  modelType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/50 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onModelChange(type)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t border-border/30 pt-4 space-y-2">
          <span className="text-xs text-muted-foreground">Gesture Guide</span>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-3 h-3 text-secondary" />
              <span className="text-muted-foreground">Pinch to Zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <Hand className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Open Hand to Rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3 h-3 text-destructive" />
              <span className="text-muted-foreground">Fist to Reset</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
