"use client"

import { useState, useEffect } from "react"
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
  Paper,
  InputAdornment,
  CircularProgress,
  Slide,
  Grow,
  Alert,
  Snackbar,
  Tooltip,
  Zoom,
  alpha,
} from "@mui/material"
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  ArrowForward,
  LockReset,
  ErrorOutline,
  CheckCircleOutline,
  Dashboard,
} from "@mui/icons-material"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../components/auth/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

import { BASE_URL } from "../api/endpoints"

// Import images - update paths as needed
import logo from "../assets/aberdure_logo.png"
import newLogo from "../assets/aberdure_logo_new.png"
import banner from "../assets/pharma.avif"

const API_URL = `${BASE_URL}/auth`

// Custom styled components matching dashboard aesthetics
const GlassCard = ({ children, sx = {}, ...props }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    elevation={0}
    sx={{
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(20px)',
      borderRadius: { xs: 2.5, sm: 3 },
      padding: { xs: 2, sm: 3, md: 3.5 },
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #f37021 0%, #ff8833 100%)',
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Paper>
)

const StyledTextField = ({ ...props }) => {
  const theme = useTheme()
  return (
    <TextField
      variant="outlined"
      fullWidth
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        '& .MuiOutlinedInput-root': {
          borderRadius: 2.5,
          minHeight: { xs: 48, sm: 52 },
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
          },
          '&.Mui-focused': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 2px ${alpha('#f37021', 0.2)}`,
          },
          '& fieldset': {
            borderColor: alpha(theme.palette.text.primary, 0.12),
          },
          '&:hover fieldset': {
            borderColor: alpha('#f37021', 0.4),
          },
          '&.Mui-focused fieldset': {
            borderColor: '#f37021',
          },
        },
        '& .MuiInputBase-input': {
          fontSize: { xs: '15.5px', sm: '15px' },
          padding: { xs: '13px 14px', sm: '14.5px 16px' },
          boxSizing: 'border-box',
        },
        '& .MuiInputLabel-root': {
          color: theme.palette.text.secondary,
          fontSize: { xs: '0.9rem', sm: '0.95rem' },
        },
        '& input::-ms-reveal, & input::-ms-clear': {
          display: 'none !important',
        },
        my: { xs: 1.2, sm: 1.5 },
      }}
      {...props}
    />
  )
}

const StyledButton = ({ children, loading, ...props }) => (
  <Button
    component={motion.button}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    variant="contained"
    fullWidth
    sx={{
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 2.5,
      minHeight: { xs: 46, sm: 50 },
      padding: { xs: '12px 20px', sm: '13px 28px' },
      textTransform: 'none',
      fontSize: { xs: '0.98rem', sm: '1.05rem' },
      fontWeight: 600,
      background: 'linear-gradient(135deg, #f37021 0%, #ea580c 100%)',
      boxShadow: '0 4px 16px rgba(243, 112, 33, 0.35)',
      '&:hover': {
        background: 'linear-gradient(135deg, #d95300 0%, #c2410c 100%)',
        boxShadow: '0 6px 20px rgba(243, 112, 33, 0.45)',
      },
      '&:disabled': {
        background: (theme) => theme.palette.action.disabledBackground || '#e2e8f0',
        color: (theme) => theme.palette.action.disabled || '#94a3b8',
      },
      ...props.sx,
    }}
    {...props}
  >
    {loading ? (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <CircularProgress size={20} color="inherit" />
        <span>Signing In...</span>
      </Box>
    ) : (
      children
    )}
  </Button>
)

export default function EnhancedLoginPage() {
  const [empId, setEmpId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [formValid, setFormValid] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Validate form
  useEffect(() => {
    setFormValid(empId.trim() !== "" && password.trim() !== "")
  }, [empId, password])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(`${API_URL}/login.php`, {
        EmpId: empId,
        password: password,
      })

      if (response.data.success) {
        login(response.data.data)
        setSnackbarMessage("Login successful! Redirecting to dashboard...")
        setSnackbarSeverity("success")
        setShowSnackbar(true)

        setTimeout(() => {
          navigate("/dashboard")
        }, 1500)
      } else {
        setError(response.data.message)
        setSnackbarMessage(response.data.message || "Login failed")
        setSnackbarSeverity("error")
        setShowSnackbar(true)
      }
    } catch (error) {
      const errorMessage = "Network error. Please check your connection and try again."
      setError(errorMessage)
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity("error")
      setShowSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotPasswordError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setForgotPasswordError("")
    setForgotPasswordSuccess("")

    try {
      const response = await axios.post(`${API_URL}/forget_password.php`, {
        email: forgotEmail,
      })

      if (response.data.success) {
        setForgotPasswordSuccess("Password reset instructions sent to your email")
        setSnackbarMessage("Password reset instructions sent to your email")
        setSnackbarSeverity("success")
        setShowSnackbar(true)

        setTimeout(() => {
          setOpenDialog(false)
        }, 2000)
      } else {
        setForgotPasswordError(response.data.message || "Email not found")
      }
    } catch (error) {
      setForgotPasswordError("Network error. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setShowSnackbar(false)
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #edf2f7 50%, #e2e8f0 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'stretch',
        justifyContent: 'center',
        boxSizing: 'border-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 15% 20%, ${alpha('#f37021', 0.06)} 0%, transparent 45%),
                      radial-gradient(circle at 85% 80%, ${alpha('#ff8833', 0.05)} 0%, transparent 45%)`,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Animated Background Elements - Hidden on mobile/tablet */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: '8%',
          left: '6%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#f37021', 0.1)} 0%, transparent 70%)`,
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-20px) scale(1.05)' },
          },
        }}
      />
      
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          bottom: '10%',
          right: '8%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#f37021', 0.08)} 0%, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }}
      />

      {/* Left Side - Brand Section - Desktop (>= 900px) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: { md: '0 0 55%', lg: '0 0 58%' },
          width: { md: '55%', lg: '58%' },
          minHeight: '100vh',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { md: 4, lg: 6, xl: 8 },
          background: '#ffffff',
          borderRight: '1px solid #eef2f6',
          boxShadow: '4px 0 24px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ 
            textAlign: 'center', 
            zIndex: 2,
            width: '100%',
            maxWidth: 520,
            boxSizing: 'border-box',
          }}
        >
          {/* Aberdure Pharma Logo */}
          <Box
            component={motion.img}
            src={newLogo}
            alt="Aberdure Pharma Logo"
            sx={{
              width: 'auto',
              maxWidth: { md: 220, lg: 260 },
              height: 'auto',
              maxHeight: { md: 75, lg: 85 },
              objectFit: 'contain',
              display: 'inline-block',
              mb: { md: 1.5, lg: 2 },
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />

          <Typography
            variant="h2"
            component={motion.h2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            sx={{
              color: '#f37021',
              fontWeight: 900,
              mb: 1,
              fontSize: { md: '2.0rem', lg: '2.5rem', xl: '2.8rem' },
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}
          >
            ABERDURE PHARMA
          </Typography>

          <Typography
            variant="h6"
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            sx={{
              color: '#64748b',
              fontWeight: 500,
              mb: { md: 2.5, lg: 3 },
              maxWidth: 440,
              lineHeight: 1.5,
              fontSize: { md: '0.92rem', lg: '1.05rem' },
              mx: 'auto',
            }}
          >
            Complete HR Solution Tailor-made for Your Business
          </Typography>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={banner}
              alt="Pharma Platform Illustration"
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: 'min(260px, 32vh)',
                borderRadius: '16px',
                boxShadow: '0 16px 36px rgba(0,0,0,0.1)',
                border: '1px solid #f1f5f9',
                objectFit: 'cover',
              }}
            />
          </motion.div>
        </motion.div>
      </Box>

      {/* Right Side - Login Form - Full width on small screens, centered on desktop */}
      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '0 0 45%', lg: '0 0 42%' },
          width: { xs: '100%', md: '45%', lg: '42%' },
          minHeight: { xs: '100vh', md: 'auto' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { xs: '24px 20px', sm: '32px 28px', md: '40px 32px' },
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 400, md: 420 },
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch',
            boxSizing: 'border-box',
            my: 'auto',
          }}
        >
          {/* Mobile Branding Header (Only visible on screens < 900px) */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              mb: { xs: 2, sm: 2.5 },
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Box
              component={motion.img}
              src={newLogo}
              alt="Aberdure Pharma Logo"
              sx={{
                width: 'auto',
                maxWidth: { xs: 150, sm: 180 },
                height: 'auto',
                maxHeight: 60,
                objectFit: 'contain',
                mb: 1,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
            <Typography
              variant="h5"
              sx={{
                color: '#f37021',
                fontWeight: 900,
                fontSize: { xs: '1.25rem', sm: '1.45rem' },
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              ABERDURE PHARMA
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                fontSize: { xs: '0.78rem', sm: '0.85rem' },
                mt: 0.5,
              }}
            >
              Complete HR Solution Tailor-made for Your Business
            </Typography>
          </Box>

          <GlassCard sx={{ width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 2.5, md: 3 }, width: '100%', boxSizing: 'border-box' }}>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Dashboard 
                  sx={{ 
                    fontSize: { xs: 32, sm: 38, md: 44 }, 
                    mb: 0.5,
                    background: `linear-gradient(135deg, #f37021, #ea580c)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }} 
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(135deg, #f37021, #ea580c)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                    fontSize: { xs: '1.4rem', sm: '1.65rem', md: '1.85rem' },
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    opacity: 0.85,
                    fontSize: { xs: '0.82rem', sm: '0.9rem' },
                  }}
                >
                  Sign in to access your HR dashboard
                </Typography>
              </motion.div>
            </Box>

            <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        alignItems: 'center',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                      icon={<ErrorOutline />}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} style={{ width: '100%', boxSizing: 'border-box' }}>
                <StyledTextField
                  label="Employee ID"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#f37021', fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="username"
                  placeholder="Enter your employee ID"
                />

                <StyledTextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#f37021', fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          aria-label="Toggle password visibility"
                          sx={{ 
                            color: showPassword ? '#f37021' : 'text.secondary',
                            '&:hover': {
                              backgroundColor: alpha('#f37021', 0.1),
                            },
                            padding: { xs: '6px', sm: '8px' },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />

                <Box sx={{ textAlign: 'right', mb: 2, mt: 0.5 }}>
                  <Button
                    onClick={() => setOpenDialog(true)}
                    startIcon={<LockReset sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'text.secondary',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      '&:hover': {
                        color: '#f37021',
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>

                <StyledButton
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={!formValid || loading}
                  endIcon={!loading && <ArrowForward />}
                >
                  {loading ? '' : 'Sign In'}
                </StyledButton>
              </form>
            </Box>
          </GlassCard>
        </Box>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => !loading && setOpenDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18)',
            margin: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: { xs: 'calc(100% - 32px)', sm: 420 },
          },
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockReset sx={{ color: '#f37021' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Reset Your Password
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>

          <AnimatePresence>
            {forgotPasswordError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }} icon={<ErrorOutline />}>
                  {forgotPasswordError}
                </Alert>
              </motion.div>
            )}

            {forgotPasswordSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }} icon={<CheckCircleOutline />}>
                  {forgotPasswordSuccess}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <StyledTextField
            label="Email Address"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            disabled={loading || forgotPasswordSuccess !== ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#f37021' }} />
                </InputAdornment>
              ),
            }}
            autoComplete="email"
            placeholder="Enter your registered email"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            Cancel
          </Button>

          <StyledButton
            onClick={handleForgotPassword}
            loading={loading}
            disabled={!forgotEmail || forgotPasswordSuccess !== ""}
            sx={{ minWidth: 140 }}
          >
            {loading ? '' : 'Reset Password'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Grow}
        sx={{
          bottom: { xs: 16, sm: 24 },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            alignItems: 'center',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}