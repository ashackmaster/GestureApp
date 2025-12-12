import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GestureState } from '@/hooks/useHandTracking';

interface ModelProps {
  gesture: GestureState;
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron' | 'car' | 'chair' | 'solar';
}

// Solar System Component
const SolarSystem = ({ gesture }: { gesture: GestureState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);
  const isFrozen = useRef(false);

  const planets = useMemo(() => [
    { name: 'Mercury', distance: 1.5, size: 0.08, color: '#b5b5b5', speed: 4.15 },
    { name: 'Venus', distance: 2.0, size: 0.12, color: '#e6c87a', speed: 1.62 },
    { name: 'Earth', distance: 2.6, size: 0.13, color: '#4a90d9', speed: 1 },
    { name: 'Mars', distance: 3.2, size: 0.09, color: '#d4573b', speed: 0.53 },
    { name: 'Jupiter', distance: 4.2, size: 0.35, color: '#d4a574', speed: 0.08 },
    { name: 'Saturn', distance: 5.4, size: 0.3, color: '#e6d9a8', speed: 0.03, hasRing: true },
    { name: 'Uranus', distance: 6.4, size: 0.2, color: '#a8e6e6', speed: 0.01 },
    { name: 'Neptune', distance: 7.2, size: 0.19, color: '#4a7bd4', speed: 0.006 },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Gesture controls
    if (gesture.isFist && !isFrozen.current) {
      isFrozen.current = true;
    }
    if (!gesture.isFist && (gesture.isOpenHand || gesture.isZoomIn || gesture.isZoomOut || gesture.isPeace || gesture.isReset)) {
      isFrozen.current = false;
    }

    if (gesture.isReset) {
      targetRotation.current = { x: 0, y: 0 };
      targetPosition.current = { x: 0, y: 0 };
      targetScale.current = 1;
      isFrozen.current = false;
    }

    if (!isFrozen.current) {
      if (gesture.isOpenHand) {
        targetRotation.current.x += gesture.rotation.x;
        targetRotation.current.y += gesture.rotation.y;
      }
      if (gesture.isPeace) {
        targetPosition.current.x += gesture.position.x;
        targetPosition.current.y += gesture.position.y;
        targetPosition.current.x = Math.max(-3, Math.min(3, targetPosition.current.x));
        targetPosition.current.y = Math.max(-2, Math.min(2, targetPosition.current.y));
      }
      if (gesture.isZoomIn) {
        targetScale.current = Math.min(3, targetScale.current + 0.02);
      }
      if (gesture.isZoomOut) {
        targetScale.current = Math.max(0.3, targetScale.current - 0.02);
      }
    }

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x + 0.3, 0.15);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.15);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosition.current.x, 0.15);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosition.current.y, 0.15);
    
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale.current, 0.1);
    groupRef.current.scale.setScalar(newScale);
  });

  return (
    <group ref={groupRef} scale={0.4}>
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff8800"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffcc00" distance={20} />

      {/* Planets */}
      {planets.map((planet, index) => (
        <Planet key={planet.name} {...planet} />
      ))}
    </group>
  );
};

const Planet = ({ 
  distance, 
  size, 
  color, 
  speed, 
  hasRing 
}: { 
  name: string;
  distance: number; 
  size: number; 
  color: string; 
  speed: number; 
  hasRing?: boolean;
}) => {
  const planetRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (planetRef.current) {
      const angle = state.clock.elapsedTime * speed;
      planetRef.current.position.x = Math.cos(angle) * distance;
      planetRef.current.position.z = Math.sin(angle) * distance;
      planetRef.current.rotation.y += 0.02;
    }
  });

  return (
    <>
      {/* Orbit line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.01, distance + 0.01, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Planet */}
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Saturn's ring */}
        {hasRing && (
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[size * 1.4, size * 2, 64]} />
            <meshBasicMaterial color="#d4c4a8" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </>
  );
};

