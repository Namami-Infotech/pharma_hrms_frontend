import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AddHoliday from '../components/holiday/AddHoliday';
import ViewHoliday from '../components/holiday/ViewHoliday';
import { useAuth } from '../components/auth/AuthContext';

function Holiday() {
    const { user } = useAuth();

    return (
        <PageWrapper title="Holidays">
            {/* Show AddHoliday component only for Admin users */}
            {user && ['Admin', 'admin', 'SuperAdmin'].includes(user.role) && <AddHoliday />}
            
            {/* Show ViewHoliday for all users */}
            <ViewHoliday />
        </PageWrapper>
    );
}

export default Holiday;