import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { GestureState } from '@/hooks/useHandTracking';

interface ModelProps {
  gesture: GestureState;
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron' | 'car' | 'chair';
}

const InteractiveModel = ({ gesture, modelType }: ModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);
  const isFrozen = useRef(false);

  useFrame(() => {
    if (!meshRef.current || !groupRef.current) return;

    // Fist = Freeze (toggle)
    if (gesture.isFist && !isFrozen.current) {
      isFrozen.current = true;
    }
    
    // Any other gesture unfreezes
    if (!gesture.isFist && (gesture.isOpenHand || gesture.isZoomIn || gesture.isZoomOut || gesture.isPeace || gesture.isReset)) {
      isFrozen.current = false;
    }

    // Reset gesture
    if (gesture.isReset) {
      targetRotation.current = { x: 0, y: 0 };
      targetPosition.current = { x: 0, y: 0 };
      targetScale.current = 1;
      isFrozen.current = false;
    }

    if (!isFrozen.current) {
      // Open hand = rotate model (direct, no momentum)
      if (gesture.isOpenHand) {
        targetRotation.current.x += gesture.rotation.x;
        targetRotation.current.y += gesture.rotation.y;
      }

      // Peace sign = move position
      if (gesture.isPeace) {
        targetPosition.current.x += gesture.position.x;
        targetPosition.current.y += gesture.position.y;
        // Clamp position
        targetPosition.current.x = Math.max(-3, Math.min(3, targetPosition.current.x));
        targetPosition.current.y = Math.max(-2, Math.min(2, targetPosition.current.y));
      }

      // Zoom in: Index + Thumb
      if (gesture.isZoomIn) {
        targetScale.current = Math.min(3, targetScale.current + 0.02);
      }

      // Zoom out: Only index finger
      if (gesture.isZoomOut) {
        targetScale.current = Math.max(0.3, targetScale.current - 0.02);
      }
    }

    // Apply transformations with smooth interpolation
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      0.15
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation.current.y,
      0.15
    );

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetPosition.current.x,
      0.15
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetPosition.current.y,
      0.15
    );

    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale.current, 0.1)
    );
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
      case 'car':
        return <capsuleGeometry args={[0.6, 1.8, 8, 32]} />;
      case 'chair':
        return <cylinderGeometry args={[0.8, 1.2, 1.5, 32]} />;
      default:
        return <torusKnotGeometry args={[1, 0.35, 200, 40]} />;
    }
  };

  const getColor = () => {
    switch (modelType) {
      case 'car': return '#ff4444';
      case 'chair': return '#8844ff';
      default: return '#00ffff';
    }
  };

  const distortAmount = gesture.isZoomIn ? 0.5 : gesture.isZoomOut ? 0.3 : gesture.isOpenHand ? 0.25 : isFrozen.current ? 0 : 0.15;

  return (
    <group ref={groupRef}>
      <Float speed={isFrozen.current ? 0 : 2} rotationIntensity={isFrozen.current ? 0 : 0.15} floatIntensity={isFrozen.current ? 0 : 0.4}>
        <mesh ref={meshRef}>
          {getGeometry()}
          <MeshDistortMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={isFrozen.current ? 0.1 : gesture.isZoomIn ? 0.5 : gesture.isZoomOut ? 0.4 : 0.25}
            metalness={0.95}
            roughness={0.05}
            distort={distortAmount}
            speed={isFrozen.current ? 0 : 3}
          />
        </mesh>
      </Float>
    </group>
  );
};

const GestureParticles = ({ gesture }: { gesture: GestureState }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 0.5;
      pos[i + 1] = (Math.random() - 0.5) * 0.5;
      pos[i + 2] = (Math.random() - 0.5) * 0.5;
      vel[i] = (Math.random() - 0.5) * 0.02;
      vel[i + 1] = (Math.random() - 0.5) * 0.02;
      vel[i + 2] = (Math.random() - 0.5) * 0.02;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    const isActive = gesture.isZoomIn || gesture.isZoomOut || gesture.isOpenHand || gesture.isPeace;
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      if (isActive) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Reset if too far
        const dist = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2);
        if (dist > 3) {
          positions[i] = (Math.random() - 0.5) * 0.5;
          positions[i + 1] = (Math.random() - 0.5) * 0.5;
          positions[i + 2] = (Math.random() - 0.5) * 0.5;
        }
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const getParticleColor = () => {
    if (gesture.isZoomIn) return '#00ff88';
    if (gesture.isZoomOut) return '#ff8800';
    if (gesture.isPeace) return '#ff44aa';
    if (gesture.isOpenHand) return '#00ffff';
    return '#00ffff';
  };

  const isVisible = gesture.isZoomIn || gesture.isZoomOut || gesture.isOpenHand || gesture.isPeace;

  if (!isVisible) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={getParticleColor()}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
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
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron' | 'car' | 'chair';
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
        <GestureParticles gesture={gesture} />
        <ParticleField />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default Scene3D;
