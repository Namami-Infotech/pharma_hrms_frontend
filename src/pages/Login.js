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
import logo from "../assets/HRSmileLogo.jpeg"
import banner from "../assets/Login.png"
import playstore from "../assets/playstore.png"
import appstore from "../assets/appstore.png"

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
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      padding: { xs: 2, sm: 3, md: 4 },
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #8d0638 0%, #b81652 100%)',
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
      size="small"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          },
          '&.Mui-focused': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 2px ${alpha('#8d0638', 0.2)}`,
          },
          '& fieldset': {
            borderColor: alpha(theme.palette.text.primary, 0.1),
          },
          '&:hover fieldset': {
            borderColor: alpha('#8d0638', 0.3),
          },
          '&.Mui-focused fieldset': {
            borderColor: '#8d0638',
          },
        },
        '& .MuiInputLabel-root': {
          color: theme.palette.text.secondary,
          fontSize: { xs: '0.9rem', sm: '1rem' },
        },
        my: 1.5,
      }}
      {...props}
    />
  )
}

const StyledButton = ({ children, loading, ...props }) => (
  <Button
    component={motion.button}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    variant="contained"
    sx={{
      borderRadius: 2,
      padding: { xs: '10px 24px', sm: '12px 32px' },
      textTransform: 'none',
      fontSize: { xs: '0.9rem', sm: '1rem' },
      fontWeight: 600,
      background: 'linear-gradient(135deg, #8d0638 0%, #b81652 100%)',
      boxShadow: '0 4px 16px rgba(141, 6, 56, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #7a0530 0%, #a61448 100%)',
        boxShadow: '0 6px 20px rgba(141, 6, 56, 0.4)',
      },
      '&:disabled': {
        background: theme => theme.palette.action.disabled,
      },
      ...props.sx,
    }}
    {...props}
  >
    {loading ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} color="inherit" />
        Signing In...
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
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha('#8d0638', 0.05)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${alpha('#b81652', 0.05)} 0%, transparent 50%)`,
        },
      }}
    >
      {/* Animated Background Elements - Hidden on small mobile */}
      {!isSmallMobile && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#8d0638', 0.1)} 0%, transparent 70%)`,
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px) scale(1)' },
                '50%': { transform: 'translateY(-20px) scale(1.05)' },
              },
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              right: '15%',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#b81652', 0.08)} 0%, transparent 70%)`,
              animation: 'float 8s ease-in-out infinite 1s',
            }}
          />
        </>
      )}

      <Grid 
        container 
        sx={{ 
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Left Side - Brand Section - Hidden on small screens */}
        {(
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: { xs: 2, md: 3, lg: 4 },
              background: 'linear-gradient(135deg, #8d0638 0%, #b81652 100%)',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ 
                textAlign: 'center', 
                zIndex: 2,
                width: '100%',
                maxWidth: 600,
              }}
            >
              <Box
                component={motion.img}
                src={logo}
                alt="HR Smile Logo"
                sx={{
                  width: { xs: 60, md: 80, lg: 120 },
                  height: { xs: 60, md: 80, lg: 120 },
                  mb: { xs: 1, md: 2, lg: 4 },
                  filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
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
                  color: 'white',
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '1.5rem', md: '2rem', lg: '3.5rem' },
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: 1.2,
                }}
              >
                SAFEGUARD HR
              </Typography>

              <Typography
                variant="h6"
                component={motion.p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  mb: { xs: 2, md: 3, lg: 4 },
                  maxWidth: 400,
                  lineHeight: 1.5,
                  fontSize: { xs: '0.875rem', md: '1rem', lg: '1.25rem' },
                  mx: 'auto',
                }}
              >
                Complete HR Solution Tailor-made for Your Business
              </Typography>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={banner}
                  alt="HR Platform Illustration"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: isMobile ? 150 : 250,
                    filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.4))',
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: 16 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    fontSize: { xs: '0.7rem', md: '0.75rem', lg: '0.875rem' },
                    flexWrap: 'wrap',
                  }}
                >
                  <span>by</span>
                  <Link
                    to="https://namami-infotech.com/"
                    target="_blank"
                    style={{
                      color: 'white',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#FFD700')}
                    onMouseOut={(e) => (e.currentTarget.style.color = 'white')}
                  >
                    Namami Infotech India Pvt. Ltd.
                  </Link>
                </Typography>
              </motion.div>
            </motion.div>
          </Grid>
        )}

        {/* Right Side - Login Form - Full width on small screens */}
        <Grid
          item
          xs={12}
          md={isSmallMobile ? 12 : 4}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: { xs: 1, sm: 2, md: 3, lg: 4 },
            height: '100%',
            overflow: 'hidden',
            background: isSmallMobile ? 'linear-gradient(135deg, #8d0638 0%, #b81652 100%)' : 'transparent',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 400, md: 480 },
              height: isSmallMobile ? '100%' : 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isSmallMobile ? 2 : 0,
            }}
          >
            <GlassCard 
              sx={{ 
                width: '100%',
                maxHeight: isSmallMobile ? '100%' : '90vh',
                height: isSmallMobile ? '100%' : 'auto',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: isSmallMobile ? 'center' : 'flex-start',
              }}
            >
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  mb: { xs: 2, sm: 3, md: 4 },
                  flexShrink: 0,
                }}
              >
                {isSmallMobile && (
                  <Box
                    component={motion.img}
                    src={logo}
                    alt="HR Smile Logo"
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 2,
                      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Dashboard 
                    sx={{ 
                      fontSize: { xs: 32, sm: 40, md: 48 }, 
                      mb: 1,
                      background: `linear-gradient(135deg, #8d0638, #b81652)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }} 
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, #8d0638, #b81652)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      opacity: 0.8,
                      fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                    }}
                  >
                    Sign in to access your HR dashboard
                  </Typography>
                </motion.div>
              </Box>

              <Box sx={{ 
                flex: isSmallMobile ? 1 : 'none', 
                overflow: 'auto', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: isSmallMobile ? 'center' : 'flex-start',
              }}>
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

                <motion.form
                  onSubmit={handleLogin}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ 
                    flex: isSmallMobile ? 1 : 'none', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: isSmallMobile ? 'center' : 'flex-start',
                  }}
                >
                  <Box sx={{ flex: isSmallMobile ? 1 : 'none' }}>
                    <StyledTextField
                      label="Employee ID"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#8d0638', fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
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
                            <Lock sx={{ color: '#8d0638', fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ 
                                color: showPassword ? '#8d0638' : 'text.secondary',
                                '&:hover': {
                                  backgroundColor: alpha('#8d0638', 0.1),
                                },
                                padding: { xs: '4px', sm: '8px' },
                              }}
                            >
                              {showPassword ? <VisibilityOff fontSize={isSmallMobile ? "small" : "medium"} /> : <Visibility fontSize={isSmallMobile ? "small" : "medium"} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                    />

                    <Box sx={{ textAlign: 'right', mb: 2 }}>
                      <Button
                        onClick={() => setOpenDialog(true)}
                        startIcon={<LockReset sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 500,
                          color: 'text.secondary',
                          fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                          '&:hover': {
                            color: '#8d0638',
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        Forgot Password?
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ flexShrink: 0, mt: isSmallMobile ? 'auto' : 0 }}>
                    <StyledButton
                      type="submit"
                      fullWidth
                      loading={loading}
                      disabled={!formValid || loading}
                      endIcon={!loading && <ArrowForward />}
                    >
                      {loading ? '' : 'Sign In'}
                    </StyledButton>

                    {/* Mobile App Downloads */}
                    {!isSmallMobile && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 2, opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            Get the HR Smile mobile app
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Tooltip title="Download from Google Play Store" arrow TransitionComponent={Zoom}>
                              <Link 
                                to="https://play.google.com/store/apps/details?id=com.namami.safeguard" 
                                target="_blank"
                                style={{ textDecoration: 'none' }}
                              >
                                <motion.img
                                  src={playstore}
                                  alt="Google Play Store"
                                  style={{
                                    height: isMobile ? 35 : 40,
                                    cursor: 'pointer',
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                />
                              </Link>
                            </Tooltip>

                            <Tooltip title="Download from Apple App Store" arrow TransitionComponent={Zoom}>
                              <Link 
                                to="https://apps.apple.com/in/app/hr-smile/id6738949653" 
                                target="_blank"
                                style={{ textDecoration: 'none' }}
                              >
                                <motion.img
                                  src={appstore}
                                  alt="Apple App Store"
                                  style={{
                                    height: isMobile ? 35 : 40,
                                    cursor: 'pointer',
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                />
                              </Link>
                            </Tooltip>
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                </motion.form>
              </Box>
            </GlassCard>
          </Box>
        </Grid>
      </Grid>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => !loading && setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            margin: 2,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 32px)',
          },
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockReset sx={{ color: '#8d0638' }} />
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
                  <Email sx={{ color: '#8d0638' }} />
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