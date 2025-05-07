import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ViewInAr as ViewInArIcon,
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Folder as FolderIcon,
  ViewQuilt as ViewQuiltIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 240;

// Define style constants with proper typing
const drawerContentStyle: React.CSSProperties = {
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: 8,
  paddingRight: 8,
  display: 'flex',
  flexDirection: 'column' as React.CSSProperties['flexDirection'],
  height: '100%'
};

const logoBoxStyle: React.CSSProperties = {
  paddingLeft: 16,
  paddingRight: 16,
  marginBottom: 16
};

const versionBoxStyle: React.CSSProperties = {
  marginTop: 'auto',
  padding: 16
};

const mobileDrawerStyle = {
  display: { xs: 'block', md: 'none' } as const,
  '& .MuiDrawer-paper': { 
    boxSizing: 'border-box', 
    width: drawerWidth 
  },
};

const desktopDrawerStyle = {
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
  },
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { activeTab, setActiveTab } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    
    // If on mobile, close the drawer after selection
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <div style={drawerContentStyle}>
      <div style={logoBoxStyle}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Truck Loader
        </Typography>
      </div>
      
      <Divider />
      
      <List>
        <ListItem 
          button 
          selected={activeTab === 'dashboard'} 
          onClick={() => handleNavigation('dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeTab === 'input'} 
          onClick={() => handleNavigation('input')}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Input Data" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeTab === 'placedSkid'} 
          onClick={() => handleNavigation('placedSkid')}
        >
          <ListItemIcon>
            <ViewQuiltIcon />
          </ListItemIcon>
          <ListItemText primary="Placed Skid" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeTab === 'visualization'} 
          onClick={() => handleNavigation('visualization')}
        >
          <ListItemIcon>
            <ViewInArIcon />
          </ListItemIcon>
          <ListItemText primary="3D Visualization" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeTab === 'sequence'} 
          onClick={() => handleNavigation('sequence')}
        >
          <ListItemIcon>
            <PlayArrowIcon />
          </ListItemIcon>
          <ListItemText primary="Loading Sequence" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeTab === 'report'} 
          onClick={() => handleNavigation('report')}
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>
      
      <Divider />
      
      <List>
        <ListItem 
          button 
          selected={activeTab === 'templates'} 
          onClick={() => handleNavigation('templates')}
        >
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary="Templates" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeTab === 'save'} 
          onClick={() => handleNavigation('save')}
        >
          <ListItemIcon>
            <SaveIcon />
          </ListItemIcon>
          <ListItemText primary="Save Plan" />
        </ListItem>
        
        <ListItem 
          button 
          selected={activeTab === 'settings'} 
          onClick={() => handleNavigation('settings')}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
      
      <div style={versionBoxStyle}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile view - temporary drawer with overlay */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={mobileDrawerStyle}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Desktop view - persistent drawer
        <Drawer
          sx={desktopDrawerStyle}
          variant="persistent"
          anchor="left"
          open={open}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar; 