import { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Mesh, CylinderGeometry, MeshStandardMaterial, TorusGeometry } from 'three';
import { CustomRing } from '@/types/ring';
import * as THREE from 'three';

// Custom shader for the metal band
const metalVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const metalFragmentShader = `
  uniform vec3 color;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Base color with slight variation
    vec3 baseColor = color;
    
    // Create micro-scratches and imperfections
    float scratches = 0.0;
    scratches += sin(vPosition.x * 200.0 + time * 0.5) * 0.02;
    scratches += sin(vPosition.y * 180.0 + time * 0.3) * 0.02;
    scratches += sin(vPosition.z * 220.0 + time * 0.7) * 0.02;
    
    // Add some grain/noise for realistic metal surface
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.05;
    
    // Fresnel effect for edges
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    
    // Combine all effects
    vec3 finalColor = baseColor + scratches + noise + fresnel * 0.2;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Custom shader for gemstones
const gemVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gemFragmentShader = `
  uniform vec3 color;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Simple noise function for internal gem structure
  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    // Base color
    vec3 baseColor = color;
    
    // Create internal reflections and facets
    float facetPattern = sin(vPosition.x * 30.0) * sin(vPosition.y * 30.0) * sin(vPosition.z * 30.0);
    facetPattern = abs(facetPattern);
    
    // Add some sparkle with time-varying highlights
    float sparkle = sin(time * 2.0 + vPosition.x * 100.0) * 
                   cos(time * 1.5 + vPosition.y * 90.0) * 
                   sin(time * 2.5 + vPosition.z * 110.0);
    sparkle = max(0.0, sparkle) * 0.3;
    
    // Fresnel effect for edges
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 4.0);
    
    // Combine effects
    vec3 finalColor = mix(baseColor, vec3(1.0), facetPattern * 0.3 + sparkle + fresnel * 0.5);
    
    gl_FragColor = vec4(finalColor, 0.9);
  }
`;

// Custom shader material for the metal
class MetalMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color(0xcccccc) },
        time: { value: 0 }
      },
      vertexShader: metalVertexShader,
      fragmentShader: metalFragmentShader
    });
  }
}

// Custom shader material for gems
class GemMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        time: { value: 0 }
      },
      vertexShader: gemVertexShader,
      fragmentShader: gemFragmentShader,
      transparent: true
    });
  }
}

// Extend Three.js with our custom materials
extend({ MetalMaterial, GemMaterial });

interface RingModelProps {
  selection: CustomRing;
}

export default function RingModel({ selection }: RingModelProps) {
  const ringRef = useRef<Mesh>(null);
  const stoneRef = useRef<Mesh>(null);
  const metalMaterialRef = useRef<MetalMaterial>(null);
  const gemMaterialRef = useRef<GemMaterial>(null);

  // Update shader uniforms each frame
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
    if (stoneRef.current) {
      stoneRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
    if (metalMaterialRef.current) {
      metalMaterialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
    if (gemMaterialRef.current) {
      gemMaterialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* Main Ring Band - using a more detailed geometry */}
      <mesh ref={ringRef} castShadow receiveShadow>
        <torusGeometry args={[1, 0.15, 32, 64]} />
        <metalMaterial 
          ref={metalMaterialRef}
          uniforms-color-value={new THREE.Color(selection.material.color)}
        />
      </mesh>

      {/* Stone Setting (only if a stone is selected) */}
      {selection.stone.id !== 'none' && (
        <group>
          {/* Stone Setting Base with prongs */}
          <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
            <metalMaterial 
              uniforms-color-value={new THREE.Color(selection.material.color)}
            />
          </mesh>

          {/* Prongs for the stone setting */}
          {[...Array(4)].map((_, i) => (
            <mesh
              key={i}
              position={[
                0.2 * Math.cos((i * Math.PI) / 2),
                1.2,
                0.2 * Math.sin((i * Math.PI) / 2)
              ]}
              rotation={[0, (i * Math.PI) / 2, 0]}
              castShadow
            >
              <coneGeometry args={[0.03, 0.1, 8]} />
              <metalMaterial 
                uniforms-color-value={new THREE.Color(selection.material.color)}
              />
            </mesh>
          ))}

          {/* The Gem Stone with more facets */}
          <mesh
            ref={stoneRef}
            position={[0, 1.2, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.18, 0.18, 0.15, 32]} />
            <gemMaterial 
              ref={gemMaterialRef}
              uniforms-color-value={new THREE.Color(getStoneColor(selection.stone.name))}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Helper function to get stone colors
function getStoneColor(stoneName: string): string {
  const colors: { [key: string]: string } = {
    'Diamond': '#FFFFFF',
    'Blue Sapphire': '#0F52BA',
    'Ruby': '#E0115F',
    'Emerald': '#50C878',
    'Amethyst': '#9966CC',
  };
  return colors[stoneName] || '#CCCCCC';
}