import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import ViewExpense from '../components/expense/ViewExpense';

function EnhancedExpensePage() {
  return (
    <PageWrapper title="Expense Management">
      <ViewExpense />
    </PageWrapper>
  );
}

export default EnhancedExpensePage;