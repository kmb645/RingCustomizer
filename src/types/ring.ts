// src/types/ring.ts
export interface RingMaterial {
  id: string;
  name: string;
  color: string; // e.g., "#C0C0C0" for silver, "#FFD700" for gold
  price: number;
}

export interface RingStone {
  id: string;
  name: string;
  imageUrl?: string; // URL to a stone image
  price: number;
}

export interface RingSize {
  value: number; // e.g., 5, 6, 7, 8, etc.
}

export interface CustomRing {
  material: RingMaterial;
  stone: RingStone;
  size: RingSize;
  // You can add more properties later (engraving, etc.)
}

// This will be our global state shape
export interface RingState {
  materials: RingMaterial[];
  stones: RingStone[];
  sizes: RingSize[];
  currentSelection: CustomRing;
}