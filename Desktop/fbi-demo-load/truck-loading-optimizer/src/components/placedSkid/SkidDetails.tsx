import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField, 
  IconButton, 
  Grid, 
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Stack
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Rotate90DegreesCcw as RotateIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { StandardSkid } from '../../models/placedSkid';

interface SkidDetailsProps {
  selectedSkidId: string | null;
  onUpdateSkid?: (skid: StandardSkid) => void;
  onRotateSkid?: (skidId: string) => void;
  onRemoveSkid?: (skidId: string) => void;
}

const SkidDetails: React.FC<SkidDetailsProps> = ({
  selectedSkidId,
  onUpdateSkid,
  onRotateSkid,
  onRemoveSkid
}) => {
  const [skid, setSkid] = useState<StandardSkid | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkid, setEditedSkid] = useState<StandardSkid | null>(null);
  
  // Example function to fetch skid details - in a real app, this would come from props or context
  useEffect(() => {
    if (selectedSkidId) {
      // This is a placeholder. In a real app, you would fetch the skid from your state management
      const mockSkid: StandardSkid = {
        id: selectedSkidId,
        label: 'Selected Skid',
        length: 48,
        width: 40,
        height: 48,
        weight: 1200,
        color: '#4dabf7',
        isStackable: true,
        isFragile: false
      };
      
      setSkid(mockSkid);
      setEditedSkid(mockSkid);
    } else {
      setSkid(null);
      setEditedSkid(null);
      setIsEditing(false);
    }
  }, [selectedSkidId]);
  
  // Handle input changes when editing
  const handleInputChange = (field: keyof StandardSkid, value: any) => {
    if (!editedSkid) return;
    
    setEditedSkid({
      ...editedSkid,
      [field]: value
    });
  };
  
  // Handle the save button click
  const handleSave = () => {
    if (editedSkid && onUpdateSkid) {
      onUpdateSkid(editedSkid);
      setSkid(editedSkid);
      setIsEditing(false);
    }
  };
  
  // Handle the cancel button click
  const handleCancel = () => {
    setEditedSkid(skid);
    setIsEditing(false);
  };
  
  // Handle the rotate button click
  const handleRotate = () => {
    if (skid && onRotateSkid) {
      onRotateSkid(skid.id);
    }
  };
  
  // Handle the remove button click
  const handleRemove = () => {
    if (skid && onRemoveSkid) {
      onRemoveSkid(skid.id);
    }
  };
  
  // Define style constants
  const emptyCardStyle: React.CSSProperties = { 
    backgroundColor: '#f5f5f5', 
    height: '100%' 
  };
  
  const emptyContentStyle: React.CSSProperties = { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%' 
  };
  
  const headerBoxStyle: React.CSSProperties = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  };
  
  const infoBoxStyle: React.CSSProperties = { 
    marginBottom: 16 
  };
  
  const propertyBoxStyle: React.CSSProperties = { 
    display: 'flex', 
    flexDirection: 'column' as React.CSSProperties['flexDirection'], 
    marginTop: 4 
  };
  
  const dividerStyle: React.CSSProperties = { 
    marginBottom: 16 
  };
  
  const myDividerStyle: React.CSSProperties = { 
    marginTop: 16, 
    marginBottom: 16 
  };
  
  const iconButtonBoxStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center'
  };

  const marginRightStyle: React.CSSProperties = {
    marginRight: 8
  };
  
  // Define stack style for properties
  const propertiesStackStyle: React.CSSProperties = {
    marginTop: 4
  };
  
  if (!skid) {
    return (
      <Card elevation={2} style={emptyCardStyle}>
        <CardContent style={emptyContentStyle}>
          <Typography variant="body2" color="text.secondary" align="center">
            No skid selected. Click on a skid to view details.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card elevation={2}>
      <CardContent>
        <div style={headerBoxStyle}>
          <Typography variant="h6">
            {isEditing ? 'Edit Skid' : 'Skid Details'}
          </Typography>
          
          {!isEditing ? (
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          ) : (
            <div style={iconButtonBoxStyle}>
              <IconButton size="small" color="primary" onClick={handleSave}>
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={handleCancel}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </div>
          )}
        </div>
        
        <Divider style={dividerStyle} />
        
        {!isEditing ? (
          <>
            <div style={infoBoxStyle}>
              <Typography variant="subtitle1" fontWeight="bold">
                {skid.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`ID: ${skid.id.substring(0, 8)}...`}
              </Typography>
            </div>
            
            <div style={infoBoxStyle}>
              <Typography variant="body2" color="text.secondary">
                Dimensions
              </Typography>
              <Typography variant="body1">
                {`${skid.length}" × ${skid.width}" × ${skid.height || 'N/A'}"` }
              </Typography>
            </div>
            
            {skid.weight && (
              <div style={infoBoxStyle}>
                <Typography variant="body2" color="text.secondary">
                  Weight
                </Typography>
                <Typography variant="body1">
                  {`${skid.weight} lbs`}
                </Typography>
              </div>
            )}
            
            <div style={infoBoxStyle}>
              <Typography variant="body2" color="text.secondary">
                Properties
              </Typography>
              <Stack direction="column" spacing={1} style={propertiesStackStyle}>
                <Typography variant="body2">
                  {`Stackable: ${skid.isStackable ? 'Yes' : 'No'}`}
                </Typography>
                <Typography variant="body2">
                  {`Fragile: ${skid.isFragile ? 'Yes' : 'No'}`}
                </Typography>
              </Stack>
            </div>
            
            <Divider style={myDividerStyle} />
            
            <Stack direction="row" spacing={1}>
              <Button 
                variant="outlined" 
                startIcon={<RotateIcon />}
                onClick={handleRotate}
                fullWidth
              >
                Rotate
              </Button>
              
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleRemove}
              >
                Remove
              </Button>
            </Stack>
          </>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Label"
                value={editedSkid?.label || ''}
                onChange={(e) => handleInputChange('label', e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                label="Length"
                value={editedSkid?.length || ''}
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
                value={editedSkid?.width || ''}
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
                value={editedSkid?.height || ''}
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
            
            <Grid item xs={12}>
              <TextField
                label="Weight (lbs)"
                value={editedSkid?.weight || ''}
                onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                variant="outlined"
                size="small"
                type="number"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedSkid?.isStackable || false}
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
                    checked={editedSkid?.isFragile || false}
                    onChange={(e) => handleInputChange('isFragile', e.target.checked)}
                    size="small"
                  />
                }
                label="Fragile"
              />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default SkidDetails; 