import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import QuotationList from '../components/quotation/QuotationList';

function Quotation() {

  return (
    <PageWrapper title="Quotation Management">
      <QuotationList />
    </PageWrapper>
  );
}

export default Quotation;
