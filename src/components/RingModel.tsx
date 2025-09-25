'use client'

import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CustomRing } from '@/types/ring';

// ====================== SHADERS ======================
const metalVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const metalFragmentShader = `
  uniform vec3 color;
  uniform float time;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  vec3 sampleEnvironment(vec3 reflectDir) {
    float horizon = smoothstep(-0.2, 0.5, reflectDir.y);
    vec3 skyColor = mix(vec3(0.3, 0.5, 0.7), vec3(0.8, 0.8, 0.9), horizon);
    vec3 groundColor = vec3(0.2, 0.2, 0.3);
    float spec = smoothstep(0.97, 1.0, dot(normalize(reflectDir), normalize(vec3(0.0, 1.0, 0.0))));
    vec3 highlight = vec3(1.2) * spec * 0.8;
    return mix(groundColor, skyColor, smoothstep(-0.1, 0.3, reflectDir.y)) + highlight;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(0.0, 1.0, 0.0));

    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 reflection = sampleEnvironment(reflectDir);

    float diff = max(dot(normal, lightDir), 0.0);
    diff = pow(diff, 0.8);

    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);
    spec = pow(spec, 0.6) * 1.8;

    float rim = 1.0 - max(dot(normal, viewDir), 0.0);
    rim = pow(rim, 2.0) * 0.8;

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    vec3 reflectionColor = reflection * (fresnel * 0.6 + 0.15);

    vec3 ambient = vec3(0.12);
    vec3 diffuseComponent = color * (diff * 1.1 + ambient);
    vec3 specularComponent = vec3(1.5) * spec * 1.8;
    vec3 rimComponent = vec3(0.8) * rim * 0.6;
    vec3 reflectionComponent = reflectionColor * 0.9;

    vec3 finalColor = diffuseComponent + specularComponent + rimComponent + reflectionComponent;
    float noise = fract(sin(dot(vWorldPosition.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.06;
    finalColor += noise;
    finalColor = pow(finalColor, vec3(0.95));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const gemVertexShader = metalVertexShader;

const gemFragmentShader = `
  uniform vec3 color;
  uniform float time;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  float generateSparkle(vec3 position, float frequency, float speed) {
    return sin(time * speed + position.x * frequency) *
           cos(time * speed * 1.3 + position.y * frequency * 0.8) *
           sin(time * speed * 0.7 + position.z * frequency * 1.2);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(0.0, 1.0, 0.0));

    float diff = max(dot(normal, lightDir), 0.0);
    diff = pow(diff, 0.7) * 1.2;

    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 24.0);
    spec = pow(spec, 0.5) * 2.5;

    float rim = 1.0 - max(dot(normal, viewDir), 0.0);
    rim = pow(rim, 1.5) * 1.2;

    vec3 baseColor = color * (diff * 1.2 + 0.25);

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
    vec3 reflection = mix(vec3(0.4), vec3(0.8), fresnel) * 1.0;

    vec3 finalColor = baseColor + spec * vec3(1.5) + rim * color * 0.6 + reflection;

    float sparkle1 = generateSparkle(vWorldPosition, 60.0, 2.0);
    float sparkle2 = generateSparkle(vWorldPosition, 90.0, 3.0);
    sparkle1 = max(0.0, sparkle1) * 0.25;
    sparkle2 = max(0.0, sparkle2) * 0.2;
    finalColor += vec3(1.5) * (sparkle1 + sparkle2);

    finalColor = pow(finalColor, vec3(0.9));

    gl_FragColor = vec4(finalColor, 0.85);
  }
`;

// ====================== MATERIALS ======================
class MetalMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color(0xcccccc) },
        time: { value: 0 },
      },
      vertexShader: metalVertexShader,
      fragmentShader: metalFragmentShader,
    });
  }
}

class GemMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        time: { value: 0 },
      },
      vertexShader: gemVertexShader,
      fragmentShader: gemFragmentShader,
      transparent: true,
    });
  }
}

extend({ MetalMaterial, GemMaterial });

// ====================== COMPONENT ======================
interface RingModelProps {
  selection: CustomRing;
}

export default function RingModel({ selection }: RingModelProps) {
  const metalMaterialRef = useRef<MetalMaterial>(null);
  const gemMaterialRef = useRef<GemMaterial>(null);
  const ringRef = useRef<THREE.Group>(null);
  
  // const { scene } = useGLTF('/model/ring_gold_with_diamond/scene.gltf');
  const { scene } = useGLTF('/model/jlcerda01.glb');

  const filteredScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.scale.set(1, 1, 1);
  
    // ✅ Center the model
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center); // shift model so center = (0,0,0)
  
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
  
        if (mesh.name.toLowerCase().includes('metal')) {
          const material = new MetalMaterial();
          material.uniforms.color.value = new THREE.Color(selection.material.color);
          mesh.material = material;
        }
  
        if (mesh.name.toLowerCase().includes('stone')) {
          const material = new GemMaterial();
          material.uniforms.color.value = new THREE.Color(getStoneColor(selection.stone.name));
          mesh.material = material;
        }
      }
    });
  
    return clone;
  }, [scene, selection]);
  

  // Animate time + rotation
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (metalMaterialRef.current) metalMaterialRef.current.uniforms.time.value = time;
    if (gemMaterialRef.current) gemMaterialRef.current.uniforms.time.value = time;

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.05; // rotate X-axis
      // ringRef.current.rotation.z += delta * 0.01; // optional: slow Y-axis rotation
    }
  });

  return (
    <group ref={ringRef} scale={[0.05, 0.05, 0.05]}>
      <primitive object={filteredScene} />
    </group>
  );
}

// ====================== HELPER ======================
function getStoneColor(stoneName: string): string {
  const colors: { [key: string]: string } = {
    Diamond: '#FFFFFF',
    'Blue Sapphire': '#0F52BA',
    Ruby: '#E0115F',
    Emerald: '#50C878',
    Amethyst: '#9966CC',
  };
  return colors[stoneName] || '#CCCCCC';
}
