// src/data/sampleData.ts

import { RingState } from "@/types/ring";


export const initialRingState: RingState = {
  materials: [
    { id: 'silver', name: 'Sterling Silver', color: '#c0c0c0', price: 250 },
    { id: 'gold', name: '14K Yellow Gold', color: '#ffd700', price: 1000 },
    { id: 'rose-gold', name: '14K Rose Gold', color: '#e7c8b5', price: 1050 },
    { id: 'platinum', name: 'Platinum', color: '#e5e4e2', price: 1500 },
  ],
  stones: [
    { id: 'diamond', name: 'Diamond', price: 500 },
    { id: 'sapphire', name: 'Blue Sapphire', price: 300 },
    { id: 'ruby', name: 'Ruby', price: 350 },
    { id: 'none', name: 'No Stone', price: 0 },
  ],
  sizes: [
    { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 },
    { value: 8 }, { value: 9 }, { value: 10 }, { value: 11 },
  ],
  currentSelection: {
    material: { id: 'silver', name: 'Sterling Silver', color: '#c0c0c0', price: 250 }, // Default material
    stone: { id: 'none', name: 'No Stone', price: 0 }, // Default stone
    size: { value: 7 }, // Default size
  }
};