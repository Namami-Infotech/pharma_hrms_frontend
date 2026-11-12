import React from 'react';
import { Box } from '@mui/material';
import PageWrapper from '../components/layout/PageWrapper';

import ManualAttendancePage from '../components/activity/ManualAttendancePage';

function ManualAttendance() {
    return (
        <PageWrapper title="Manual Attendance">
            <Box sx={{ maxWidth: 1800, mx: 'auto', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ManualAttendancePage />
            </Box>
        </PageWrapper>
    );
}

export default ManualAttendance;