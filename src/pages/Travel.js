"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Fab,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { Add, FlightTakeoff } from "@mui/icons-material"
import { useAuth } from "../components/auth/AuthContext"
import PageWrapper from "../components/layout/PageWrapper"
import ApplyTravel from "../components/travel/ApplyTravel"
import ViewTravel from "../components/travel/ViewTravel"

function Travel() {
  const { user } = useAuth()
  const [openApplyExpenseDialog, setOpenApplyExpenseDialog] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleOpenApplyExpenseDialog = () => setOpenApplyExpenseDialog(true)
  const handleCloseApplyExpenseDialog = () => setOpenApplyExpenseDialog(false)

  const handleExpenseApplied = () => {
    handleCloseApplyExpenseDialog()
  }

  return (
    <PageWrapper title="Travel Management">
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: -0.3,
            mb: 0.4,
          }}
        >
          Travel Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
          Manage employee travel requests, itineraries, and expense claims
        </Typography>
      </Box>

      {/* Action Section */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent="space-between"
            alignItems={isMobile ? "stretch" : "center"}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Apply for travel expenses and manage your requests
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleOpenApplyExpenseDialog}
              startIcon={<Add />}
              sx={{
                bgcolor: "#f37021",
                "&:hover": { bgcolor: "#6d052cff" },
                minWidth: 200,
                height: 48,
              }}
            >
              Apply for Travel
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Travel Requests Table */}
      {user && user.emp_id && <ViewTravel EmpId={user.emp_id} />}

      {/* Apply Travel Dialog */}
      <ApplyTravel
        open={openApplyExpenseDialog}
        onClose={handleCloseApplyExpenseDialog}
        onExpenseApplied={handleExpenseApplied}
      />

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
            bgcolor: "#f37021",
            "&:hover": { bgcolor: "#6d052cff" }
          }}
          aria-label="add travel request"
          onClick={handleOpenApplyExpenseDialog}
        >
          <Add />
        </Fab>
      )}
    </PageWrapper>
  )
}

export default Travel