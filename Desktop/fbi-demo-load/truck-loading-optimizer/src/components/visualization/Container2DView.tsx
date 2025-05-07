import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { Skid, TruckDimensions } from '../../models/types';
import Container2DVisualization from './container2d/Container2DVisualization';
import OptimizedContainerView from './container2d/OptimizedContainerView';

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
  const [viewMode, setViewMode] = useState<'current' | 'optimized'>('current');

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'current' | 'optimized',
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    // @ts-ignore - Complex union type in MUI sx prop
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {viewMode === 'current' ? 'Current Loading Plan' : 'Optimized Loading Plan'}
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="container view mode"
          size="small"
        >
          <ToggleButton value="current" aria-label="current loading">
            Current Plan
          </ToggleButton>
          <ToggleButton value="optimized" aria-label="optimized loading">
            Optimized Plan
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'current' ? (
        <Container2DVisualization 
          loadedSkids={loadedSkids}
          truckDimensions={truckDimensions}
        />
      ) : (
        <OptimizedContainerView 
          skids={loadedSkids}
          truckDimensions={truckDimensions}
        />
      )}
    </Box>
  );
};

export default Container2DView; 