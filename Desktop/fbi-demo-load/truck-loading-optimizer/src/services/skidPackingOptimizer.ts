import { Skid, TruckDimensions, Position } from '../models/types';

// Constants
const INCHES_PER_METER = 39.3701;
const SAFETY_MARGIN = 0.0127; // 0.5 inches in meters

// Types for the optimizer
interface SkidPlacement {
  skid: Skid;
  position: Position;
  rotation: number; // 0 or 90 degrees
}

interface OptimizationResult {
  placements: SkidPlacement[];
  utilization: number;
  unplacedSkids: Skid[];
}

interface ExtremePoint {
  x: number;
  y: number;
  z: number;
}

/**
 * Main optimizer class that handles the skid packing algorithm
 */
export class SkidPackingOptimizer {
  private container: TruckDimensions;
  private skids: Skid[];
  private constraints: {
    prioritizeByPriority: boolean;
    respectWeight: boolean;
    allowStacking: boolean;
  };

  constructor(
    container: TruckDimensions,
    skids: Skid[],
    constraints = {
      prioritizeByPriority: true,
      respectWeight: true,
      allowStacking: false
    }
  ) {
    this.container = container;
    this.skids = [...skids];
    this.constraints = constraints;
  }

  /**
   * Main optimization method that returns the best packing solution
   */
  public optimize(): OptimizationResult {
    // First, preprocess and sort skids
    this.preprocessSkids();

    // Run multiple algorithms and pick the best result
    const extremePointSolution = this.runExtremePointPacking();
    
    // In a real implementation, you'd run multiple algorithms here
    // const geneticSolution = this.runGeneticAlgorithm();
    // const simulatedAnnealingSolution = this.runSimulatedAnnealing();
    
    // For now, just return the extreme point solution
    return extremePointSolution;
  }

  /**
   * Sort and prepare skids for packing
   */
  private preprocessSkids(): void {
    // Sort by priority if enabled
    if (this.constraints.prioritizeByPriority) {
      this.skids.sort((a, b) => a.priority - b.priority);
    } else {
      // Otherwise sort by volume (largest first)
      this.skids.sort((a, b) => {
        const volumeA = a.length * a.width * a.height;
        const volumeB = b.length * b.width * b.height;
        return volumeB - volumeA;
      });
    }
  }

  /**
   * Extreme Point Packing Algorithm
   * This is a greedy algorithm that places each skid at the "extreme point"
   * that minimizes a placement score (typically the distance from the origin)
   */
  private runExtremePointPacking(): OptimizationResult {
    // Initialize with the origin point
    const extremePoints: ExtremePoint[] = [{ x: 0, y: 0, z: 0 }];
    const placements: SkidPlacement[] = [];
    const placedSkidIds = new Set<string>();
    
    // Get container dimensions in meters
    const containerLength = this.container.insideLength || (this.container.length * 0.95);
    const containerWidth = this.container.insideWidth || (this.container.width * 0.95);
    const containerHeight = this.container.insideHeight || (this.container.height * 0.75);
    
    // Try to place each skid
    for (const skid of this.skids) {
      let bestPlacement: SkidPlacement | null = null;
      let bestScore = Infinity;
      
      // Try both orientations (0° and 90° rotations)
      const orientations = [
        { length: skid.length, width: skid.width, rotation: 0 },
        { length: skid.width, width: skid.length, rotation: 90 }
      ];
      
      // Try each extreme point with each orientation
      for (const point of extremePoints) {
        for (const orientation of orientations) {
          // Skip if the skid doesn't fit at this point with this orientation
          if (!this.canPlaceSkid(
            containerLength,
            containerWidth,
            containerHeight,
            point,
            orientation.length,
            orientation.width,
            skid.height,
            placements
          )) {
            continue;
          }
          
          // Calculate placement score (lower is better)
          // Here we use distance from origin as the score
          const score = this.calculatePlacementScore(point, containerLength, containerWidth);
          
          // Update best placement if this is better
          if (score < bestScore) {
            bestScore = score;
            bestPlacement = {
              skid,
              position: {
                x: point.x,
                y: point.z, // Note: we map z to y for 3D -> 2D conversion
                z: point.y, // And y to z
                rotation: orientation.rotation
              },
              rotation: orientation.rotation
            };
          }
        }
      }
      
      // If we found a valid placement, add it
      if (bestPlacement) {
        placements.push(bestPlacement);
        placedSkidIds.add(skid.id);
        
        // Update extreme points based on the new placement
        this.updateExtremePoints(
          extremePoints,
          bestPlacement.position.x,
          bestPlacement.position.z, // Using z as y for the 2D view
          bestPlacement.position.y, // Using y as z (height)
          bestPlacement.rotation === 0 ? skid.length : skid.width,
          bestPlacement.rotation === 0 ? skid.width : skid.length,
          skid.height
        );
      }
    }
    
    // Identify unplaced skids
    const unplacedSkids = this.skids.filter(skid => !placedSkidIds.has(skid.id));
    
    // Calculate utilization
    const utilization = this.calculateUtilization(
      containerLength,
      containerWidth,
      containerHeight,
      placements
    );
    
    return {
      placements,
      utilization,
      unplacedSkids
    };
  }

