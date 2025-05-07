import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Paper, IconButton, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Rotate90DegreesCcw as RotateIcon,
  GridOn as GridIcon,
  GridOff as GridOffIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { StandardSkid, PlacedSkid, STANDARD_CONTAINER } from '../../models/placedSkid';
import { v4 as uuidv4 } from 'uuid';

// Constants for the container visualization
const CONTAINER_WIDTH = STANDARD_CONTAINER.width;
const CONTAINER_LENGTH = STANDARD_CONTAINER.length;
const PADDING = 20;
const GRID_SIZE = 12; // Inches per grid
const DEFAULT_ZOOM = 0.9;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

// Constants for the container dimensions in inches
const CONTAINER_LENGTH_INCHES = 636; // 53 feet
const CONTAINER_WIDTH_INCHES = 108; // 9 feet

// Constants for visualization
const METERS_TO_INCHES = 39.3701;
const GRID_INTERVAL_FEET = 5; // Grid lines every 5 feet
const GRID_INTERVAL_INCHES = GRID_INTERVAL_FEET * 12;

// Define styles with explicit typing to avoid complex union types
const styles: Record<string, React.CSSProperties> = {
  mainBox: {
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%'
  },
  headerBox: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16
  },
  containerBox: {
    flex: 1, 
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #ced4da',
    borderRadius: 4,
    backgroundColor: '#f8f9fa'
  },
  zoomBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transformOrigin: 'center center',
    transition: 'transform 0.2s ease-out'
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%'
  }
};

export interface Container2DOptimizerRef {
  addSkid: (skid: StandardSkid) => void;
  rotateSkid: (skidId: string) => void;
  removeSkid: (skidId: string) => void;
  clearAllSkids: () => void;
  getPlacedSkids: () => PlacedSkid[];
  optimizeLayout: (settings: any) => void;
}

interface Container2DOptimizerProps {
  onSkidSelect?: (skidId: string | null) => void;
  onSkidUpdate?: (skid: PlacedSkid) => void;
  onLayoutChange?: (skids: PlacedSkid[]) => void;
  onSpaceUtilization?: (percentage: number) => void;
}

