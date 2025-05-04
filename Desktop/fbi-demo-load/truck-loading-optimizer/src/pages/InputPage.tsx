import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Fade, Button, Alert, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import TableViewIcon from '@mui/icons-material/TableView';
import TruckDetailsForm from '../components/input/TruckDetailsForm';
import SkidForm from '../components/input/SkidForm';
import SkidList from '../components/input/SkidList';
import { useAppContext } from '../context/AppContext';
import { getPredefinedDemoSkids } from '../utils/demoData';

// Check if WebGL is available
const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const InputPage: React.FC = () => {
  const { skids, generateLoadingPlan, setActiveTab, addSkid } = useAppContext();
  const [error, setError] = React.useState<string | null>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  
  // Check WebGL support on mount
  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  const handleStartOptimization = () => {
    if (skids.length === 0) {
      setError('Please add at least one skid before starting optimization.');
      return;
    }
    
    setError(null);
    // Generate the loading plan
    generateLoadingPlan();
    
    // Navigate to the appropriate page based on WebGL support
    if (webGLSupported) {
      setActiveTab('visualization');
    } else {
      setActiveTab('results');
    }
  };
  
  const handleLoadDemoData = () => {
    // Get the demo skids
    const demoSkids = getPredefinedDemoSkids();
    
    // Add each demo skid to the context
    demoSkids.forEach(skid => addSkid(skid));
    
    setError(null);
  };

  return (
    <Fade in={true} timeout={500}>
      <Box component="div">
        {/* @ts-ignore - Complex union type issue in MUI */}
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}>
          Input Data
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Enter truck dimensions and add skids to be loaded.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TruckDetailsForm />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SkidForm />
          </Grid>
          
          <Grid item xs={12}>
            <SkidList />
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}
          
          {webGLSupported === false && (
            <Grid item xs={12}>
              <Alert severity="info">
                WebGL is not supported in your browser. You will see a 2D table view of the optimization results instead of a 3D visualization.
              </Alert>
            </Grid>
          )}
          
          {/* @ts-ignore - Complex union type issue in MUI */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleLoadDemoData}
              >
                Load Demo Data
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={webGLSupported ? <ViewInArIcon /> : <TableViewIcon />}
                onClick={handleStartOptimization}
                sx={{ 
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              >
                Start Optimization
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default InputPage; 