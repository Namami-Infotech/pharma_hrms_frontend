import React from 'react';
import { Box } from '@mui/material';
import PageWrapper from '../components/layout/PageWrapper';
import SalarySlip from '../components/employee/SalarySlip';

function Salary() {
  return (
    <PageWrapper title="Salary Management">
      <Box sx={{ p: { xs: 1, sm: 1.5 }, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
        {/* Salary Slip Generator, Modal & Records Table */}
        <SalarySlip />
      </Box>
    </PageWrapper>
  );
}

export default Salary;
