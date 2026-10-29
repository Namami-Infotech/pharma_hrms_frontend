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
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  useTheme,
  Fade,
  Stack,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import {
  Close,
  CloudUpload,
  Image as ImageIcon,
  Schedule,
  Link as LinkIcon,
  Title,
  Description,
  Send,
  Preview,
  Delete,
  NotificationsActive,
  AccessTime,
  Launch,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"

// Enhanced Image Upload Component
const ImageUploadArea = ({ onImageSelect, selectedImage, onImageRemove }) => {
  const theme = useTheme()

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onImageSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{
        border: `2px dashed ${selectedImage ? theme.palette.success.main : theme.palette.divider}`,
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        bgcolor: selectedImage ? theme.palette.success.light + "10" : theme.palette.action.hover,
        "&:hover": {
          borderColor: theme.palette.primary.main,
          bgcolor: theme.palette.primary.light + "10",
        },
      }}
    >
      {selectedImage ? (
        <Box>
          <Box
            component="img"
            src={selectedImage}
            alt="Preview"
            sx={{
              maxWidth: "100%",
              maxHeight: 200,
              borderRadius: 1,
              mb: 2,
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              component="label"
              size="small"
            >
              Change Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => e.target.files[0] && onImageSelect(e.target.files[0])}
              />
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={onImageRemove}
              size="small"
            >
              Remove
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, mx: "auto", mb: 2, width: 56, height: 56 }}>
            <ImageIcon />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            Upload Image
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop an image here, or click to select
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            component="label"
          >
            Choose File
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => e.target.files[0] && onImageSelect(e.target.files[0])}
            />
          </Button>
        </Box>
      )}
    </Box>
  )
}

// Notification Preview Component
const NotificationPreview = ({ subject, body, url, pushTime, image }) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          p: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <NotificationsActive sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="bold">
          Notification Preview
        </Typography>
      </Box>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
            <NotificationsActive />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {subject || "Subject will appear here"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {body || "Notification body will appear here"}
            </Typography>
            
            {pushTime && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AccessTime fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="caption">
                  {new Date(pushTime).toLocaleString()}
                </Typography>
              </Box>
            )}
            
            {url && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Launch fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                <Typography
                  variant="caption"
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {url}
                </Typography>
              </Box>
            )}
            
            {image && (
              <Box
                component="img"
                src={image}
                alt="Notification"
                sx={{
                  width: "100%",
                  maxHeight: 150,
                  objectFit: "cover",
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function AddNotification({ open, onClose, onNotificationAdded }) {
  const { user } = useAuth()
  const theme = useTheme()
  
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    url: "",
    pushTime: new Date(),
    priority: "normal",
  })
  
  const [base64Image, setBase64Image] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleImageSelect = (file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setBase64Image(reader.result)
        setImagePreview(reader.result)
        setError("")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageRemove = () => {
    setBase64Image(null)
    setImagePreview(null)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required"
    }
    
    if (!formData.body.trim()) {
      errors.body = "Body is required"
    }
    
    if (formData.url && !isValidUrl(formData.url)) {
      errors.url = "Please enter a valid URL"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please fix the validation errors")
      return
    }

    setLoading(true)
    setError("")

    try {
      const payload = {
        subject: formData.subject.trim(),
        body: formData.body.trim(),
        url: formData.url.trim(),
        push_time: formData.pushTime.toISOString(),
        image: base64Image,
        priority: formData.priority,
        Tenent_Id: user.tenent_id,
      }

      const response = await axios.post(
        `${BASE_URL}/notification/add_notification.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.success) {
        onNotificationAdded()
        handleClose()
      } else {
        setError(response.data.message || "Failed to add notification")
      }
    } catch (err) {
      setError("Error adding notification: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      subject: "",
      body: "",
      url: "",
      pushTime: new Date(),
      priority: "normal",
    })
    setBase64Image(null)
    setImagePreview(null)
    setError("")
    setValidationErrors({})
    setShowPreview(false)
    onClose()
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
          <NotificationsActive sx={{ mr: 1 }} />
          <Typography variant="h6">Create New Notification</Typography>
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
                <Title sx={{ mr: 1, color: theme.palette.primary.main }} />
                Notification Details
              </Typography>
              <Divider />
            </Box>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                error={!!validationErrors.subject}
                helperText={validationErrors.subject}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Title color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Body"
                multiline
                rows={4}
                value={formData.body}
                onChange={(e) => handleInputChange("body", e.target.value)}
                error={!!validationErrors.body}
                helperText={validationErrors.body}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="URL (Optional)"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                error={!!validationErrors.url}
                helperText={validationErrors.url || "Add a link for users to take action"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Schedule Time"
                  value={formData.pushTime}
                  onChange={(newValue) => handleInputChange("pushTime", newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Schedule color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </LocalizationProvider>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="low">
                    <Chip label="Low" color="default" size="small" sx={{ mr: 1 }} />
                    Low Priority
                  </MenuItem>
                  <MenuItem value="normal">
                    <Chip label="Normal" sx={{color:"#8d0638ff",mr: 1}} size="small"  />
                    Normal Priority
                  </MenuItem>
                  <MenuItem value="high">
                    <Chip label="High" color="warning" size="small" sx={{ mr: 1 }} />
                    High Priority
                  </MenuItem>
                  <MenuItem value="urgent">
                    <Chip label="Urgent" color="error" size="small" sx={{ mr: 1 }} />
                    Urgent Priority
                  </MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Image Attachment (Optional)
                </Typography>
                <ImageUploadArea
                  onImageSelect={handleImageSelect}
                  selectedImage={imagePreview}
                  onImageRemove={handleImageRemove}
                />
              </Box>
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
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                      <Preview sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Live Preview
                    </Typography>
                    <Divider />
                  </Box>
                  <NotificationPreview
                    subject={formData.subject}
                    body={formData.body}
                    url={formData.url}
                    pushTime={formData.pushTime}
                    image={imagePreview}
                  />
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
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.subject || !formData.body}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            sx={{
              bgcolor: "#8d0638ff",
              "&:hover": {
                bgcolor: "#0f1f3d",
              },
            }}
          >
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default AddNotification
