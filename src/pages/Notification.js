import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { Box } from '@mui/material';
import AddNotification from '../components/notification/AddNotification';
import ViewNotifications from '../components/notification/ViewNotification';

function Notification() {
    return (
        <PageWrapper title="Notifications">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <AddNotification />
                <ViewNotifications />
            </Box>
        </PageWrapper>
    );
}

export default Notification;