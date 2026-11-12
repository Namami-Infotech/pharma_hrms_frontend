"use client"

import { useState } from "react"
import { useAuth } from "../components/auth/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
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
  ButtonBase,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Person,
  ExitToApp,
  Receipt as ReceiptIcon,
  NotificationsOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material"

const ROUTE_INFO = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview & key metrics" },
  "/leave": { title: "Leave Management", subtitle: "Track employee leave requests, balances, and approval records" },
  "/attendance": { title: "Attendance Management", subtitle: "Track daily attendance, check-in logs, and activity reports" },
  "/manual-attendance": { title: "Manual Attendance", subtitle: "Mark or edit attendance records for employees manually" },
  "/quotation": { title: "Quotations Management", subtitle: "Create, track, and manage client pharmaceutical price quotations and approvals" },
  "/expense": { title: "Expense Management", subtitle: "Submit, review, and track employee business expenses and claims" },
  "/advance": { title: "Advance Salary", subtitle: "Manage employee advance requests, approval workflows, and balances" },
  "/product": { title: "Product Master", subtitle: "Manage medicine catalogue, pricing, packaging, and stock details" },
  "/products": { title: "Product Master", subtitle: "Manage medicine catalogue, pricing, packaging, and stock details" },
  "/employees": { title: "Employee Management", subtitle: "Manage company staff, designations, departments, and employee directory" },
  "/employee": { title: "Employee Management", subtitle: "Manage company staff, designations, departments, and employee directory" },
  "/offices": { title: "Offices Management", subtitle: "Locations and office branches" },
  "/holiday": { title: "Holiday Calendar", subtitle: "Manage and view company holidays and official calendar" },
  "/holidays": { title: "Holiday Calendar", subtitle: "Manage and view company holidays and official calendar" },
  "/policy": { title: "Company Policies", subtitle: "Guidelines and documentation" },
  "/notification": { title: "Notifications", subtitle: "System updates and alerts" },
  "/invoices": { title: "Invoices", subtitle: "Manage and generate client invoices" },
  "/salary": { title: "Salary Management", subtitle: "Generate salary slips, manage deductions, and track monthly payroll disbursements" },
  "/profile": { title: "My Profile", subtitle: "Personal account details" },
  "/user": { title: "My Profile", subtitle: "Personal account details" },
  "/visit": { title: "Visit Management", subtitle: "Track and manage employee field visits, dealer check-ins, and activity logs" },
  "/dealer": { title: "Visit Management", subtitle: "Track and manage employee field visits, dealer check-ins, and activity logs" },
  "/plan-visit": { title: "Plan Visit", subtitle: "Schedule and manage planned dealer and clinic visits" },
  "/assets": { title: "Asset Management", subtitle: "Company assigned assets" },
  "/regularise": { title: "Regularise Attendance", subtitle: "Review attendance regularisation requests" },
  "/report": { title: "Visit Reports", subtitle: "Daily field reports and logs" },
  "/registration": { title: "Leads & Dealers", subtitle: "Register, manage and track all leads and dealer records in one place" },
  "/maps": { title: "Field Maps & Tracking", subtitle: "Live field tracking and route coverage" },
  "/live-track": { title: "Live Tracking", subtitle: "Real-time employee location" },
  "/travel": { title: "Travel Management", subtitle: "Track travel requests and itineraries" },
}

const getRouteInfo = (pathname) => {
  if (ROUTE_INFO[pathname]) return ROUTE_INFO[pathname]
  for (const [path, info] of Object.entries(ROUTE_INFO)) {
    if (path !== "/" && pathname.startsWith(path)) return info
  }
  return { title: "Aberdure HRMS", subtitle: "Pharmaceutical Management Portal" }
}

function Navbar({ onMenuClick }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pageInfo = getRouteInfo(location.pathname)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const notifications = [
    { id: 1, title: "Leave Request Approved", unread: true },
    { id: 2, title: "Expense Pending Review", unread: true },
    { id: 3, title: "Advance Request Status Updated", unread: false },
  ]
  const hasUnread = notifications.some((n) => n.unread)

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
          borderBottom: "1px solid #e2e8f0",
          height: 84,
          boxSizing: "border-box",
          width: { md: `calc(100% - 260px)` },
          ml: { md: `260px` },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 83,
            minHeight: "83px !important",
            maxHeight: 83,
            px: { xs: 2, sm: 3 },
            boxSizing: "border-box",
          }}
        >
          {/* Left: Mobile Drawer Toggle + Page Title & Subtitle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, pr: 2 }}>
            {isMobile && (
              <IconButton 
                onClick={onMenuClick}
                edge="start"
                size="small"
                sx={{ color: "#64748b", mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  fontSize: { xs: "1.05rem", sm: "1.25rem" },
                  letterSpacing: -0.3,
                  lineHeight: 1.25,
                }}
              >
                {pageInfo.title}
              </Typography>
              {pageInfo.subtitle && (
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    color: "#64748b",
                    fontSize: { xs: "0.72rem", sm: "0.78rem" },
                    display: { xs: "none", sm: "block" },
                    mt: 0.2,
                  }}
                >
                  {pageInfo.subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Right: User Profile (Notification Bell commented out for now) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* Notification Bell - Commented out for now
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
            */}

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

      {/* Notification Menu - Commented out for now
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
      */}
    </>
  )
}

export default Navbar