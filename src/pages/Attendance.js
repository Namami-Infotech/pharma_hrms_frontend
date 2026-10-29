import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AttendanceList from '../components/activity/AttendanceList';

function Attendance() {
    return (
        <PageWrapper title="Attendance">
            <AttendanceList />
        </PageWrapper>
    );
}

export default Attendance;