"use client"

import { useState } from "react"
import { useAuth } from "../components/auth/AuthContext"
import { useNavigate } from "react-router-dom"
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
  Divider,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  ButtonBase,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Person,
  ExitToApp,
  Receipt as ReceiptIcon,
  Search,
  NotificationsOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material"

function Navbar({ onMenuClick }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const notifications = [
    { id: 1, title: "Leave Request Approved", unread: true },
    { id: 2, title: "Expense Pending Review", unread: true },
    { id: 3, title: "Advance Request Status Updated", unread: false },
  ]
  const hasUnread = notifications.some((n) => n.unread)

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      if (q.includes("advance")) navigate("/advance")
      else if (q.includes("leave")) navigate("/leave")
      else if (q.includes("expense")) navigate("/expense")
      else if (q.includes("salary")) navigate("/salary")
      else if (q.includes("employee")) navigate("/employees")
      else if (q.includes("attendance")) navigate("/attendance")
      else if (q.includes("quotation")) navigate("/quotation")
      else if (q.includes("product")) navigate("/products")
      else if (q.includes("holiday")) navigate("/holiday")
      else if (q.includes("policy")) navigate("/policy")
      else navigate("/dashboard")
    }
  }

  const displayName = user?.username || user?.Name || user?.emp_name || "Employee"
  const displayEmail = user?.email || user?.Email || (user?.role ? `${user.role} Portal` : "aberdure@pharma.com")
  const initial = displayName.charAt(0)?.toUpperCase() || "U"

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#ffffff",
          color: "text.primary",
          boxShadow: "none",
          borderBottom: "1px solid #f1f5f9",
          width: { md: `calc(100% - 240px)` },
          ml: { md: `240px` },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: { xs: 58, sm: 64 },
            px: { xs: 2, sm: 3 },
          }}
        >
          {/* Left: Search Input & Mobile Drawer Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, maxWidth: { xs: "100%", sm: 420, md: 480 } }}>
            {isMobile && (
              <IconButton 
                onClick={onMenuClick}
                edge="start"
                size="small"
                sx={{ color: "#64748b" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <TextField
              size="small"
              placeholder="Search patients, appointments, records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "#f8fafc",
                  fontSize: "0.85rem",
                  height: 40,
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: "#ffffff",
                    borderColor: "#cbd5e1",
                  },
                  "&.Mui-focused": {
                    bgcolor: "#ffffff",
                    borderColor: "#f37021",
                    boxShadow: "0 0 0 3px rgba(243, 112, 33, 0.12)",
                  },
                },
                "& fieldset": {
                  border: "none",
                },
              }}
            />
          </Box>

          {/* Right: Notifications & User Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* Notification Bell */}
            <IconButton
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
              size="small"
              sx={{
                color: "#64748b",
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                width: 38,
                height: 38,
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
              }}
            >
              <Badge color="error" variant="dot" invisible={!hasUnread}>
                <NotificationsOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* Profile Pill Button */}
            <ButtonBase
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                p: 0.6,
                pr: { xs: 0.6, sm: 1.2 },
                borderRadius: 2.5,
                bgcolor: "transparent",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
            >
              <Avatar
                src={user?.image}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#f37021",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                {initial}
              </Avatar>

              <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.2,
                  }}
                >
                  {displayName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "#64748b",
                    lineHeight: 1.2,
                    mt: 0.2,
                  }}
                >
                  {displayEmail}
                </Typography>
              </Box>

              <KeyboardArrowDown sx={{ fontSize: 18, color: "#94a3b8", display: { xs: "none", sm: "block" } }} />
            </ButtonBase>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2.5,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            border: "1px solid #f1f5f9",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9" }}>
          <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
            {displayName}
          </Typography>
          <Typography variant="caption" color="#64748b">
            {displayEmail}
          </Typography>
        </Box>
        <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }} sx={{ py: 1.2, fontSize: "0.875rem" }}>
          <Person fontSize="small" sx={{ mr: 1.5, color: "#64748b" }} /> Profile
        </MenuItem>
        {user && (["Admin", "admin", "SuperAdmin"].includes(user.role) || (Array.isArray(user.modules) && user.modules.includes(7))) && (
          <MenuItem onClick={() => { setAnchorEl(null); navigate("/invoices"); }} sx={{ py: 1.2, fontSize: "0.875rem" }}>
            <ReceiptIcon fontSize="small" sx={{ mr: 1.5, color: "#64748b" }} /> Invoices
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate("/"); }} sx={{ color: "error.main", py: 1.2, fontSize: "0.875rem" }}>
          <ExitToApp fontSize="small" sx={{ mr: 1.5 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 320,
            borderRadius: 2.5,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            border: "1px solid #f1f5f9",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9" }}>
          <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
            Notifications
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {notifications.map((n) => (
            <MenuItem key={n.id} sx={{ py: 1.5, borderBottom: "1px solid #fafafa" }}>
              <Badge
                color="primary"
                variant="dot"
                invisible={!n.unread}
                sx={{ mr: 1.5 }}
              />
              <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "#334155" }}>{n.title}</Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  )
}

export default Navbar