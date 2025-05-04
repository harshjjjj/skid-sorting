import React from 'react';
import * as THREE from 'three';
import { useAppContext } from '../../context/AppContext';
import { Skid } from '../../models/types';
import { COLORS } from '../../utils/constants';

interface SkidModelsProps {
  loadedSkids: Skid[];
}

const SkidModels: React.FC<SkidModelsProps> = ({ loadedSkids }) => {
  // Function to determine skid color based on priority
  const getSkidColor = (skid: Skid): string => {
    if (skid.isFragile) {
      return '#e53935'; // red for fragile
    }
    
    const priorityIndex = Math.min(skid.priority - 1, COLORS.PRIORITY_COLORS.length - 1);
    return COLORS.PRIORITY_COLORS[priorityIndex] || COLORS.DEFAULT_SKID;
  };

  return (
    <group>
      {loadedSkids.map((skid) => {
        if (!skid.position) return null;
        
        const { x, y, z, rotation } = skid.position;
        const color = getSkidColor(skid);
        
        // Adjust dimensions based on rotation
        const width = rotation === 0 ? skid.width : skid.length;
        const length = rotation === 0 ? skid.length : skid.width;
        const height = skid.height;
        
        // Center the skid at its position
        const posX = x + width/2;
        const posY = y + height/2;
        const posZ = z + length/2;
        
        return (
          <mesh
            key={skid.id}
            position={[posX, posY, posZ]}
            rotation={[0, rotation === 90 ? Math.PI / 2 : 0, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial 
              color={color} 
              transparent 
              opacity={0.85}
              roughness={0.7}
              metalness={0.1}
            />
            
            {/* Add wireframe outline for better visibility */}
            <lineSegments>
              <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(width, height, length)]} />
              <lineBasicMaterial attach="material" color="#000" linewidth={1} />
            </lineSegments>
          </mesh>
        );
      })}
    </group>
  );
};

export default SkidModels; 