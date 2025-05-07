import React, { useRef, useEffect, useState } from 'react';
import { Skid, TruckDimensions } from '../../../models/types';
import { COLORS } from '../../../utils/constants';

// Conversion constants
const METERS_TO_FEET = 3.28084;
const FEET_TO_METERS = 0.3048;

interface ContainerCanvasProps {
  loadedSkids: Skid[];
  truckDimensions: TruckDimensions;
  showSequence?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  highlightedSkidId?: string | null;
  zoomLevel?: number;
  onSkidClick?: (skid: Skid) => void;
  useMetric?: boolean; // Added prop to toggle between metric and imperial
}

const ContainerCanvas: React.FC<ContainerCanvasProps> = ({
  loadedSkids,
  truckDimensions,
  showSequence = true,
  showGrid = true,
  showLabels = true,
  highlightedSkidId = null,
  zoomLevel = 1,
  onSkidClick,
  useMetric = false // Default to imperial (feet)
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSkid, setHoveredSkid] = useState<Skid | null>(null);
  const [canvasPosition, setCanvasPosition] = useState({ left: 0, top: 0 });
  
  // Constants for visualization
  const CANVAS_PADDING = 50; // Increased padding for rulers
  const LABEL_FONT_SIZE = 12;
  const SEQUENCE_FONT_SIZE = 14;
  const GRID_MAJOR_INTERVAL = useMetric ? 1 : 5; // 5-foot or 1-meter intervals for major grid lines
  
  // Convert truck dimensions from meters to feet for display
  const truckLengthMeters = truckDimensions.insideLength || truckDimensions.length * 0.95;
  const truckWidthMeters = truckDimensions.insideWidth || truckDimensions.width * 0.95;
  
  // Convert to feet for display
  const truckLengthFeet = truckLengthMeters * METERS_TO_FEET;
  const truckWidthFeet = truckWidthMeters * METERS_TO_FEET;
  
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

  // Handle canvas mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const updateCanvasPosition = () => {
      const rect = canvas.getBoundingClientRect();
      setCanvasPosition({ left: rect.left, top: rect.top });
    };
    
    updateCanvasPosition();
    window.addEventListener('resize', updateCanvasPosition);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is over any skid
      let foundSkid: Skid | null = null;
      
      for (const skid of sortedSkids) {
        if (!skid.position) continue;
        
        const { x: skidX, z: skidZ, rotation } = skid.position;
        
        // Determine skid dimensions based on rotation
        const skidWidth = rotation === 0 ? skid.width : skid.length;
        const skidLength = rotation === 0 ? skid.length : skid.width;
        
        // Calculate scale factors
        const scaleX = (canvas.width - CANVAS_PADDING * 2) / truckLengthMeters;
        const scaleY = (canvas.height - CANVAS_PADDING * 2) / truckWidthMeters;
        
        // Calculate position on canvas
        const canvasX = CANVAS_PADDING + skidZ * scaleX;
        const canvasY = CANVAS_PADDING + skidX * scaleY;
        const skidWidthPx = skidWidth * scaleY;
        const skidLengthPx = skidLength * scaleX;
        
        // Check if mouse is inside this skid
        if (
          x >= canvasX && 
          x <= canvasX + skidLengthPx && 
          y >= canvasY && 
          y <= canvasY + skidWidthPx
        ) {
          foundSkid = skid;
          break;
        }
      }
      
      setHoveredSkid(foundSkid);
      canvas.style.cursor = foundSkid ? 'pointer' : 'default';
    };
    
    const handleClick = (e: MouseEvent) => {
      if (hoveredSkid && onSkidClick) {
        onSkidClick(hoveredSkid);
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('resize', updateCanvasPosition);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [hoveredSkid, onSkidClick, sortedSkids, truckLengthMeters, truckWidthMeters]);
  
  // Main drawing function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set the scale for visualization
    // We're mapping the dimensions in meters to pixels
    const scaleX = (canvas.width - CANVAS_PADDING * 2) / truckLengthMeters;
    const scaleY = (canvas.height - CANVAS_PADDING * 2) / truckWidthMeters;
    
    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e5e5e5'; // Light gray for minor grid
      ctx.lineWidth = 0.5;
      
      if (useMetric) {
        // Draw 1-meter grid for metric
        // Vertical grid lines (every meter)
        for (let m = 0; m <= Math.ceil(truckLengthMeters); m++) {
          const x = CANVAS_PADDING + (m * scaleX);
          
          // Use darker lines for major intervals
          if (m % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa'; // Darker gray for major grid
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5'; // Light gray for minor grid
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(x, CANVAS_PADDING);
          ctx.lineTo(x, CANVAS_PADDING + truckWidthMeters * scaleY);
          ctx.stroke();
        }
        
        // Horizontal grid lines (every meter)
        for (let m = 0; m <= Math.ceil(truckWidthMeters); m++) {
          const y = CANVAS_PADDING + (m * scaleY);
          
          // Use darker lines for major intervals
          if (m % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa'; // Darker gray for major grid
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5'; // Light gray for minor grid
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(CANVAS_PADDING, y);
          ctx.lineTo(CANVAS_PADDING + truckLengthMeters * scaleX, y);
          ctx.stroke();
        }
      } else {
        // Draw 1-foot grid for imperial
        // Vertical grid lines (every foot)
        for (let ft = 0; ft <= Math.ceil(truckLengthFeet); ft++) {
          const x = CANVAS_PADDING + (ft * FEET_TO_METERS * scaleX);
          
          // Use darker lines for 5-foot intervals
          if (ft % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa'; // Darker gray for major grid
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5'; // Light gray for minor grid
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(x, CANVAS_PADDING);
          ctx.lineTo(x, CANVAS_PADDING + truckWidthMeters * scaleY);
          ctx.stroke();
        }
        
        // Horizontal grid lines (every foot)
        for (let ft = 0; ft <= Math.ceil(truckWidthFeet); ft++) {
          const y = CANVAS_PADDING + (ft * FEET_TO_METERS * scaleY);
          
          // Use darker lines for 5-foot intervals
          if (ft % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa'; // Darker gray for major grid
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5'; // Light gray for minor grid
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(CANVAS_PADDING, y);
          ctx.lineTo(CANVAS_PADDING + truckLengthMeters * scaleX, y);
          ctx.stroke();
        }
      }
    }
    
    // Draw container outline
    ctx.strokeStyle = COLORS.TRUCK_FRAME;
    ctx.lineWidth = 3;
    ctx.strokeRect(
      CANVAS_PADDING, 
      CANVAS_PADDING, 
      truckLengthMeters * scaleX, 
      truckWidthMeters * scaleY
    );
    
    // Draw rulers
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (useMetric) {
      // Draw horizontal ruler (length) in meters
      for (let m = 0; m <= Math.ceil(truckLengthMeters); m += GRID_MAJOR_INTERVAL) {
        const x = CANVAS_PADDING + (m * scaleX);
        
        // Draw tick
        ctx.beginPath();
        ctx.moveTo(x, CANVAS_PADDING - 5);
        ctx.lineTo(x, CANVAS_PADDING);
        ctx.stroke();
        
        // Draw meter marker
        ctx.fillText(`${m}m`, x, CANVAS_PADDING - 15);
      }
      
      // Draw vertical ruler (width) in meters
      for (let m = 0; m <= Math.ceil(truckWidthMeters); m += GRID_MAJOR_INTERVAL) {
        const y = CANVAS_PADDING + (m * scaleY);
        
        // Draw tick
        ctx.beginPath();
        ctx.moveTo(CANVAS_PADDING - 5, y);
        ctx.lineTo(CANVAS_PADDING, y);
        ctx.stroke();
        
        // Draw meter marker
        ctx.textAlign = 'right';
        ctx.fillText(`${m}m`, CANVAS_PADDING - 10, y);
      }
      
      // Add container label in meters
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `Container: ${truckLengthMeters.toFixed(1)}m × ${truckWidthMeters.toFixed(1)}m`,
        CANVAS_PADDING,
        10
      );
      
      // Add scale indicator
      ctx.textAlign = 'right';
      ctx.fillText(
        `1 square = 1 meter`,
        canvas.width - 10,
        10
      );
    } else {
      // Draw horizontal ruler (length) in feet
      for (let ft = 0; ft <= Math.ceil(truckLengthFeet); ft += GRID_MAJOR_INTERVAL) {
        const x = CANVAS_PADDING + (ft * FEET_TO_METERS * scaleX);
        
        // Draw tick
        ctx.beginPath();
        ctx.moveTo(x, CANVAS_PADDING - 5);
        ctx.lineTo(x, CANVAS_PADDING);
        ctx.stroke();
        
        // Draw foot marker
        ctx.fillText(`${ft}'`, x, CANVAS_PADDING - 15);
      }
      
      // Draw vertical ruler (width) in feet
      for (let ft = 0; ft <= Math.ceil(truckWidthFeet); ft += GRID_MAJOR_INTERVAL) {
        const y = CANVAS_PADDING + (ft * FEET_TO_METERS * scaleY);
        
        // Draw tick
        ctx.beginPath();
        ctx.moveTo(CANVAS_PADDING - 5, y);
        ctx.lineTo(CANVAS_PADDING, y);
        ctx.stroke();
        
        // Draw foot marker
        ctx.textAlign = 'right';
        ctx.fillText(`${ft}'`, CANVAS_PADDING - 10, y);
      }
      
      // Add container label in feet
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `53' × 9' Container (${truckLengthFeet.toFixed(1)}' × ${truckWidthFeet.toFixed(1)}')`,
        CANVAS_PADDING,
        10
      );
      
      // Add scale indicator
      ctx.textAlign = 'right';
      ctx.fillText(
        `1 square = 1 foot`,
        canvas.width - 10,
        10
      );
    }
    
    // Draw orientation indicators
    ctx.font = 'bold 14px Arial';
    
    // Update orientation labels based on new requirements
    // Front and Back on Left and Right
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('FRONT', CANVAS_PADDING - 25, CANVAS_PADDING + truckWidthMeters * scaleY / 2);
    
    ctx.textAlign = 'left';
    ctx.fillText('BACK', CANVAS_PADDING + truckLengthMeters * scaleX + 25, CANVAS_PADDING + truckWidthMeters * scaleY / 2);
    
    // Left at top, Right at bottom - SWAPPED as requested
    ctx.textAlign = 'center';
    ctx.fillText('LEFT', CANVAS_PADDING + truckLengthMeters * scaleX / 2, CANVAS_PADDING - 25);
    ctx.fillText('RIGHT', CANVAS_PADDING + truckLengthMeters * scaleX / 2, CANVAS_PADDING + truckWidthMeters * scaleY + 25);
    
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
        // Use colors from sequence palette for better distinction
        const colorIndex = index % COLORS.SEQUENCE.length;
        skidColor = COLORS.SEQUENCE[colorIndex];
      } else {
        // Use a fixed color based on skid properties
        skidColor = skid.isFragile ? COLORS.FRAGILE : (skid.isStackable ? COLORS.STACKABLE : COLORS.SKID);
      }
      
      // Apply gradient for better visual appeal
      const gradient = ctx.createLinearGradient(
        canvasX, 
        canvasY, 
        canvasX + skidLength * scaleX, 
        canvasY + skidWidth * scaleY
      );
      gradient.addColorStop(0, skidColor);
      gradient.addColorStop(1, adjustColor(skidColor, -20)); // Slightly darker variant
      
      // Draw skid rectangle with gradient fill
      ctx.fillStyle = gradient;
      ctx.fillRect(
        canvasX,
        canvasY,
        skidLength * scaleX,
        skidWidth * scaleY
      );
      
      // Add pattern for fragile items
      if (skid.isFragile) {
        drawFragilePattern(
          ctx, 
          canvasX, 
          canvasY, 
          skidLength * scaleX, 
          skidWidth * scaleY
        );
      }
      
      // Add stack indicator for stackable items
      if (skid.isStackable) {
        drawStackableIndicator(
          ctx, 
          canvasX, 
          canvasY, 
          skidLength * scaleX, 
          skidWidth * scaleY
        );
      }
      
      // Draw skid border (darker shade of the fill color)
      ctx.strokeStyle = adjustColor(skidColor, -40);
      ctx.lineWidth = skid.id === highlightedSkidId || skid === hoveredSkid ? 3 : 1;
      ctx.strokeRect(
        canvasX,
        canvasY,
        skidLength * scaleX,
        skidWidth * scaleY
      );
      
      // If highlighted or hovered, add glow effect
      if (skid.id === highlightedSkidId || skid === hoveredSkid) {
        ctx.strokeStyle = skid.id === highlightedSkidId ? '#ff9800' : '#4fc3f7';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          canvasX - 3,
          canvasY - 3,
          skidLength * scaleX + 6,
          skidWidth * scaleY + 6
        );
        ctx.setLineDash([]);
      }
      
      // Only show labels if enabled
      if (showLabels) {
        // Draw skid label
        ctx.fillStyle = '#000';
        ctx.font = `${LABEL_FONT_SIZE}px Arial`;
        
        // Position the label in the center of the skid
        const labelX = canvasX + (skidLength * scaleX / 2);
        const labelY = canvasY + (skidWidth * scaleY / 2) - 10;
        
        // Adjust text to fit within skid
        const maxTextWidth = Math.min(skidLength * scaleX - 10, 100);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Only draw label if skid is large enough
        if (skidLength * scaleX > 40 && skidWidth * scaleY > 25) {
          // Draw the label
          ctx.fillText(
            skid.label.length > 10 ? skid.label.substring(0, 10) + '...' : skid.label,
            labelX,
            labelY,
            maxTextWidth
          );
          
          // Draw dimensions based on unit system
          ctx.font = `${LABEL_FONT_SIZE - 2}px Arial`;
          if (useMetric) {
            ctx.fillText(
              `${skidWidth.toFixed(1)}m × ${skidLength.toFixed(1)}m`,
              labelX,
              labelY + 15,
              maxTextWidth
            );
          } else {
            ctx.fillText(
              `${(skidWidth * METERS_TO_FEET).toFixed(1)}' × ${(skidLength * METERS_TO_FEET).toFixed(1)}'`,
              labelX,
              labelY + 15,
              maxTextWidth
            );
          }
        }
      }
      
      // Draw loading sequence number if enabled
      if (showSequence) {
        ctx.font = `bold ${SEQUENCE_FONT_SIZE}px Arial`;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Draw sequence number in top-left corner
        const seqX = canvasX + 5;
        const seqY = canvasY + 5;
        
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
      
      // Draw priority indicator in the bottom-right corner
      const priorityX = canvasX + skidLength * scaleX - 15;
      const priorityY = canvasY + skidWidth * scaleY - 15;
      
      // Draw priority circle
      ctx.beginPath();
      ctx.arc(priorityX, priorityY, 10, 0, Math.PI * 2);
      ctx.fillStyle = getPriorityColor(skid.priority);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw priority number
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        skid.priority.toString(),
        priorityX,
        priorityY
      );
    });
    
    // Draw compass rose in the bottom-right corner
    drawCompassRose(
      ctx, 
      canvas.width - 50, 
      canvas.height - 50, 
      30
    );
    
  }, [
    sortedSkids, 
    truckLengthMeters, 
    truckWidthMeters, 
    truckLengthFeet, 
    truckWidthFeet,
    showSequence, 
    showGrid, 
    showLabels, 
    highlightedSkidId, 
    hoveredSkid,
    useMetric,
    GRID_MAJOR_INTERVAL
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={400}
      style={{ 
        border: '1px solid #ddd', 
        borderRadius: 4,
        backgroundColor: '#f9f9f9',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

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

// Helper function to draw fragile pattern
function drawFragilePattern(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): void {
  const spacing = 15;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  
  // Draw diagonal lines
  for (let i = -height; i < width + height; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + height, y + height);
    ctx.stroke();
  }
}

// Helper function to draw stackable indicator
function drawStackableIndicator(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): void {
  const margin = 5;
  const iconSize = 15;
  
  // Only draw if there's enough space
  if (width < iconSize * 2 || height < iconSize * 2) return;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  
  // Draw stacked rectangles icon in top-right corner
  const iconX = x + width - iconSize - margin;
  const iconY = y + margin;
  
  // Bottom rectangle
  ctx.fillRect(iconX, iconY + 5, iconSize - 2, iconSize - 5);
  ctx.strokeRect(iconX, iconY + 5, iconSize - 2, iconSize - 5);
  
  // Top rectangle
  ctx.fillRect(iconX + 2, iconY, iconSize - 2, iconSize - 5);
  ctx.strokeRect(iconX + 2, iconY, iconSize - 2, iconSize - 5);
}

// Helper function to get priority color
function getPriorityColor(priority: number): string {
  const colors = [
    '#e53935', // Priority 1 - Red
    '#ff9800', // Priority 2 - Orange
    '#ffeb3b', // Priority 3 - Yellow
    '#4caf50', // Priority 4 - Green
    '#2196f3', // Priority 5 - Blue
    '#9c27b0', // Priority 6+ - Purple
  ];
  
  return priority > 0 && priority <= colors.length 
    ? colors[priority - 1] 
    : colors[colors.length - 1];
}

// Helper function to draw compass rose
function drawCompassRose(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number
): void {
  const halfSize = size / 2;
  
  // Draw circle
  ctx.beginPath();
  ctx.arc(x, y, halfSize, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw North pointer
  ctx.beginPath();
  ctx.moveTo(x, y - halfSize + 5);
  ctx.lineTo(x - 5, y);
  ctx.lineTo(x + 5, y);
  ctx.closePath();
  ctx.fillStyle = '#e53935'; // Red for North
  ctx.fill();
  ctx.stroke();
  
  // Draw direction labels
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  
  ctx.fillText('N', x, y - halfSize + 10);
  ctx.fillText('S', x, y + halfSize - 10);
  ctx.fillText('E', x + halfSize - 10, y);
  ctx.fillText('W', x - halfSize + 10, y);
}

export default ContainerCanvas; 