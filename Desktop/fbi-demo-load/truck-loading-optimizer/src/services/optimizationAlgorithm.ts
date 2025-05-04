import { Skid, TruckDimensions, Position, LoadingPlan, LoadingStep, LoadingSequence } from '../models/types';
import { ALGORITHM_CONFIG } from '../utils/constants';

/**
 * Calculate the volume of a skid
 * @param skid Skid object
 * @returns Volume of the skid
 */
const calculateSkidVolume = (skid: Skid): number => {
  return skid.width * skid.length * skid.height;
};

/**
 * Check if a skid can be placed at a specific position in the truck
 * @param skid Skid to place
 * @param position Position to place the skid
 * @param placedSkids Already placed skids
 * @param truckDimensions Dimensions of the truck
 * @returns True if the skid can be placed, false otherwise
 */
const canPlaceSkid = (
  skid: Skid,
  position: Position,
  placedSkids: Skid[],
  truckDimensions: TruckDimensions
): boolean => {
  const { x, y, z, rotation } = position;
  
  // Adjust width and length based on rotation
  const skidWidth = rotation === 0 ? skid.width : skid.length;
  const skidLength = rotation === 0 ? skid.length : skid.width;
  
  // Get inside dimensions with fallback to outer dimensions
  const insideWidth = truckDimensions.insideWidth || truckDimensions.width * 0.95;
  const insideHeight = truckDimensions.insideHeight || truckDimensions.height * 0.75;
  const insideLength = truckDimensions.insideLength || truckDimensions.length * 0.95;
  
  // Check if skid is within truck boundaries
  if (
    x < 0 ||
    y < 0 ||
    z < 0 ||
    x + skidWidth > insideWidth ||
    y + skid.height > insideHeight ||
    z + skidLength > insideLength
  ) {
    return false;
  }
  
  // Check for collisions with other skids
  for (const placedSkid of placedSkids) {
    if (!placedSkid.position) continue;
    
    const placedPos = placedSkid.position;
    const placedWidth = placedPos.rotation === 0 ? placedSkid.width : placedSkid.length;
    const placedLength = placedPos.rotation === 0 ? placedSkid.length : placedSkid.width;
    
    // Check for 3D intersection
    if (
      x < placedPos.x + placedWidth &&
      x + skidWidth > placedPos.x &&
      y < placedPos.y + placedSkid.height &&
      y + skid.height > placedPos.y &&
      z < placedPos.z + placedLength &&
      z + skidLength > placedPos.z
    ) {
      return false;
    }
  }
  
  // If y is greater than 0 (not on the floor), check if there's sufficient support underneath
  if (y > 0) {
    let supportedArea = 0;
    const skidArea = skidWidth * skidLength;
    
    for (const placedSkid of placedSkids) {
      if (!placedSkid.position) continue;
      
      // Check if the placed skid can support another skid on top
      if (!placedSkid.isStackable) continue;
      
      const placedPos = placedSkid.position;
      const placedWidth = placedPos.rotation === 0 ? placedSkid.width : placedSkid.length;
      const placedLength = placedPos.rotation === 0 ? placedSkid.length : placedSkid.width;
      
      // Check if placed skid is directly below the current position
      if (
        placedPos.y + placedSkid.height === y &&
        x < placedPos.x + placedWidth &&
        x + skidWidth > placedPos.x &&
        z < placedPos.z + placedLength &&
        z + skidLength > placedPos.z
      ) {
        // Calculate overlap area
        const overlapX = Math.min(x + skidWidth, placedPos.x + placedWidth) - Math.max(x, placedPos.x);
        const overlapZ = Math.min(z + skidLength, placedPos.z + placedLength) - Math.max(z, placedPos.z);
        
        // Add to supported area
        supportedArea += overlapX * overlapZ;
      }
    }
    
    // Check if at least 70% of the skid is supported
    const minSupportRatio = 0.7;
    if (supportedArea / skidArea < minSupportRatio) {
      return false;
    }
    
    // Check if the skid is not too heavy for what's beneath it
    let maxWeightSupport = 0;
    
    for (const placedSkid of placedSkids) {
      if (!placedSkid.position || !placedSkid.isStackable) continue;
      
      const placedPos = placedSkid.position;
      const placedWidth = placedPos.rotation === 0 ? placedSkid.width : placedSkid.length;
      const placedLength = placedPos.rotation === 0 ? placedSkid.length : placedSkid.width;
      
      // Check if placed skid is directly below the current position
      if (
        placedPos.y + placedSkid.height === y &&
        x < placedPos.x + placedWidth &&
        x + skidWidth > placedPos.x &&
        z < placedPos.z + placedLength &&
        z + skidLength > placedPos.z
      ) {
        // Calculate the proportion of this skid that's supporting the new skid
        const overlapX = Math.min(x + skidWidth, placedPos.x + placedWidth) - Math.max(x, placedPos.x);
        const overlapZ = Math.min(z + skidLength, placedPos.z + placedLength) - Math.max(z, placedPos.z);
        const overlapArea = overlapX * overlapZ;
        const supportProportion = overlapArea / (placedWidth * placedLength);
        
        // Add proportional weight support
        if (placedSkid.maxWeightOnTop !== undefined) {
          maxWeightSupport += placedSkid.maxWeightOnTop * supportProportion;
        } else {
          // If maxWeightOnTop is not defined, assume it can support its own weight
          maxWeightSupport += placedSkid.weight * 0.8 * supportProportion;
        }
      }
    }
    
    // If the skid is too heavy for the support, reject this position
    if (skid.weight > maxWeightSupport) {
      return false;
    }
  }
  
  return true;
};

