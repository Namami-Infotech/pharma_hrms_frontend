import React from 'react';
import { Box } from '@mui/material';
import PageWrapper from '../components/layout/PageWrapper';
import AttendanceList from '../components/activity/AttendanceList';

function Attendance() {
    return (
        <PageWrapper title="Attendance Management">
            <Box sx={{ maxWidth: 1800, mx: 'auto', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <AttendanceList />
            </Box>
        </PageWrapper>
    );
}

export default Attendance;