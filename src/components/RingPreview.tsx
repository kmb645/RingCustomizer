import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

import { CustomRing } from '@/types/ring';
import RingModel from './RingModel';

interface RingPreviewProps {
  selection: CustomRing;
}

export default function RingPreview({ selection }: RingPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-100">
      {/* Optional header */}
      <h2 className="text-2xl font-semibold text-center py-4 bg-white shadow-md">3D Preview</h2>

      {/* Canvas fills the remaining space */}
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 45 }}
          shadows
          className="w-full h-full"
        >
          {/* <ambientLight intensity={0.5} /> */}
          {/* <directionalLight
            position={[10, 10, 5]}
            intensity={0.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          /> */}
          
          <RingModel selection={selection} />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={10}
          />
          
          <Environment preset="studio" />
        </Canvas>
      </div>
    </div>
  );
}
