import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import { Rotate90DegreesCcw as RotateIcon, Add as AddIcon } from '@mui/icons-material';
import { StandardSkid, STANDARD_SKIDS } from '../../models/placedSkid';
import { v4 as uuidv4 } from 'uuid';

// Define styles with proper typings
const libraryBoxStyle: React.CSSProperties = { 
  width: '100%' 
};

const chipStyle: React.CSSProperties = { 
  height: 20, 
  fontSize: '0.7rem' 
};

interface SkidLibraryProps {
  onSkidSelect?: (skidId: string | null) => void;
  onAddSkid?: (skid: StandardSkid) => void;
}

const SkidLibrary: React.FC<SkidLibraryProps> = ({ onSkidSelect, onAddSkid }) => {
  // Function to handle adding a skid to the container
  const handleAddSkid = (skid: StandardSkid) => {
    if (onAddSkid) {
      // Create a new skid with a unique ID based on the template
      const newSkid: StandardSkid = {
        ...skid,
        id: `${skid.id}-${uuidv4().substring(0, 8)}` // Create a unique ID
      };
      
      onAddSkid(newSkid);
    }
  };
  
  // Function to handle skid selection
  const handleSkidSelect = (skidId: string) => {
    if (onSkidSelect) {
      onSkidSelect(skidId);
    }
  };
  
  return (
    <Box style={libraryBoxStyle}>
      <Grid container spacing={2}>
        {STANDARD_SKIDS.map((skid) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={skid.id}>
            <SkidCard 
              skid={skid} 
              onAddSkid={handleAddSkid} 
              onSelect={handleSkidSelect}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Sub-component for rendering a skid card
interface SkidCardProps {
  skid: StandardSkid;
  onAddSkid: (skid: StandardSkid) => void;
  onSelect: (skidId: string) => void;
}

const SkidCard: React.FC<SkidCardProps> = ({ skid, onAddSkid, onSelect }) => {
  // Define card-specific styles with proper typings
  const cardStyle: React.CSSProperties = { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    borderTop: `4px solid ${skid.color || '#4dabf7'}`
  };
  
  const cardContentStyle: React.CSSProperties = { 
    flexGrow: 1, 
    padding: '16px', 
    paddingBottom: 0 
  };
  
  const skidVisualStyle: React.CSSProperties = { 
    width: '100%', 
    height: 80, 
    backgroundColor: skid.color || '#4dabf7',
    borderRadius: 4,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    marginBottom: 8,
    position: 'relative' as React.CSSProperties['position'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  const propertiesBoxStyle: React.CSSProperties = {
    display: 'flex', 
    flexWrap: 'wrap' as React.CSSProperties['flexWrap'], 
    gap: 4
  };
  
  const actionsStyle: React.CSSProperties = {
    padding: 8
  };
  
  const customChipStyle: React.CSSProperties = { 
    height: 20, 
    fontSize: '0.7rem' 
  };
  
  return (
    <Card style={cardStyle}>
      <CardContent style={cardContentStyle}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          {skid.label}
        </Typography>
        
        {/* Skid visual representation */}
        <Box 
          style={skidVisualStyle}
          onClick={() => onSelect(skid.id)}
        >
          <Typography variant="body2" color="white" fontWeight="bold">
            {`${skid.length}" × ${skid.width}"`}
          </Typography>
        </Box>
        
        {/* Skid properties */}
        <Box style={propertiesBoxStyle}>
          {skid.isStackable && (
            <Chip 
              label="Stackable" 
              color="success" 
              size="small" 
              style={customChipStyle}
            />
          )}
          
          {skid.isFragile && (
            <Chip 
              label="Fragile" 
              color="error" 
              size="small" 
              style={customChipStyle}
            />
          )}
          
          {skid.weight && (
            <Chip 
              label={`${skid.weight} lbs`} 
              color="info" 
              size="small" 
              style={customChipStyle}
            />
          )}
        </Box>
      </CardContent>
      
      <CardActions style={actionsStyle}>
        <Button 
          startIcon={<AddIcon />} 
          size="small" 
          onClick={() => onAddSkid(skid)}
          fullWidth
        >
          Add to Container
        </Button>
      </CardActions>
    </Card>
  );
};

export default SkidLibrary; 