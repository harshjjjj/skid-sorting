// Define units of measurement
export type UnitSystem = 'metric' | 'imperial';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface TruckDimensions extends Dimensions {
  maxWeight: number;
  insideWidth?: number;
  insideHeight?: number;
  insideLength?: number;
  frameWidth?: number;
  cubicCapacity?: number;
}

export interface Skid {
  id: string;
  label: string;
  width: number;
  length: number;
  height: number;
  weight: number;
  priority: number; // 1 for high, 2 for medium, 3 for low
  isStackable: boolean;
  isFragile: boolean;
  position?: Position; // Set by the optimization algorithm
  maxWeightOnTop?: number;
  description?: string;
  specialHandling?: string;
}

export interface Position {
  x: number; // Position from left side of truck
  y: number; // Position from floor of truck
  z: number; // Position from front of truck
  rotation?: number; // 0 or 90 degrees rotation around Y axis
}

export interface LoadingPlan {
  truckDimensions: TruckDimensions;
  loadedSkids: Skid[];
  unloadedSkids: Skid[];
  spaceUtilization: number; // Percentage of total space used
  totalWeight: number;
  weightDistribution: {
    front: number; // Percentage of weight in front section
    middle: number; // Percentage of weight in middle section
    back: number; // Percentage of weight in back section
    left: number; // Percentage of weight on left side
    right: number; // Percentage of weight on right side
  };
}

export interface LoadingStep {
  skidId: string;
  position: Position;
  instruction: string;
}

export interface LoadingSequence {
  steps: LoadingStep[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  description?: string;
  truckDimensions: TruckDimensions;
  skids: Skid[];
  createdAt: Date;
  lastModified: Date;
} 