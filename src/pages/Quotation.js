import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { useAuth } from '../components/auth/AuthContext';
import QuotationList from '../components/quotation/QuotationList';

function Quotation() {
  const { user } = useAuth();

  return (
    <PageWrapper title="Quotation Management">
      <QuotationList />
    </PageWrapper>
  );
}

export default Quotation;
