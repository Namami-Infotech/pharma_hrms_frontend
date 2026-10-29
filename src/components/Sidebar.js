"use client"

import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import {
  List,
  ListItem,
  Box,
  ListItemIcon,
  Typography,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Drawer,
} from "@mui/material"
import {
  Dashboard,
  Notifications,
  Map as MapIcon,
} from "@mui/icons-material"
import { useAuth } from "./auth/AuthContext"
import { MODULES_BY_ID, ROLE_PERMISSIONS } from "../config/rolePermissions"
import logo from "../assets/HRSmileLogo.jpeg"

// Simple logo
const HRSmileLogo = () => (
  <Box
    sx={{
      width: 45,
      height: 45,
      borderRadius: 2,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#8d0638ff",
    }}
  >
    <img
      src={logo}
      alt="S-HR Logo"
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  </Box>
)

// --- Simplified Nav Item ---
const NavItem = ({ route, isActive, isExpanded, hasNotification = false }) => {
  const theme = useTheme()
  return (
    <Tooltip title={!isExpanded ? route.name : ""} placement="right" arrow>
      <ListItem
        component={Link}
        to={route.path}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
          flexDirection: isExpanded ? "row" : "column",
          color: isActive ? "white" : theme.palette.text.primary,
          bgcolor: isActive ? "#8d0638ff" : "transparent",
          borderRadius: 2,
          mx: 1,
          my: 0.6,
          px: isExpanded ? 2 : 1,
          py: 1.2,
          transition: "all 0.25s ease",
          "&:hover": {
            bgcolor: isActive ? "#9a1f4b" : theme.palette.action.hover,
            boxShadow: isActive ? theme.shadows[2] : theme.shadows[1],
          },
          textDecoration: 'none',
        }}
      >
        <ListItemIcon
          sx={{
            color: "inherit",
            minWidth: isExpanded ? 40 : "auto",
            mr: isExpanded ? 1.2 : 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Badge
            variant="dot"
            color="error"
            invisible={!hasNotification}
            sx={{
              "& .MuiBadge-badge": {
                right: -2,
                top: 2,
              },
            }}
          >
            {route.icon}
          </Badge>
        </ListItemIcon>

        {isExpanded ? (
          <Typography
            variant="body2"
            fontWeight={isActive ? 600 : 400}
            sx={{
              whiteSpace: "nowrap",
              opacity: 0.95,
            }}
          >
            {route.name}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              fontSize: "0.65rem",
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            {route.name}
          </Typography>
        )}
      </ListItem>
    </Tooltip>
  )
}

const CATEGORY_ORDER = [
  "Main",
  "Analytics",
  "HR",
  "Finance",
  "Sales",
  "Field",
  "Travel",
  "Compliance",
  "Support",
  "IT",
  "Operations",
]

// --- Sidebar ---
function Sidebar({ open, onClose, variant = "permanent" }) { // Add props for mobile
  const location = useLocation()
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [isExpanded, setIsExpanded] = useState(true)

  // 1. Get modules array sent directly by Backend Login API (from tenent.Menu & role)
  const rawModules = user?.modules
  let userModules = []

  if (Array.isArray(rawModules)) {
    userModules = rawModules.map((id) => Number(id)).filter((n) => !isNaN(n))
  } else if (typeof rawModules === "string" && rawModules.trim()) {
    userModules = rawModules
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n))
  }

  // 2. Map directly from MODULES_BY_ID and deduplicate by path
  const seenPaths = {}
  const routes = []
  userModules.forEach((id) => {
    const route = MODULES_BY_ID[id]
    if (route && route.path && !seenPaths[route.path]) {
      seenPaths[route.path] = true
      routes.push(route)
    }
  })

  // 3. Group routes by category
  const groupedRoutes = routes.reduce((acc, r) => {
    const cat = r.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  // Sort categories according to CATEGORY_ORDER so Main is at the top
  const sortedCategories = Object.keys(groupedRoutes).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    return a.localeCompare(b)
  })

  const sidebarContent = (
  <>
    {/* Header - Fixed/Sticky */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: isExpanded ? "space-between" : "center",
        p: 2,
        bgcolor: "white",
        color: "red",
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid",
        borderColor: "divider",
        // Prevent horizontal scrolling
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          // Ensure content doesn't overflow
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <HRSmileLogo />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: 0.5,
            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            // Prevent text overflow
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          SAFEGUARD HR
        </Typography>
      </Box>
    </Box>

    {/* Navigation - Add overflow control */}
    <Box sx={{ 
      flexGrow: 1, 
      py: 1,
      overflow: "auto",
      // Prevent horizontal scrolling
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
        background: theme.palette.divider,
        borderRadius: "3px",
      },
    }}>
      {sortedCategories.map((category) => {
        const categoryRoutes = groupedRoutes[category]
        if (!categoryRoutes || categoryRoutes.length === 0) return null
        return (
          <Box key={category} sx={{ mb: 1, width: "100%" }}>
            {isExpanded && (
              <Typography
                variant="overline"
                sx={{
                  px: 2,
                  color: "#8d0638ff",
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  fontSize: "1rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {category}
              </Typography>
            )}
            <List sx={{ py: 0, width: "100%" }}>
              {categoryRoutes.map((route) => (
                <NavItem
                  key={route.path}
                  route={route}
                  isActive={location.pathname === route.path}
                  isExpanded={isExpanded}
                  hasNotification={route.hasNotification}
                />
              ))}
            </List>
            <Divider sx={{ mx: 2, opacity: 0.3 }} />
          </Box>
        )
      })}
    </Box>
  </>
);

  // For mobile, use temporary drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    )
  }

  // For desktop, use permanent drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  )
}

export default Sidebar