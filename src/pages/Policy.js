import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { Box } from '@mui/material';
import PolicyList from '../components/policy/PolicyList';
import AddPolicy from '../components/policy/AddPolicy';

function Policy() {
    return (
        <PageWrapper title="Policy Management">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <AddPolicy />
                <PolicyList />
            </Box>
        </PageWrapper>
    );
}

export default Policy;