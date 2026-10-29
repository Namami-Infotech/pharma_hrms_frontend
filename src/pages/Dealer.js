import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import VisitTable from '../components/dealers/VisitTable';
import { useLocation } from 'react-router-dom';
import PlanVisit from '../components/dealers/PlanVisit';

function Visit() {
    const location = useLocation();

    // Determine page title based on route
    const getPageTitle = () => {
        return location.pathname === '/visit' ? 'Visit Management' : 'Plan Visit';
    };

    return (
        <PageWrapper title={getPageTitle()}>
            {location.pathname === '/visit' ? <VisitTable /> : <PlanVisit />}
        </PageWrapper>
    );
}

export default Visit;