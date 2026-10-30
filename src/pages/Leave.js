import React from "react"
import PageWrapper from "../components/layout/PageWrapper"
import { Box, Typography, Fade } from "@mui/material"
import ViewLeave from "../components/leave/ViewLeave"
import { useAuth } from "../components/auth/AuthContext"

function Leave() {
  const { user } = useAuth()

  return (
    <PageWrapper title="Leave Management">
      <Fade in timeout={500}>
        <Box sx={{ maxWidth: 1800, mx: 'auto', minHeight: '100%' }}>
          {user && user.emp_id ? (
            <ViewLeave EmpId={user.emp_id} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Please log in to view your leave records.
            </Typography>
          )}
        </Box>
      </Fade>
    </PageWrapper>
  )
}

export default Leave