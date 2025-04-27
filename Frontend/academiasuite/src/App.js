import React, { useState, useEffect } from 'react';
import Login from './components/Login/Login.js';
import Dashboard from './components/Dashboard/Dashboard.js';
import { CircularProgress, Box, Typography, Fade } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

function App() {
  const [activeComponent, setActiveComponent] = useState('login');
  const [user, setUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 300);

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'login':
        return <Login setActiveComponent={setActiveComponent} setUser={setUser} />;
      case 'dashboard':
        return <Dashboard user={user} setDashboardActiveComp={logoutApp}/>;
    }
  }

  const logoutApp = () => {
    console.log('logoutapp');
    setActiveComponent('login');
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Fade in={true} timeout={1000}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 3,
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: 'white',
            maxWidth: 400,
            width: '90%'
          }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              AcademiaSuite
            </Typography>
            <Box sx={{ width: '100%', mt: 2 }}>
              <CircularProgress 
                variant="determinate" 
                value={loadingProgress} 
                size={60}
                thickness={4}
                sx={{ color: 'primary.main' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div" color="text.secondary">
                  {`${Math.round(loadingProgress)}%`}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary" align="center">
              {loadingProgress < 30 && "Initializing application..."}
              {loadingProgress >= 30 && loadingProgress < 60 && "Loading modules..."}
              {loadingProgress >= 60 && loadingProgress < 90 && "Preparing dashboard..."}
              {loadingProgress >= 90 && "Almost ready..."}
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center">
              Please wait while we set up your environment
            </Typography>
          </Box>
        </Fade>
      </div>
    );
  }

  return (
    <div className="App">
      {renderComponent()}
    </div>
  );
}

export default App;
