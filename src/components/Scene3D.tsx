import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { GestureState } from '@/hooks/useHandTracking';

interface ModelProps {
  gesture: GestureState;
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron';
}

const InteractiveModel = ({ gesture, modelType }: ModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);

  useEffect(() => {
    if (gesture.isOpenHand && !gesture.isPinching) {
      targetRotation.current.x += gesture.rotation.x * 0.5;
      targetRotation.current.y += gesture.rotation.y * 0.5;
    }

    if (gesture.isPinching) {
      const scale = Math.max(0.5, Math.min(2, 1 + (0.05 - gesture.pinchDistance) * 10));
      targetScale.current = scale;
    }

    if (gesture.isFist) {
      targetRotation.current = { x: 0, y: 0 };
      targetScale.current = 1;
    }
  }, [gesture]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotation.current.x,
        0.1
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation.current.y,
        0.1
      );

      // Smooth scaling
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale.current, 0.1)
      );

      // Idle animation when no gesture
      if (!gesture.palmPosition) {
        meshRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  const getGeometry = () => {
    switch (modelType) {
      case 'torus':
        return <torusKnotGeometry args={[1, 0.3, 128, 32]} />;
      case 'sphere':
        return <sphereGeometry args={[1.2, 64, 64]} />;
      case 'cube':
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1.2, 1]} />;
      default:
        return <torusKnotGeometry args={[1, 0.3, 128, 32]} />;
    }
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <MeshDistortMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          distort={gesture.isPinching ? 0.4 : 0.2}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 500;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00ffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

interface Scene3DProps {
  gesture: GestureState;
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron';
}

const Scene3D = ({ gesture, modelType }: Scene3DProps) => {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#070a0f']} />
        <fog attach="fog" args={['#070a0f', 5, 20]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        <spotLight
          position={[0, 5, 0]}
          intensity={0.8}
          angle={0.5}
          penumbra={1}
          color="#00ffff"
        />

        <InteractiveModel gesture={gesture} modelType={modelType} />
        <ParticleField />

        <Environment preset="night" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default Scene3D;
