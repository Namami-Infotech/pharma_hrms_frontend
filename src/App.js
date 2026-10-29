// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from './components/auth/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import theme from './styles/theme';
import Employee from './pages/Employee';
import Holiday from './pages/Holiday';
import Policy from './pages/Policy';
import Attendance from './pages/Attendance';

import ManualAttendance from './pages/ManualAttendance'; 
import Notification from './pages/Notification';
import Leave from './pages/Leave';
import Expense from './pages/Expense';
import EmpProfile from './pages/User';
import PrivateRoute from './components/auth/PrivateRoute';
import Assets from './pages/Assets';
import EmployeeProfile from './pages/EmployeeProfile';
import Visit from './pages/Dealer';
import Registration from './pages/Registration';
import VisitReport from './pages/VisitReport';
import Maps from './pages/Maps';
import Ticket from './pages/Ticket';
import Travel from './pages/Travel';
import Checkpoints from './pages/Checkpoints';
import Menus from './pages/Menus';
import HRMSLayout from './styles/HRMSLayout';
import EmployeeSalarySlip from './components/employee/EmployeeSalarySlip';
import Regularise from './pages/Regularise';
import Docket from './pages/Docket';
import MainLayout from './components/layout/MainLayout';
import Offices from './pages/Offices';
import Invoices from './pages/Invoices';
import Salary from './pages/Salary';
import Quotation from './pages/Quotation';
import Product from './pages/Product';

// Wrapper component for routes that need layout
const LayoutWrapper = ({ children }) => {
  const { user } = useAuth();
  
  // Don't show layout for login page
  if (!user) {
    return children;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

function App() {

  useEffect(() => {
    const handleRightClick = (event) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', handleRightClick);

    return () => {
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Dashboard />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/employees" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <Employee />
                </LayoutWrapper>
              </PrivateRoute>
            } />

            <Route path="/offices" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <Offices />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/employees/:empId" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <EmployeeProfile />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/holiday" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Holiday />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/policy" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Policy />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/attendance" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Attendance />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            {/* Add the Manual Attendance Route */}
            <Route path="/manual-attendance" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <ManualAttendance />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/notification" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Notification />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/leave" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Leave />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/expense" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Expense />
                </LayoutWrapper>
              </PrivateRoute>
            } />

            <Route path="/invoices" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Invoices />
                </LayoutWrapper>
              </PrivateRoute>
            } />

            <Route path="/salary" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Salary />
                </LayoutWrapper>
              </PrivateRoute>
            } />

            <Route path="/quotation" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Quotation />
                </LayoutWrapper>
              </PrivateRoute>
            } />

            <Route path="/products" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Product />
                </LayoutWrapper>
              </PrivateRoute>
            } />

            <Route path="/product" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Product />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <EmpProfile />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            {/* Add similar layout wrappers for all other protected routes */}
            <Route path="/visit" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Visit />
                </LayoutWrapper>
              </PrivateRoute>
            } />
             <Route path="/plan-visit" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Visit />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/assets" element={
              <PrivateRoute>
                <LayoutWrapper>
                  <Assets />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            <Route path="/regularise" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <Regularise />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            <Route path="/report" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <VisitReport />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            <Route path="/registration" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <Registration />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            <Route path="/maps" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <Maps />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            <Route path="/live-track" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <Maps />
                </LayoutWrapper>
              </PrivateRoute>
            } />
             <Route path="/travel" element={
              <PrivateRoute requiredRole="HR">
                <LayoutWrapper>
                  <Travel />
                </LayoutWrapper>
              </PrivateRoute>
            } />
            
            {/* Add all other routes similarly */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;