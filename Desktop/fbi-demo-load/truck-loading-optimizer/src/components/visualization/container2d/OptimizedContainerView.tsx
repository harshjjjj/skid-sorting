import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Grid, Divider } from '@mui/material';
import { Skid, TruckDimensions, Position } from '../../../models/types';
import { COLORS } from '../../../utils/constants';
import { optimizeSkidPacking } from '../../../services/skidPackingOptimizer';

// Constants for visualization
const METERS_TO_FEET = 3.28084;

// Types specific to this component
interface SkidPlacement {
  skid: Skid;
  position: Position;
  rotation: number; // 0 or 90 degrees
}

interface OptimizedContainerViewProps {
  skids: Skid[];
  truckDimensions: TruckDimensions;
  useMetric?: boolean;
}

const OptimizedContainerView: React.FC<OptimizedContainerViewProps> = ({
  skids,
  truckDimensions,
  useMetric = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSkidId, setHoveredSkidId] = useState<string | null>(null);
  const [selectedSkidId, setSelectedSkidId] = useState<string | null>(null);
  const [utilizationPercentage, setUtilizationPercentage] = useState<number>(0);
  const [placedSkidsCount, setPlacedSkidsCount] = useState<number>(0);
  const [unplacedSkidsCount, setUnplacedSkidsCount] = useState<number>(0);
  
  // Run the optimization and render the result
  useEffect(() => {
    if (!canvasRef.current || skids.length === 0) return;
    
    const optimizationResult = optimizeSkidPacking(truckDimensions, skids);
    
    // Update state with optimization results
    setUtilizationPercentage(optimizationResult.utilization * 100);
    setPlacedSkidsCount(optimizationResult.placements.length);
    setUnplacedSkidsCount(optimizationResult.unplacedSkids.length);
    
    // Render the optimized packing
    renderOptimizedPacking(optimizationResult.placements);
  }, [skids, truckDimensions, useMetric]);
  
  // Function to render the optimized packing on canvas
  const renderOptimizedPacking = (placements: SkidPlacement[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get container dimensions
    const containerLength = truckDimensions.insideLength || (truckDimensions.length * 0.95);
    const containerWidth = truckDimensions.insideWidth || (truckDimensions.width * 0.95);
    
    // Set up scale and padding
    const canvasPadding = 50;
    const scaleX = (canvas.width - canvasPadding * 2) / containerLength;
    const scaleY = (canvas.height - canvasPadding * 2) / containerWidth;
    
    // Draw container outline
    ctx.strokeStyle = COLORS.TRUCK_FRAME;
    ctx.lineWidth = 3;
    ctx.strokeRect(
      canvasPadding,
      canvasPadding,
      containerLength * scaleX,
      containerWidth * scaleY
    );
    
    // Draw grid and rulers
    drawGridAndRulers(ctx, containerLength, containerWidth, scaleX, scaleY, canvasPadding, useMetric);
    
    // Draw orientation indicators
    drawOrientationLabels(ctx, containerLength, containerWidth, scaleX, scaleY, canvasPadding);
    
    // Draw each placed skid
    placements.forEach((placement, index) => {
      const { skid, position, rotation } = placement;
      
      // Determine skid dimensions based on rotation
      const skidLength = rotation === 0 ? skid.length : skid.width;
      const skidWidth = rotation === 0 ? skid.width : skid.length;
      
      // Calculate position on canvas
      const canvasX = canvasPadding + position.x * scaleX;
      const canvasY = canvasPadding + position.z * scaleY; // Using Z as Y for the 2D view
      
      // Generate color for the skid
      const isHighlighted = skid.id === hoveredSkidId || skid.id === selectedSkidId;
      const skidColor = getSkidColor(skid, index, isHighlighted);
      
      // Draw the skid
      drawSkid(
        ctx,
        canvasX,
        canvasY,
        skidLength * scaleX,
        skidWidth * scaleY,
        skidColor,
        skid,
        isHighlighted,
        useMetric,
        index + 1,
        scaleX,
        scaleY
      );
    });
    
    // Draw scale indicator and optimization stats
    drawScaleIndicator(ctx, canvas.width, useMetric);
    drawStats(ctx, canvas.width, canvas.height, utilizationPercentage, placedSkidsCount, unplacedSkidsCount);
  };
  
  // Handle mouse interactions with the canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // TODO: Implement hit testing to detect when mouse is over a skid
    // This would update hoveredSkidId state
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // TODO: Implement hit testing to detect which skid was clicked
    // This would update selectedSkidId state
  };
  
  return (
    // @ts-ignore - Complex union type in MUI sx prop
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Optimized Loading Plan
        <Chip 
          label={`${utilizationPercentage.toFixed(1)}% Utilized`}
          color={utilizationPercentage > 90 ? "success" : utilizationPercentage > 75 ? "warning" : "error"}
          size="small"
          sx={{ ml: 2 }}
        />
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Paper sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Space Utilization
            </Typography>
            <Typography variant="h6">
              {utilizationPercentage.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Placed Skids
            </Typography>
            <Typography variant="h6">
              {placedSkidsCount} / {skids.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Unplaced Skids
            </Typography>
            <Typography variant="h6" color={unplacedSkidsCount > 0 ? "error.main" : "success.main"}>
              {unplacedSkidsCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Canvas */}
      <Box sx={{ textAlign: 'center' }}>
        <canvas
          ref={canvasRef}
          width={1200}
          height={400}
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          style={{ 
            border: '1px solid #ddd', 
            borderRadius: 4,
            backgroundColor: '#f9f9f9',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </Box>
    </Box>
  );
};

// Helper function to draw grid and rulers
function drawGridAndRulers(
  ctx: CanvasRenderingContext2D,
  containerLength: number,
  containerWidth: number,
  scaleX: number,
  scaleY: number,
  padding: number,
  useMetric: boolean
) {
  // Draw grid
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 0.5;
  
  const gridInterval = useMetric ? 1 : 0.3048; // 1 meter or 1 foot
  const majorGridInterval = useMetric ? 5 : 5 * 0.3048; // 5 meters or 5 feet
  
  // Vertical grid lines
  for (let x = 0; x <= containerLength; x += gridInterval) {
    const canvasX = padding + x * scaleX;
    
    // Use darker lines for major intervals
    if (Math.abs(x % majorGridInterval) < 0.01) {
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 0.8;
    } else {
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 0.5;
    }
    
    ctx.beginPath();
    ctx.moveTo(canvasX, padding);
    ctx.lineTo(canvasX, padding + containerWidth * scaleY);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let y = 0; y <= containerWidth; y += gridInterval) {
    const canvasY = padding + y * scaleY;
    
    // Use darker lines for major intervals
    if (Math.abs(y % majorGridInterval) < 0.01) {
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 0.8;
    } else {
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 0.5;
    }
    
    ctx.beginPath();
    ctx.moveTo(padding, canvasY);
    ctx.lineTo(padding + containerLength * scaleX, canvasY);
    ctx.stroke();
  }
  
  // Draw rulers
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Horizontal ruler (length)
  for (let x = 0; x <= containerLength; x += majorGridInterval) {
    const canvasX = padding + x * scaleX;
    
    // Draw tick
    ctx.beginPath();
    ctx.moveTo(canvasX, padding - 5);
    ctx.lineTo(canvasX, padding);
    ctx.stroke();
    
    // Draw marker
    if (useMetric) {
      ctx.fillText(`${x.toFixed(0)}m`, canvasX, padding - 15);
    } else {
      const feet = x * METERS_TO_FEET;
      ctx.fillText(`${feet.toFixed(0)}'`, canvasX, padding - 15);
    }
  }
  
  // Vertical ruler (width)
  for (let y = 0; y <= containerWidth; y += majorGridInterval) {
    const canvasY = padding + y * scaleY;
    
    // Draw tick
    ctx.beginPath();
    ctx.moveTo(padding - 5, canvasY);
    ctx.lineTo(padding, canvasY);
    ctx.stroke();
    
    // Draw marker
    ctx.textAlign = 'right';
    if (useMetric) {
      ctx.fillText(`${y.toFixed(0)}m`, padding - 10, canvasY);
    } else {
      const feet = y * METERS_TO_FEET;
      ctx.fillText(`${feet.toFixed(0)}'`, padding - 10, canvasY);
    }
  }
  
  // Add container label
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  if (useMetric) {
    ctx.fillText(
      `Container: ${containerLength.toFixed(1)}m × ${containerWidth.toFixed(1)}m`,
      padding,
      10
    );
  } else {
    const lengthFeet = containerLength * METERS_TO_FEET;
    const widthFeet = containerWidth * METERS_TO_FEET;
    ctx.fillText(
      `Container: ${lengthFeet.toFixed(1)}' × ${widthFeet.toFixed(1)}'`,
      padding,
      10
    );
  }
}

// Helper function to draw orientation labels
function drawOrientationLabels(
  ctx: CanvasRenderingContext2D,
  containerLength: number,
  containerWidth: number,
  scaleX: number,
  scaleY: number,
  padding: number
) {
  ctx.font = 'bold 14px Arial';
  
  // Draw orientation indicators
  // Front and Back on Left and Right
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('FRONT', padding - 25, padding + containerWidth * scaleY / 2);
  
  ctx.textAlign = 'left';
  ctx.fillText('BACK', padding + containerLength * scaleX + 25, padding + containerWidth * scaleY / 2);
  
  // Left at top, Right at bottom
  ctx.textAlign = 'center';
  ctx.fillText('LEFT', padding + containerLength * scaleX / 2, padding - 25);
  ctx.fillText('RIGHT', padding + containerLength * scaleX / 2, padding + containerWidth * scaleY + 25);
}

// Helper function to get skid color
function getSkidColor(skid: Skid, index: number, isHighlighted: boolean): string {
  if (isHighlighted) {
    return '#ff9800'; // Highlight color
  }
  
  // Use a color based on properties or index
  if (skid.isFragile) {
    return COLORS.FRAGILE;
  } else if (skid.isStackable) {
    return COLORS.STACKABLE;
  } else {
    // Use a color from sequence colors
    return COLORS.SEQUENCE[index % COLORS.SEQUENCE.length];
  }
}

// Helper function to draw a skid
function drawSkid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  skid: Skid,
  isHighlighted: boolean,
  useMetric: boolean,
  sequenceNumber: number,
  scaleX: number,
  scaleY: number
) {
  // Draw skid rectangle
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  
  // Draw border
  ctx.strokeStyle = adjustColor(color, -40);
  ctx.lineWidth = isHighlighted ? 3 : 1;
  ctx.strokeRect(x, y, width, height);
  
  // Draw highlight if needed
  if (isHighlighted) {
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x - 3, y - 3, width + 6, height + 6);
    ctx.setLineDash([]);
  }
  
  // Draw skid label if it fits
  if (width > 40 && height > 25) {
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw label
    const labelX = x + width / 2;
    const labelY = y + height / 2 - 10;
    const labelText = skid.label.length > 10 ? skid.label.substring(0, 10) + '...' : skid.label;
    ctx.fillText(labelText, labelX, labelY);
    
    // Draw dimensions
    ctx.font = '10px Arial';
    if (useMetric) {
      // Note: width and height of the rectangle already account for the rotation
      // We're displaying the dimensions of the skid as it appears after rotation
      const displayWidth = height / scaleY; // Convert from pixels back to meters
      const displayLength = width / scaleX; // Convert from pixels back to meters
      ctx.fillText(`${displayWidth.toFixed(1)}m × ${displayLength.toFixed(1)}m`, labelX, labelY + 15);
    } else {
      // Convert meters to feet
      const displayWidth = (height / scaleY) * METERS_TO_FEET; // Convert from pixels to feet
      const displayLength = (width / scaleX) * METERS_TO_FEET; // Convert from pixels to feet
      ctx.fillText(`${displayWidth.toFixed(1)}' × ${displayLength.toFixed(1)}'`, labelX, labelY + 15);
    }
  }
  
  // Draw sequence number
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const seqX = x + 5;
  const seqY = y + 5;
  
  // Draw text stroke (outline)
  ctx.strokeText(sequenceNumber.toString(), seqX, seqY);
  // Draw text fill
  ctx.fillText(sequenceNumber.toString(), seqX, seqY);
}

// Helper function to draw scale indicator
function drawScaleIndicator(ctx: CanvasRenderingContext2D, canvasWidth: number, useMetric: boolean) {
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  
  if (useMetric) {
    ctx.fillText('1 square = 1 meter', canvasWidth - 10, 10);
  } else {
    ctx.fillText('1 square = 1 foot', canvasWidth - 10, 10);
  }
}

// Helper function to draw statistics
function drawStats(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  utilizationPercentage: number,
  placedSkidsCount: number,
  unplacedSkidsCount: number
) {
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  const statsText = `Utilization: ${utilizationPercentage.toFixed(1)}% | Placed: ${placedSkidsCount} | Unplaced: ${unplacedSkidsCount}`;
  ctx.fillText(statsText, 10, canvasHeight - 10);
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  // Remove # if present
  color = color.replace('#', '');
  
  // Parse the color
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Adjust and clamp
  const adjustR = Math.max(0, Math.min(255, r + amount));
  const adjustG = Math.max(0, Math.min(255, g + amount));
  const adjustB = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${adjustR.toString(16).padStart(2, '0')}${adjustG.toString(16).padStart(2, '0')}${adjustB.toString(16).padStart(2, '0')}`;
}

export default OptimizedContainerView; 