// Realistic Car Component
const CarModel = ({ gesture }: { gesture: GestureState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);
  const isFrozen = useRef(false);

  useFrame(() => {
    if (!groupRef.current) return;

    if (gesture.isFist && !isFrozen.current) isFrozen.current = true;
    if (!gesture.isFist && (gesture.isOpenHand || gesture.isZoomIn || gesture.isZoomOut || gesture.isPeace || gesture.isReset)) {
      isFrozen.current = false;
    }

    if (gesture.isReset) {
      targetRotation.current = { x: 0, y: 0 };
      targetPosition.current = { x: 0, y: 0 };
      targetScale.current = 1;
      isFrozen.current = false;
    }

    if (!isFrozen.current) {
      if (gesture.isOpenHand) {
        targetRotation.current.x += gesture.rotation.x;
        targetRotation.current.y += gesture.rotation.y;
      }
      if (gesture.isPeace) {
        targetPosition.current.x += gesture.position.x;
        targetPosition.current.y += gesture.position.y;
        targetPosition.current.x = Math.max(-3, Math.min(3, targetPosition.current.x));
        targetPosition.current.y = Math.max(-2, Math.min(2, targetPosition.current.y));
      }
      if (gesture.isZoomIn) targetScale.current = Math.min(3, targetScale.current + 0.02);
      if (gesture.isZoomOut) targetScale.current = Math.max(0.3, targetScale.current - 0.02);
    }

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.15);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.15);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosition.current.x, 0.15);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosition.current.y, 0.15);
    
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale.current, 0.1);
    groupRef.current.scale.setScalar(newScale);
  });

  return (
    <group ref={groupRef}>
      <Float speed={isFrozen.current ? 0 : 1} rotationIntensity={0} floatIntensity={isFrozen.current ? 0 : 0.2}>
        <group>
          {/* Car Body */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[2.4, 0.5, 1.1]} />
            <meshStandardMaterial color="#cc0000" metalness={0.9} roughness={0.1} />
          </mesh>
          
          {/* Car Cabin */}
          <mesh position={[0.1, 0.85, 0]}>
            <boxGeometry args={[1.2, 0.5, 0.95]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.1} />
          </mesh>
          
          {/* Windshield */}
          <mesh position={[-0.4, 0.85, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.4, 0.45, 0.9]} />
            <meshStandardMaterial color="#87ceeb" metalness={0.1} roughness={0} transparent opacity={0.5} />
          </mesh>
          
          {/* Rear window */}
          <mesh position={[0.6, 0.85, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.3, 0.45, 0.9]} />
            <meshStandardMaterial color="#87ceeb" metalness={0.1} roughness={0} transparent opacity={0.5} />
          </mesh>
          
          {/* Wheels */}
          {[[-0.7, 0.15, 0.55], [-0.7, 0.15, -0.55], [0.7, 0.15, 0.55], [0.7, 0.15, -0.55]].map((pos, i) => (
            <group key={i} position={pos as [number, number, number]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.16, 16]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          ))}
          
          {/* Headlights */}
          <mesh position={[-1.2, 0.4, 0.35]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
          </mesh>
          <mesh position={[-1.2, 0.4, -0.35]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
          </mesh>
          
          {/* Taillights */}
          <mesh position={[1.2, 0.4, 0.35]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[1.2, 0.4, -0.35]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

// Realistic Chair Component
const ChairModel = ({ gesture }: { gesture: GestureState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);
  const isFrozen = useRef(false);

  useFrame(() => {
    if (!groupRef.current) return;

    if (gesture.isFist && !isFrozen.current) isFrozen.current = true;
    if (!gesture.isFist && (gesture.isOpenHand || gesture.isZoomIn || gesture.isZoomOut || gesture.isPeace || gesture.isReset)) {
      isFrozen.current = false;
    }

    if (gesture.isReset) {
      targetRotation.current = { x: 0, y: 0 };
      targetPosition.current = { x: 0, y: 0 };
      targetScale.current = 1;
      isFrozen.current = false;
    }

    if (!isFrozen.current) {
      if (gesture.isOpenHand) {
        targetRotation.current.x += gesture.rotation.x;
        targetRotation.current.y += gesture.rotation.y;
      }
      if (gesture.isPeace) {
        targetPosition.current.x += gesture.position.x;
        targetPosition.current.y += gesture.position.y;
        targetPosition.current.x = Math.max(-3, Math.min(3, targetPosition.current.x));
        targetPosition.current.y = Math.max(-2, Math.min(2, targetPosition.current.y));
      }
      if (gesture.isZoomIn) targetScale.current = Math.min(3, targetScale.current + 0.02);
      if (gesture.isZoomOut) targetScale.current = Math.max(0.3, targetScale.current - 0.02);
    }

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.15);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.15);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosition.current.x, 0.15);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosition.current.y, 0.15);
    
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale.current, 0.1);
    groupRef.current.scale.setScalar(newScale);
  });

  const woodColor = '#8b4513';
  const cushionColor = '#4a0000';

  return (
    <group ref={groupRef}>
      <Float speed={isFrozen.current ? 0 : 1} rotationIntensity={0} floatIntensity={isFrozen.current ? 0 : 0.2}>
        <group>
          {/* Seat */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.12, 1.2]} />
            <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.8} />
          </mesh>
          
          {/* Seat Cushion */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.1, 0.15, 1.1]} />
            <meshStandardMaterial color={cushionColor} metalness={0.1} roughness={0.9} />
          </mesh>
          
          {/* Backrest */}
          <mesh position={[0, 0.7, -0.5]}>
            <boxGeometry args={[1.2, 1.2, 0.1]} />
            <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.8} />
          </mesh>
          
          {/* Backrest Cushion */}
          <mesh position={[0, 0.7, -0.42]}>
            <boxGeometry args={[1.0, 1.0, 0.1]} />
            <meshStandardMaterial color={cushionColor} metalness={0.1} roughness={0.9} />
          </mesh>
          
          {/* Legs */}
          {[[-0.5, -0.45, 0.5], [0.5, -0.45, 0.5], [-0.5, -0.45, -0.5], [0.5, -0.45, -0.5]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.05, 0.05, 0.8, 16]} />
              <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.8} />
            </mesh>
          ))}
          
          {/* Armrests */}
          <mesh position={[-0.55, 0.25, 0]}>
            <boxGeometry args={[0.1, 0.08, 0.8]} />
            <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.8} />
          </mesh>
          <mesh position={[0.55, 0.25, 0]}>
            <boxGeometry args={[0.1, 0.08, 0.8]} />
            <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.8} />
          </mesh>
          
          {/* Armrest supports */}
          <mesh position={[-0.55, 0.12, 0.3]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
            <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.8} />
          </mesh>
          <mesh position={[0.55, 0.12, 0.3]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
            <meshStandardMaterial color={woodColor} metalness={0.2} roughness={0.8} />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

const InteractiveModel = ({ gesture, modelType }: ModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);
  const isFrozen = useRef(false);

  useFrame(() => {
    if (!meshRef.current || !groupRef.current) return;

    if (gesture.isFist && !isFrozen.current) {
      isFrozen.current = true;
    }
    
    if (!gesture.isFist && (gesture.isOpenHand || gesture.isZoomIn || gesture.isZoomOut || gesture.isPeace || gesture.isReset)) {
      isFrozen.current = false;
    }

    if (gesture.isReset) {
      targetRotation.current = { x: 0, y: 0 };
      targetPosition.current = { x: 0, y: 0 };
      targetScale.current = 1;
      isFrozen.current = false;
    }

    if (!isFrozen.current) {
      if (gesture.isOpenHand) {
        targetRotation.current.x += gesture.rotation.x;
        targetRotation.current.y += gesture.rotation.y;
      }

      if (gesture.isPeace) {
        targetPosition.current.x += gesture.position.x;
        targetPosition.current.y += gesture.position.y;
        targetPosition.current.x = Math.max(-3, Math.min(3, targetPosition.current.x));
        targetPosition.current.y = Math.max(-2, Math.min(2, targetPosition.current.y));
      }

      if (gesture.isZoomIn) {
        targetScale.current = Math.min(3, targetScale.current + 0.02);
      }

      if (gesture.isZoomOut) {
        targetScale.current = Math.max(0.3, targetScale.current - 0.02);
      }
    }

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.current.x, 0.15);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.current.y, 0.15);

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosition.current.x, 0.15);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosition.current.y, 0.15);

    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale.current, 0.1));
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

  const distortAmount = gesture.isZoomIn ? 0.5 : gesture.isZoomOut ? 0.3 : gesture.isOpenHand ? 0.25 : isFrozen.current ? 0 : 0.15;

  return (
    <group ref={groupRef}>
      <Float speed={isFrozen.current ? 0 : 2} rotationIntensity={isFrozen.current ? 0 : 0.15} floatIntensity={isFrozen.current ? 0 : 0.4}>
        <mesh ref={meshRef}>
          {getGeometry()}
          <MeshDistortMaterial
            color="#00ffff"
            emissive="#00ffff"
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
  modelType: 'torus' | 'sphere' | 'cube' | 'icosahedron' | 'car' | 'chair' | 'solar';
}

const Scene3D = ({ gesture, modelType }: Scene3DProps) => {
  const renderModel = () => {
    switch (modelType) {
      case 'car':
        return <CarModel gesture={gesture} />;
      case 'chair':
        return <ChairModel gesture={gesture} />;
      case 'solar':
        return <SolarSystem gesture={gesture} />;
      default:
        return <InteractiveModel gesture={gesture} modelType={modelType} />;
    }
  };

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, modelType === 'solar' ? 8 : 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#070a0f']} />
        <fog attach="fog" args={['#070a0f', 5, 30]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#ff00ff" />
        <pointLight position={[0, -10, 5]} intensity={0.4} color="#00ff88" />
        <spotLight
          position={[0, 8, 0]}
          intensity={1}
          angle={0.4}
          penumbra={1}
          color="#ffffff"
        />

        {renderModel()}
        <ParticleField />
        
        {modelType === 'solar' && <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}

        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default Scene3D;
