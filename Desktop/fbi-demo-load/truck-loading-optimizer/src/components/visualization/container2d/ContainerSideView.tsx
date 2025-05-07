import React, { useRef, useEffect, useState } from 'react';
import { Skid, TruckDimensions } from '../../../models/types';
import { COLORS } from '../../../utils/constants';

// Conversion constants
const METERS_TO_FEET = 3.28084;
const FEET_TO_METERS = 0.3048;

interface ContainerSideViewProps {
  loadedSkids: Skid[];
  truckDimensions: TruckDimensions;
  showSequence?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  highlightedSkidId?: string | null;
  zoomLevel?: number;
  onSkidClick?: (skid: Skid) => void;
  useMetric?: boolean;
  viewSide?: 'left' | 'right';
}

const ContainerSideView: React.FC<ContainerSideViewProps> = ({
  loadedSkids,
  truckDimensions,
  showSequence = true,
  showGrid = true,
  showLabels = true,
  highlightedSkidId = null,
  zoomLevel = 1,
  onSkidClick,
  useMetric = false,
  viewSide = 'left'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSkid, setHoveredSkid] = useState<Skid | null>(null);
  
  // Constants for visualization
  const CANVAS_PADDING = 50;
  const LABEL_FONT_SIZE = 12;
  const SEQUENCE_FONT_SIZE = 14;
  const GRID_MAJOR_INTERVAL = useMetric ? 1 : 5; // 5-foot or 1-meter intervals for major grid lines
  
  // Convert truck dimensions from meters to feet/meters for display
  const truckLengthMeters = truckDimensions.insideLength || truckDimensions.length * 0.95;
  const truckHeightMeters = truckDimensions.insideHeight || truckDimensions.height * 0.95;
  
  // Convert to feet for display if needed
  const truckLengthFeet = truckLengthMeters * METERS_TO_FEET;
  const truckHeightFeet = truckHeightMeters * METERS_TO_FEET;
  
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

  // Main drawing function for side view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Make canvas full width of its container
    const parentWidth = canvas.parentElement?.clientWidth || 800;
    canvas.width = parentWidth;
    canvas.height = 200; // Fixed height for side view
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set the scale for visualization
    // For side view, we map differently based on which side we're viewing from
    // Left side view: We see width (X) and height (Y)
    // Right side view: We see width (X) and height (Y) from opposite side
    
    // Get truck dimensions
    const truckWidthMeters = truckDimensions.insideWidth || truckDimensions.width * 0.95;
    
    // For both side views, we map width and height
    const scaleX = (canvas.width - CANVAS_PADDING * 2) / truckLengthMeters;
    const scaleY = (canvas.height - CANVAS_PADDING * 2) / truckHeightMeters;
    
    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e5e5e5'; // Light gray for minor grid
      ctx.lineWidth = 0.5;
      
      if (useMetric) {
        // Draw vertical grid lines (every meter)
        for (let m = 0; m <= Math.ceil(truckLengthMeters); m++) {
          const x = CANVAS_PADDING + (m * scaleX);
          
          // Use darker lines for major intervals
          if (m % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5';
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(x, CANVAS_PADDING);
          ctx.lineTo(x, CANVAS_PADDING + truckHeightMeters * scaleY);
          ctx.stroke();
        }
        
        // Draw horizontal grid lines (every meter)
        for (let m = 0; m <= Math.ceil(truckHeightMeters); m++) {
          const y = CANVAS_PADDING + (m * scaleY);
          
          if (m % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5';
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(CANVAS_PADDING, y);
          ctx.lineTo(CANVAS_PADDING + truckLengthMeters * scaleX, y);
          ctx.stroke();
        }
      } else {
        // Imperial units (feet)
        // Draw vertical grid lines (every foot)
        for (let ft = 0; ft <= Math.ceil(truckLengthFeet); ft++) {
          const x = CANVAS_PADDING + (ft * FEET_TO_METERS * scaleX);
          
          if (ft % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5';
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(x, CANVAS_PADDING);
          ctx.lineTo(x, CANVAS_PADDING + truckHeightMeters * scaleY);
          ctx.stroke();
        }
        
        // Draw horizontal grid lines (every foot)
        for (let ft = 0; ft <= Math.ceil(truckHeightFeet); ft++) {
          const y = CANVAS_PADDING + (ft * FEET_TO_METERS * scaleY);
          
          if (ft % GRID_MAJOR_INTERVAL === 0) {
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = '#e5e5e5';
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
      truckHeightMeters * scaleY
    );
    
    // Draw labels for container dimensions
    if (showLabels) {
      ctx.font = `${LABEL_FONT_SIZE}px Arial`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      
      // Draw length label at bottom (which is actually the length for side views)
      const lengthText = useMetric 
        ? `${truckLengthMeters.toFixed(1)}m`
        : `${truckLengthFeet.toFixed(1)}'`;
      ctx.fillText(
        lengthText, 
        CANVAS_PADDING + (truckLengthMeters * scaleX) / 2, 
        CANVAS_PADDING + truckHeightMeters * scaleY + 20
      );
      
      // Draw height label on the side
      const heightText = useMetric 
        ? `${truckHeightMeters.toFixed(1)}m`
        : `${truckHeightFeet.toFixed(1)}'`;
      ctx.save();
      ctx.translate(CANVAS_PADDING - 20, CANVAS_PADDING + (truckHeightMeters * scaleY) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(heightText, 0, 0);
      ctx.restore();
    }
    
    // For side views, we show a different projection:
    // - Left side: Looking at the container from the left side (X = Z, Y = Y)
    // - Right side: Looking at the container from the right side (X = length - Z, Y = Y)
    
    // Filter skids based on viewSide - only show skids on the respective side
    const containerWidthMeters = truckDimensions.insideWidth || truckDimensions.width * 0.95;
    const midPointX = containerWidthMeters / 2;
    
    const filteredSkids = viewSide === 'left'
      ? sortedSkids.filter(skid => skid.position && skid.position.x < midPointX)
      : sortedSkids.filter(skid => skid.position && skid.position.x >= midPointX);
    
    // Draw skids on side view
    filteredSkids.forEach((skid, index) => {
      if (!skid.position) return;
      
      const { z, y: skidY } = skid.position;
      const skidHeight = skid.height || 1.2; // Default height if not specified
      
      // In the side view, the X coordinate depends on which side we're viewing from
      let skidX;
      if (viewSide === 'left') {
        skidX = z; // From left side, we see skids positioned by their Z coordinate
      } else {
        skidX = truckLengthMeters - z - (skid.position.rotation === 0 || skid.position.rotation === 180 
          ? skid.length 
          : skid.width); // From right side, we need to invert the Z coordinate
      }
      
      // Calculate position on canvas
      // Important change: Position Y from the bottom of the container instead of from the top
      // This means we need to invert the Y coordinate relative to the container height
      const canvasX = CANVAS_PADDING + skidX * scaleX;
      
      // Determine dimensions based on skid orientation
      const skidLengthMeters = skid.position.rotation === 0 || skid.position.rotation === 180 
        ? skid.length 
        : skid.width;
      
      const skidLengthCanvas = skidLengthMeters * scaleX;
      const skidHeightCanvas = skidHeight * scaleY;
      
      // Calculate Y position from the bottom of the container
      // First, get the bottom of the container in canvas coordinates
      const containerBottomY = CANVAS_PADDING + truckHeightMeters * scaleY;
      // Then position the skid Y relative to the bottom, going upward
      const canvasY = containerBottomY - skidHeightCanvas - (skidY * scaleY);
      
      // Determine skid color based on highlighting or sequence
      let fillColor = getSkidColor(skid, index);
      
      // Highlight the selected skid
      if (highlightedSkidId === skid.id || hoveredSkid?.id === skid.id) {
        fillColor = adjustColor(fillColor, 30); // Brighten color
        ctx.strokeStyle = '#ff0000'; // Red outline for highlighted skid
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
      }
      
      // Draw the skid rectangle
      ctx.fillStyle = fillColor;
      ctx.fillRect(canvasX, canvasY, skidLengthCanvas, skidHeightCanvas);
      ctx.strokeRect(canvasX, canvasY, skidLengthCanvas, skidHeightCanvas);
      
      // Draw height measurement lines and labels
      const showDetailedMeasurements = zoomLevel >= 1.0; // Only show detailed measurements at sufficient zoom
      
      if (showDetailedMeasurements) {
        // Draw height measurement line
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]); // Dashed line for measurement

        // Draw height measurement line on the right side of the skid
        const measureX = canvasX + skidLengthCanvas + 10;
        ctx.beginPath();
        ctx.moveTo(measureX, canvasY);
        ctx.lineTo(measureX, canvasY + skidHeightCanvas);
        ctx.stroke();
        
        // Draw small horizontal ticks at top and bottom
        ctx.beginPath();
        ctx.moveTo(measureX - 3, canvasY);
        ctx.lineTo(measureX + 3, canvasY);
        ctx.moveTo(measureX - 3, canvasY + skidHeightCanvas);
        ctx.lineTo(measureX + 3, canvasY + skidHeightCanvas);
        ctx.stroke();
        
        // Reset line dash
        ctx.setLineDash([]);
        
        // Draw height measurement text
        ctx.font = `${LABEL_FONT_SIZE - 2}px Arial`;
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Format height with units and precision
        const heightDisplay = useMetric 
          ? `${skidHeight.toFixed(2)}m`
          : `${(skidHeight * METERS_TO_FEET).toFixed(1)}'`;
        
        // Add tolerance range (±1cm or ±0.5in)
        const toleranceDisplay = useMetric 
          ? `±1cm` 
          : `±0.5"`;
        
        // Draw height text
        ctx.fillText(
          heightDisplay, 
          measureX + 5,
          canvasY + skidHeightCanvas/2
        );
        
        // Draw tolerance text
        ctx.font = `${LABEL_FONT_SIZE - 4}px Arial`;
        ctx.fillText(
          toleranceDisplay,
          measureX + 5,
          canvasY + skidHeightCanvas/2 + 12
        );
        
        // Draw timestamp (just for display purposes in this prototype)
        const currentDate = new Date();
        const timestamp = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        ctx.font = `${LABEL_FONT_SIZE - 4}px Arial`;
        ctx.fillStyle = '#999999';
        ctx.fillText(
          timestamp,
          canvasX + 5,
          canvasY + skidHeightCanvas - 5
        );
      }
      
      // Draw labels if enabled
      if (showLabels) {
        ctx.font = `${LABEL_FONT_SIZE}px Arial`;
        ctx.fillStyle = getContrastTextColor(fillColor);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Show skid ID if label is space allows
        if (skidLengthCanvas > 30 && skidHeightCanvas > 15) {
          ctx.fillText(
            skid.id.substring(0, 8), 
            canvasX + skidLengthCanvas / 2, 
            canvasY + skidHeightCanvas / 2
          );
        }
      }
      
      // Draw sequence number if enabled
      if (showSequence) {
        ctx.font = `bold ${SEQUENCE_FONT_SIZE}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw circle for sequence number
        const circleRadius = 12;
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(canvasX + 15, canvasY + 15, circleRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw sequence number
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          (index + 1).toString(), 
          canvasX + 15, 
          canvasY + 15
        );
      }
      
      // Draw properties indicators (fragile, stackable)
      if (skid.isFragile && skidLengthCanvas > 40 && skidHeightCanvas > 30) {
        drawFragilePattern(ctx, canvasX, canvasY, skidLengthCanvas, skidHeightCanvas);
      }
      
      // Draw improved stackability indicator with additional data
      if (skid.isStackable && skidLengthCanvas > 40 && skidHeightCanvas > 30) {
        drawEnhancedStackableIndicator(ctx, canvasX, canvasY, skidLengthCanvas, skidHeightCanvas);
        
        // Draw top surface profile indicator (for stackability assessment)
        drawSurfaceProfile(ctx, canvasX, canvasY, skidLengthCanvas, skidHeightCanvas, 'top');
        
        // Draw bottom surface profile indicator (for stackability assessment)
        drawSurfaceProfile(ctx, canvasX, canvasY, skidLengthCanvas, skidHeightCanvas, 'bottom');
        
        // Draw stacking contact points
        drawStackingContactPoints(ctx, canvasX, canvasY, skidLengthCanvas, skidHeightCanvas);
      } else if (skidLengthCanvas > 40 && skidHeightCanvas > 30) {
        // Draw non-stackable indicator
        drawNonStackableIndicator(ctx, canvasX, canvasY, skidLengthCanvas, skidHeightCanvas);
      }
    });
    
    // Draw a label indicating which side view this is
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `${viewSide.charAt(0).toUpperCase() + viewSide.slice(1)} Side View`, 
      Number(CANVAS_PADDING), 
      10
    );

  }, [
    loadedSkids, 
    truckLengthMeters, 
    truckHeightMeters, 
    showGrid, 
    showLabels, 
    showSequence, 
    highlightedSkidId, 
    hoveredSkid, 
    zoomLevel, 
    useMetric,
    viewSide
  ]);

  // Update handle click logic to also work with the updated rendering
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSkidClick) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert canvas coordinates to truck coordinates
    const scaleX = (canvas.width - CANVAS_PADDING * 2) / truckLengthMeters;
    const scaleY = (canvas.height - CANVAS_PADDING * 2) / truckHeightMeters;
    
    // Filter skids based on viewSide - only check skids on the respective side
    const containerWidthMeters = truckDimensions.insideWidth || truckDimensions.width * 0.95;
    const midPointX = containerWidthMeters / 2;
    
    const filteredSkids = viewSide === 'left'
      ? sortedSkids.filter(skid => skid.position && skid.position.x < midPointX)
      : sortedSkids.filter(skid => skid.position && skid.position.x >= midPointX);
    
    // Check each skid to see if it was clicked
    for (const skid of filteredSkids) {
      if (!skid.position) continue;
      
      const { z, y: skidY } = skid.position;
      const skidHeight = skid.height || 1.2; // Default height if not specified
      
      // Calculate skid X position based on the view
      let skidX;
      if (viewSide === 'left') {
        skidX = z;
      } else {
        skidX = truckLengthMeters - z - (skid.position.rotation === 0 || skid.position.rotation === 180 
          ? skid.length 
          : skid.width);
      }
      
      // Determine dimensions based on skid orientation
      const skidLengthMeters = skid.position.rotation === 0 || skid.position.rotation === 180 
        ? skid.length 
        : skid.width;
      
      const skidLengthCanvas = skidLengthMeters * scaleX;
      const skidHeightCanvas = skidHeight * scaleY;
      
      // Calculate position on canvas (using bottom-up positioning to match rendering)
      const canvasX = CANVAS_PADDING + skidX * scaleX;
      
      // Calculate Y position from the bottom of the container
      const containerBottomY = CANVAS_PADDING + truckHeightMeters * scaleY;
      const canvasY = containerBottomY - skidHeightCanvas - (skidY * scaleY);
      
      // Check if click is inside this skid
      if (
        x >= canvasX && 
        x <= canvasX + skidLengthCanvas && 
        y >= canvasY && 
        y <= canvasY + skidHeightCanvas
      ) {
        onSkidClick(skid);
        break;
      }
    }
  };

  // Don't forget to return the canvas element
  return (
    <canvas 
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{ 
        maxWidth: '100%',
        height: 'auto',
        cursor: hoveredSkid ? 'pointer' : 'default'
      }}
    />
  );
};

// Helper function to get skid color based on sequence
function getSkidColor(skid: Skid, index: number): string {
  // Generate color based on priority or sequence index
  const colors = [
    '#4dabf7', // blue
    '#51cf66', // green
    '#fcc419', // yellow
    '#ff6b6b', // red
    '#cc5de8', // purple
    '#ff922b', // orange
    '#20c997', // teal
    '#868e96', // gray
  ];
  
  // Use priority if available (1=high, 2=medium, 3=low)
  if (skid.priority) {
    // High priority (1) - bright red
    if (skid.priority === 1) return '#e63946'; 
    // Medium priority (2) - vibrant orange
    if (skid.priority === 2) return '#ff9500'; 
    // Low priority (3) - yellow
    if (skid.priority === 3) return '#ffcd00'; 
    // Any other priority values - light blue
    return '#4361ee';
  }
  
  // For non-priority skids, use muted colors to create visual distinction
  return '#a0a0a0'; // Gray for all non-priority skids
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  return color;
}

// Helper function to get contrasting text color
function getContrastTextColor(hexColor: string): string {
  // Simple algorithm to determine if text should be black or white based on background
  if (!hexColor.startsWith('#')) return '#000000';
  
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calculate luminance - higher means lighter color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Helper function to draw fragile pattern
function drawFragilePattern(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): void {
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
  ctx.lineWidth = 1;
  
  // Draw diagonal lines
  for (let i = 0; i < width + height; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + Math.min(i, width), y);
    ctx.lineTo(x, y + Math.min(i, height));
    ctx.stroke();
  }
}

// Helper function to draw enhanced stackable indicator with additional data
function drawEnhancedStackableIndicator(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): void {
  const iconSize = Math.min(width / 4, height / 4, 20);
  const padding = 5;
  
  // Draw green stacking icon background for stackable items
  ctx.fillStyle = 'rgba(0, 150, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(
    x + width - iconSize - padding, 
    y + padding + iconSize/2, 
    iconSize/2 + 2, 
    0, 
    2 * Math.PI
  );
  ctx.fill();
  
  // Draw two stacked rectangles
  const rectWidth = iconSize * 0.8;
  const rectHeight = iconSize * 0.4;
  
  // White rectangles for contrast
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
  // Bottom rectangle
  ctx.fillRect(
    x + width - iconSize - padding - rectWidth/2 + 2,
    y + padding + iconSize/2,
    rectWidth,
    rectHeight
  );
  
  // Top rectangle (slightly offset)
  ctx.fillRect(
    x + width - iconSize - padding - rectWidth/2 - 2,
    y + padding + iconSize/2 - rectHeight,
    rectWidth,
    rectHeight
  );
}

// Helper function to draw non-stackable indicator
function drawNonStackableIndicator(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): void {
  const iconSize = Math.min(width / 4, height / 4, 20);
  const padding = 5;
  
  // Draw red circle background for non-stackable items
  ctx.fillStyle = 'rgba(200, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(
    x + width - iconSize - padding, 
    y + padding + iconSize/2, 
    iconSize/2 + 2, 
    0, 
    2 * Math.PI
  );
  ctx.fill();
  
  // Draw white "no stacking" symbol
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  
  // Draw circle with diagonal line (prohibition symbol)
  ctx.beginPath();
  ctx.arc(
    x + width - iconSize - padding, 
    y + padding + iconSize/2, 
    iconSize/2 - 2, 
    0, 
    2 * Math.PI
  );
  ctx.moveTo(
    x + width - iconSize - padding - iconSize/2 + 3, 
    y + padding + iconSize
  );
  ctx.lineTo(
    x + width - iconSize - padding + iconSize/2 - 3, 
    y + padding
  );
  ctx.stroke();
}

// Helper function to draw surface profile (top or bottom)
function drawSurfaceProfile(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number,
  surface: 'top' | 'bottom'
): void {
  // Only draw if we have sufficient space
  if (width < 60 || height < 20) return;
  
  const isTop = surface === 'top';
  const surfaceY = isTop ? y : y + height - 4;
  
  ctx.strokeStyle = isTop ? 'rgba(0, 100, 200, 0.7)' : 'rgba(100, 50, 0, 0.7)';
  ctx.lineWidth = 1.5;
  
  // Draw surface profile line
  ctx.beginPath();
  ctx.moveTo(x + 5, surfaceY);
  
  // Generate a simple surface profile (in a real system, this would be based on actual measurements)
  const segments = 5;
  const segmentWidth = (width - 10) / segments;
  
  for (let i = 1; i <= segments; i++) {
    const deviation = Math.sin(i * 1.5) * 2; // Small variations in surface profile
    ctx.lineTo(x + 5 + i * segmentWidth, surfaceY + deviation);
  }
  
  ctx.stroke();
  
  // Add a tiny label
  ctx.font = '8px Arial';
  ctx.fillStyle = ctx.strokeStyle;
  ctx.textAlign = 'left';
  ctx.fillText(
    isTop ? 'Top' : 'Base', 
    x + 6, 
    surfaceY + (isTop ? -3 : 8)
  );
}

// Helper function to draw stacking contact points
function drawStackingContactPoints(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): void {
  // Only draw if we have sufficient space
  if (width < 80 || height < 30) return;
  
  // Draw contact points at key locations
  const contactPoints = [
    { x: x + 10, y: y },
    { x: x + width - 10, y: y },
    { x: x + width/2, y: y }
  ];
  
  ctx.fillStyle = 'rgba(0, 150, 0, 0.7)';
  
  contactPoints.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw tiny down arrow below each contact point
    ctx.beginPath();
    ctx.moveTo(point.x, point.y - 6);
    ctx.lineTo(point.x - 3, point.y - 10);
    ctx.lineTo(point.x + 3, point.y - 10);
    ctx.closePath();
    ctx.fill();
  });
}

export default ContainerSideView; 