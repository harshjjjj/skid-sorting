import React, { useEffect, useState } from 'react';
import { Canvas, Props as CanvasProps } from '@react-three/fiber';
import { Alert, Box, Typography } from '@mui/material';

interface SafeCanvasProps extends CanvasProps {
  fallback?: React.ReactNode;
}

/**
 * A wrapper around Canvas that provides error handling for WebGL issues
 */
const SafeCanvas: React.FC<SafeCanvasProps> = ({ children, fallback, ...props }) => {
  const [error, setError] = useState<Error | null>(null);

  // Check for WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const hasWebGL = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      
      if (!hasWebGL) {
        setError(new Error('WebGL is not supported in your browser'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error initializing WebGL'));
    }
  }, []);

  // If there's an error, render fallback content
  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // @ts-ignore - Complex union type issue in MUI
    return (
      <Box 
        // @ts-ignore - Complex union type issue in MUI
        sx={{ 
          height: '100%', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3
        }}
      >
        <Alert 
          // @ts-ignore - Complex union type issue in MUI
          severity="error" 
          sx={{ mb: 2, width: '100%' }}
        >
          Error: {error.message || 'Failed to initialize WebGL rendering'}
        </Alert>
        <Typography variant="body1">
          3D visualization requires WebGL support, which isn't available in your browser or device.
        </Typography>
        <Typography 
          // @ts-ignore - Complex union type issue in MUI
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2 }}
        >
          Try using a modern browser or enable hardware acceleration in your browser settings.
        </Typography>
      </Box>
    );
  }

  // If no error, render the Canvas
  try {
    return <Canvas {...props}>{children}</Canvas>;
  } catch (err) {
    console.error('Error rendering Canvas:', err);
    
    // Delayed error handling - if an error occurs while rendering the Canvas
    setError(err instanceof Error ? err : new Error('Error rendering 3D view'));
    
    // Return a loading state while updating the error state
    return (
      <Box 
        // @ts-ignore - Complex union type issue in MUI
        sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography>Loading visualization...</Typography>
      </Box>
    );
  }
};

export default SafeCanvas; 