import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
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
  const velocity = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Open hand = move/rotate model
      if (gesture.isOpenHand) {
        velocity.current.x += gesture.rotation.x * 0.3;
        velocity.current.y += gesture.rotation.y * 0.3;
      }

      // Apply friction
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;

      targetRotation.current.x += velocity.current.x;
      targetRotation.current.y += velocity.current.y;

      // Zoom in: Index + Thumb open
      if (gesture.isZoomIn) {
        targetScale.current = Math.min(3, targetScale.current + 0.02);
      }

      // Zoom out: Only index finger
      if (gesture.isZoomOut) {
        targetScale.current = Math.max(0.3, targetScale.current - 0.02);
      }

      // Fist = reset
      if (gesture.isFist) {
        targetRotation.current = { x: 0, y: 0 };
        targetScale.current = 1;
        velocity.current = { x: 0, y: 0 };
      }

      // Smooth interpolation
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotation.current.x,
        0.08
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation.current.y,
        0.08
      );

      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale.current, 0.08)
      );

      // Gentle idle animation
      if (!gesture.palmPosition) {
        meshRef.current.rotation.y += delta * 0.15;
        meshRef.current.rotation.x += delta * 0.05;
      }
    }
  });

  const getGeometry = () => {
    switch (modelType) {
      case 'torus':
        return <torusKnotGeometry args={[1, 0.35, 200, 40]} />;
      case 'sphere':
        return <sphereGeometry args={[1.3, 128, 128]} />;
      case 'cube':
        return <boxGeometry args={[1.6, 1.6, 1.6]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1.3, 2]} />;
      default:
        return <torusKnotGeometry args={[1, 0.35, 200, 40]} />;
    }
  };

  const distortAmount = gesture.isZoomIn ? 0.5 : gesture.isZoomOut ? 0.3 : gesture.isOpenHand ? 0.25 : 0.15;

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <MeshDistortMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={gesture.isZoomIn ? 0.5 : gesture.isZoomOut ? 0.4 : 0.25}
          metalness={0.95}
          roughness={0.05}
          distort={distortAmount}
          speed={3}
        />
      </mesh>
    </Float>
  );
};

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 800;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 25;
      pos[i + 1] = (Math.random() - 0.5) * 25;
      pos[i + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.008;
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
        size={0.025}
        color="#00ffff"
        transparent
        opacity={0.5}
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
        <fog attach="fog" args={['#070a0f', 5, 25]} />
        
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#ff00ff" />
        <pointLight position={[0, -10, 5]} intensity={0.4} color="#00ff88" />
        <spotLight
          position={[0, 8, 0]}
          intensity={1}
          angle={0.4}
          penumbra={1}
          color="#00ffff"
        />

        <InteractiveModel gesture={gesture} modelType={modelType} />
        <ParticleField />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default Scene3D;
