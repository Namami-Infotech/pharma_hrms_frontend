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
      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, pt: { xs: 1.5, sm: 2 }, width: '100%', boxSizing: 'border-box' }}>
        {/* Page Title Block with optimized padding and margin */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: -0.3,
              fontSize: { xs: "1.25rem", sm: "1.45rem" },
            }}
          >
            Salary & Payroll Management
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.25,
              fontSize: "0.84rem",
            }}
          >
            Generate salary slips, manage deductions, and track monthly payroll disbursements
          </Typography>
        </Box>

        {/* Salary Slip Generator, Modal & Records Table */}
        <SalarySlip />
      </Box>
    </PageWrapper>
  );
}

export default Salary;
