import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import PageWrapper from '../components/layout/PageWrapper';
import SalarySlip from '../components/employee/SalarySlip';

function Salary() {
  return (
    <PageWrapper title="Salary Management">
      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', boxSizing: 'border-box' }}>
        {/* Page Title Block */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>
            Salary & Payroll Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3, fontSize: "0.85rem" }}>
            Generate salary slips, manage deductions, and track monthly payroll disbursements
          </Typography>
        </Box>

        {/* Salary Slip */}
        <SalarySlip />
      </Box>
    </PageWrapper>
  );
}

export default Salary;