/**
 * Find possible positions for a skid in the truck
 * @param skid Skid to place
 * @param placedSkids Already placed skids
 * @param truckDimensions Dimensions of the truck
 * @returns Array of possible positions
 */
const findPossiblePositions = (
  skid: Skid,
  placedSkids: Skid[],
  truckDimensions: TruckDimensions
): Position[] => {
  const positions: Position[] = [];
  
  // Step size for position search (smaller step = more precise but slower)
  const step = 0.1;
  
  // Get inside dimensions with fallback to outer dimensions
  const insideWidth = truckDimensions.insideWidth || truckDimensions.width * 0.95;
  const insideLength = truckDimensions.insideLength || truckDimensions.length * 0.95;
  
  // Try floor level (y = 0) positions first
  for (let z = 0; z <= insideLength - Math.min(skid.length, skid.width); z += step) {
    for (let x = 0; x <= insideWidth - Math.min(skid.length, skid.width); x += step) {
      // Try normal orientation
      const normalPosition: Position = { x, y: 0, z, rotation: 0 };
      if (canPlaceSkid(skid, normalPosition, placedSkids, truckDimensions)) {
        positions.push(normalPosition);
      }
      
      // Try rotated orientation (90 degrees around Y axis)
      const rotatedPosition: Position = { x, y: 0, z, rotation: 90 };
      if (canPlaceSkid(skid, rotatedPosition, placedSkids, truckDimensions)) {
        positions.push(rotatedPosition);
      }
    }
  }
  
  // If the skid can be placed on top of other skids, check those positions too
  if (!skid.isFragile) {
    for (const placedSkid of placedSkids) {
      if (!placedSkid.position || !placedSkid.isStackable) continue;
      
      const placedPos = placedSkid.position;
      const y = placedPos.y + placedSkid.height;
      
      // Try positions on top of this placed skid
      for (let zOffset = -skid.length + step; zOffset <= placedSkid.length; zOffset += step) {
        for (let xOffset = -skid.width + step; xOffset <= placedSkid.width; xOffset += step) {
          const x = placedPos.x + xOffset;
          const z = placedPos.z + zOffset;
          
          // Try normal orientation
          const normalPosition: Position = { x, y, z, rotation: 0 };
          if (canPlaceSkid(skid, normalPosition, placedSkids, truckDimensions)) {
            positions.push(normalPosition);
          }
          
          // Try rotated orientation
          const rotatedPosition: Position = { x, y, z, rotation: 90 };
          if (canPlaceSkid(skid, rotatedPosition, placedSkids, truckDimensions)) {
            positions.push(rotatedPosition);
          }
        }
      }
    }
  }
  
  return positions;
};

/**
 * Score a position based on various optimization factors
 * @param skid Skid to place
 * @param position Position to evaluate
 * @param placedSkids Already placed skids
 * @param truckDimensions Dimensions of the truck
 * @returns Score for the position (higher is better)
 */
