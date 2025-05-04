import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Alert,
  Fade,
  Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useAppContext } from '../context/AppContext';
import Container2DView from '../components/visualization/Container2DView';

/**
 * A 2D alternative visualization that doesn't require WebGL
 */
const LoadingResultsPage: React.FC = () => {
  const { loadingPlan, setActiveTab } = useAppContext();
  
  if (!loadingPlan) {
    return (
      <Fade in={true}>
        <Box 
          // @ts-ignore - Complex union type issue in MUI
          sx={{ p: 4 }}
        >
          <Alert 
            // @ts-ignore - Complex union type issue in MUI
            severity="warning"
          >
            No loading plan available. Please go to the Input page and start optimization.
          </Alert>
          <Button 
            // @ts-ignore - Complex union type issue in MUI
            startIcon={<ArrowBackIcon />} 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => setActiveTab('input')}
          >
            Back to Input
          </Button>
        </Box>
      </Fade>
    );
  }
  
  const totalSkids = loadingPlan.loadedSkids.length + loadingPlan.unloadedSkids.length;
  const loadedPercentage = Math.round((loadingPlan.loadedSkids.length / totalSkids) * 100);
  
  return (
    <Fade in={true}>
      <Box>
        <Box 
          // @ts-ignore - Complex union type issue in MUI
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}
        >
          <Typography 
            // @ts-ignore - Complex union type issue in MUI
            variant="h4" 
            gutterBottom
          >
            Loading Results
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              // @ts-ignore - Complex union type issue in MUI
              startIcon={<ArrowBackIcon />} 
              variant="outlined" 
              onClick={() => setActiveTab('input')}
            >
              Back to Input
            </Button>
            <Button 
              // @ts-ignore - Complex union type issue in MUI
              startIcon={<ViewInArIcon />} 
              variant="contained" 
              color="primary"
              onClick={() => setActiveTab('visualization')}
            >
              Try 3D View
            </Button>
          </Stack>
        </Box>

        {/* 2D Container Visualization */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Container Layout - Top View" />
          <Divider />
          <CardContent>
            <Container2DView 
              loadedSkids={loadingPlan.loadedSkids} 
              truckDimensions={loadingPlan.truckDimensions}
              showSequence={true}
            />
          </CardContent>
        </Card>
        
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Loading Summary" />
              <Divider />
              <CardContent>
                <Typography 
                  // @ts-ignore - Complex union type issue in MUI
                  variant="h3" 
                  align="center" 
                  color="primary"
                >
                  {loadedPercentage}%
                </Typography>
                <Typography 
                  // @ts-ignore - Complex union type issue in MUI
                  variant="subtitle1" 
                  align="center" 
                  sx={{ mb: 2 }}
                >
                  Skids Loaded
                </Typography>
                <Typography>
                  Loaded: {loadingPlan.loadedSkids.length} of {totalSkids} skids
                </Typography>
                <Typography>
                  Space Utilization: {loadingPlan.spaceUtilization.toFixed(1)}%
                </Typography>
                <Typography>
                  Total Weight: {loadingPlan.totalWeight.toFixed(0)} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Weight Distribution */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Weight Distribution" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      // @ts-ignore - Complex union type issue in MUI
                      variant="subtitle2" 
                      gutterBottom
                    >
                      Front-to-Back Distribution
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip 
                        // @ts-ignore - Complex union type issue in MUI
                        label={`Front: ${loadingPlan.weightDistribution.front.toFixed(0)}%`} 
                        color="primary" 
                        variant="outlined"
                        sx={{ flexGrow: loadingPlan.weightDistribution.front / 20 }}
                      />
                      <Chip 
                        // @ts-ignore - Complex union type issue in MUI
                        label={`Middle: ${loadingPlan.weightDistribution.middle.toFixed(0)}%`} 
                        color="secondary" 
                        variant="outlined"
                        sx={{ flexGrow: loadingPlan.weightDistribution.middle / 20 }}
                      />
                      <Chip 
                        // @ts-ignore - Complex union type issue in MUI
                        label={`Back: ${loadingPlan.weightDistribution.back.toFixed(0)}%`} 
                        color="info" 
                        variant="outlined"
                        sx={{ flexGrow: loadingPlan.weightDistribution.back / 20 }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      // @ts-ignore - Complex union type issue in MUI
                      variant="subtitle2" 
                      gutterBottom
                    >
                      Left-to-Right Distribution
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        // @ts-ignore - Complex union type issue in MUI
                        label={`Left: ${loadingPlan.weightDistribution.left.toFixed(0)}%`} 
                        color="success" 
                        variant="outlined"
                        sx={{ flexGrow: loadingPlan.weightDistribution.left / 100 }}
                      />
                      <Chip 
                        // @ts-ignore - Complex union type issue in MUI
                        label={`Right: ${loadingPlan.weightDistribution.right.toFixed(0)}%`} 
                        color="warning" 
                        variant="outlined"
                        sx={{ flexGrow: loadingPlan.weightDistribution.right / 100 }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Loaded Skids Table */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title={`Loaded Skids (${loadingPlan.loadedSkids.length})`} />
              <Divider />
              <CardContent>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Label</TableCell>
                        <TableCell>Dimensions (W×L×H)</TableCell>
                        <TableCell>Weight</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Position</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingPlan.loadedSkids.map((skid) => (
                        <TableRow key={skid.id}>
                          <TableCell>{skid.id.substring(0, 8)}...</TableCell>
                          <TableCell>{skid.label}</TableCell>
                          <TableCell>{`${skid.width}×${skid.length}×${skid.height}`}</TableCell>
                          <TableCell>{skid.weight} kg</TableCell>
                          <TableCell>
                            <Chip 
                              // @ts-ignore - Complex union type issue in MUI
                              label={`P${skid.priority}`}
                              color={skid.priority === 1 ? "error" : skid.priority === 2 ? "warning" : "success"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {skid.position ? 
                              `(${skid.position.x.toFixed(1)}, ${skid.position.y.toFixed(1)}, ${skid.position.z.toFixed(1)})` : 
                              'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Unloaded Skids Table */}
          {loadingPlan.unloadedSkids.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title={`Unloaded Skids (${loadingPlan.unloadedSkids.length})`} 
                  // @ts-ignore - Complex union type issue in MUI
                  sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}
                />
                <Divider />
                <CardContent>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Label</TableCell>
                          <TableCell>Dimensions (W×L×H)</TableCell>
                          <TableCell>Weight</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loadingPlan.unloadedSkids.map((skid) => (
                          <TableRow key={skid.id}>
                            <TableCell>{skid.id.substring(0, 8)}...</TableCell>
                            <TableCell>{skid.label}</TableCell>
                            <TableCell>{`${skid.width}×${skid.length}×${skid.height}`}</TableCell>
                            <TableCell>{skid.weight} kg</TableCell>
                            <TableCell>
                              <Chip 
                                // @ts-ignore - Complex union type issue in MUI
                                label={`P${skid.priority}`}
                                color={skid.priority === 1 ? "error" : skid.priority === 2 ? "warning" : "success"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              Could not find suitable position
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Fade>
  );
};

export default LoadingResultsPage; 