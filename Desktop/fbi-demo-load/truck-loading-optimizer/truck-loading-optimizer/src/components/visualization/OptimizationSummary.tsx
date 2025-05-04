import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Tooltip,
  SxProps,
  Theme
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { LoadingPlan } from '../../models/types';
import { formatWeight } from '../../utils/unitConversion';

interface OptimizationSummaryProps {
  loadingPlan: LoadingPlan;
}

const OptimizationSummary: React.FC<OptimizationSummaryProps> = ({ loadingPlan }) => {
  const { unitSystem } = useAppContext();
  
  const { 
    loadedSkids, 
    unloadedSkids, 
    spaceUtilization, 
    totalWeight,
    weightDistribution 
  } = loadingPlan;

  // Calculate the percentage of skids loaded
  const totalSkids = loadedSkids.length + unloadedSkids.length;
  const skidLoadPercentage = totalSkids === 0 ? 0 : (loadedSkids.length / totalSkids) * 100;

  // Format data with appropriate units
  const formattedWeight = formatWeight(totalWeight, unitSystem);
  
  return (
    <Card elevation={2}>
      <CardHeader title="Optimization Summary" />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Skids Loaded
            </Typography>
            <Typography variant="h6">
              {loadedSkids.length} / {totalSkids}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={skidLoadPercentage} 
              sx={{ mt: 1, mb: 2, height: 6, borderRadius: 3 }} 
            />
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Space Utilization
            </Typography>
            <Typography variant="h6">
              {spaceUtilization.toFixed(1)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={spaceUtilization} 
              color="success"
              sx={{ mt: 1, mb: 2, height: 6, borderRadius: 3 }} 
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Weight
            </Typography>
            <Typography variant="h6">
              {formattedWeight}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Weight Distribution
            </Typography>
            
            <Box sx={{ mb: 2 } as SxProps<Theme>}>
              <Typography variant="body2" gutterBottom>
                Front-Back Distribution:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tooltip title={`Front: ${weightDistribution.front.toFixed(1)}%`}>
                  <Box sx={{ 
                    width: `${weightDistribution.front}%`, 
                    height: 24, 
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                  } as SxProps<Theme>}>
                    {weightDistribution.front > 15 && `${weightDistribution.front.toFixed(0)}%`}
                  </Box>
                </Tooltip>
                
                <Tooltip title={`Middle: ${weightDistribution.middle.toFixed(1)}%`}>
                  <Box sx={{ 
                    width: `${weightDistribution.middle}%`, 
                    height: 24, 
                    bgcolor: 'secondary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                  } as SxProps<Theme>}>
                    {weightDistribution.middle > 15 && `${weightDistribution.middle.toFixed(0)}%`}
                  </Box>
                </Tooltip>
                
                <Tooltip title={`Back: ${weightDistribution.back.toFixed(1)}%`}>
                  <Box sx={{ 
                    width: `${weightDistribution.back}%`, 
                    height: 24, 
                    bgcolor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  } as SxProps<Theme>}>
                    {weightDistribution.back > 15 && `${weightDistribution.back.toFixed(0)}%`}
                  </Box>
                </Tooltip>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" gutterBottom>
                Left-Right Distribution:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={`Left: ${weightDistribution.left.toFixed(1)}%`}>
                  <Box sx={{ 
                    width: `${weightDistribution.left}%`, 
                    height: 24, 
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                  } as SxProps<Theme>}>
                    {weightDistribution.left > 15 && `${weightDistribution.left.toFixed(0)}%`}
                  </Box>
                </Tooltip>
                
                <Tooltip title={`Right: ${weightDistribution.right.toFixed(1)}%`}>
                  <Box sx={{ 
                    width: `${weightDistribution.right}%`, 
                    height: 24, 
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  } as SxProps<Theme>}>
                    {weightDistribution.right > 15 && `${weightDistribution.right.toFixed(0)}%`}
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OptimizationSummary; 