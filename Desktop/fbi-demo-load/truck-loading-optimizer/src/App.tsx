import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/layout/Layout';
import InputPage from './pages/InputPage';
import VisualizationPage from './pages/VisualizationPage';
import LoadingResultsPage from './pages/LoadingResultsPage';
import PlacedSkidPage from './pages/PlacedSkidPage';

// Check if WebGL is available
const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </Router>
  );
};

// Separate component to access context
const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useAppContext();
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  
  // Check for WebGL support on component mount
  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);
  
  // If WebGL is not supported and the user tries to access the 3D visualization,
  // automatically redirect them to the 2D results page
  useEffect(() => {
    if (webGLSupported === false && activeTab === 'visualization') {
      setActiveTab('results');
    }
  }, [activeTab, webGLSupported, setActiveTab]);
  
  // Render different pages based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'input':
        return <InputPage />;
      case 'placedSkid':
        return <PlacedSkidPage />;
      case 'visualization':
        // If WebGL is not supported, show the 2D results page instead
        return webGLSupported === false ? <LoadingResultsPage /> : <VisualizationPage />;
      case 'results':
        return <LoadingResultsPage />;
      default:
        return <InputPage />;
    }
  };
  
  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default App; 