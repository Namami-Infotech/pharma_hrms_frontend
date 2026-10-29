import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';

import { useAuth } from '../components/auth/AuthContext';
import InvoiceList from '../components/invoices/InvoiceList';

function Invoices() {
    const { user } = useAuth();

    return (
        <PageWrapper title="Invoice Management">
            <InvoiceList />
        </PageWrapper>
    );
}

export default Invoices;