const scorePosition = (
  skid: Skid,
  position: Position,
  placedSkids: Skid[],
  truckDimensions: TruckDimensions
): number => {
  let score = 0;
  
  // Get inside dimensions with fallback to outer dimensions
  const insideWidth = truckDimensions.insideWidth || truckDimensions.width * 0.95;
  const insideLength = truckDimensions.insideLength || truckDimensions.length * 0.95;
  
  // Prioritize positions toward the front or back based on priority
  // Lower priority numbers (higher priority) should be toward the back of the truck
  if (skid.priority <= 2) {
    // High priority items (1-2) should be toward the back for easier unloading
    score += (1 - position.z / insideLength) * 10 * ALGORITHM_CONFIG.PRIORITY_WEIGHT;
  } else {
    // Lower priority items should be toward the front
    score += (position.z / insideLength) * 5;
  }
  
  // Prefer positions on the floor rather than stacked
  score += position.y === 0 ? 3 : 0;
  
  // Prefer positions against walls for stability
  if (position.x === 0 || position.x + skid.width >= insideWidth) {
    score += 2;
  }
  if (position.z === 0 || position.z + skid.length >= insideLength) {
    score += 2;
  }
  
  // Prefer positions that maximize contact with other skids (better stability)
  let contactScore = 0;
  for (const placedSkid of placedSkids) {
    if (!placedSkid.position) continue;
    
    const placedPos = placedSkid.position;
    const placedWidth = placedPos.rotation === 0 ? placedSkid.width : placedSkid.length;
    const placedLength = placedPos.rotation === 0 ? placedSkid.length : placedSkid.width;
    
    // Check for contact on all sides
    const isInContactX = 
      (position.x === placedPos.x + placedWidth || position.x + skid.width === placedPos.x) &&
      position.z < placedPos.z + placedLength &&
      position.z + skid.length > placedPos.z &&
      position.y < placedPos.y + placedSkid.height &&
      position.y + skid.height > placedPos.y;
      
    const isInContactZ = 
      (position.z === placedPos.z + placedLength || position.z + skid.length === placedPos.z) &&
      position.x < placedPos.x + placedWidth &&
      position.x + skid.width > placedPos.x &&
      position.y < placedPos.y + placedSkid.height &&
      position.y + skid.height > placedPos.y;
      
    if (isInContactX || isInContactZ) {
      contactScore += 1;
    }
  }
  score += contactScore;
  
  // Consider weight balance
  const xCenterOfTruck = insideWidth / 2;
  const skidCenterX = position.x + skid.width / 2;
  
  // Penalize positions that create imbalance
  const distanceFromCenter = Math.abs(skidCenterX - xCenterOfTruck);
  score -= distanceFromCenter * 0.5; // Small penalty for imbalance
  
  return score;
};

/**
 * Sort skids by priority, weight, and volume
 * @param skids Array of skids to sort
 * @returns Sorted array of skids
 */
const sortSkidsForLoading = (skids: Skid[]): Skid[] => {
  return [...skids].sort((a, b) => {
    // First sort by priority (lower number = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    // Then sort by weight (heavier first)
    if (a.weight !== b.weight) {
      return b.weight - a.weight;
    }
    
    // Finally sort by volume (larger first)
    const volumeA = calculateSkidVolume(a);
    const volumeB = calculateSkidVolume(b);
    return volumeB - volumeA;
  });
};

/**
 * Calculate weight distribution in the truck
 * @param loadedSkids Loaded skids with positions
 * @param truckDimensions Dimensions of the truck
 * @returns Weight distribution metrics
 */
const calculateWeightDistribution = (
  loadedSkids: Skid[],
  truckDimensions: TruckDimensions
): LoadingPlan['weightDistribution'] => {
  let totalWeight = 0;
  let frontWeight = 0;
  let middleWeight = 0;
  let backWeight = 0;
  let leftWeight = 0;
  let rightWeight = 0;
  
  // Get inside dimensions with fallback to outer dimensions
  const insideLength = truckDimensions.insideLength || truckDimensions.length * 0.95;
  const insideWidth = truckDimensions.insideWidth || truckDimensions.width * 0.95;
  
  loadedSkids.forEach(skid => {
    if (!skid.position) return;
    
    const weight = skid.weight;
    totalWeight += weight;
    
    // Front, middle, back distribution
    const position = skid.position;
    const skidCenterZ = position.z + (position.rotation === 0 ? skid.length : skid.width) / 2;
    const relativeZ = skidCenterZ / insideLength;
    
    if (relativeZ < 0.33) {
      frontWeight += weight;
    } else if (relativeZ < 0.66) {
      middleWeight += weight;
    } else {
      backWeight += weight;
    }
    
    // Left-right distribution
    const skidCenterX = position.x + (position.rotation === 0 ? skid.width : skid.length) / 2;
    const relativeX = skidCenterX / insideWidth;
    
    if (relativeX < 0.5) {
      leftWeight += weight;
    } else {
      rightWeight += weight;
    }
  });
  
  // Convert to percentages
  return {
    front: totalWeight > 0 ? (frontWeight / totalWeight) * 100 : 0,
    middle: totalWeight > 0 ? (middleWeight / totalWeight) * 100 : 0,
    back: totalWeight > 0 ? (backWeight / totalWeight) * 100 : 0,
    left: totalWeight > 0 ? (leftWeight / totalWeight) * 100 : 0,
    right: totalWeight > 0 ? (rightWeight / totalWeight) * 100 : 0,
  };
};

/**
 * Calculate the space utilization percentage
 * @param loadedSkids Loaded skids
 * @param truckDimensions Dimensions of the truck
 * @returns Space utilization percentage
 */
