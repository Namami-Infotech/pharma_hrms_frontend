import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { Box } from '@mui/material';
import EmployeeProfile from '../components/employee/UserProfile';


function EmpProfile() {
    return (
        <PageWrapper title="Profile">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <EmployeeProfile />
            </Box>
        </PageWrapper>
    );
}

export default EmpProfile;