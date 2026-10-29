"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
  Slide,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Badge,
  Stack,
} from "@mui/material"
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../auth/AuthContext"
import axios from "axios"

const MotionPaper = motion(Paper)
const MotionCard = motion(Card)
const MotionBox = motion(Box)

const UserProfile = () => {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // State management
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
  }

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }, [newPassword])

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "error"
    if (passwordStrength < 50) return "warning"
    if (passwordStrength < 75) return "info"
    return "success"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak"
    if (passwordStrength < 50) return "Fair"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
    setPasswordStrength(0)
  }

  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return false
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return false
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await axios.post(`${BASE_URL}/auth/change_password.php`, {
        EmpId: user?.emp_id,
        currentPassword,
        newPassword,
      })

      if (response.data.success) {
        setSuccess(response.data.message)
        setSnackbarMessage("Password changed successfully!")
        setSnackbarSeverity("success")
        setSnackbarOpen(true)
        setTimeout(handleClose, 2000)
      } else {
        setError(response.data.message)
        setSnackbarMessage("Failed to change password")
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
      }
    } catch (err) {
      setError("Failed to change password. Please try again.")
      setSnackbarMessage("Network error occurred")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const profileStats = [
    { label: "Employee ID", value: user?.emp_id || "N/A", icon: <BadgeIcon /> },
    { label: "Email", value: user?.email || "N/A", icon: <EmailIcon /> },
    { label: "Role", value: user?.role || "Employee", icon: <PersonIcon /> },
    { label: "Status", value: "Active", icon: <CheckCircleIcon /> },
  ]

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box sx={{ maxWidth: 1200, margin: "auto" }}>
          {/* Header */}
          
          <Grid container spacing={4}>
            {/* Profile Card */}
            <Grid item xs={12} lg={4}>
              <MotionCard
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                sx={{
                  background: "white",
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  overflow: "visible",
                  position: "relative",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "#8d0638",
                            color: "white",
                            "&:hover": { bgcolor: "#6d052c" },
                          }}
                        >
                          <PhotoCameraIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          margin: "auto",
                          border: "4px solid white",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          background: "linear-gradient(45deg, #8d0638, #c2185b)",
                        }}
                        src={user?.image}
                        alt={user?.username}
                      >
                        <PersonIcon sx={{ fontSize: 60 }} />
                      </Avatar>
                    </Badge>
                  </motion.div>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 3,
                      mb: 1,
                      fontWeight: "bold",
                      background: "linear-gradient(45deg, #8d0638, #c2185b)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {user?.username || "User Name"}
                  </Typography>

                  {/* FIXED: Use valid MUI color instead of hex code */}
                  <Chip 
                    label={user?.role || "Employee"} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      mb: 3,
                      borderColor: "#8d0638",
                      color: "#8d0638",
                      '& .MuiChip-label': {
                        fontWeight: 600
                      }
                    }} 
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      startIcon={<LockIcon />}
                      onClick={handleOpen}
                      sx={{
                        background: "linear-gradient(45deg, #8d0638, #c2185b)",
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 600,
                        boxShadow: "0 4px 15px rgba(141, 6, 56, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #6d052c, #a0154b)",
                          boxShadow: "0 6px 20px rgba(141, 6, 56, 0.6)",
                        },
                      }}
                    >
                      Change Password
                    </Button>
                  </motion.div>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Profile Information */}
            <Grid item xs={12} lg={8}>
              <MotionCard
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                sx={{
                  background: "white",
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  height: "fit-content",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <InfoIcon sx={{ mr: 2, color: "#8d0638" }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      Profile Information
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {profileStats.map((stat, index) => (
                      <Grid item xs={12} sm={6} key={stat.label}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                          <Paper
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              background: "linear-gradient(135deg, rgba(141, 6, 56, 0.1), rgba(194, 24, 91, 0.1))",
                              border: "1px solid rgba(141, 6, 56, 0.2)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 8px 25px rgba(141, 6, 56, 0.15)",
                              },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <Box
                                sx={{
                                  color: "#8d0638",
                                  mr: 2,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {stat.icon}
                              </Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                }}
                              >
                                {stat.label}
                              </Typography>
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                color: "text.primary",
                              }}
                            >
                              {stat.value}
                            </Typography>
                          </Paper>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Security Section */}
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <SecurityIcon sx={{ mr: 2, color: "#8d0638" }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Security Settings
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Keep your account secure by regularly updating your password and enabling security features.
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Chip icon={<CheckCircleIcon />} label="Password Protected" color="success" variant="outlined" />
                      <Chip icon={<CheckCircleIcon />} label="Account Active" color="success" variant="outlined" />
                    </Stack>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* Enhanced Change Password Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: "white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            pb: 1,
            background: "linear-gradient(45deg, #8d0638, #c2185b)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          <LockIcon sx={{ mr: 1, verticalAlign: "middle", color: "#8d0638" }} />
          Change Password
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          {newPassword && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="caption" sx={{ mr: 1 }}>
                  Password Strength:
                </Typography>
                <Typography variant="caption" color={`${getPasswordStrengthColor()}.main`} sx={{ fontWeight: "bold" }}>
                  {getPasswordStrengthText()}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                color={getPasswordStrengthColor()}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          <TextField
            margin="dense"
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={confirmPassword && newPassword !== confirmPassword}
            helperText={confirmPassword && newPassword !== confirmPassword ? "Passwords don't match" : ""}
            sx={{ mb: 2 }}
          />

          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2">Updating password...</Typography>
                </Box>
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={
              loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword
            }
            sx={{
              background: "linear-gradient(45deg, #8d0638, #c2185b)",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                background: "linear-gradient(45deg, #6d052c, #a0154b)",
              },
            }}
          >
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default UserProfile