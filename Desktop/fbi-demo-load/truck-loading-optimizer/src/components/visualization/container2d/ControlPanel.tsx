import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Slider,
  Button,
  ButtonGroup,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  GridOn as GridOnIcon,
  GridOff as GridOffIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  Print as PrintIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';

interface ControlPanelProps {
  showGrid: boolean;
  showLabels: boolean;
  showSequence: boolean;
  zoomLevel: number;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  colorMode: 'sequence' | 'priority' | 'type';
  onToggleGrid: () => void;
  onToggleLabels: () => void;
  onToggleSequence: () => void;
  onZoomChange: (zoom: number) => void;
  onFitToScreen: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onPrint: () => void;
  onColorModeChange: (mode: 'sequence' | 'priority' | 'type') => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  showGrid,
  showLabels,
  showSequence,
  zoomLevel,
  isPlaying,
  currentStep,
  totalSteps,
  colorMode,
  onToggleGrid,
  onToggleLabels,
  onToggleSequence,
  onZoomChange,
  onFitToScreen,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onPrint,
  onColorModeChange
}) => {
  return (
    // @ts-ignore - Complex union type in MUI sx prop
    <Paper 
      sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
      elevation={1}
    >
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Container View Controls</Typography>
        
        <ButtonGroup size="small">
          <Tooltip title="Print View">
            <Button onClick={onPrint}>
              <PrintIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Fit to Screen">
            <Button onClick={onFitToScreen}>
              <FitScreenIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>
      
      <Divider />
      
      {/* View Options */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>View Options</Typography>
        <FormGroup row>
          <FormControlLabel
            control={<Switch checked={showGrid} onChange={onToggleGrid} />}
            label="Grid"
          />
          <FormControlLabel
            control={<Switch checked={showLabels} onChange={onToggleLabels} />}
            label="Labels"
          />
          <FormControlLabel
            control={<Switch checked={showSequence} onChange={onToggleSequence} />}
            label="Sequence"
          />
        </FormGroup>
      </Box>
      
      {/* Zoom Control */}
      {/* @ts-ignore - Complex union type in MUI sx prop */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ZoomOutIcon fontSize="small" />
        <Slider
          value={zoomLevel}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(_, value) => onZoomChange(value as number)}
          sx={{ mx: 1 }}
        />
        <ZoomInIcon fontSize="small" />
      </Box>
      
      {/* Sequence Navigation */}
      {showSequence && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Loading Sequence: Step {currentStep} of {totalSteps}
            </Typography>
            {/* @ts-ignore - Complex union type in MUI sx prop */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button 
                variant="outlined"
                size="small"
                onClick={onStepBackward}
                disabled={currentStep <= 1}
              >
                <PrevIcon />
              </Button>
              <Button 
                variant="contained"
                size="small"
                onClick={onPlayPause}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </Button>
              <Button 
                variant="outlined"
                size="small"
                onClick={onStepForward}
                disabled={currentStep >= totalSteps}
              >
                <NextIcon />
              </Button>
            </Box>
          </Box>
        </>
      )}
      
      {/* Color Mode */}
      <Divider />
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Color Mode
        </Typography>
        <ButtonGroup fullWidth size="small">
          <Tooltip title="Color by Sequence">
            <Button 
              variant={colorMode === 'sequence' ? 'contained' : 'outlined'}
              onClick={() => onColorModeChange('sequence')}
            >
              Sequence
            </Button>
          </Tooltip>
          <Tooltip title="Color by Priority">
            <Button 
              variant={colorMode === 'priority' ? 'contained' : 'outlined'}
              onClick={() => onColorModeChange('priority')}
            >
              Priority
            </Button>
          </Tooltip>
          <Tooltip title="Color by Type">
            <Button 
              variant={colorMode === 'type' ? 'contained' : 'outlined'}
              onClick={() => onColorModeChange('type')}
            >
              Type
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>
    </Paper>
  );
};

export default ControlPanel; 