const Container2DOptimizer = forwardRef<Container2DOptimizerRef, Container2DOptimizerProps>((props, ref) => {
  const { onSkidSelect, onSkidUpdate, onLayoutChange, onSpaceUtilization } = props;
  
  // State for placed skids, selected skid, and dragging
  const [placedSkids, setPlacedSkids] = useState<PlacedSkid[]>([]);
  const [selectedSkidId, setSelectedSkidId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'solid'>('grid');
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [spaceUtilization, setSpaceUtilization] = useState(0);
  
  // Refs for container element and canvas
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handler for adding a skid
  const handleAddSkid = (skid: StandardSkid) => {
    const newSkid: PlacedSkid = {
      ...skid,
      id: `${skid.id}-${uuidv4().substring(0, 8)}`,
      x: PADDING,
      y: PADDING,
      rotation: 0,
      zIndex: placedSkids.length
    };
    
    setPlacedSkids(prev => [...prev, newSkid]);
    if (onLayoutChange) {
      onLayoutChange([...placedSkids, newSkid]);
    }
    calculateSpaceUtilization([...placedSkids, newSkid]);
  };
  
  // Handler for rotating a skid
  const handleRotateSkid = (skidId: string) => {
    setPlacedSkids(prev => 
      prev.map(skid => 
        skid.id === skidId
          ? { ...skid, rotation: ((skid.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : skid
      )
    );
    
    if (selectedSkidId === skidId && onSkidUpdate) {
      const updatedSkid = placedSkids.find(s => s.id === skidId);
      if (updatedSkid) {
        onSkidUpdate({
          ...updatedSkid,
          rotation: ((updatedSkid.rotation + 90) % 360) as 0 | 90 | 180 | 270
        });
      }
    }
    
    if (onLayoutChange) {
      onLayoutChange(placedSkids.map(skid => 
        skid.id === skidId
          ? { ...skid, rotation: ((skid.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : skid
      ));
    }
    
    calculateSpaceUtilization(placedSkids);
  };
  
  // Handler for removing a skid
  const handleRemoveSkid = (skidId: string) => {
    setPlacedSkids(prev => prev.filter(skid => skid.id !== skidId));
    
    if (selectedSkidId === skidId) {
      setSelectedSkidId(null);
      if (onSkidSelect) {
        onSkidSelect(null);
      }
    }
    
    if (onLayoutChange) {
      onLayoutChange(placedSkids.filter(skid => skid.id !== skidId));
    }
    
    calculateSpaceUtilization(placedSkids.filter(skid => skid.id !== skidId));
  };
  
  // Handler for clearing all skids
  const handleClearAllSkids = () => {
    setPlacedSkids([]);
    setSelectedSkidId(null);
    
    if (onSkidSelect) {
      onSkidSelect(null);
    }
    
    if (onLayoutChange) {
      onLayoutChange([]);
    }
    
    setSpaceUtilization(0);
    if (onSpaceUtilization) {
      onSpaceUtilization(0);
    }
  };
  
  // Function to optimize layout based on settings
  const optimizeLayout = (settings: any) => {
    // This would be replaced with actual optimization algorithm
    console.log('Optimizing layout with settings:', settings);
    
    // For now, just arrange skids in rows as a simple example
    const optimizedSkids = [...placedSkids];
    let currentX = PADDING;
    let currentY = PADDING;
    let rowHeight = 0;
    
    optimizedSkids.forEach((skid, index) => {
      // Determine dimensions based on rotation
      const skidWidth = skid.rotation === 90 || skid.rotation === 270 ? skid.length : skid.width;
      const skidLength = skid.rotation === 90 || skid.rotation === 270 ? skid.width : skid.length;
      
      // Check if we need to move to next row
      if (currentX + skidWidth + PADDING > CONTAINER_WIDTH) {
        currentX = PADDING;
        currentY += rowHeight + PADDING;
        rowHeight = 0;
      }
      
      // Update skid position
      skid.x = currentX;
      skid.y = currentY;
      
      // Move currentX for next skid
      currentX += skidWidth + PADDING;
      rowHeight = Math.max(rowHeight, skidLength);
    });
    
    setPlacedSkids(optimizedSkids);
    
    if (onLayoutChange) {
      onLayoutChange(optimizedSkids);
    }
    
    calculateSpaceUtilization(optimizedSkids);
  };
  
  // Calculate space utilization
  const calculateSpaceUtilization = (skids: PlacedSkid[]) => {
    const containerArea = CONTAINER_WIDTH * CONTAINER_LENGTH;
    let occupiedArea = 0;
    
    skids.forEach(skid => {
      const skidWidth = skid.rotation === 90 || skid.rotation === 270 ? skid.length : skid.width;
      const skidLength = skid.rotation === 90 || skid.rotation === 270 ? skid.width : skid.length;
      occupiedArea += skidWidth * skidLength;
    });
    
    const utilization = Math.round((occupiedArea / containerArea) * 100);
    setSpaceUtilization(utilization);
    
    if (onSpaceUtilization) {
      onSpaceUtilization(utilization);
    }
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addSkid: handleAddSkid,
    rotateSkid: handleRotateSkid,
    removeSkid: handleRemoveSkid,
    clearAllSkids: handleClearAllSkids,
    getPlacedSkids: () => placedSkids,
    optimizeLayout
  }));
  
  // Mouse event handlers for dragging skids
  const handleMouseDown = (e: React.MouseEvent, skidId: string) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const skid = placedSkids.find(s => s.id === skidId);
    
    if (skid) {
      setSelectedSkidId(skidId);
      setIsDragging(true);
      
      // Calculate offset from mouse to skid origin
      setDragOffset({
        x: (e.clientX - containerRect.left) / zoomLevel - skid.x,
        y: (e.clientY - containerRect.top) / zoomLevel - skid.y
      });
      
      if (onSkidSelect) {
        onSkidSelect(skidId);
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !selectedSkidId) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate new position with boundaries
    const newX = Math.max(
      PADDING,
      Math.min(
        (e.clientX - containerRect.left) / zoomLevel - dragOffset.x,
        CONTAINER_WIDTH - PADDING
      )
    );
    
    const newY = Math.max(
      PADDING,
      Math.min(
        (e.clientY - containerRect.top) / zoomLevel - dragOffset.y,
        CONTAINER_LENGTH - PADDING
      )
    );
    
    setPlacedSkids(prev => 
      prev.map(skid => 
        skid.id === selectedSkidId
          ? { ...skid, x: newX, y: newY }
          : skid
      )
    );
  };
  
  const handleMouseUp = () => {
    if (isDragging && selectedSkidId) {
      setIsDragging(false);
      
      // Update skid
      const updatedSkid = placedSkids.find(s => s.id === selectedSkidId);
      if (updatedSkid && onSkidUpdate) {
        onSkidUpdate(updatedSkid);
      }
      
      // Notify layout change
      if (onLayoutChange) {
        onLayoutChange(placedSkids);
      }
      
      calculateSpaceUtilization(placedSkids);
    }
  };
  
  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };
  
  // Toggle view mode (grid vs solid)
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'grid' | 'solid' | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Draw container and skids on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = CONTAINER_WIDTH;
    canvas.height = CONTAINER_LENGTH;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (viewMode === 'grid') {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      
      // Draw vertical grid lines
      for (let x = 0; x <= CONTAINER_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CONTAINER_LENGTH);
        ctx.stroke();
      }
      
      // Draw horizontal grid lines
      for (let y = 0; y <= CONTAINER_LENGTH; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CONTAINER_WIDTH, y);
        ctx.stroke();
      }
    }
    
    // Draw container border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CONTAINER_WIDTH, CONTAINER_LENGTH);
    
    // Sort skids by zIndex
    const sortedSkids = [...placedSkids].sort((a, b) => a.zIndex - b.zIndex);
    
    // Draw skids
    sortedSkids.forEach(skid => {
      ctx.save();
      
      // Translate to skid position
      ctx.translate(skid.x, skid.y);
      
      // Rotate if needed
      if (skid.rotation) {
        const skidWidth = skid.rotation === 90 || skid.rotation === 270 ? skid.length : skid.width;
        const skidLength = skid.rotation === 90 || skid.rotation === 270 ? skid.width : skid.length;
        
        // Rotate around center
        ctx.translate(skidWidth / 2, skidLength / 2);
        ctx.rotate((skid.rotation * Math.PI) / 180);
        ctx.translate(-skidWidth / 2, -skidLength / 2);
      }
      
      // Get dimensions based on rotation
      const width = skid.rotation === 90 || skid.rotation === 270 ? skid.length : skid.width;
      const height = skid.rotation === 90 || skid.rotation === 270 ? skid.width : skid.length;
      
      // Draw skid background
      ctx.fillStyle = skid.color || '#4dabf7';
      ctx.fillRect(0, 0, width, height);
      
      // Draw border (thicker if selected)
      ctx.strokeStyle = skid.id === selectedSkidId ? '#ff4081' : '#000000';
      ctx.lineWidth = skid.id === selectedSkidId ? 3 : 1;
      ctx.strokeRect(0, 0, width, height);
      
      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(skid.label, width / 2, height / 2);
      
      // Draw dimensions
      ctx.font = '10px Arial';
      ctx.fillText(`${width}" × ${height}"`, width / 2, height / 2 + 15);
      
      ctx.restore();
    });
  }, [placedSkids, selectedSkidId, viewMode, zoomLevel]);
  
  // Define styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  };
  
  const toolbarStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#f5f5f5'
  };
  
  const canvasContainerStyles: React.CSSProperties = {
    position: 'relative',
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  };
  
  const canvasWrapperStyles: React.CSSProperties = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'center',
    transition: 'transform 0.2s',
    cursor: isDragging ? 'grabbing' : 'grab'
  };
  
  const utilizationStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center'
  };
  
  const textStyle: React.CSSProperties = {
    marginRight: 8
  };
  
  const zoomControlsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  };

  const flexBoxStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px'
  };

  const paperStyle: React.CSSProperties = { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    overflow: 'hidden' 
  };

  const skidActionButtonStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    marginBottom: 4
  };

  const skidRemoveButtonStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid #ccc'
  };

  const skidActionsBoxStyle = (isSelected: boolean): React.CSSProperties => ({
    position: 'absolute' as React.CSSProperties['position'],
    right: -20,
    top: 0,
    display: isSelected ? 'flex' : 'none',
    flexDirection: 'column' as React.CSSProperties['flexDirection']
  });

  const skidDivStyle = (skid: PlacedSkid): React.CSSProperties => {
    const width = skid.rotation === 90 || skid.rotation === 270 ? skid.length : skid.width;
    const height = skid.rotation === 90 || skid.rotation === 270 ? skid.width : skid.length;
    
    return {
      position: 'absolute' as React.CSSProperties['position'],
      left: `${skid.x}px`,
      top: `${skid.y}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `rotate(${skid.rotation}deg)`,
      transformOrigin: 'top left',
      cursor: 'grab',
      zIndex: 1000 + skid.zIndex
    };
  };

  return (
    <Paper 
      style={paperStyle}
      elevation={2}
    >
      <div style={toolbarStyles}>
        <div style={utilizationStyles}>
          <Typography variant="body2" style={textStyle}>
            Space Utilization: {spaceUtilization}%
          </Typography>
          <Tooltip title="Clear All Skids">
            <IconButton size="small" onClick={handleClearAllSkids}>
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        
        <div style={flexBoxStyle}>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
          >
            <ToggleButton value="grid">
              <Tooltip title="Show Grid">
                <GridIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="solid">
              <Tooltip title="Hide Grid">
                <GridOffIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <div style={zoomControlsStyle}>
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>
      
      <div 
        style={containerStyles}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={canvasContainerStyles}>
          <div style={canvasWrapperStyles}>
            <canvas 
              ref={canvasRef} 
              width={CONTAINER_WIDTH} 
              height={CONTAINER_LENGTH}
            />
            
            {/* Render clickable divs for each skid to handle mouse events */}
            {placedSkids.map(skid => (
              <div
                key={skid.id}
                style={skidDivStyle(skid)}
                onMouseDown={(e) => handleMouseDown(e, skid.id)}
              >
                <div
                  style={skidActionsBoxStyle(skid.id === selectedSkidId)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton
                    size="small"
                    style={skidActionButtonStyle}
                    onClick={() => handleRotateSkid(skid.id)}
                  >
                    <RotateIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    style={skidRemoveButtonStyle}
                    onClick={() => handleRemoveSkid(skid.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Paper>
  );
});

export default Container2DOptimizer; 