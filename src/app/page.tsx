// app/page.tsx
'use client'; // This is required because we are using useState (a client-side feature)

import { useState } from 'react';
import { initialRingState } from '@/data/sampleData';
import { RingState } from '@/types/ring';
// import RingMaterialSelector from '@/components/RingMaterialSelector';
import RingPreview from '@/components/RingPreview';
// import RingMaterialSelector from '@/components/RingMaterialSelector';
// import RingStoneSelector from '@/components/RingStoneSelector';
// import RingSizeSelector from '@/components/RingSizeSelector';
// import RingPreview from '@/components/RingPreview';
// import PriceSummary from '@/components/PriceSummary';

export default function Home() {
  // Initialize our state with the sample data
  const [ringState] = useState<RingState>(initialRingState);

  // Helper function to update the current selection
  // const updateSelection = (newSelection: Partial<CustomRing>) => {
  //   setRingState(prevState => ({
  //     ...prevState,
  //     currentSelection: {
  //       ...prevState.currentSelection,
  //       ...newSelection,
  //     }
  //   }));
  // };
// TODO: I need RingPreview will be full screen
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Ring Customizer</h1>
        <p className="text-center text-gray-600 mb-10">Design your perfect ring.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Right Column - Preview and Summary */}
          <div className="space-y-8">
            <RingPreview selection={ringState.currentSelection} />
            {/* <PriceSummary selection={ringState.currentSelection} /> */}
          </div>
        </div>
      </div>
    </main>
  );
}