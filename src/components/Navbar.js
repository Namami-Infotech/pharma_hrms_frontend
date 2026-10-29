"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../components/auth/AuthContext"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Badge,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Breadcrumbs,
} from "@mui/material"
import {
  Notifications,
  Menu as MenuIcon,
  Search,
  Settings,
  Person,
  ExitToApp,
  DarkMode,
  LightMode,
  ChevronRight,
  ReceiptLongSharp,
  Receipt as ReceiptIcon,
} from "@mui/icons-material"
import { motion } from "framer-motion"

const HRSmileLogo = () => (
  <Box
    sx={{
      width: 120,
      height: 38,
      borderRadius: 1.5,
      bgcolor: "#8d0638ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "1.1rem",
      letterSpacing: 0.8,
    }}
  >
    HR SMILE
  </Box>
)

function Navbar({ onMenuClick }) { // Add onMenuClick prop for mobile
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Greeting message
  const [greeting, setGreeting] = useState("")
  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(
      hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
    )
  }, [])

  const notifications = [
    { id: 1, title: "Leave Approved", unread: true },
    { id: 2, title: "Expense Due", unread: true },
    { id: 3, title: "Team Meeting Tomorrow", unread: false },
  ]
  const unreadCount = notifications.filter((n) => n.unread).length

  const breadcrumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .map((x, i, arr) => ({
      name: x.charAt(0).toUpperCase() + x.slice(1),
      path: "/" + arr.slice(0, i + 1).join("/"),
      isLast: i === arr.length - 1,
    }))

  return (
    <>
      <AppBar
        position="fixed" // Changed from sticky to fixed
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure it's above sidebar
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 1,
          width: { md: `calc(100% - 240px)` }, // Adjust for sidebar width
          ml: { md: `240px` }, // Match sidebar width
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 64,
          }}
        >
          {/* Left */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton 
                onClick={onMenuClick} // Use the prop instead of direct navigation
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0px 1px 2px rgba(0,0,0,0.4)",  
                }}
              >
                {greeting}, {user?.username || "Guest"}!
              </Typography>
            </motion.div>

            {breadcrumbs.length > 0 && (
              <Breadcrumbs
                separator={<ChevronRight fontSize="small" />}
                sx={{ ml: 2, display: { xs: 'none', sm: 'flex' } }}
                aria-label="breadcrumb"
              >
               
                {breadcrumbs.map((b) => (
                  <Typography
                    key={b.path}
                    variant="caption"
                    color={b.isLast ? "text.primary" : "text.secondary"}
                    sx={{
                      fontWeight: b.isLast ? 600 : 400,
                      textDecoration: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                    component={b.isLast ? "span" : Link}
                    to={b.isLast ? undefined : b.path}
                  >
                    {b.name}
                  </Typography>
                ))}
              </Breadcrumbs>
            )}
          </Box>

          {/* Center - Search */}
         

          {/* Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Dark / Light */}
            

            {/* Profile */}
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar
                  src={user?.image}
                  sx={{
                    width: 36,
                    height: 36,
                    border: `2px solid ${theme.palette.primary.main}`,
                  }}
                >
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: theme.shadows[6] },
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.username || "Guest"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || "guest@example.com"}
          </Typography>
        </Box>
        <MenuItem onClick={() => navigate("/profile")}>
          <Person fontSize="small" sx={{ mr: 1 }} /> Profile
        </MenuItem>
        {user && (user.role === "HR" || user.role === "Admin" || user.role === "admin" || user.role === "SuperAdmin" || (Array.isArray(user.modules) && user.modules.includes(7))) && (
          <MenuItem onClick={() => navigate("/invoices")}>
            <ReceiptIcon fontSize="small" sx={{ mr: 1 }} /> Invoices
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { logout(); navigate("/") }} sx={{ color: "error.main" }}>
          <ExitToApp fontSize="small" sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: { mt: 1, maxWidth: 380, borderRadius: 2, boxShadow: theme.shadows[6] },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {notifications.length ? (
            notifications.map((n) => (
              <MenuItem key={n.id}>
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={!n.unread}
                  sx={{ mr: 1.5 }}
                />
                <Typography variant="body2">{n.title}</Typography>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  )
}

export default Navbar