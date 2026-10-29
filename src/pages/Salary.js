import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
} from '@mui/material';
import {
  Receipt,
  FormatListBulleted,
  Payments,
} from '@mui/icons-material';
import PageWrapper from '../components/layout/PageWrapper';
import SalarySlip from '../components/employee/SalarySlip';
import SalaryList from '../components/employee/SalaryList';

function Salary() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <PageWrapper title="Salary Management">
      <Box sx={{ width: '100%', mb: 2 }}>
        {/* Navigation Tabs Header */}
        <Paper
          elevation={1}
          sx={{
            mb: 2,
            borderRadius: 2,
            bgcolor: '#ffffff',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 48,
              },
              '& .Mui-selected': {
                color: '#8d0638 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8d0638',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              icon={<Receipt sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Salary Slip"
            />
            <Tab
              icon={<FormatListBulleted sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Salary Records"
            />
          </Tabs>
        </Paper>

        {/* Tab 0: Salary Slip */}
        {activeTab === 0 && (
          <Box>
            <SalarySlip />
          </Box>
        )}

        {/* Tab 1: Salary Records */}
        {activeTab === 1 && (
          <Box>
            <SalaryList />
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
}

export default Salary;
