import React, { useState, useRef } from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import ContainerCanvas from './ContainerCanvas';
import ControlPanel from './ControlPanel';
import SkidInfoPanel from './SkidInfoPanel';
import { Skid, TruckDimensions } from '../../../models/types';

interface Container2DVisualizationProps {
  loadedSkids: Skid[];
  truckDimensions: TruckDimensions;
}

const Container2DVisualization: React.FC<Container2DVisualizationProps> = ({
  loadedSkids,
  truckDimensions
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for visualization options
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showSequence, setShowSequence] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedSkid, setSelectedSkid] = useState<Skid | null>(null);
  const [colorMode, setColorMode] = useState<'sequence' | 'priority' | 'type'>('sequence');
  
  // State for sequence playback
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = loadedSkids.length;
  
  // Sort skids by loading sequence
  const sortedSkids = [...loadedSkids].sort((a, b) => {
    if (!a.position || !b.position) return 0;
    // First by Y (floor level first)
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    // Then by Z (front to back)
    return a.position.z - b.position.z;
  });
  
  // Get the currently highlighted skid based on sequence step
  const highlightedSkidId = showSequence && sortedSkids.length > 0 && currentStep > 0 && currentStep <= sortedSkids.length
    ? sortedSkids[currentStep - 1].id
    : null;
  
  // Handle skid selection
  const handleSkidClick = (skid: Skid) => {
    setSelectedSkid(skid);
    
    // If in sequence mode, update current step to match the selected skid
    if (showSequence) {
      const skidIndex = sortedSkids.findIndex(s => s.id === skid.id);
      if (skidIndex !== -1) {
        setCurrentStep(skidIndex + 1);
      }
    }
  };
  
  // Handle sequence navigation
  const handleStepForward = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Update selected skid
      if (sortedSkids.length >= currentStep) {
        setSelectedSkid(sortedSkids[currentStep]);
      }
    }
  };
  
  const handleStepBackward = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Update selected skid
      if (sortedSkids.length >= currentStep - 2) {
        setSelectedSkid(sortedSkids[currentStep - 2]);
      }
    }
  };
  
  // Handle play/pause for sequence animation
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Print function
  const handlePrint = () => {
    window.print();
  };
  
  // Fit to screen function
  const handleFitToScreen = () => {
    setZoomLevel(1);
  };
  
  return (
    <Box 
      // @ts-ignore - Complex union type in MUI sx prop
      ref={containerRef}
      sx={{ 
        width: '100%', 
        backgroundColor: theme.palette.background.default,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Typography 
        variant="h5" 
        align="center" 
        gutterBottom
        sx={{ mt: 2 }}
      >
        Container Loading Visualization - 53' × 9'
      </Typography>
      
      {/* Main Container Visualization - Full Width */}
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 2, 
          mx: 2,
          mb: 2,
          textAlign: 'center',
          overflow: 'auto',
          maxHeight: '500px' // Make container taller
        }}
      >
        <ContainerCanvas 
          loadedSkids={loadedSkids}
          truckDimensions={truckDimensions}
          showSequence={showSequence}
          showGrid={showGrid}
          showLabels={showLabels}
          highlightedSkidId={highlightedSkidId}
          zoomLevel={zoomLevel}
          onSkidClick={handleSkidClick}
        />
      </Paper>
      
      {/* Controls Below Container */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {/* Control Panel - Left Side */}
        <Grid item xs={12} md={8}>
          <ControlPanel 
            showGrid={showGrid}
            showLabels={showLabels}
            showSequence={showSequence}
            zoomLevel={zoomLevel}
            isPlaying={isPlaying}
            currentStep={currentStep}
            totalSteps={totalSteps}
            colorMode={colorMode}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleLabels={() => setShowLabels(!showLabels)}
            onToggleSequence={() => setShowSequence(!showSequence)}
            onZoomChange={setZoomLevel}
            onFitToScreen={handleFitToScreen}
            onPlayPause={handlePlayPause}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onPrint={handlePrint}
            onColorModeChange={setColorMode}
          />
        </Grid>
        
        {/* Skid Info Panel - Right Side */}
        <Grid item xs={12} md={4}>
          <SkidInfoPanel skid={selectedSkid} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Container2DVisualization; 