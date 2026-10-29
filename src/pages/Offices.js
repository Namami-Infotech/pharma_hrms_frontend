import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { Box } from '@mui/material';
import OfficeManagement from '../components/employee/OfficeManagement';

function Offices() {
    return (
        <PageWrapper title="Offices Management">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <OfficeManagement />
            </Box>
        </PageWrapper>
    );
}

export default Offices;