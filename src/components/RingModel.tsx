'use client'

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CustomRing } from '@/types/ring';

interface RingModelProps {
  selection: CustomRing;
}

export default function RingModel({ selection }: RingModelProps) {
  const ringRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/model/jlcerda01.glb');

  const filteredScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.scale.set(1, 1, 1);

    // Center the model
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center);

    // Set DoubleSide for all meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            m.side = THREE.DoubleSide;
            m.needsUpdate = true;
          });
        } else if (mesh.material) {
          mesh.material.side = THREE.DoubleSide;
          mesh.material.needsUpdate = true;
        }
      }
    });
    
    return clone;
  }, [scene, selection]);

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={ringRef} scale={[0.05, 0.05, 0.05]}>
      <primitive object={filteredScene} />
    </group>
  );
}
