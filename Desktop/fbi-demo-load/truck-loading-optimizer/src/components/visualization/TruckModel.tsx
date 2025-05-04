import React from 'react';
import { COLORS } from '../../utils/constants';
import { TruckDimensions } from '../../models/types';

interface TruckModelProps {
  dimensions: TruckDimensions;
}

const TruckModel: React.FC<TruckModelProps> = ({ dimensions }) => {
  // Convert to Three.js units with default values for undefined properties
  const length = dimensions.insideLength || dimensions.length * 0.95; // 5% less than outer length if not specified
  const width = dimensions.insideWidth || dimensions.width * 0.95; // 5% less than outer width if not specified
  const height = dimensions.insideHeight || dimensions.height * 0.75; // Lower than outer height if not specified
  const halfLength = length / 2;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const thickness = 0.05; // Thickness of the truck walls

  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh 
        receiveShadow 
        position={[0, -thickness/2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <boxGeometry args={[width, length, thickness]} />
        <meshStandardMaterial color={COLORS.TRUCK_FLOOR} />
      </mesh>

      {/* Left Wall */}
      <mesh 
        receiveShadow 
        position={[-halfWidth - thickness/2, halfHeight, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <boxGeometry args={[height, length, thickness]} />
        <meshStandardMaterial color={COLORS.TRUCK_WALLS} transparent opacity={0.7} />
      </mesh>

      {/* Right Wall */}
      <mesh 
        receiveShadow 
        position={[halfWidth + thickness/2, halfHeight, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <boxGeometry args={[height, length, thickness]} />
        <meshStandardMaterial color={COLORS.TRUCK_WALLS} transparent opacity={0.7} />
      </mesh>

      {/* Front Wall */}
      <mesh 
        receiveShadow 
        position={[0, halfHeight, -halfLength - thickness/2]}
      >
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color={COLORS.TRUCK_WALLS} transparent opacity={0.7} />
      </mesh>

      {/* Back Wall (loading door) - making it more transparent */}
      <mesh 
        receiveShadow 
        position={[0, halfHeight, halfLength + thickness/2]}
      >
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color={COLORS.TRUCK_WALLS} transparent opacity={0.3} />
      </mesh>

      {/* Frame edges - top */}
      <mesh position={[0, height + thickness/2, 0]}>
        <boxGeometry args={[width + thickness*2, thickness, length + thickness*2]} />
        <meshStandardMaterial color={COLORS.TRUCK_FRAME} />
      </mesh>

      {/* Frame edges - corners */}
      {[
        [-halfWidth - thickness/2, halfHeight, -halfLength - thickness/2], // front left
        [halfWidth + thickness/2, halfHeight, -halfLength - thickness/2],  // front right
        [-halfWidth - thickness/2, halfHeight, halfLength + thickness/2],  // back left
        [halfWidth + thickness/2, halfHeight, halfLength + thickness/2]    // back right
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          <boxGeometry args={[thickness, height, thickness]} />
          <meshStandardMaterial color={COLORS.TRUCK_FRAME} />
        </mesh>
      ))}

      {/* Frame edges - vertical */}
      {[
        [-halfWidth - thickness/2, 0, -halfLength - thickness/2], // front left
        [halfWidth + thickness/2, 0, -halfLength - thickness/2],  // front right
        [-halfWidth - thickness/2, 0, halfLength + thickness/2],  // back left
        [halfWidth + thickness/2, 0, halfLength + thickness/2]    // back right
      ].map((position, index) => (
        <mesh key={index + 4} position={position as [number, number, number]}>
          <boxGeometry args={[thickness, height * 2, thickness]} />
          <meshStandardMaterial color={COLORS.TRUCK_FRAME} />
        </mesh>
      ))}
    </group>
  );
};

export default TruckModel; 