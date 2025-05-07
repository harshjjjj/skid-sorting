import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Stack,
  Switch,
  FormControlLabel,
  Slider,
  Divider
} from '@mui/material';
import { 
  Tune as TuneIcon, 
  RestartAlt as ResetIcon 
} from '@mui/icons-material';

interface OptimizationControlsProps {
  onOptimize?: (settings: OptimizationSettings) => void;
}

interface OptimizationSettings {
  prioritizeSize: boolean;
  allowRotation: boolean;
  maintainSequence: boolean;
  weightBalancePriority: number;
  spaceEfficiencyPriority: number;
}

// Define style constants with proper typing
const settingBoxStyle: React.CSSProperties = { 
  marginBottom: 16 
};

const controlDescriptionStyle: React.CSSProperties = { 
  marginBottom: 4 
};

const actionStyle: React.CSSProperties = { 
  marginTop: 24 
};

const dividerStyle: React.CSSProperties = { 
  marginBottom: 16 
};

const OptimizationControls: React.FC<OptimizationControlsProps> = ({ onOptimize }) => {
  // Default optimization settings
  const defaultSettings: OptimizationSettings = {
    prioritizeSize: true,
    allowRotation: true,
    maintainSequence: false,
    weightBalancePriority: 50,
    spaceEfficiencyPriority: 50
  };
  
  // State for tracking optimization settings
  const [settings, setSettings] = useState<OptimizationSettings>(defaultSettings);
  
  // Handle settings change
  const handleSettingChange = (key: keyof OptimizationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle optimize button click
  const handleOptimize = () => {
    if (onOptimize) {
      onOptimize(settings);
    }
  };
  
  // Handle reset button click
  const handleReset = () => {
    setSettings(defaultSettings);
  };
  
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Optimization Settings
        </Typography>
        
        <Divider style={dividerStyle} />
        
        <Box style={settingBoxStyle}>
          <FormControlLabel 
            control={
              <Switch 
                checked={settings.prioritizeSize} 
                onChange={(e) => handleSettingChange('prioritizeSize', e.target.checked)}
              />
            } 
            label="Prioritize larger skids first"
          />
          <Typography variant="caption" color="text.secondary" style={controlDescriptionStyle}>
            Places larger skids before smaller ones to optimize space
          </Typography>
        </Box>
        
        <Box style={settingBoxStyle}>
          <FormControlLabel 
            control={
              <Switch 
                checked={settings.allowRotation} 
                onChange={(e) => handleSettingChange('allowRotation', e.target.checked)}
              />
            } 
            label="Allow skid rotation"
          />
          <Typography variant="caption" color="text.secondary" style={controlDescriptionStyle}>
            Automatically rotate skids to find optimal fit
          </Typography>
        </Box>
        
        <Box style={settingBoxStyle}>
          <FormControlLabel 
            control={
              <Switch 
                checked={settings.maintainSequence} 
                onChange={(e) => handleSettingChange('maintainSequence', e.target.checked)}
              />
            } 
            label="Maintain load sequence"
          />
          <Typography variant="caption" color="text.secondary" style={controlDescriptionStyle}>
            Keep the original order of skids when optimizing
          </Typography>
        </Box>
        
        <Box style={settingBoxStyle}>
          <Typography variant="body2" gutterBottom>
            Weight Balance Priority
          </Typography>
          <Slider
            value={settings.weightBalancePriority}
            onChange={(_, value) => handleSettingChange('weightBalancePriority', value)}
            aria-labelledby="weight-balance-slider"
            valueLabelDisplay="auto"
            step={10}
            marks
            min={0}
            max={100}
          />
          <Typography variant="caption" color="text.secondary" style={controlDescriptionStyle}>
            Higher values prioritize even weight distribution
          </Typography>
        </Box>
        
        <Box style={settingBoxStyle}>
          <Typography variant="body2" gutterBottom>
            Space Efficiency Priority
          </Typography>
          <Slider
            value={settings.spaceEfficiencyPriority}
            onChange={(_, value) => handleSettingChange('spaceEfficiencyPriority', value)}
            aria-labelledby="space-efficiency-slider"
            valueLabelDisplay="auto"
            step={10}
            marks
            min={0}
            max={100}
          />
          <Typography variant="caption" color="text.secondary" style={controlDescriptionStyle}>
            Higher values maximize container utilization
          </Typography>
        </Box>
        
        <Box style={actionStyle}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<TuneIcon />}
              onClick={handleOptimize}
              fullWidth
            >
              Optimize Layout
            </Button>
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OptimizationControls; 