import React, { useState } from "react"
import PageWrapper from "../components/layout/PageWrapper"
import { Button, Paper, Box, Typography, Divider, Stack, Fade } from "@mui/material"
import { EventAvailable, AddCircle } from "@mui/icons-material"
import ApplyLeave from "../components/leave/ApplyLeave"
import ViewLeave from "../components/leave/ViewLeave"
import { useAuth } from "../components/auth/AuthContext"

function Leave() {
  const { user } = useAuth()
  const [openApplyLeaveDialog, setOpenApplyLeaveDialog] = useState(false)

  const handleOpenApplyLeaveDialog = () => setOpenApplyLeaveDialog(true)
  const handleCloseApplyLeaveDialog = () => setOpenApplyLeaveDialog(false)
  const handleLeaveApplied = () => handleCloseApplyLeaveDialog()

  return (
    <PageWrapper title="Leave Management">
      <Fade in timeout={500}>
      <Box sx={{ maxWidth: 1800, mx: 'auto', minHeight: '100%' }}>
          {/* Header Section */}
          

          {/* View Leave Section */}
         
            {user && user.emp_id ? (
              <ViewLeave EmpId={user.emp_id} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Please log in to view your leave records.
              </Typography>
            )}
         
        </Box>
      </Fade>

      {/* Leave Dialog */}
      <ApplyLeave
        open={openApplyLeaveDialog}
        onClose={handleCloseApplyLeaveDialog}
        onLeaveApplied={handleLeaveApplied}
      />
    </PageWrapper>
  )
}

export default Leave