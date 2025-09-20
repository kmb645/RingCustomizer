import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

import { CustomRing } from '@/types/ring';
import RingModel from './RingModel';

interface RingPreviewProps {
  selection: CustomRing;
}

export default function RingPreview({ selection }: RingPreviewProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">3D Preview</h2>
      <div className="aspect-square w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 45 }}
          shadows
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          
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