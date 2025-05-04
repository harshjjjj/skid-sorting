import React, { useState, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import { 
  Box, 
  Typography, 
  Grid, 
  Divider, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Alert,
  Fade,
} from '@mui/material';
import { useAppContext } from '../context/AppContext';
import { 
  TruckModel, 
  SkidModels, 
  OptimizationSummary,
  SafeCanvas 
} from '../components/visualization';

const VisualizationPage: React.FC = () => {
  const { loadingPlan } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a slight delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Fallback content for when WebGL is not available
  const renderFallbackView = () => {
    // Return early if no loading plan
    if (!loadingPlan) {
      return (
        <Box 
          // @ts-ignore - Complex union type issue in MUI
          sx={{ height: '100%', p: 3 }}
        >
          <Alert 
            // @ts-ignore - Complex union type issue in MUI
            severity="error"
          >
            No loading plan available.
          </Alert>
        </Box>
      );
    }

    return (
      <Box 
        // @ts-ignore - Complex union type issue in MUI
        sx={{ height: '100%', p: 3 }}
      >
        <Alert 
          // @ts-ignore - Complex union type issue in MUI
          severity="error" 
          sx={{ mb: 3 }}
        >
          WebGL is not available on your device. Cannot render 3D visualization.
        </Alert>
        <Typography 
          // @ts-ignore - Complex union type issue in MUI
          variant="h6" 
          gutterBottom
        >
          Loading Summary
        </Typography>
        <Typography>
          Loaded skids: {loadingPlan.loadedSkids.length} / {loadingPlan.loadedSkids.length + loadingPlan.unloadedSkids.length}
        </Typography>
        <Typography>
          Space utilization: {loadingPlan.spaceUtilization.toFixed(1)}%
        </Typography>
        <List dense>
          {loadingPlan.loadedSkids.map((skid) => (
            <ListItem key={skid.id}>
              <ListItemText
                primary={skid.label}
                secondary={`Position: ${skid.position ? `(${skid.position.x.toFixed(1)}, ${skid.position.y.toFixed(1)}, ${skid.position.z.toFixed(1)})` : 'Unknown'}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  if (!loadingPlan) {
    return (
      <Fade in={isLoaded}>
        <Box 
          // @ts-ignore - Complex union type issue in MUI
          component="div" 
          sx={{ py: 4 }}
        >
          <Alert 
            // @ts-ignore - Complex union type issue in MUI
            severity="warning" 
            sx={{ mb: 4 }}
          >
            No loading plan available. Please go to the Input page and start optimization.
          </Alert>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={isLoaded}>
      <Box component="div">
        <Typography 
          // @ts-ignore - Complex union type issue in MUI
          variant="h4" 
          gutterBottom 
          sx={{ fontFamily: 'Montserrat', fontWeight: 600 }}
        >
          3D Visualization
        </Typography>
        <Typography 
          // @ts-ignore - Complex union type issue in MUI
          variant="subtitle1" 
          color="text.secondary" 
          paragraph
        >
          Interact with the 3D model to inspect the optimized loading plan.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card 
              // @ts-ignore - Complex union type issue in MUI
              elevation={3} 
              sx={{ height: '65vh', overflow: 'hidden' }}
            >
              <CardContent 
                // @ts-ignore - Complex union type issue in MUI
                sx={{ height: '100%', p: 0 }}
              >
                <SafeCanvas shadows fallback={renderFallbackView()}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                  <PerspectiveCamera makeDefault position={[10, 5, 10]} />

                  {/* Truck container */}
                  <TruckModel dimensions={loadingPlan.truckDimensions} />

                  {/* Loaded skids */}
                  <SkidModels loadedSkids={loadingPlan.loadedSkids} />

                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={20}
                  />
                  
                  <gridHelper args={[30, 30]} />
                  <axesHelper args={[5]} />
                  
                  {process.env.NODE_ENV === 'development' && <Stats />}
                </SafeCanvas>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <OptimizationSummary loadingPlan={loadingPlan} />

            <Card 
              // @ts-ignore - Complex union type issue in MUI
              elevation={2} 
              sx={{ mt: 3 }}
            >
              <CardHeader title="Unloaded Skids" />
              <Divider />
              <CardContent>
                {loadingPlan.unloadedSkids.length === 0 ? (
                  <Typography 
                    // @ts-ignore - Complex union type issue in MUI
                    variant="body2" 
                    color="text.secondary"
                  >
                    All skids were successfully loaded.
                  </Typography>
                ) : (
                  <List dense>
                    {loadingPlan.unloadedSkids.map((skid) => (
                      <ListItem key={skid.id}>
                        <ListItemText
                          primary={skid.label}
                          secondary={`Dimensions: ${skid.width}x${skid.length}x${skid.height}, Weight: ${skid.weight}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default VisualizationPage; 