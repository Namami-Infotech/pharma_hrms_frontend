// components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar onMenuClick={handleDrawerToggle} />
      
      {/* Sidebar */}
      <Sidebar 
        open={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
      />
      
      {/* Main Content - REMOVE PADDING HERE */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: '84px', // Navbar height
          width: { xs: '100%', md: `calc(100% - 260px)` },
          minWidth: 0,
          maxWidth: { xs: '100vw', md: 'none' },
          height: 'calc(100vh - 84px)', // Full height minus navbar
          overflow: 'hidden', // Prevent double scrolling
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;