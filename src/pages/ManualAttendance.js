import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';

import ManualAttendancePage from '../components/activity/ManualAttendancePage';

function ManualAttendance() {

    return (
        <PageWrapper title="Manual Attendance">
            <ManualAttendancePage />
        </PageWrapper>
    );
}

export default ManualAttendance;