import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Grid,
  InputAdornment,
  Divider
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';

const TruckDetailsForm: React.FC = () => {
  const { 
    truckDimensions, 
    setTruckDimensions, 
    unitSystem 
  } = useAppContext();

  const handleDimensionChange = (dimension: 'width' | 'length' | 'height' | 'maxWeight') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0) {
      setTruckDimensions({
        ...truckDimensions,
        [dimension]: value
      });
    }
  };

  const lengthUnit = unitSystem === 'imperial' ? 'ft' : 'm';
  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';

  return (
    <Card 
      // @ts-ignore - Complex union type issue in MUI
      elevation={2} 
      sx={{ height: '100%' }}
    >
      <CardHeader 
        // @ts-ignore - Complex union type issue in MUI
        title="Truck Details" 
        titleTypographyProps={{ variant: 'h6' }}
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography 
              // @ts-ignore - Complex union type issue in MUI
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
            >
              Enter the interior dimensions of the truck's cargo area
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Width"
              type="number"
              fullWidth
              value={truckDimensions.width}
              onChange={handleDimensionChange('width')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{lengthUnit}</InputAdornment>,
              }}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Length"
              type="number"
              fullWidth
              value={truckDimensions.length}
              onChange={handleDimensionChange('length')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{lengthUnit}</InputAdornment>,
              }}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Height"
              type="number"
              fullWidth
              value={truckDimensions.height}
              onChange={handleDimensionChange('height')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{lengthUnit}</InputAdornment>,
              }}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Maximum Weight"
              type="number"
              fullWidth
              value={truckDimensions.maxWeight}
              onChange={handleDimensionChange('maxWeight')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{weightUnit}</InputAdornment>,
              }}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TruckDetailsForm; 