import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppContext } from '../../context/AppContext';
import { Skid } from '../../models/types';
import { v4 as uuidv4 } from 'uuid';

const SkidForm: React.FC = () => {
  const { addSkid, unitSystem } = useAppContext();
  const [skidData, setSkidData] = useState<Omit<Skid, 'id'>>({
    label: '',
    width: 1.0,
    length: 1.0,
    height: 1.0,
    weight: 10,
    priority: 3,
    isStackable: true,
    isFragile: false,
    position: undefined
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Omit<Skid, 'id' | 'isStackable' | 'isFragile'>) => (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = e.target.value;
    
    // For numeric fields, ensure the value is a positive number
    if (['width', 'length', 'height', 'weight'].includes(field)) {
      const numValue = typeof value === 'string' ? parseFloat(value) : (value as number);
      
      if (!isNaN(numValue) && numValue > 0) {
        setSkidData(prevData => ({ ...prevData, [field]: numValue }));
        
        // Clear validation error if it exists
        if (validationErrors[field]) {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      } else {
        // Set validation error
        setValidationErrors(prev => ({
          ...prev,
          [field]: 'Value must be a positive number'
        }));
      }
    } else if (field === 'priority') {
      setSkidData(prevData => ({ ...prevData, [field]: value as number }));
    } else {
      setSkidData(prevData => ({ ...prevData, [field]: value }));
    }
  };

  const handleCheckboxChange = (field: 'isStackable' | 'isFragile') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSkidData(prevData => ({ ...prevData, [field]: e.target.checked }));
  };

  const handleAddSkid = () => {
    // Validate required fields
    const errors: Record<string, string> = {};
    
    if (!skidData.label.trim()) {
      errors.label = 'Label is required';
    }
    
    ['width', 'length', 'height', 'weight'].forEach(field => {
      const value = skidData[field as keyof Omit<Skid, 'id'>] as number;
      if (!value || value <= 0) {
        errors[field] = 'Value must be a positive number';
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Add the skid with a unique ID
    addSkid({
      ...skidData,
      id: uuidv4()
    });
    
    // Reset form to default values
    setSkidData({
      label: '',
      width: 1.0,
      length: 1.0,
      height: 1.0,
      weight: 10,
      priority: 3,
      isStackable: true,
      isFragile: false,
      position: undefined
    });
    
    // Clear validation errors
    setValidationErrors({});
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
        title="Add Skid" 
        titleTypographyProps={{ variant: 'h6' }}
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Label"
              fullWidth
              value={skidData.label}
              onChange={handleInputChange('label')}
              error={!!validationErrors.label}
              helperText={validationErrors.label}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Width"
              type="number"
              fullWidth
              value={skidData.width}
              onChange={handleInputChange('width')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{lengthUnit}</InputAdornment>,
              }}
              error={!!validationErrors.width}
              helperText={validationErrors.width}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Length"
              type="number"
              fullWidth
              value={skidData.length}
              onChange={handleInputChange('length')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{lengthUnit}</InputAdornment>,
              }}
              error={!!validationErrors.length}
              helperText={validationErrors.length}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Height"
              type="number"
              fullWidth
              value={skidData.height}
              onChange={handleInputChange('height')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{lengthUnit}</InputAdornment>,
              }}
              error={!!validationErrors.height}
              helperText={validationErrors.height}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Weight"
              type="number"
              fullWidth
              value={skidData.weight}
              onChange={handleInputChange('weight')}
              InputProps={{
                endAdornment: <InputAdornment position="end">{weightUnit}</InputAdornment>,
              }}
              error={!!validationErrors.weight}
              helperText={validationErrors.weight}
              // @ts-ignore - Complex union type issue in MUI
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={skidData.priority}
                label="Priority"
                onChange={handleInputChange('priority') as any}
                // @ts-ignore - Complex union type issue in MUI
                size="small"
              >
                <MenuItem value={1}>1 - High</MenuItem>
                <MenuItem value={2}>2 - Medium</MenuItem>
                <MenuItem value={3}>3 - Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box 
              // @ts-ignore - Complex union type issue in MUI
              sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}
            >
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={skidData.isStackable} 
                    onChange={handleCheckboxChange('isStackable')} 
                  />
                }
                label="Stackable"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={skidData.isFragile} 
                    onChange={handleCheckboxChange('isFragile')} 
                  />
                }
                label="Fragile"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddSkid}
              fullWidth
              // @ts-ignore - Complex union type issue in MUI
              sx={{ mt: 1 }}
            >
              Add Skid
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SkidForm; 