  /**
   * Check if a skid can be placed at a specific position with given dimensions
   */
  private canPlaceSkid(
    containerLength: number,
    containerWidth: number,
    containerHeight: number,
    point: ExtremePoint,
    skidLength: number,
    skidWidth: number,
    skidHeight: number,
    placements: SkidPlacement[]
  ): boolean {
    // Add safety margin
    const length = skidLength - 2 * SAFETY_MARGIN;
    const width = skidWidth - 2 * SAFETY_MARGIN;
    const x = point.x + SAFETY_MARGIN;
    const y = point.y + SAFETY_MARGIN;
    const z = point.z;
    
    // Check if the skid fits within the container
    if (
      x + length > containerLength ||
      y + width > containerWidth ||
      z + skidHeight > containerHeight
    ) {
      return false;
    }
    
    // Check for collisions with already placed skids
    for (const placement of placements) {
      const existingSkid = placement.skid;
      const existingX = placement.position.x;
      const existingY = placement.position.z; // Z is used as Y in our 2D view
      const existingZ = placement.position.y; // Y is used as Z (height)
      
      const existingLength = placement.rotation === 0 ? existingSkid.length : existingSkid.width;
      const existingWidth = placement.rotation === 0 ? existingSkid.width : existingSkid.length;
      
      // Simple collision detection (axis-aligned bounding boxes)
      if (
        x < existingX + existingLength &&
        x + length > existingX &&
        y < existingY + existingWidth &&
        y + width > existingY &&
        z < existingZ + existingSkid.height &&
        z + skidHeight > existingZ
      ) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Update extreme points after placing a skid
   */
  private updateExtremePoints(
    extremePoints: ExtremePoint[],
    x: number,
    y: number,
    z: number,
    length: number,
    width: number,
    height: number
  ): void {
    // Add new extreme points after placing a skid
    extremePoints.push(
      { x: x + length, y, z }, // Right edge
      { x, y: y + width, z }, // Front edge
      { x, y, z: z + height } // Top edge
    );
    
    // Remove dominated points (those that are "behind" other points in all dimensions)
    for (let i = extremePoints.length - 1; i >= 0; i--) {
      const point = extremePoints[i];
      
      // Skip if the point is inside the new skid
      if (
        point.x >= x && point.x <= x + length &&
        point.y >= y && point.y <= y + width &&
        point.z >= z && point.z <= z + height
      ) {
        extremePoints.splice(i, 1);
        continue;
      }
      
      // Check if this point is dominated by any other point
      let isDominated = false;
      for (let j = 0; j < extremePoints.length; j++) {
        if (i === j) continue;
        
        const otherPoint = extremePoints[j];
        if (
          otherPoint.x <= point.x &&
          otherPoint.y <= point.y &&
          otherPoint.z <= point.z
        ) {
          isDominated = true;
          break;
        }
      }
      
      if (isDominated) {
        extremePoints.splice(i, 1);
      }
    }
  }

  /**
   * Calculate a score for a potential placement (lower is better)
   */
  private calculatePlacementScore(
    point: ExtremePoint,
    containerLength: number,
    containerWidth: number
  ): number {
    // For now, use a simple distance-from-origin score
    // This will prioritize placements closer to the front-left corner
    return Math.sqrt(
      Math.pow(point.x / containerLength, 2) + 
      Math.pow(point.y / containerWidth, 2) + 
      Math.pow(point.z, 2)
    );
    
    // In a more sophisticated implementation, you might consider:
    // - Weighted distance from origin based on loading priorities
    // - Skyline-based scores to encourage level surfaces
    // - Contact area with other skids or container walls
    // - Weight distribution concerns
  }

  /**
   * Calculate space utilization percentage
   */
  private calculateUtilization(
    containerLength: number,
    containerWidth: number,
    containerHeight: number,
    placements: SkidPlacement[]
  ): number {
    const containerVolume = containerLength * containerWidth * containerHeight;
    
    // Sum up the volume of all placed skids
    let placedVolume = 0;
    for (const placement of placements) {
      placedVolume += placement.skid.length * placement.skid.width * placement.skid.height;
    }
    
    return placedVolume / containerVolume;
  }
}

/**
 * Main function to optimize skid packing in a container
 */
export function optimizeSkidPacking(
  truckDimensions: TruckDimensions,
  skids: Skid[]
): OptimizationResult {
  const optimizer = new SkidPackingOptimizer(truckDimensions, skids);
  return optimizer.optimize();
} 