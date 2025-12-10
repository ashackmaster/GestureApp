import { useState } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import Scene3D from '@/components/Scene3D';
import HandTrackingOverlay from '@/components/HandTrackingOverlay';
import ControlPanel from '@/components/ControlPanel';
import Header from '@/components/Header';
import GestureIndicator from '@/components/GestureIndicator';

type ModelType = 'torus' | 'sphere' | 'cube' | 'icosahedron';

const Index = () => {
  const [modelType, setModelType] = useState<ModelType>('torus');
  const {
    videoRef,
    canvasRef,
    isTracking,
    isLoading,
    gesture,
    startTracking,
    stopTracking,
  } = useHandTracking();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card opacity-50" />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      {/* 3D Scene */}
      <Scene3D gesture={gesture} modelType={modelType} />

      {/* Header */}
      <Header />

      {/* Control Panel */}
      <ControlPanel
        isTracking={isTracking}
        isLoading={isLoading}
        modelType={modelType}
        onStartTracking={startTracking}
        onStopTracking={stopTracking}
        onModelChange={setModelType}
      />

      {/* Hand Tracking Overlay */}
      <HandTrackingOverlay
        videoRef={videoRef}
        canvasRef={canvasRef}
        isTracking={isTracking}
        gesture={gesture}
      />

      {/* Gesture Indicator */}
      <GestureIndicator gesture={gesture} isTracking={isTracking} />

      {/* Instructions */}
      {!isTracking && (
        <div className="absolute bottom-6 right-6 z-20 max-w-xs">
          <div className="glass-panel p-4 text-sm">
            <p className="text-muted-foreground">
              Click <span className="text-primary font-semibold">Start Tracking</span> to enable hand gesture controls. 
              Use your hand movements to interact with the 3D model.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
