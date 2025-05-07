import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField, 
  Grid, 
  InputAdornment,
  Switch,
  FormControlLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack
} from '@mui/material';
import { colorOptions } from './colorOptions';
import { StandardSkid } from '../../models/placedSkid';

// Define styles to avoid complex union types
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8
};

const dividerStyle: React.CSSProperties = {
  marginBottom: 16
};

const colorBoxStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  marginRight: 8,
  border: '1px solid #ddd'
};

const colorOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center'
};

interface CustomSkidCreatorProps {
  onAddSkid?: (skid: StandardSkid) => void;
}

const defaultSkid: StandardSkid = {
  id: '',
  label: 'New Skid',
  length: 48,
  width: 40,
  height: 48,
  weight: 1200,
  color: '#4dabf7',
  isStackable: true,
  isFragile: false
};

const CustomSkidCreator: React.FC<CustomSkidCreatorProps> = ({ onAddSkid }) => {
  const [skid, setSkid] = useState<StandardSkid>({ ...defaultSkid });
  
  // Handle input changes
  const handleInputChange = (field: keyof StandardSkid, value: any) => {
    setSkid({
      ...skid,
      [field]: value
    });
  };
  
  // Handle the create button click
  const handleCreate = () => {
    if (onAddSkid) {
      const newSkid = {
        ...skid,
        id: uuidv4() // Generate a unique ID
      };
      onAddSkid(newSkid);
      setSkid({ ...defaultSkid }); // Reset form
    }
  };
  
  // Handle the clear button click
  const handleClear = () => {
    setSkid({ ...defaultSkid });
  };
  
  return (
    <Card elevation={2}>
      <CardContent>
        <Box style={headerStyle}>
          <Typography variant="h6">
            Create Custom Skid
          </Typography>
        </Box>
        
        <Divider style={dividerStyle} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Label"
              value={skid.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          
          <Grid item xs={4}>
            <TextField
              label="Length"
              value={skid.length}
              onChange={(e) => handleInputChange('length', Number(e.target.value))}
              variant="outlined"
              size="small"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">"</InputAdornment>,
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={4}>
            <TextField
              label="Width"
              value={skid.width}
              onChange={(e) => handleInputChange('width', Number(e.target.value))}
              variant="outlined"
              size="small"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">"</InputAdornment>,
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={4}>
            <TextField
              label="Height"
              value={skid.height}
              onChange={(e) => handleInputChange('height', Number(e.target.value))}
              variant="outlined"
              size="small"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">"</InputAdornment>,
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              label="Weight (lbs)"
              value={skid.weight}
              onChange={(e) => handleInputChange('weight', Number(e.target.value))}
              variant="outlined"
              size="small"
              type="number"
              fullWidth
            />
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Color</InputLabel>
              <Select
                value={skid.color}
                label="Color"
                onChange={(e) => handleInputChange('color', e.target.value)}
                renderValue={(selected) => (
                  <Box style={colorOptionStyle}>
                    <Box style={{ ...colorBoxStyle, backgroundColor: selected as string }} />
                    {selected}
                  </Box>
                )}
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box style={colorOptionStyle}>
                      <Box style={{ ...colorBoxStyle, backgroundColor: color.value }} />
                      {color.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={skid.isStackable}
                  onChange={(e) => handleInputChange('isStackable', e.target.checked)}
                  size="small"
                />
              }
              label="Stackable"
            />
          </Grid>
          
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={skid.isFragile}
                  onChange={(e) => handleInputChange('isFragile', e.target.checked)}
                  size="small"
                />
              }
              label="Fragile"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider style={{ marginTop: 8, marginBottom: 16 }} />
            <Stack direction="row" spacing={1}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCreate}
                fullWidth
              >
                Create Skid
              </Button>
              
              <Button 
                variant="outlined"
                onClick={handleClear}
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CustomSkidCreator; 