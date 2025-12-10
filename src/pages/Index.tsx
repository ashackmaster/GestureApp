import { useState, useEffect } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import Scene3D from '@/components/Scene3D';
import Header from '@/components/Header';
import GestureIndicator from '@/components/GestureIndicator';
import MiniCameraOverlay from '@/components/MiniCameraOverlay';
import ModelSelector from '@/components/ModelSelector';

type ModelType = 'torus' | 'sphere' | 'cube' | 'icosahedron';

const Index = () => {
  const [modelType, setModelType] = useState<ModelType>('torus');
  const {
    videoRef,
    canvasRef,
    isTracking,
    gesture,
    startTracking,
  } = useHandTracking();

  // Auto-start tracking on mount
  useEffect(() => {
    startTracking();
  }, []);

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

      {/* Model Selector - minimal UI */}
      <ModelSelector modelType={modelType} onModelChange={setModelType} />

      {/* Mini Camera Overlay - small corner */}
      <MiniCameraOverlay
        videoRef={videoRef}
        canvasRef={canvasRef}
        isTracking={isTracking}
      />

      {/* Gesture Indicator */}
      <GestureIndicator gesture={gesture} isTracking={isTracking} />
    </div>
  );
};

export default Index;
