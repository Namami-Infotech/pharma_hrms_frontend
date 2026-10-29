import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import MonthlyInOutReport from '../components/activity/MonthlyInOutReport';

function MonthlyInOutReportPage() {
    return (
        <PageWrapper title="Monthly In/Out Report">
            <MonthlyInOutReport />
        </PageWrapper>
    );
}

export default MonthlyInOutReportPage;
