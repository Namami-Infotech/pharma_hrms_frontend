"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  alpha,
  IconButton,
} from "@mui/material"
import { FlightTakeoff, CalendarToday, LocationOn, DirectionsCar, Close } from "@mui/icons-material"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"

function ApplyTravel({ open, onClose, onTravelApplied }) {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [travelEntry, setTravelEntry] = useState({
    empId: user.emp_id,
    travelDate: "",
    travelDestination: "",
    travelFrom: "",
    travelTo: "",
    travelType: "",
    status: "Pending",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const travelTypes = ["Business", "Training", "Conference", "Client Meeting", "Other"]

  const handleChange = (field, value) => {
    setTravelEntry({ ...travelEntry, [field]: value })
    if (error) setError("")
  }

  const validateForm = () => {
    const requiredFields = ["travelDate", "travelDestination", "travelFrom", "travelTo", "travelType"]
    const emptyFields = requiredFields.filter((field) => !travelEntry[field].trim())

    if (emptyFields.length > 0) {
      setError("Please fill in all required fields")
      return false
    }

    const selectedDate = new Date(travelEntry.travelDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError("Travel date cannot be in the past")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!user || !user.emp_id) {
      setError("User authentication required")
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setSuccess("")
    setError("")

    try {
      const payload = {
        application: travelEntry,
      }
      const response = await axios.post(
        `${BASE_URL}/travel/apply_travel.php`,
        payload,
      )

      if (response.data.success) {
        setSuccess("Travel application submitted successfully!")
        setTimeout(() => {
          onTravelApplied()
          onClose()
          setTravelEntry({
            empId: user.emp_id,
            travelDate: "",
            travelDestination: "",
            travelFrom: "",
            travelTo: "",
            travelType: "",
            status: "Pending",
          })
          setSuccess("")
        }, 1500)
      } else {
        setError(response.data.message || "Failed to submit travel application")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError("")
      setSuccess("")
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : 3,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#8d0638ff",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FlightTakeoff sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="700">
              Apply for Travel
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
              Submit your travel request
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleClose} 
          sx={{ 
            color: "white",
            bgcolor: alpha("#ffffff", 0.1),
            "&:hover": {
              bgcolor: alpha("#ffffff", 0.2),
            }
          }}
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mt:3, mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Fill in the details for your travel request. All fields are required.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Travel Date"
              type="date"
              value={travelEntry.travelDate}
              onChange={(e) => handleChange("travelDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1.5, color: "action.active" }} />,
              }}
              inputProps={{
                min: new Date().toISOString().split("T")[0],
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Travel Type</InputLabel>
              <Select
                value={travelEntry.travelType}
                onChange={(e) => handleChange("travelType", e.target.value)}
                label="Travel Type"
                sx={{ borderRadius: 2 }}
              >
                {travelTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Travel Destination"
              value={travelEntry.travelDestination}
              onChange={(e) => handleChange("travelDestination", e.target.value)}
              fullWidth
              placeholder="Enter destination city or location"
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1.5, color: "action.active" }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Travel From"
              value={travelEntry.travelFrom}
              onChange={(e) => handleChange("travelFrom", e.target.value)}
              fullWidth
              placeholder="Starting location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Travel To"
              value={travelEntry.travelTo}
              onChange={(e) => handleChange("travelTo", e.target.value)}
              fullWidth
              placeholder="Ending location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Status Messages */}
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 3, gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body1" color="text.secondary">
              Submitting your travel request...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3, 
              borderRadius: 2,
            }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mt: 3, 
              borderRadius: 2,
            }}
          >
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            minWidth: 100,
            borderColor: alpha("#8d0638ff", 0.5),
            color: "#8d0638ff",
            "&:hover": {
              borderColor: "#8d0638ff",
              bgcolor: alpha("#8d0638ff", 0.04),
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          variant="contained"
          sx={{ 
            borderRadius: 2,
            minWidth: 140,
            bgcolor: "#8d0638ff",
            fontWeight: "600",
            fontSize: "1rem",
            "&:hover": {
              bgcolor: "#6d052cff",
            }
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ApplyTravel