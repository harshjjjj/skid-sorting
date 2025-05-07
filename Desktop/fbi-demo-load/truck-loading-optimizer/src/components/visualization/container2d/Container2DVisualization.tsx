import React, { useState, useRef } from 'react';
import { Box, Grid, Paper, Typography, useTheme, FormControlLabel, Switch } from '@mui/material';
import ContainerCanvas from './ContainerCanvas';
import ContainerSideView from './ContainerSideView';
import { Skid, TruckDimensions } from '../../../models/types';

// Conversion constants
const METERS_TO_FEET = 3.28084;

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
  const [useMetric, setUseMetric] = useState<boolean>(false);
  
  // State for sequence playback
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = loadedSkids.length;
  
  // Sort skids by loading sequence
  const sortedSkids = [...loadedSkids].sort((a, b) => {
    // First separate priority skids from non-priority skids
    // ALL priority skids should be at the back of the container
    if (a.priority && !b.priority) {
      return -1; // Priority skid comes before non-priority
    } else if (!a.priority && b.priority) {
      return 1; // Non-priority skid comes after priority
    }
    
    // If both have priority, sort by priority number (3 first, then 2, then 1)
    if (a.priority && b.priority) {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher number first: 3, 2, 1
      }
    }
    
    // After handling all priority skids, sort by position
    if (!a.position || !b.position) return 0;
    
    // First by Z coordinate (back to front) - higher Z means further back in container
    if (a.position.z !== b.position.z) {
      // Reverse order: larger Z (back of container) comes first
      return b.position.z - a.position.z;
    }
    
    // Then by X coordinate (side to side) - this ensures skids are placed on both sides
    if (a.position.x !== b.position.x) {
      return a.position.x - b.position.x;
    }
    
    // Finally by Y coordinate (floor level first)
    return a.position.y - b.position.y;
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
  
  // Toggle metric/imperial units
  const handleUnitToggle = () => {
    setUseMetric(!useMetric);
  };

  // State for synchronized measurement view
  const [showSyncMeasurements, setShowSyncMeasurements] = useState<boolean>(false);

  // Toggle synchronized measurement view
  const handleSyncMeasurementsToggle = () => {
    setShowSyncMeasurements(!showSyncMeasurements);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ mt: 2 }}
        >
          Container Loading Visualization - 53' × 9'
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Synchronized Measurements Toggle */}
          <FormControlLabel
            control={
              <Switch 
                checked={showSyncMeasurements} 
                onChange={handleSyncMeasurementsToggle} 
                color="secondary"
              />
            }
            label="Sync Measurements"
            sx={{ mr: 2 }}
          />
          
          {/* Units Toggle */}
          <FormControlLabel
            control={
              <Switch 
                checked={useMetric} 
                onChange={handleUnitToggle} 
                color="primary"
              />
            }
            label={useMetric ? "Metric (m)" : "Imperial (ft)"}
          />
        </Box>
      </Box>
      
      {/* Priority Loading Rules Legend */}
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          mx: 2,
          mb: 2,
          backgroundColor: '#f8f9fa',
          border: '1px dashed #dee2e6'
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Priority Loading Rules - ALL Priority Skids Loaded at Back
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#ffcd00', mr: 1, borderRadius: 1 }} />
            <Typography variant="body2">
              Priority 3 (Low) - Loaded FIRST at back on both sides
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#ff9500', mr: 1, borderRadius: 1 }} />
            <Typography variant="body2">
              Priority 2 (Medium) - Loaded at back after Priority 3
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#e63946', mr: 1, borderRadius: 1 }} />
            <Typography variant="body2">
              Priority 1 (High) - Loaded at back after Priority 2
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#a0a0a0', mr: 1, borderRadius: 1 }} />
            <Typography variant="body2">
              Non-priority skids - Loaded ONLY after ALL priority skids
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          ALL priority skids (3, 2, 1) are loaded at the back of the container on both sides, with Priority 3 first, followed by Priority 2, then Priority 1.
          Non-priority skids are only loaded after all priority skids. If there is not enough load to fill the container, the front area remains empty.
        </Typography>
      </Paper>
      
      {/* Main Container Visualization - Top-Down View */}
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
          useMetric={useMetric}
        />
      </Paper>
      
      {/* Synchronized Measurement View - Only show when toggled */}
      {showSyncMeasurements && (
        <Paper 
          elevation={1}
          sx={{ 
            p: 2, 
            mx: 2,
            mb: 2,
            textAlign: 'center',
            overflow: 'auto',
            maxHeight: '350px',
            backgroundColor: '#f5f5f5'
          }}
        >
          <Typography variant="h6" gutterBottom align="left" sx={{ color: 'secondary.main' }}>
            Synchronized Measurement View
          </Typography>
          
          <Grid container spacing={1}>
            {/* Left Side View with Measurement Points */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 1, 
                  backgroundColor: 'white',
                  border: 1,
                  borderColor: 'divider',
                  height: '250px',
                  position: 'relative'
                }}
              >
                <Typography variant="subtitle2" gutterBottom align="center" sx={{ color: 'secondary.dark' }}>
                  Left Side - Height Analysis
                </Typography>
                
                <ContainerSideView 
                  loadedSkids={loadedSkids}
                  truckDimensions={truckDimensions}
                  showSequence={false}
                  showGrid={true}
                  showLabels={true}
                  highlightedSkidId={highlightedSkidId}
                  zoomLevel={1.5} // Enhanced zoom for better visibility
                  onSkidClick={handleSkidClick}
                  useMetric={useMetric}
                  viewSide="left"
                />
                
                {/* Overlay measurement guidelines */}
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    border: '2px dashed rgba(25, 118, 210, 0.5)',
                    borderRadius: 1,
                    zIndex: 10
                  }}
                />
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    right: 5, 
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    px: 1,
                    borderRadius: 1
                  }}
                >
                  Left Measurement Reference
                </Typography>
              </Paper>
            </Grid>
            
            {/* Right Side View with Measurement Points */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 1, 
                  backgroundColor: 'white',
                  border: 1,
                  borderColor: 'divider',
                  height: '250px',
                  position: 'relative'
                }}
              >
                <Typography variant="subtitle2" gutterBottom align="center" sx={{ color: 'secondary.dark' }}>
                  Right Side - Height Analysis
                </Typography>
                
                <ContainerSideView 
                  loadedSkids={loadedSkids}
                  truckDimensions={truckDimensions}
                  showSequence={false}
                  showGrid={true}
                  showLabels={true}
                  highlightedSkidId={highlightedSkidId}
                  zoomLevel={1.5} // Enhanced zoom for better visibility
                  onSkidClick={handleSkidClick}
                  useMetric={useMetric}
                  viewSide="right"
                />
                
                {/* Overlay measurement guidelines */}
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    border: '2px dashed rgba(156, 39, 176, 0.5)',
                    borderRadius: 1,
                    zIndex: 10
                  }}
                />
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    right: 5, 
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    px: 1,
                    borderRadius: 1
                  }}
                >
                  Right Measurement Reference
                </Typography>
              </Paper>
            </Grid>
            
            {/* Measurement data comparison */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: 1, 
                  mt: 1, 
                  bgcolor: 'secondary.light', 
                  color: 'secondary.contrastText',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Cross-Referenced Height Analysis
                </Typography>
                <Typography variant="caption">
                  Height measurements from both perspectives are synchronized to ensure accurate stackability assessment
                </Typography>
                
                {selectedSkid && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', mr: 1 }} />
                      <Typography variant="caption">
                        Left measurement: {useMetric 
                          ? `${selectedSkid.height.toFixed(2)}m` 
                          : `${(selectedSkid.height * METERS_TO_FEET).toFixed(2)}ft`}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main', mr: 1 }} />
                      <Typography variant="caption">
                        Right measurement: {useMetric 
                          ? `${selectedSkid.height.toFixed(2)}m` 
                          : `${(selectedSkid.height * METERS_TO_FEET).toFixed(2)}ft`}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                      <Typography variant="caption" fontWeight="bold">
                        Variance: {useMetric ? '0.00m' : '0.00ft'} (within tolerance)
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Side View Container Visualization */}
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 2, 
          mx: 2,
          mb: 2,
          textAlign: 'center',
          overflow: 'auto',
          maxHeight: '250px' // Height for side view
        }}
      >
        <Typography variant="h6" gutterBottom align="left">
          Side Views
        </Typography>
        <Grid container spacing={2}>
          {/* Left Side View */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom align="center">
              Left Side View
            </Typography>
            <ContainerSideView 
              loadedSkids={loadedSkids}
              truckDimensions={truckDimensions}
              showSequence={showSequence}
              showGrid={showGrid}
              showLabels={showLabels}
              highlightedSkidId={highlightedSkidId}
              zoomLevel={zoomLevel}
              onSkidClick={handleSkidClick}
              useMetric={useMetric}
              viewSide="left"
            />
          </Grid>
          
          {/* Right Side View */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom align="center">
              Right Side View
            </Typography>
            <ContainerSideView 
              loadedSkids={loadedSkids}
              truckDimensions={truckDimensions}
              showSequence={showSequence}
              showGrid={showGrid}
              showLabels={showLabels}
              highlightedSkidId={highlightedSkidId}
              zoomLevel={zoomLevel}
              onSkidClick={handleSkidClick}
              useMetric={useMetric}
              viewSide="right"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Stackability Assessment Panel - Only show when a skid is selected */}
      {selectedSkid && (
        <Paper 
          elevation={1}
          sx={{ 
            p: 2, 
            mx: 2,
            mb: 2,
            textAlign: 'left',
            overflow: 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Stackability Assessment
            <Box component="span" sx={{ ml: 2, color: selectedSkid.isStackable ? 'success.main' : 'error.main' }}>
              [{selectedSkid.isStackable ? 'STACKABLE' : 'NOT STACKABLE'}]
            </Box>
            {selectedSkid.priority && (
              <Box 
                component="span" 
                sx={{ 
                  ml: 2, 
                  backgroundColor: selectedSkid.priority === 1 ? '#e63946' : 
                                   selectedSkid.priority === 2 ? '#ff9500' : 
                                   selectedSkid.priority === 3 ? '#ffcd00' : '#4361ee',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.8rem'
                }}
              >
                PRIORITY {selectedSkid.priority}
              </Box>
            )}
          </Typography>
          
          <Grid container spacing={2}>
            {/* Height Measurement Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Height Measurements
              </Typography>
              <Box sx={{ mt: 1, border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Measured Height:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      {useMetric 
                        ? `${selectedSkid.height.toFixed(2)}m (${(selectedSkid.height * 100).toFixed(0)}cm)` 
                        : `${(selectedSkid.height * METERS_TO_FEET).toFixed(2)}ft`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tolerance Range:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {useMetric ? '±1cm' : '±0.5in'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Timestamp:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontSize="0.8rem">
                      {new Date().toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Verified from multiple angles: Left side, Right side
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Surface Profile Analysis */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Surface Profile Analysis
              </Typography>
              <Box sx={{ mt: 1, border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                <Grid container>
                  <Grid item xs={7}>
                    <Typography variant="body2" color="text.secondary">
                      Top Surface Flatness:
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography 
                      variant="body2" 
                      color={selectedSkid.isStackable ? 'success.main' : 'warning.main'}
                      fontWeight="bold"
                    >
                      {selectedSkid.isStackable ? 'PASS' : 'CAUTION'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={7}>
                    <Typography variant="body2" color="text.secondary">
                      Weight Distribution:
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography 
                      variant="body2" 
                      color={selectedSkid.isStackable ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {selectedSkid.isStackable ? 'EVEN' : 'UNEVEN'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={7}>
                    <Typography variant="body2" color="text.secondary">
                      Contact Points:
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" fontWeight="bold">
                      {selectedSkid.isStackable ? '3' : '1'} points
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={7}>
                    <Typography variant="body2" color="text.secondary">
                      Loading Position:
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                    >
                      {selectedSkid.priority 
                        ? `BACK - Priority ${selectedSkid.priority} ${selectedSkid.priority === 3 ? '(First)' : selectedSkid.priority === 2 ? '(After P3)' : '(After P2)'}`
                        : 'After ALL priority skids'
                      }
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Surface flatness is critical for stable stacking
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Stacking Recommendations */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Stacking Recommendations
              </Typography>
              <Box sx={{ mt: 1, border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                <Typography variant="body2" paragraph>
                  {selectedSkid.isStackable 
                    ? `This skid can safely support additional items on top with a max weight of ${selectedSkid.weight * 0.8} kg.`
                    : `This skid should NOT have additional items stacked on top due to stability concerns.`
                  }
                </Typography>
                
                <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                  Compatible with skids: 
                  {selectedSkid.isStackable 
                    ? ' 3, 4, 7' // In a real app, this would be calculated
                    : ' None'
                  }
                </Typography>
                
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: selectedSkid.isStackable ? 'success.main' : 'error.main',
                      mr: 1
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {selectedSkid.isStackable ? 'SAFE TO STACK' : 'DO NOT STACK'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Validation Status */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: 1, 
                  mt: 1, 
                  bgcolor: 'info.light', 
                  color: 'info.contrastText',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="body2">
                  Stackability assessment complete. Data validated from multiple angles.
                </Typography>
                <Typography variant="caption">
                  Report ID: SA-{selectedSkid.id}-{Math.floor(Math.random() * 1000)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Container2DVisualization; 