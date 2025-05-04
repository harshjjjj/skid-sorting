import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  FormGroup,
  FormControlLabel,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../theme/ThemeProvider';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
  onToggleDrawer: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleDrawer }) => {
  const { toggleTheme, mode } = useAppTheme();
  const { unitSystem, toggleUnitSystem } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="fixed" 
      // @ts-ignore - Complex union type issue in MUI
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle drawer"
          onClick={onToggleDrawer}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          {isMobile ? 'Truck Loader' : 'Truck Loading Optimizer'}
        </Typography>
        
        {/* @ts-ignore - Complex union type issue in MUI */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={unitSystem === 'imperial'} onChange={toggleUnitSystem} />}
              label={unitSystem === 'imperial' ? 'Imperial' : 'Metric'}
            />
          </FormGroup>
          
          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
            {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 