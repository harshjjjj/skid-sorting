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
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 240;

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
    <Box sx={{ py: 2, px: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Truck Loader
        </Typography>
      </Box>
      
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
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
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
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Desktop view - persistent drawer
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
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