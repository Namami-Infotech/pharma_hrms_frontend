import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';

import { useAuth } from '../components/auth/AuthContext';
import ManualAttendancePage from '../components/activity/ManualAttendancePage';

function ManualAttendance() {
    const { user } = useAuth();

    return (
        <PageWrapper title="Manual Attendance">
            <ManualAttendancePage />
        </PageWrapper>
    );
}

export default ManualAttendance;