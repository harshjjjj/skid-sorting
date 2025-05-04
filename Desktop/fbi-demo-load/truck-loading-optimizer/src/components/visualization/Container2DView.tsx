import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Skid, TruckDimensions } from '../../models/types';
import { COLORS } from '../../utils/constants';

interface Container2DViewProps {
  loadedSkids: Skid[];
  truckDimensions: TruckDimensions;
  showSequence?: boolean;
}

/**
 * A 2D top-down visualization of skids loaded in a container
 */
const Container2DView: React.FC<Container2DViewProps> = ({ 
  loadedSkids, 
  truckDimensions,
  showSequence = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Constants for visualization
  const CANVAS_PADDING = 40;
  const LABEL_FONT_SIZE = 12;
  const SEQUENCE_FONT_SIZE = 14;

  // Get the dimensions of the truck
  const truckLength = truckDimensions.insideLength || truckDimensions.length * 0.95; // In meters
  const truckWidth = truckDimensions.insideWidth || truckDimensions.width * 0.95; // In meters
  
  // Sort skids by loading sequence if needed
  const sortedSkids = showSequence 
    ? [...loadedSkids].sort((a, b) => {
        if (!a.position || !b.position) return 0;
        // First by Y (floor level first)
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        // Then by Z (front to back)
        return a.position.z - b.position.z;
      })
    : loadedSkids;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set the scale for better visualization
    // We're mapping the actual dimensions (in meters) to pixels
    // For horizontal orientation, Z (length) maps to X axis, X (width) maps to Y axis
    const scaleX = (canvas.width - CANVAS_PADDING * 2) / truckLength;
    const scaleY = (canvas.height - CANVAS_PADDING * 2) / truckWidth;
    
    // Draw the container outline (rectangle) - horizontal orientation
    ctx.strokeStyle = COLORS.TRUCK_FRAME;
    ctx.lineWidth = 3;
    ctx.strokeRect(
      CANVAS_PADDING, 
      CANVAS_PADDING, 
      truckLength * scaleX, 
      truckWidth * scaleY
    );
    
    // Add container label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `53ft Container (${truckLength.toFixed(1)}m × ${truckWidth.toFixed(1)}m)`,
      CANVAS_PADDING,
      10
    );
    
    // Draw front/back indicators
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FRONT', CANVAS_PADDING, CANVAS_PADDING / 2);
    ctx.fillText('BACK', CANVAS_PADDING + truckLength * scaleX, CANVAS_PADDING / 2);
    
    // Draw left/right indicators
    ctx.textAlign = 'left';
    ctx.fillText('LEFT', CANVAS_PADDING / 2, CANVAS_PADDING);
    ctx.fillText('RIGHT', CANVAS_PADDING / 2, CANVAS_PADDING + truckWidth * scaleY);
    
    // Draw skids
    sortedSkids.forEach((skid, index) => {
      if (!skid.position) return;
      
      const { x, z, rotation } = skid.position;
      
      // Determine skid dimensions based on rotation
      const skidWidth = rotation === 0 ? skid.width : skid.length;
      const skidLength = rotation === 0 ? skid.length : skid.width;
      
      // Calculate position on canvas - Convert from 3D to 2D top-down view
      // Z coordinate (depth/length) maps to X axis in our 2D view
      // X coordinate (width) maps to Y axis in our 2D view
      const canvasX = CANVAS_PADDING + z * scaleX;
      const canvasY = CANVAS_PADDING + x * scaleY;
      
      // Generate a color based on loading sequence or randomly
      let skidColor;
      if (showSequence) {
        // Generate colors along a gradient based on loading sequence
        const hue = (index * 137.5) % 360; // Golden angle to distribute colors
        skidColor = `hsl(${hue}, 70%, 65%)`;
      } else {
        // Use a fixed color based on skid properties
        skidColor = skid.isFragile ? COLORS.FRAGILE : (skid.isStackable ? COLORS.STACKABLE : COLORS.SKID);
      }
      
      // Draw skid rectangle - swap dimensions for horizontal view
      ctx.fillStyle = skidColor;
      ctx.fillRect(
        canvasX,
        canvasY,
        skidLength * scaleX,
        skidWidth * scaleY
      );
      
      // Draw skid border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        canvasX,
        canvasY,
        skidLength * scaleX,
        skidWidth * scaleY
      );
      
      // Draw skid label
      ctx.fillStyle = '#000';
      ctx.font = `${LABEL_FONT_SIZE}px Arial`;
      
      // Position the label in the center of the skid
      const labelX = canvasX + (skidLength * scaleX / 2);
      const labelY = canvasY + (skidWidth * scaleY / 2);
      
      // Adjust text to fit within skid
      const maxTextWidth = Math.min(skidLength * scaleX - 6, 100);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw the label
      ctx.fillText(
        skid.label.length > 10 ? skid.label.substring(0, 10) + '...' : skid.label,
        labelX,
        labelY,
        maxTextWidth
      );
      
      // Draw loading sequence number if enabled
      if (showSequence) {
        ctx.font = `bold ${SEQUENCE_FONT_SIZE}px Arial`;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        // Draw sequence number in top-left corner
        const seqX = canvasX + 10;
        const seqY = canvasY + 15;
        
        // Draw text stroke (outline)
        ctx.strokeText(
          (index + 1).toString(),
          seqX,
          seqY
        );
        
        // Draw text fill
        ctx.fillText(
          (index + 1).toString(),
          seqX,
          seqY
        );
      }
    });
    
  }, [loadedSkids, truckDimensions, truckLength, truckWidth, showSequence]);

  return (
    // @ts-ignore - Complex union type in MUI sx prop
    <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Container Loading - Top View (53' x 9')
      </Typography>
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        overflowX: 'auto'
      }}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={250}
          style={{ 
            border: '1px solid #ddd', 
            borderRadius: 4,
            backgroundColor: '#f9f9f9'
          }}
        />
      </Box>
    </Box>
  );
};

export default Container2DView; 