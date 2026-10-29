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
  CircularProgress,
  Alert,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  alpha,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material"
import { CloudUpload, Policy, Close, Description, InsertDriveFile } from "@mui/icons-material"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"

function AddPolicyDialog({ open, onClose, onPolicyAdded }) {
  const { user } = useAuth()
  const [policyName, setPolicyName] = useState("")
  const [policyDescription, setPolicyDescription] = useState("")
  const [pdfBase64, setPdfBase64] = useState("")
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file only")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB")
        return
      }

      setFileName(file.name)
      setError("")

      const reader = new FileReader()
      reader.onloadend = () => {
        setPdfBase64(reader.result.split(",")[1])
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!policyName.trim()) {
      setError("Policy name is required")
      return false
    }
    if (!policyDescription.trim()) {
      setError("Policy description is required")
      return false
    }
    if (!pdfBase64) {
      setError("Please upload a PDF file")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await axios.post(`${BASE_URL}/policy/add_policy.php`, {
        subject: policyName,
        body: policyDescription,
        pdf: pdfBase64,
        Tenent_Id: user?.tenent_id,
      })

      if (response.data.success) {
        setSuccess("Policy added successfully!")
        setTimeout(() => {
          onPolicyAdded()
          handleClose()
        }, 1500)
      } else {
        setError(response.data.message || "Failed to add policy")
      }
    } catch (error) {
      console.error("Error adding policy:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setPolicyName("")
      setPolicyDescription("")
      setPdfBase64("")
      setFileName("")
      setError("")
      setSuccess("")
      onClose()
    }
  }

  const removeFile = () => {
    setPdfBase64("")
    setFileName("")
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
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
          p: 2.5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, ${alpha("#8d0638ff", 0.9)} 0%, ${alpha("#6d0430ff", 0.9)} 100%)`,
            zIndex: 1,
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, position: 'relative', zIndex: 2 }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            bgcolor: alpha('#ffffff', 0.2),
            borderRadius: 2,
          }}>
            <Policy sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="700">
              Add New Policy
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
              Create company policy document
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleClose} 
          sx={{ 
            color: "white", 
            position: 'relative', 
            zIndex: 2,
            bgcolor: alpha('#ffffff', 0.1),
            '&:hover': {
              bgcolor: alpha('#ffffff', 0.2),
            }
          }}
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2.5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Add a new company policy with detailed description and PDF document attachment.
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {/* Policy Name */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem', mb: 1.5 }}>
              📝 Policy Information
            </Typography>
            <TextField
              fullWidth
              label="Policy Name"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder="Enter policy name"
              disabled={loading}
              size="small"
              InputProps={{
                startAdornment: (
                  <Policy sx={{ mr: 1, color: 'text.secondary', fontSize: '1.1rem' }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          {/* Policy Description */}
          <Box>
            <TextField
              fullWidth
              label="Policy Description"
              multiline
              rows={3}
              value={policyDescription}
              onChange={(e) => setPolicyDescription(e.target.value)}
              placeholder="Enter detailed policy description..."
              disabled={loading}
              size="small"
              InputProps={{
                startAdornment: (
                  <Description sx={{ mr: 1, color: 'text.secondary', fontSize: '1.1rem', alignSelf: 'flex-start', mt: 1 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          {/* File Upload */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem', mb: 1.5 }}>
              📎 Policy Document
            </Typography>
            
            {fileName ? (
              <Card
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, width: 40, height: 40 }}>
                      <InsertDriveFile />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" sx={{ fontSize: '0.85rem' }}>
                        {fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF Document
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={removeFile}
                    disabled={loading}
                    sx={{
                      color: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.04),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            ) : (
              <Card
                sx={{
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() => !loading && document.getElementById('pdf-upload')?.click()}
              >
                <input
                  accept="application/pdf"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="pdf-upload"
                  disabled={loading}
                />
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: theme.palette.primary.main, 
                  width: 48, 
                  height: 48,
                  mx: 'auto',
                  mb: 1.5
                }}>
                  <CloudUpload />
                </Avatar>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Upload PDF Document
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                  Click to browse or drag and drop your PDF file
                </Typography>
                <Chip 
                  label="Max 10MB" 
                  size="small" 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.main,
                    fontSize: '0.7rem'
                  }}
                />
              </Card>
            )}
          </Box>
        </Stack>

        {/* Status Messages */}
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'center', mt: 3, gap: 1.5, p: 2, bgcolor: alpha(theme.palette.info.main, 0.04), borderRadius: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Adding policy document...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.error.light}`,
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
              mt: 2, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.success.light}`,
            }}
          >
            {success}
          </Alert>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.grey[50], 0.8),
        }}
      >
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 2,
            minWidth: 80,
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !policyName || !policyDescription || !pdfBase64}
          variant="contained"
          size="small"
          sx={{ 
            borderRadius: 2,
            minWidth: 120,
            bgcolor: "#8d0638ff",
            fontWeight: "600",
            "&:hover": {
              bgcolor: "#6d0430ff",
            },
            "&:disabled": {
              bgcolor: theme.palette.grey[300],
              color: theme.palette.grey[500],
            }
          }}
        >
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            "Add Policy"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddPolicyDialog