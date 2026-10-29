"use client";
import { BASE_URL } from "../../api/endpoints";

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert,
  TablePagination,
  InputAdornment,
  TextField,
  Stack,
  Divider,
  Fab,
  Zoom,
  alpha,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import {
  Add,
  Notifications,
  Search,
  Refresh,
  FilterList,
  NotificationsActive,
  Schedule,
  Link as LinkIcon,
  Image as ImageIcon,
  Visibility,
  Edit,
  Delete,
  NotificationImportant,
  AccessTime,
  Launch,
  Download,
  Settings,
  Close,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO, isValid } from "date-fns"
import axios from "axios"
import AddNotification from "./AddNotification"
import { useAuth } from "../auth/AuthContext"

// Compact Stats Card Component
const StatsCard = ({ icon, title, value, color, subtitle, trend }) => {
  const theme = useTheme()

  return (
    <Card
      component={motion.div}
      whileHover={{
        translateY: -2,
        boxShadow: theme.shadows[4],
        transition: { duration: 0.2 },
      }}
      sx={{
        height: "100%",
        borderLeft: `3px solid ${color}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.04)} 100%)`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="500" gutterBottom sx={{ fontSize: '0.75rem' }}>
              {title}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={color} sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: alpha(color, 0.1), 
              color: color, 
              width: 36, 
              height: 36,
              fontSize: '1rem'
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Notification Card for Mobile View
const NotificationCard = ({ notification, index }) => {
  const theme = useTheme()

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, "MMM dd, yyyy HH:mm") : "Invalid date"
    } catch {
      return "Invalid date"
    }
  }

  const getNotificationIcon = () => {
    if (notification.image) return <ImageIcon />
    if (notification.url) return <LinkIcon />
    return <NotificationsActive />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        sx={{
          mb: 2,
          borderLeft: `3px solid ${theme.palette.primary.main}`,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
          "&:hover": {
            boxShadow: theme.shadows[4],
            transform: "translateY(-2px)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", flexGrow: 1, gap: 1.5 }}>
              <Avatar sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                color: theme.palette.primary.main, 
                width: 32, 
                height: 32 
              }}>
                {getNotificationIcon()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem', lineHeight: 1.3 }}>
                  {notification.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {notification.body}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccessTime fontSize="small" sx={{ mr: 0.5, color: theme.palette.info.main, fontSize: '0.8rem' }} />
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {formatDate(notification.push_time)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              {notification.url && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Launch fontSize="small" sx={{ mr: 0.5, color: theme.palette.secondary.main, fontSize: '0.8rem' }} />
                  <Typography
                    variant="caption"
                    component="a"
                    href={notification.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontSize: '0.75rem',
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Open Link
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          {notification.image && (
            <Box sx={{ mt: 1.5 }}>
              <img
                src={notification.image || "/placeholder.svg"}
                alt="Notification"
                style={{
                  width: "100%",
                  maxHeight: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Notification Detail Modal Component
const NotificationDetailModal = ({ open, onClose, notification }) => {
  const theme = useTheme()
  
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, "MMM dd, yyyy HH:mm") : "Invalid date"
    } catch {
      return "Invalid date"
    }
  }

  if (!notification) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: "#8d0638ff", 
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 2
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <NotificationsActive />
          <Typography variant="h6" fontWeight="600">
            Notification Details
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="500">
                SUBJECT
              </Typography>
              <Typography variant="h6" fontWeight="600" sx={{ mt: 0.5 }}>
                {notification.subject}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="500">
                MESSAGE
              </Typography>
              <Typography variant="body1" sx={{ 
                mt: 1.5, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 1,
                lineHeight: 1.6
              }}>
                {notification.body}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <AccessTime color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  PUSH TIME
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {formatDate(notification.push_time)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {notification.url && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <LinkIcon color="secondary" />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    LINK
                  </Typography>
                  <Typography
                    variant="body1"
                    component="a"
                    href={notification.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      display: "block",
                      mt: 0.5,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {notification.url}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          
          {notification.image && (
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  IMAGE
                </Typography>
                <Box sx={{ mt: 1.5, textAlign: "center" }}>
                  <img
                    src={notification.image}
                    alt="Notification"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 8,
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
        {notification.url && (
          <Button 
            component="a"
            href={notification.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            startIcon={<Launch />}
            sx={{ 
              borderRadius: 2,
              bgcolor: "#8d0638ff",
              "&:hover": { bgcolor: "#6d0430ff" }
            }}
          >
            Open Link
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

function ViewNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState("table")
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${BASE_URL}/notification/get_notification.php?Tenent_Id=${user.tenent_id}`,
      )
      setNotifications(response.data.notifications || [])
    } catch (err) {
      setError("Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user.tenent_id])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNotifications()
    setRefreshing(false)
  }

  const handleOpenDialog = () => setDialogOpen(true)
  const handleCloseDialog = () => setDialogOpen(false)
  const onNotificationAdded = () => fetchNotifications()

  const handleView = (notification) => {
    setSelectedNotification(notification)
    setDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false)
    setSelectedNotification(null)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate stats
  const totalNotifications = notifications.length
  const recentNotifications = notifications.filter((n) => {
    const notificationDate = new Date(n.push_time)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return notificationDate >= weekAgo
  }).length

  const notificationsWithImages = notifications.filter((n) => n.image).length
  const notificationsWithLinks = notifications.filter((n) => n.url).length

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, "MMM dd, yyyy HH:mm") : "Invalid date"
    } catch {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 2, 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700" color="#8d0638ff" gutterBottom>
              Notification Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track all your notifications
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                size="small"
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  bgcolor: 'white'
                }}
              >
                {refreshing ? <CircularProgress size={18} /> : <Refresh fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Button 
              variant="outlined" 
              startIcon={<Download />} 
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Search and Controls */}
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
              <Button
                variant={viewMode === "table" ? "contained" : "outlined"}
                onClick={() => setViewMode("table")}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Table
              </Button>
              <Button
                variant={viewMode === "cards" ? "contained" : "outlined"}
                onClick={() => setViewMode("cards")}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Cards
              </Button>
              {user?.role === "HR" && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenDialog}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: "#8d0638ff",
                    "&:hover": {
                      bgcolor: "#6d0430ff",
                    }
                  }}
                >
                  New
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.light}`,
          }} 
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Compact Stats Cards */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<Notifications />}
            title="Total"
            value={totalNotifications}
            color={theme.palette.primary.main}
            subtitle="All notifications"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<NotificationImportant />}
            title="Recent"
            value={recentNotifications}
            color={theme.palette.success.main}
            subtitle="Last 7 days"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<ImageIcon />}
            title="With Images"
            value={notificationsWithImages}
            color={theme.palette.info.main}
            subtitle="Media content"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<LinkIcon />}
            title="With Links"
            value={notificationsWithLinks}
            color={theme.palette.warning.main}
            subtitle="Actionable"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        {viewMode === "cards" || isMobile ? (
          // Card View
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem' }}>
              Notifications ({filteredNotifications.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <AnimatePresence>
              {filteredNotifications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    index={index}
                  />
                ))}
            </AnimatePresence>
            {filteredNotifications.length === 0 && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications found
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          // Table View
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead sx={{ bgcolor: "#8d0638ff" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <NotificationsActive sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Subject
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Message</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LinkIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      URL
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Schedule sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Push Time
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ImageIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Image
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredNotifications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((notification, index) => (
                      <motion.tr
                        key={notification.id}
                        component={TableRow}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ 
                              mr: 1.5, 
                              width: 28, 
                              height: 28, 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontSize: '0.8rem'
                            }}>
                              <NotificationsActive fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                              {notification.subject}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: '0.8rem'
                            }}
                          >
                            {notification.body}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          {notification.url ? (
                            <Tooltip title={notification.url}>
                              <Button
                                component="a"
                                href={notification.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<Launch />}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 28 }}
                              >
                                Open
                              </Button>
                            </Tooltip>
                          ) : (
                            <Chip label="No URL" size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccessTime fontSize="small" sx={{ mr: 0.5, color: "text.secondary", fontSize: '0.8rem' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {formatDate(notification.push_time)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          {notification.image ? (
                            <Box
                              component="img"
                              src={notification.image}
                              alt="Notification"
                              sx={{
                                width: 50,
                                height: 35,
                                objectFit: "cover",
                                borderRadius: 1,
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "scale(1.1)",
                                  transition: "transform 0.2s ease",
                                },
                              }}
                            />
                          ) : (
                            <Chip label="No Image" size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" sx={{color:"#8d0638ff"}} onClick={() => handleView(notification)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredNotifications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        />
      </Paper>

      {/* Floating Action Button */}
      {user?.role === "HR" && (
        <Zoom in={true}>
          <Fab
            onClick={handleOpenDialog}
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: theme.zIndex.speedDial,
              bgcolor: "#8d0638ff",
              '&:hover': {
                bgcolor: "#6d0430ff",
              }
            }}
            size="medium"
          >
            <Add />
          </Fab>
        </Zoom>
      )}

      {/* Add Notification Dialog */}
      <AddNotification open={dialogOpen} onClose={handleCloseDialog} onNotificationAdded={onNotificationAdded} />

      {/* Notification Detail Modal (only for table view) */}
      <NotificationDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        notification={selectedNotification}
      />
    </Box>
  )
}

export default ViewNotifications