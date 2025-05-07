import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  PriorityHigh as PriorityIcon,
  StackedLineChart as StackableIcon,
  BrokenImage as FragileIcon,
  Straighten as DimensionIcon,
  Scale as WeightIcon,
  Place as PositionIcon
} from '@mui/icons-material';
import { Skid } from '../../../models/types';

// Conversion constants
const METERS_TO_FEET = 3.28084;
const KILOS_TO_POUNDS = 2.20462;

interface SkidInfoPanelProps {
  skid: Skid | null;
  useMetric?: boolean;
}

const SkidInfoPanel: React.FC<SkidInfoPanelProps> = ({ 
  skid,
  useMetric = false 
}) => {
  if (!skid) {
    return (
      // @ts-ignore - Complex union type in MUI sx prop
      <Paper sx={{ p: 2, mb: 2, height: '100%', minHeight: 200 }}>
        {/* @ts-ignore - Complex union type in MUI sx prop */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary'
        }}>
          <InfoIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
          <Typography variant="body1">
            Select a skid to view details
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Convert dimensions to feet for display if needed
  const widthFeet = (skid.width * METERS_TO_FEET).toFixed(2);
  const lengthFeet = (skid.length * METERS_TO_FEET).toFixed(2);
  const heightFeet = (skid.height * METERS_TO_FEET).toFixed(2);
  const weightLbs = (skid.weight * KILOS_TO_POUNDS).toFixed(1);
  
  // Format position based on units
  const positionText = skid.position 
    ? `(${skid.position.x.toFixed(2)}, ${skid.position.y.toFixed(2)}, ${skid.position.z.toFixed(2)})` 
    : 'Not loaded';
    
  const positionFeet = skid.position 
    ? `(${(skid.position.x * METERS_TO_FEET).toFixed(2)}', ${(skid.position.y * METERS_TO_FEET).toFixed(2)}', ${(skid.position.z * METERS_TO_FEET).toFixed(2)}')` 
    : 'Not loaded';
  
  return (
    // @ts-ignore - Complex union type in MUI sx prop
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Skid Details
        </Typography>
        
        <Chip 
          label={`Priority ${skid.priority}`}
          color={getPriorityColor(skid.priority)}
          size="small"
        />
      </Box>
      
      <Typography variant="h5" gutterBottom>
        {skid.label}
      </Typography>
      
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Tooltip title="Dimensions">
            <Chip
              icon={<DimensionIcon />}
              label={useMetric ? 
                `${skid.width.toFixed(2)}m × ${skid.length.toFixed(2)}m × ${skid.height.toFixed(2)}m` : 
                `${widthFeet}' × ${lengthFeet}' × ${heightFeet}'`
              }
              variant="outlined"
            />
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title="Weight">
            <Chip
              icon={<WeightIcon />}
              label={useMetric ? 
                `${skid.weight.toFixed(1)} kg` : 
                `${weightLbs} lbs (${skid.weight.toFixed(1)} kg)`
              }
              variant="outlined"
            />
          </Tooltip>
        </Grid>
      </Grid>
      
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item>
          <Chip
            icon={<StackableIcon />}
            label={skid.isStackable ? "Stackable" : "Not Stackable"}
            color={skid.isStackable ? "success" : "default"}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item>
          <Chip
            icon={<FragileIcon />}
            label={skid.isFragile ? "Fragile" : "Not Fragile"}
            color={skid.isFragile ? "error" : "default"}
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Position Information
      </Typography>
      
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">Position (meters)</TableCell>
            <TableCell align="right">{positionText}</TableCell>
          </TableRow>
          {!useMetric && (
            <TableRow>
              <TableCell component="th" scope="row">Position (feet)</TableCell>
              <TableCell align="right">{positionFeet}</TableCell>
            </TableRow>
          )}
          {skid.position && (
            <TableRow>
              <TableCell component="th" scope="row">Rotation</TableCell>
              <TableCell align="right">{skid.position.rotation === 0 ? "Length-wise" : "Width-wise"}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {skid.description && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Description
          </Typography>
          <Typography variant="body2" paragraph>
            {skid.description}
          </Typography>
        </>
      )}
      
      {skid.specialHandling && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Special Handling Instructions
          </Typography>
          <Typography variant="body2" color="error">
            {skid.specialHandling}
          </Typography>
        </>
      )}
    </Paper>
  );
};

// Helper function to get priority color name
function getPriorityColor(priority: number): "error" | "warning" | "success" | "primary" | "secondary" | "info" {
  switch(priority) {
    case 1: return "error";
    case 2: return "warning";
    case 3: return "info";
    case 4: return "success";
    case 5: return "primary";
    default: return "secondary";
  }
}

export default SkidInfoPanel; 