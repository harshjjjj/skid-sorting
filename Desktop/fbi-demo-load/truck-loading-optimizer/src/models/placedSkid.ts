/**
 * Models and types for the Placed Skid feature
 */

// Standard skid dimensions
export interface StandardSkid {
  id: string;
  label: string;
  length: number; // Length in inches
  width: number;  // Width in inches
  height?: number; // Height in inches (optional)
  weight?: number; // Weight in pounds (optional)
  color?: string;  // Display color
  isStackable?: boolean;
  isFragile?: boolean;
  sequenceNumber?: number;
}

// Predefined standard skid types with dimensions in inches
export const STANDARD_SKIDS: StandardSkid[] = [
  {
    id: 'std-1',
    label: 'Standard 48×40',
    length: 48,
    width: 40,
    color: '#4dabf7', // blue
    isStackable: true
  },
  {
    id: 'std-2',
    label: 'Square 42×42',
    length: 42,
    width: 42,
    color: '#51cf66', // green
    isStackable: true
  },
  {
    id: 'std-3',
    label: 'European 31×47',
    length: 31,
    width: 47,
    color: '#fcc419', // yellow
    isStackable: true
  },
  {
    id: 'std-4',
    label: 'Square 48×48',
    length: 48,
    width: 48,
    color: '#ff6b6b', // red
    isStackable: true
  },
  {
    id: 'std-5',
    label: 'Reversed 40×48',
    length: 40,
    width: 48,
    color: '#cc5de8', // purple
    isStackable: true
  },
  {
    id: 'std-6',
    label: 'Custom 48×42',
    length: 48,
    width: 42,
    color: '#ff922b', // orange
    isStackable: true
  }
];

// Interface for placed skids in the container
export interface PlacedSkid extends StandardSkid {
  x: number; // Position from left side in inches
  y: number; // Position from top in inches
  rotation: 0 | 90 | 180 | 270; // Rotation in degrees
  zIndex: number; // For stacking order when skids overlap
}

// Type for container dimensions
export interface ContainerDimensions {
  length: number; // Length in inches
  width: number;  // Width in inches
}

// Standard 53' x 9' trailer dimensions in inches
export const STANDARD_CONTAINER: ContainerDimensions = {
  length: 636, // 53 feet
  width: 108   // 9 feet
}; 