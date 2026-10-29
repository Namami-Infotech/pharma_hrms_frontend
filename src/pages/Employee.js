import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import EmployeeList from '../components/employee/EmployeeList';

function Employee() {
    return (
        <PageWrapper title="Employees">
            <EmployeeList />
        </PageWrapper>
    );
}

export default Employee;