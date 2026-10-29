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
          marginTop: '64px', // Navbar height
          width: { sm: `calc(100% - 240px)` },
          height: 'calc(100vh - 64px)', // Full height minus navbar
          overflow: 'hidden', // Prevent double scrolling
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;