const calculateSpaceUtilization = (
  loadedSkids: Skid[],
  truckDimensions: TruckDimensions
): number => {
  // If cubicCapacity isn't available, calculate it using dimensions
  const truckVolume = truckDimensions.cubicCapacity || 
    (truckDimensions.insideLength || truckDimensions.length * 0.95) * 
    (truckDimensions.insideWidth || truckDimensions.width * 0.95) * 
    (truckDimensions.insideHeight || truckDimensions.height * 0.75);
    
  const skidsVolume = loadedSkids.reduce((sum, skid) => sum + calculateSkidVolume(skid), 0);
  
  return (skidsVolume / truckVolume) * 100;
};

/**
 * Generate loading steps for the loading sequence
 * @param loadedSkids Loaded skids in optimal order
 * @returns Loading sequence with steps
 */
const generateLoadingSequence = (loadedSkids: Skid[]): LoadingSequence => {
  // Sort by Y (floor first), then by Z (front to back)
  const sortedForLoading = [...loadedSkids]
    .filter(skid => skid.position)
    .sort((a, b) => {
      const posA = a.position!;
      const posB = b.position!;
      
      // First by Y (floor level first)
      if (posA.y !== posB.y) {
        return posA.y - posB.y;
      }
      
      // Then by Z (front to back)
      return posA.z - posB.z;
    });
  
  const steps: LoadingStep[] = sortedForLoading.map((skid, index) => {
    const position = skid.position!;
    const rotation = position.rotation === 0 ? 'length-wise' : 'width-wise';
    const side = position.x < (skid.width / 2) ? 'left side' : 
                (position.x > (skid.width / 2) ? 'right side' : 'center');
    
    return {
      skidId: skid.id,
      position: position,
      instruction: `Step ${index + 1}: Load ${skid.label} ${rotation} on the ${side} at ${position.z.toFixed(2)} meters from the front, ${position.x.toFixed(2)} meters from the left side, and ${position.y > 0 ? 'stacked on top of other skids' : 'on the floor'}.`,
    };
  });
  
  return { steps };
};

/**
 * Optimize the loading of skids into a truck
 * @param skids Skids to load
 * @param truckDimensions Dimensions of the truck
 * @returns Loading plan with optimized arrangement
 */
export const optimizeLoading = (
  skids: Skid[],
  truckDimensions: TruckDimensions
): LoadingPlan => {
  // Sort skids by priority, weight, and volume
  const sortedSkids = sortSkidsForLoading(skids);
  
  // Clone the skids to avoid modifying the original array
  const skidsToLoad = [...sortedSkids];
  const loadedSkids: Skid[] = [];
  
  for (let i = 0; i < skidsToLoad.length; i++) {
    const skid = skidsToLoad[i];
    
    // Find all possible positions for this skid
    const possiblePositions = findPossiblePositions(skid, loadedSkids, truckDimensions);
    
    if (possiblePositions.length > 0) {
      // Score each position and find the best one
      let bestPosition: Position | null = null;
      let bestScore = -Infinity;
      
      for (const position of possiblePositions) {
        const score = scorePosition(skid, position, loadedSkids, truckDimensions);
        if (score > bestScore) {
          bestScore = score;
          bestPosition = position;
        }
      }
      
      if (bestPosition) {
        // Create a new skid object with the position and add it to loaded skids
        const loadedSkid: Skid = { ...skid, position: bestPosition };
        loadedSkids.push(loadedSkid);
      } else {
        console.warn(`Could not find a valid position for skid ${skid.label}`);
      }
    } else {
      console.warn(`No possible positions found for skid ${skid.label}`);
    }
  }
  
  // Find skids that couldn't be loaded
  const unloadedSkids = skidsToLoad.filter(
    skid => !loadedSkids.some(loadedSkid => loadedSkid.id === skid.id)
  );
  
  // Calculate weight distribution and space utilization
  const weightDistribution = calculateWeightDistribution(loadedSkids, truckDimensions);
  const spaceUtilization = calculateSpaceUtilization(loadedSkids, truckDimensions);
  const totalWeight = loadedSkids.reduce((sum, skid) => sum + skid.weight, 0);
  
  return {
    truckDimensions,
    loadedSkids,
    unloadedSkids,
    spaceUtilization,
    totalWeight,
    weightDistribution,
  };
};

/**
 * Generate loading sequence for a loading plan
 * @param loadingPlan Loading plan with optimized arrangement
 * @returns Loading sequence with step-by-step instructions
 */
export const generateLoadingInstructions = (loadingPlan: LoadingPlan): LoadingSequence => {
  return generateLoadingSequence(loadingPlan.loadedSkids);
}; 