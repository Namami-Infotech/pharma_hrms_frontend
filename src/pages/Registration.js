import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import DealerList from '../components/dealers/DealerList';

function Registration() {
    return (
        <PageWrapper title="Leads & Dealers">
            <DealerList />
        </PageWrapper>
    );
}

export default Registration;