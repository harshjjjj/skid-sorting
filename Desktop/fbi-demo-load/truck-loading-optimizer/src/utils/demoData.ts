import { v4 as uuidv4 } from 'uuid';
import { Skid } from '../models/types';

/**
 * Generates a random set of skids for demonstration purposes
 * @param count Number of skids to generate
 * @returns Array of randomly generated skids
 */
export const generateDemoSkids = (count: number = 6): Skid[] => {
  const demoSkids: Skid[] = [];
  
  // Common box sizes for demonstration
  const standardSizes = [
    { width: 1.2, length: 0.8, height: 1.0 },   // Euro pallet + typical load
    { width: 1.0, length: 1.2, height: 1.5 },   // Industrial pallet + tall load
    { width: 0.7, length: 0.9, height: 0.8 },   // Small box
    { width: 1.5, length: 1.2, height: 0.6 },   // Wide flat load
    { width: 0.6, length: 0.6, height: 1.2 },   // Tall narrow load
    { width: 1.0, length: 1.0, height: 1.0 },   // Cube-shaped load
  ];
  
  for (let i = 0; i < count; i++) {
    // Use modulo to cycle through standard sizes if more skids than sizes
    const sizeIndex = i % standardSizes.length;
    const size = standardSizes[sizeIndex];
    
    // Generate random weight between 100kg and 500kg
    const weight = Math.floor(Math.random() * 400) + 100;
    
    // Generate random priority (1-3)
    const priority = Math.floor(Math.random() * 3) + 1;
    
    // 20% chance of being fragile
    const isFragile = Math.random() < 0.2;
    
    // 70% chance of being stackable
    const isStackable = Math.random() < 0.7;
    
    // Generate max weight it can support if stackable
    const maxWeightOnTop = isStackable ? Math.floor(weight * 0.8) : 0;
    
    const skid: Skid = {
      id: uuidv4(),
      label: `Skid ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      width: size.width,
      length: size.length,
      height: size.height,
      weight,
      priority,
      isStackable,
      maxWeightOnTop,
      isFragile,
      description: `Demo skid ${i + 1}`,
    };
    
    demoSkids.push(skid);
  }
  
  return demoSkids;
};

/**
 * Returns a predefined set of skids for consistent demos
 * @returns Array of predefined demo skids
 */
export const getPredefinedDemoSkids = (): Skid[] => {
  return [
    {
      id: uuidv4(),
      label: "Fragile Electronics",
      width: 1.2,
      length: 0.8,
      height: 0.9,
      weight: 150,
      priority: 1,
      isStackable: false,
      maxWeightOnTop: 0,
      isFragile: true,
      description: "Boxes of electronic equipment - fragile"
    },
    {
      id: uuidv4(),
      label: "Machine Parts",
      width: 1.2,
      length: 1.0,
      height: 1.1,
      weight: 450,
      priority: 2,
      isStackable: true,
      maxWeightOnTop: 200,
      isFragile: false,
      description: "Heavy machine parts - can support weight"
    },
    {
      id: uuidv4(),
      label: "Kitchen Supplies",
      width: 1.0,
      length: 1.2,
      height: 1.5,
      weight: 220,
      priority: 1,
      isStackable: true,
      maxWeightOnTop: 100,
      isFragile: false,
      description: "Kitchen equipment and supplies"
    },
    {
      id: uuidv4(),
      label: "Paint Cans",
      width: 0.8,
      length: 0.8,
      height: 0.6,
      weight: 180,
      priority: 3,
      isStackable: true,
      maxWeightOnTop: 150,
      isFragile: false,
      description: "Boxes of paint cans"
    },
    {
      id: uuidv4(),
      label: "Glass Panels",
      width: 1.5,
      length: 1.0,
      height: 0.4,
      weight: 200,
      priority: 1,
      isStackable: false,
      maxWeightOnTop: 0,
      isFragile: true,
      description: "Fragile glass panels - do not stack"
    },
    {
      id: uuidv4(),
      label: "Furniture",
      width: 1.2,
      length: 2.0,
      height: 0.8,
      weight: 320,
      priority: 2,
      isStackable: false,
      maxWeightOnTop: 0,
      isFragile: false,
      description: "Disassembled furniture pieces"
    },
  ];
}; 