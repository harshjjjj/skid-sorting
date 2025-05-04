import React from 'react';
import { Box } from '@mui/material';
import { Skid, TruckDimensions } from '../../models/types';
import Container2DVisualization from './container2d/Container2DVisualization';

interface Container2DViewProps {
  loadedSkids: Skid[];
  truckDimensions: TruckDimensions;
  showSequence?: boolean;
}

/**
 * A 2D top-down visualization of skids loaded in a container
 */
const Container2DView: React.FC<Container2DViewProps> = ({ 
  loadedSkids, 
  truckDimensions,
  showSequence = true
}) => {
  return (
    // @ts-ignore - Complex union type in MUI sx prop
    <Box sx={{ width: '100%' }}>
      <Container2DVisualization 
        loadedSkids={loadedSkids}
        truckDimensions={truckDimensions}
      />
    </Box>
  );
};

export default Container2DView; 