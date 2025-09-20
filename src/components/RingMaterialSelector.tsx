import { RingMaterial } from '@/types/ring';

interface RingMaterialSelectorProps {
  materials: RingMaterial[];
  selectedMaterial: RingMaterial;
  onSelect: (material: RingMaterial) => void;
}

export default function RingMaterialSelector({ materials, selectedMaterial, onSelect }: RingMaterialSelectorProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Choose Material</h2>
      <div className="grid grid-cols-2 gap-4">
        {materials.map((material) => (
          <button
            key={material.id}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              selectedMaterial.id === material.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => onSelect(material)}
          >
            <div
              className="w-8 h-8 rounded-full mx-auto mb-2"
              style={{ backgroundColor: material.color }}
            ></div>
            <div className="font-medium">{material.name}</div>
            <div className="text-sm text-gray-600">${material.price}</div>
          </button>
        ))}
      </div>
    </div>
  );
}