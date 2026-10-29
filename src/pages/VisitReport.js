import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import VisitList from '../components/dealers/VisitList';

function VisitReport() {
    return (
        <PageWrapper title="Visit Reports">
            <VisitList />
        </PageWrapper>
    );
}

export default VisitReport;