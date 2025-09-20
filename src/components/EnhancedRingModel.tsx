import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, CylinderGeometry, MeshStandardMaterial, TorusGeometry, SphereGeometry } from 'three';
import { CustomRing } from '@/types/ring';

interface EnhancedRingModelProps {
  selection: CustomRing;
}

export default function EnhancedRingModel({ selection }: EnhancedRingModelProps) {
  const ringRef = useRef<Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Ring Band - More detailed torus */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1, 0.12, 16, 64]} />
        <meshStandardMaterial
          color={selection.material.color}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>

      {/* Inner surface of the ring */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[0.88, 0.1, 16, 64]} />
        <meshStandardMaterial
          color={selection.material.color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Stone Setting */}
      {selection.stone.id !== 'none' && (
        <group position={[0, 1.1, 0]}>
          {/* Prong Setting */}
          <mesh rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.08, 6]} />
            <meshStandardMaterial
              color={selection.material.color}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* The Gem Stone - More faceted appearance */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.12, 8]} />
            <meshStandardMaterial
              color={getStoneColor(selection.stone.name)}
              transparent
              opacity={0.95}
              roughness={0.05}
              metalness={0.2}
              envMapIntensity={2}
            />
          </mesh>

          {/* Stone Table (top facet) */}
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.2, 0.02, 8]} />
            <meshStandardMaterial
              color={getStoneColor(selection.stone.name)}
              transparent
              opacity={0.9}
              roughness={0.02}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function getStoneColor(stoneName: string): string {
  const colors: { [key: string]: string } = {
    'Diamond': '#FFFFFF',
    'Blue Sapphire': '#0F52BA',
    'Ruby': '#E0115F',
    'Emerald': '#50C878',
    'Amethyst': '#9966CC',
    'Sapphire': '#0F52BA',
    'Topaz': '#FFC87C',
  };
  return colors[stoneName] || '#CCCCCC';
}