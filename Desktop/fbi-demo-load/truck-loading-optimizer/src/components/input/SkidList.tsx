import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Typography,
  Button,
  Box,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as StartIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { formatLength, formatWeight } from '../../utils/unitConversion';
import { parseCsvToSkids, generateCsvTemplate } from '../../utils/fileImport';
import { Skid } from '../../models/types';

const SkidList: React.FC = () => {
  const { 
    skids, 
    removeSkid, 
    clearSkids, 
    unitSystem, 
    generateLoadingPlan, 
    setActiveTab,
    addSkid
  } = useAppContext();
  
  const [importError, setImportError] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  const handleDelete = (id: string) => {
    removeSkid(id);
  };
  
  const handleEdit = (id: string) => {
    // In a real implementation, we would open an edit dialog or navigate to an edit page
    console.log('Edit skid with ID:', id);
  };
  
  const handleClearAll = () => {
    setClearDialogOpen(true);
  };
  
  const confirmClearAll = () => {
    clearSkids();
    setClearDialogOpen(false);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    parseCsvToSkids(file)
      .then((importedSkids) => {
        // In a full implementation, we would validate the skids first
        importedSkids.forEach((skid) => {
          const { id, ...skidData } = skid;
          const newSkid: Skid = {
            id,
            ...skidData,
          };
          addSkid(newSkid);
        });
        setImportError(null);
      })
      .catch((error) => {
        setImportError(error.message);
      });
    
    // Reset the input
    event.target.value = '';
  };
  
  const handleExportTemplate = () => {
    const templateContent = generateCsvTemplate();
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skid_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleStartOptimization = () => {
    if (skids.length === 0) {
      setImportError('Please add at least one skid before starting optimization.');
      return;
    }
    
    generateLoadingPlan();
    setActiveTab('visualization');
  };
  
  const getFormattedDimensions = (skid: Skid) => {
    const { width, length, height } = skid;
    const w = formatLength(width, unitSystem);
    const l = formatLength(length, unitSystem);
    const h = formatLength(height, unitSystem);
    return `${w} × ${l} × ${h}`;
  };
  
  return (
    <Card elevation={2}>
      <CardHeader 
        title="Skid List" 
        subheader={`${skids.length} skids added`}
        action={
          skids.length > 0 ? (
            <Button
              color="error"
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
              size="small"
            >
              Clear All
            </Button>
          ) : null
        }
      />
      <Divider />
      <CardContent>
        {importError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImportError(null)}>
            {importError}
          </Alert>
        )}
        
        {skids.length === 0 ? (
          // @ts-ignore - Complex union type in MUI sx prop
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No skids added yet. Use the form above to add skids manually or import from a CSV file.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                component="label"
                sx={{ mr: 1 }}
              >
                Import CSV
                <input type="file" hidden accept=".csv" onChange={handleImport} />
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportTemplate}
              >
                Download Template
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Dimensions</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Properties</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {skids.map((skid) => (
                    <TableRow key={skid.id}>
                      <TableCell>{skid.label}</TableCell>
                      <TableCell>{getFormattedDimensions(skid)}</TableCell>
                      <TableCell>{formatWeight(skid.weight, unitSystem)}</TableCell>
                      <TableCell>{skid.priority}</TableCell>
                      <TableCell>
                        {skid.isFragile && (
                          <Chip 
                            label="Fragile" 
                            size="small" 
                            color="error" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        )}
                        {skid.isStackable && (
                          <Chip 
                            label="Stackable" 
                            size="small" 
                            color="success" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(skid.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDelete(skid.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<ImportIcon />}
                  component="label"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Import CSV
                  <input type="file" hidden accept=".csv" onChange={handleImport} />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  size="small"
                  onClick={handleExportTemplate}
                >
                  Download Template
                </Button>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<StartIcon />}
                onClick={handleStartOptimization}
              >
                Start Optimization
              </Button>
            </Box>
          </>
        )}
        
        {/* Clear All Confirmation Dialog */}
        <Dialog
          open={clearDialogOpen}
          onClose={() => setClearDialogOpen(false)}
        >
          <DialogTitle>Clear All Skids?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all {skids.length} skids from the list? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmClearAll} color="error" autoFocus>
              Clear All
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SkidList; 