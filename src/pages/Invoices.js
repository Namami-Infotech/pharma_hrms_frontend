import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';

import InvoiceList from '../components/invoices/InvoiceList';

function Invoices() {

    return (
        <PageWrapper title="Invoice Management">
            <InvoiceList />
        </PageWrapper>
    );
}

export default Invoices;