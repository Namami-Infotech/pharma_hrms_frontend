"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Tooltip,
  Fade,
  useTheme,
} from "@mui/material"
import { Close, Event, Save, Add, CalendarToday, Title, DeleteOutline, EventAvailable } from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"

const AddHoliday = ({ open, onClose, onHolidayAdded }) => {
  const { user } = useAuth()
  const theme = useTheme()
  const [holidays, setHolidays] = useState([{ date: "", title: "" }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState({})

  const handleHolidayChange = (index, field, value) => {
    const newHolidays = [...holidays]
    newHolidays[index][field] = value
    setHolidays(newHolidays)

    // Clear validation error for this field
    if (validationErrors[`${index}-${field}`]) {
      const newErrors = { ...validationErrors }
      delete newErrors[`${index}-${field}`]
      setValidationErrors(newErrors)
    }
  }

  const handleAddHoliday = () => {
    setHolidays([...holidays, { date: "", title: "" }])
  }

  const handleRemoveHoliday = (index) => {
    if (holidays.length > 1) {
      setHolidays(holidays.filter((_, i) => i !== index))
      // Clear validation errors for removed holiday
      const newErrors = { ...validationErrors }
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`${index}-`)) {
          delete newErrors[key]
        }
      })
      setValidationErrors(newErrors)
    }
  }

  const validateForm = () => {
    const errors = {}
    let isValid = true

    holidays.forEach((holiday, index) => {
      if (!holiday.date.trim()) {
        errors[`${index}-date`] = "Date is required"
        isValid = false
      }
      if (!holiday.title.trim()) {
        errors[`${index}-title`] = "Title is required"
        isValid = false
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please fill in all required fields")
      return
    }

    // Check for duplicate dates
    const dates = holidays.map((h) => h.date)
    const duplicates = dates.filter((date, index) => dates.indexOf(date) !== index)
    if (duplicates.length > 0) {
      setError("Duplicate dates are not allowed")
      return
    }

    setLoading(true)
    setError("")

    try {
      const payload = {
        Tenent_Id: user.tenent_id,
        holidays: holidays.map((holiday) => ({
          date: holiday.date,
          title: holiday.title.trim(),
        })),
      }

      const response = await axios.post(
        `${BASE_URL}/holiday/add_holiday.php`,
        payload,
      )

      if (response.data.success) {
        onHolidayAdded()
        handleClose()
      } else {
        setError(response.data.message || "Failed to add holidays")
      }
    } catch (err) {
      setError("Error adding holidays: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setHolidays([{ date: "", title: "" }])
    setError("")
    setValidationErrors({})
    onClose()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
          <Typography variant="h6">Add Holidays</Typography>
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Add one or more holidays to the company calendar. You can add multiple holidays at once.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
            <Event sx={{ mr: 1, color: theme.palette.primary.main }} />
            Holiday Details ({holidays.length} {holidays.length === 1 ? "holiday" : "holidays"})
          </Typography>
          <Divider />
        </Box>

        <AnimatePresence>
          {holidays.map((holiday, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    boxShadow: theme.shadows[4],
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Holiday #{index + 1}
                    </Typography>
                    {holidays.length > 1 && (
                      <Tooltip title="Remove Holiday">
                        <IconButton
                          onClick={() => handleRemoveHoliday(index)}
                          color="error"
                          size="small"
                          sx={{
                            "&:hover": {
                              bgcolor: theme.palette.error.light + "20",
                            },
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Holiday Date"
                        type="date"
                        value={holiday.date}
                        onChange={(e) => handleHolidayChange(index, "date", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={!!validationErrors[`${index}-date`]}
                        helperText={validationErrors[`${index}-date`]}
                        InputProps={{
                          startAdornment: <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />,
                        }}
                      />
                      {holiday.date && (
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={formatDate(holiday.date)}
                            size="small"
                            sx={{ color: "#8d0638ff" }}
                            variant="outlined"
                            icon={<CalendarToday />}
                          />
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Holiday Title"
                        value={holiday.title}
                        onChange={(e) => handleHolidayChange(index, "title", e.target.value)}
                        placeholder="e.g., Christmas Day, New Year"
                        error={!!validationErrors[`${index}-title`]}
                        helperText={validationErrors[`${index}-title`]}
                        InputProps={{
                          startAdornment: <Title sx={{ mr: 1, color: "text.secondary" }} />,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddHoliday}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Add Another Holiday
          </Button>
        </Box>

        {holidays.length > 1 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.info.light + "20", borderRadius: 2 }}>
            <Typography variant="body2" color="info.main" sx={{ display: "flex", alignItems: "center" }}>
              <EventAvailable sx={{ mr: 1 }} />
              You are adding {holidays.length} holidays to the calendar
            </Typography>
          </Box>
        )}
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
        <Typography variant="body2" color="text.secondary">
          {holidays.filter((h) => h.date && h.title).length} of {holidays.length} holidays ready
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || holidays.some((h) => !h.date || !h.title)}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{
              bgcolor: "#8d0638ff",
              "&:hover": {
                bgcolor: "#0f1f3d",
              },
            }}
          >
            {loading ? "Adding..." : `Add ${holidays.length} Holiday${holidays.length > 1 ? "s" : ""}`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default AddHoliday
