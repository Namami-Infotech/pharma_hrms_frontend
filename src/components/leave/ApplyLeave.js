"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  InputAdornment,
  Stack,
  LinearProgress,
  Tooltip,
  Fade,
} from "@mui/material"
import {
  Close,
  CalendarToday,
  Person,
  Description,
  Category,
  EventAvailable,
  Send,
  Preview,
  AccessTime,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { motion, AnimatePresence } from "framer-motion"
import { differenceInDays, format, addDays } from "date-fns"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"

// Enhanced Leave Balance Card
const LeaveBalanceCard = ({ category, balance, isSelected, onClick }) => {
  const theme = useTheme()

  const getBalanceColor = () => {
    if (balance === 0) return theme.palette.error.main
    if (balance <= 2) return theme.palette.warning.main
    return theme.palette.success.main
  }

  const getBalanceIcon = () => {
    if (balance === 0) return <Warning />
    if (balance <= 2) return <Info />
    return <CheckCircle />
  }

  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        cursor: balance > 0 ? "pointer" : "not-allowed",
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        opacity: balance === 0 ? 0.6 : 1,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: balance > 0 ? theme.shadows[4] : "none",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {category.toUpperCase()}
            </Typography>
            <Typography variant="h6" color={getBalanceColor()} fontWeight="bold">
              {balance} days
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${getBalanceColor()}20`, color: getBalanceColor() }}>
            {getBalanceIcon()}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

// Leave Preview Component
const LeavePreview = ({ leaveDetails, categories }) => {
  const theme = useTheme()

  const calculateDays = () => {
    if (!leaveDetails.startDate || !leaveDetails.endDate) return 0
    return differenceInDays(new Date(leaveDetails.endDate), new Date(leaveDetails.startDate)) + 1
  }

  const selectedCategory = categories.find((cat) => cat.value === leaveDetails.category)
  const totalDays = calculateDays()

  return (
    <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          p: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Preview sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="bold">
          Leave Application Preview
        </Typography>
      </Box>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Person fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Employee
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium">
              {leaveDetails.empid || "Not specified"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Category fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Leave Type
              </Typography>
            </Box>
            <Chip
              label={leaveDetails.category || "Not selected"}
              color={leaveDetails.category ? "primary" : "default"}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium">
              {totalDays} day{totalDays !== 1 ? "s" : ""}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AccessTime fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Dates
              </Typography>
            </Box>
            <Typography variant="body2">
              {leaveDetails.startDate && leaveDetails.endDate
                ? `${format(new Date(leaveDetails.startDate), "MMM dd")} - ${format(new Date(leaveDetails.endDate), "MMM dd, yyyy")}`
                : "Not specified"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Description fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Reason
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontStyle: leaveDetails.reason ? "normal" : "italic" }}>
              {leaveDetails.reason || "No reason provided"}
            </Typography>
          </Grid>

          {selectedCategory && totalDays > 0 && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.info.light + "20", borderRadius: 1 }}>
                <Typography variant="body2" color="info.main" sx={{ display: "flex", alignItems: "center" }}>
                  <Info sx={{ mr: 1 }} />
                  Remaining balance after this leave: {selectedCategory.balance - totalDays} days
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

function ApplyLeave({ open, onClose, onLeaveApplied }) {
  const { user } = useAuth()
  const theme = useTheme()

  const [leaveDetails, setLeaveDetails] = useState({
    empid: user?.emp_id || "",
    startDate: null,
    endDate: null,
    reason: "",
    status: "Pending",
    category: "",
  })

  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const today = new Date()

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        setLoadingCategories(true)
        const response = await axios.get(
          `${BASE_URL}/leave/balance_leave.php?empid=${user.emp_id}`,
        )
        if (response.data.success) {
          const data = response.data.data
          const availableCategories = Object.keys(data)
            .filter((key) => key !== "id" && key !== "empid")
            .map((key) => ({
              label: key.toUpperCase(),
              value: key,
              balance: data[key] || 0,
            }))

          setCategories(availableCategories)
        }
      } catch (err) {
        setError("Error fetching leave balances: " + err.message)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (user?.emp_id && open) {
      fetchLeaveBalances()
    }
  }, [user, open])

  const handleChange = (field, value) => {
    setLeaveDetails({ ...leaveDetails, [field]: value })

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Auto-set end date if start date is selected and end date is not set
    if (field === "startDate" && value && !leaveDetails.endDate) {
      setLeaveDetails((prev) => ({ ...prev, startDate: value, endDate: value }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!leaveDetails.startDate) {
      errors.startDate = "Start date is required"
    }

    if (!leaveDetails.endDate) {
      errors.endDate = "End date is required"
    }

    if (leaveDetails.startDate && leaveDetails.endDate) {
      if (new Date(leaveDetails.endDate) < new Date(leaveDetails.startDate)) {
        errors.endDate = "End date cannot be before start date"
      }
    }

    if (!leaveDetails.category) {
      errors.category = "Leave category is required"
    }

    if (!leaveDetails.reason.trim()) {
      errors.reason = "Reason is required"
    }

    // Check if enough balance
    if (leaveDetails.category && leaveDetails.startDate && leaveDetails.endDate) {
      const selectedCategory = categories.find((cat) => cat.value === leaveDetails.category)
      const requestedDays = differenceInDays(new Date(leaveDetails.endDate), new Date(leaveDetails.startDate)) + 1

      if (selectedCategory && requestedDays > selectedCategory.balance) {
        errors.category = `Insufficient balance. You have ${selectedCategory.balance} days available.`
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please fix the validation errors")
      return
    }

    if (!user || !user.emp_id) {
      setError("User is not authenticated")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const formattedLeaveDetails = {
        ...leaveDetails,
        startDate: format(new Date(leaveDetails.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(leaveDetails.endDate), "yyyy-MM-dd"),
      }

      const response = await axios.post(
        `${BASE_URL}/leave/apply_leave.php`,
        formattedLeaveDetails,
      )

      if (response.data.success) {
        onLeaveApplied()
        handleClose()
      } else {
        setError(response.data.message || "Failed to apply for leave")
      }
    } catch (err) {
      setError("Error applying for leave: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setLeaveDetails({
      empid: user?.emp_id || "",
      startDate: null,
      endDate: null,
      reason: "",
      status: "Pending",
      category: "",
    })
    setError("")
    setValidationErrors({})
    setShowPreview(false)
    onClose()
  }

  const calculateDays = () => {
    if (!leaveDetails.startDate || !leaveDetails.endDate) return 0
    return differenceInDays(new Date(leaveDetails.endDate), new Date(leaveDetails.startDate)) + 1
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#8d0638ff",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <EventAvailable sx={{ mr: 1 }} />
          <Typography variant="h6">Apply for Leave</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={showPreview ? 6 : 12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
                Leave Application Details
              </Typography>
              <Divider />
            </Box>

            <Stack spacing={3}>
              <TextField
                label="Employee ID"
                value={leaveDetails.empid}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Leave Balance Cards */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <Category sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Available Leave Balance
                </Typography>
                {loadingCategories ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {categories.map((category) => (
                      <Grid item xs={12} sm={6} md={4} key={category.value}>
                        <LeaveBalanceCard
                          category={category.label}
                          balance={category.balance}
                          isSelected={leaveDetails.category === category.value}
                          onClick={() => category.balance > 0 && handleChange("category", category.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
                {validationErrors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                    {validationErrors.category}
                  </Typography>
                )}
              </Box>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={leaveDetails.startDate}
                      onChange={(newValue) => handleChange("startDate", newValue)}
                      minDate={today}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!validationErrors.startDate}
                          helperText={validationErrors.startDate}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={leaveDetails.endDate}
                      onChange={(newValue) => handleChange("endDate", newValue)}
                      minDate={leaveDetails.startDate || today}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!validationErrors.endDate}
                          helperText={validationErrors.endDate}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>

              {calculateDays() > 0 && (
                <Box sx={{ p: 2, bgcolor: theme.palette.info.light + "20", borderRadius: 1 }}>
                  <Typography variant="body2" color="info.main" sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTime sx={{ mr: 1 }} />
                    Total leave duration: {calculateDays()} day{calculateDays() !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              )}

              <TextField
                label="Reason for Leave"
                value={leaveDetails.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                error={!!validationErrors.reason}
                helperText={validationErrors.reason || "Please provide a detailed reason for your leave"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Grid>

          {/* Preview Section */}
          <AnimatePresence>
            {showPreview && (
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LeavePreview leaveDetails={leaveDetails} categories={categories} />
                </motion.div>
              </Grid>
            )}
          </AnimatePresence>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          bgcolor: "#f5f5f5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button variant="outlined" startIcon={<Preview />} onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !leaveDetails.category || !leaveDetails.startDate || !leaveDetails.endDate}
            startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
            sx={{
              bgcolor: "#8d0638ff",
              "&:hover": {
                bgcolor: "#0f1f3d",
              },
            }}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ApplyLeave
