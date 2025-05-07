import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Card, CardContent, Divider, Chip } from '@mui/material';
import { 
  AutoFixHigh as OptimizeIcon, 
  ScreenRotation as RotateIcon,
  Save as SaveIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import Container2DOptimizer from '../components/placedSkid/Container2DOptimizer';
import SkidLibrary from '../components/placedSkid/SkidLibrary';
import OptimizationControls from '../components/placedSkid/OptimizationControls';
import SkidDetails from '../components/placedSkid/SkidDetails';
import CustomSkidCreator from '../components/placedSkid/CustomSkidCreator';

/**
 * PlacedSkidPage - Main component for the 2D skid arrangement optimization system
 * This page allows users to drag and drop skids into a container,
 * optimize placements, and export loading plans
 */
const PlacedSkidPage: React.FC = () => {
  const { unitSystem } = useAppContext();
  
  // State for tracking overall statistics
  const [spaceUtilization, setSpaceUtilization] = useState<number>(0);
  const [placedSkidsCount, setPlacedSkidsCount] = useState<number>(0);
  const [selectedSkidId, setSelectedSkidId] = useState<string | null>(null);
  
  const pageStyle: React.CSSProperties = { padding: 24 };
  const marginBottomStyle: React.CSSProperties = { marginBottom: 24 };
  const paperStyle: React.CSSProperties = { 
    padding: 16, 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    minHeight: 600
  };
  const statisticsRowStyle: React.CSSProperties = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  };
  const actionsStyle: React.CSSProperties = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 8 
  };
  const libraryHeaderStyle: React.CSSProperties = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  };
  const addButtonStyle: React.CSSProperties = { marginRight: 8 };
  const dividerStyle: React.CSSProperties = { marginTop: 16, marginBottom: 16 };
  
  return (
    <Box style={pageStyle}>
      <Typography variant="h4" component="h1" gutterBottom>
        2D Skid Arrangement Optimization
      </Typography>
      
      <Box style={marginBottomStyle}>
        <Typography variant="body1" color="text.secondary">
          Maximize container space utilization through intuitive drag-and-drop functionality. 
          Create custom skid configurations and optimize loading patterns.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Container and Optimization Panel */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={2} 
            style={paperStyle}
          >
            {/* Container Visualization */}
            <Container2DOptimizer 
              onSpaceUtilization={setSpaceUtilization}
              onSkidSelect={setSelectedSkidId}
            />
          </Paper>
        </Grid>
        
        {/* Control Panel and Skid Library */}
        <Grid item xs={12} md={3}>
          <Grid container spacing={2} direction="column">
            {/* Statistics Card */}
            <Grid item>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Container Statistics
                  </Typography>
                  <Divider style={{marginBottom: 16}} />
                  
                  <Box style={statisticsRowStyle}>
                    <Typography variant="body2" color="text.secondary">
                      Space Utilization:
                    </Typography>
                    <Chip 
                      label={`${spaceUtilization.toFixed(1)}%`}
                      color={spaceUtilization > 80 ? "success" : spaceUtilization > 60 ? "warning" : "error"}
                      size="small"
                    />
                  </Box>
                  
                  <Box style={statisticsRowStyle}>
                    <Typography variant="body2" color="text.secondary">
                      Placed Skids:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {placedSkidsCount}
                    </Typography>
                  </Box>
                  
                  <Box style={statisticsRowStyle}>
                    <Typography variant="body2" color="text.secondary">
                      Available Space:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {(100 - spaceUtilization).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Selected Skid Details */}
            <Grid item>
              <SkidDetails selectedSkidId={selectedSkidId} />
            </Grid>
            
            {/* Optimization Controls */}
            <Grid item>
              <OptimizationControls />
            </Grid>
            
            {/* Quick Actions */}
            <Grid item>
              <Box style={actionsStyle}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<OptimizeIcon />}
                  fullWidth
                >
                  Auto-Arrange
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<ExportIcon />}
                  fullWidth
                >
                  Export Layout
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Skid Library */}
        <Grid item xs={12}>
          <Paper elevation={2} style={{padding: 16}}>
            <Box style={libraryHeaderStyle}>
              <Typography variant="h6">Skid Library</Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
                  style={addButtonStyle}
                >
                  Add Skid
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<SaveIcon />}
                >
                  Save Configuration
                </Button>
              </Box>
            </Box>
            
            <SkidLibrary onSkidSelect={setSelectedSkidId} />
            
            <Divider style={dividerStyle} />
            
            <CustomSkidCreator />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlacedSkidPage; 