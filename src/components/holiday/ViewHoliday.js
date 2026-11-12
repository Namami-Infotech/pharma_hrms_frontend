"use client";
import { BASE_URL } from "../../api/endpoints";

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import {
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Stack,
  alpha,
} from "@mui/material"
import {
  Event,
  CalendarMonth,
  Add,
  Refresh,
  ViewList,
  ViewModule,
  Today,
  EventAvailable,
  Celebration,
  Download,
  Filter,
} from "@mui/icons-material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { DateTime } from "luxon"
import { motion, AnimatePresence } from "framer-motion"
import AddHoliday from "./AddHoliday"
import EditHoliday from "./EditHoliday"
import { useAuth } from "../auth/AuthContext"

const localizer = momentLocalizer(moment)

// Compact Stats Card Component
const StatsCard = ({ icon, title, value, color, subtitle }) => {
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
      <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.72rem', display: 'block' }}>
              {title}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={color} sx={{ fontSize: '1.15rem', lineHeight: 1.2, my: 0.2 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: alpha(color, 0.1), 
              color: color, 
              width: 32, 
              height: 32,
              fontSize: '0.9rem'
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

// Holiday List Item Component
const HolidayListItem = ({ holiday, index }) => {
  const theme = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <ListItem
        sx={{
          borderRadius: 2,
          mb: 1,
          p: 1.5,
          bgcolor: "background.paper",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            transform: "translateX(4px)",
            transition: "all 0.2s ease",
            borderColor: alpha(theme.palette.primary.main, 0.2),
          },
        }}
      >
        <ListItemAvatar>
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              color: theme.palette.primary.main,
              width: 32,
              height: 32
            }}
          >
            <Celebration fontSize="small" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle2" fontWeight="600">
              {holiday.title}
            </Typography>
          }
          secondary={
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              <CalendarMonth fontSize="small" sx={{ mr: 0.5, color: "text.secondary", fontSize: '0.8rem' }} />
              <Typography variant="caption" color="text.secondary">
                {moment(holiday.start).format("MMM DD, YYYY")}
              </Typography>
              <Chip
                label={moment(holiday.start).format("ddd")}
                size="small"
                variant="outlined"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main
                }}
              />
            </Box>
          }
          sx={{ 
            '& .MuiListItemText-primary': { mb: 0.5 },
            '& .MuiListItemText-secondary': { mt: 0 }
          }}
        />
      </ListItem>
    </motion.div>
  )
}

function ViewHoliday() {
  const [holidays, setHolidays] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(DateTime.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState("calendar") // 'calendar' or 'list'
  const [refreshing, setRefreshing] = useState(false)

  const { user } = useAuth()
  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const fetchHolidays = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${BASE_URL}/holiday/view_holiday.php?Tenent_Id=${user.tenent_id}`,
      )
      if (response.data.success) {
        const holidayEvents = response.data.data.map((holiday) => ({
          title: holiday.title,
          start: new Date(holiday.date),
          end: new Date(holiday.date),
          allDay: true,
          id: holiday.id,
        }))
        setHolidays(holidayEvents)
      } else {
        setError("Failed to fetch holidays")
      }
    } catch (err) {
      setError("Error fetching holidays: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [user.tenent_id])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHolidays()
    setRefreshing(false)
  }

  const handleMonthYearChange = (date) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  // Calculate statistics
  const currentYear = selectedDate.year
  const currentMonth = selectedDate.month
  const totalHolidays = holidays.length
  const thisMonthHolidays = holidays.filter((holiday) => {
    const holidayDate = moment(holiday.start)
    return holidayDate.year() === currentYear && holidayDate.month() + 1 === currentMonth
  }).length
  const upcomingHolidays = holidays.filter((holiday) => moment(holiday.start).isAfter(moment())).length

  // Get holidays for current month for list view
  const currentMonthHolidays = holidays
    .filter((holiday) => {
      const holidayDate = moment(holiday.start)
      return holidayDate.year() === currentYear && holidayDate.month() + 1 === currentMonth
    })
    .sort((a, b) => moment(a.start).diff(moment(b.start)))

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 }, bgcolor: "#f8fafc", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Header Bar */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.25, 
          mb: 1.5, 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Left: DatePicker */}
        <Box sx={{ width: { xs: "100%", sm: 220 } }}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DatePicker
              views={["year", "month"]}
              value={selectedDate}
              onChange={handleMonthYearChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <CalendarMonth sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />,
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 36,
                      fontSize: "0.82rem",
                      borderRadius: 1.8,
                    }
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Box>

        {/* Right: View Mode Toggle, Refresh, Export, Add Holiday */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {/* Calendar / List toggle */}
          <Box sx={{ display: "flex", bgcolor: "#f1f5f9", p: 0.3, borderRadius: 1.8 }}>
            <Button
              variant={viewMode === "calendar" ? "contained" : "text"}
              onClick={() => setViewMode("calendar")}
              size="small"
              startIcon={<ViewModule sx={{ fontSize: 16 }} />}
              sx={{
                fontSize: "0.75rem",
                height: 30,
                textTransform: "none",
                fontWeight: 600,
                px: 1.2,
                borderRadius: 1.5,
                bgcolor: viewMode === "calendar" ? "#ffffff" : "transparent",
                color: viewMode === "calendar" ? "#0f172a" : "#64748b",
                boxShadow: viewMode === "calendar" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                "&:hover": { bgcolor: viewMode === "calendar" ? "#ffffff" : "transparent" },
              }}
            >
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "contained" : "text"}
              onClick={() => setViewMode("list")}
              size="small"
              startIcon={<ViewList sx={{ fontSize: 16 }} />}
              sx={{
                fontSize: "0.75rem",
                height: 30,
                textTransform: "none",
                fontWeight: 600,
                px: 1.2,
                borderRadius: 1.5,
                bgcolor: viewMode === "list" ? "#ffffff" : "transparent",
                color: viewMode === "list" ? "#0f172a" : "#64748b",
                boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                "&:hover": { bgcolor: viewMode === "list" ? "#ffffff" : "transparent" },
              }}
            >
              List
            </Button>
          </Box>

          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              size="small"
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.8,
                bgcolor: "white",
                width: 36,
                height: 36,
              }}
            >
              {refreshing ? <CircularProgress size={16} /> : <Refresh fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Button 
            variant="outlined" 
            startIcon={<Download />} 
            size="small"
            sx={{ 
              borderRadius: 1.8, 
              height: 36, 
              fontSize: "0.8rem", 
              textTransform: "none",
              borderColor: "#e2e8f0",
              color: "#334155",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            Export
          </Button>

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              size="small"
              sx={{ 
                borderRadius: 1.8, 
                height: 36,
                fontSize: "0.8rem",
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#f37021",
                px: 2,
                boxShadow: "0 2px 6px rgba(243, 112, 33, 0.25)",
                "&:hover": {
                  bgcolor: "#d95300",
                }
              }}
            >
              Add Holiday
            </Button>
          )}
        </Box>
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
      <Grid container spacing={1.2} sx={{ mb: 1, flexShrink: 0 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<Event />}
            title="Total Holidays"
            value={totalHolidays}
            color={theme.palette.primary.main}
            subtitle="This year"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<CalendarMonth />}
            title="This Month"
            value={thisMonthHolidays}
            color={theme.palette.success.main}
            subtitle={selectedDate.toFormat("MMM yyyy")}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<EventAvailable />}
            title="Upcoming"
            value={upcomingHolidays}
            color={theme.palette.warning.main}
            subtitle="Future holidays"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={<Today />}
            title="Next Holiday"
            value={
              upcomingHolidays > 0
                ? moment(
                    holidays.find((h) => moment(h.start).isAfter(moment()))?.start,
                  ).fromNow()
                : "None"
            }
            color={theme.palette.info.main}
            subtitle="Days remaining"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Calendar/List View */}
        <Grid item xs={12} lg={8} sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              height: "100%",
              flex: 1,
              minHeight: 0,
              background: 'white',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {viewMode === "calendar" ? (
              <Box sx={{ p: { xs: 1, sm: 1.25 }, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    height: "100%",
                    width: "100%",
                    borderRadius: 1,
                    overflowX: "auto",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    "& .rbc-calendar": {
                      height: "100%",
                      width: "100%",
                      minWidth: { xs: 480, sm: "100%" },
                      fontFamily: 'inherit',
                      display: "flex",
                      flexDirection: "column",
                    },
                    "& .rbc-toolbar": {
                      marginBottom: "6px",
                      minHeight: "36px",
                    },
                    "& .rbc-event": {
                      backgroundColor: "#f37021",
                      borderRadius: "4px",
                      border: "none",
                      color: "white",
                      fontSize: { xs: "0.68rem", sm: "0.75rem" },
                      fontWeight: 500,
                      padding: { xs: '1px 3px', sm: '2px 4px' },
                    },
                    "& .rbc-today": {
                      backgroundColor: `${alpha("#f37021", 0.08)}`,
                    },
                    "& .rbc-header": {
                      backgroundColor: alpha("#f37021", 0.9),
                      color: "white",
                      fontWeight: "600",
                      padding: { xs: "4px 2px", sm: "5px" },
                      fontSize: { xs: "0.72rem", sm: "0.78rem" },
                      textAlign: "center",
                    },
                    "& .rbc-month-view": {
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: "8px",
                      minWidth: { xs: 480, sm: "100%" },
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    },
                    "& .rbc-month-row": {
                      flex: "1 0 0",
                      minHeight: 0,
                      overflow: "hidden",
                    },
                    "& .rbc-date-cell": {
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      padding: { xs: "2px", sm: "3px 6px" },
                    },
                  }}
                >
                  <Calendar
                    localizer={localizer}
                    events={holidays}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    views={["month", "agenda", "day"]}
                    date={selectedDate.toJSDate()}
                    onNavigate={(date) => setSelectedDate(DateTime.fromJSDate(date))}
                    selectable={false}
                    popup
                    eventPropGetter={(event) => ({
                      style: {
                        backgroundColor: "#f37021",
                        borderRadius: "4px",
                        border: "none",
                        color: "white",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      },
                    })}
                  />
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: { xs: 1.5, sm: 2 }, height: "100%", overflow: "auto" }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Holidays in {selectedDate.toFormat("MMMM yyyy")}
                </Typography>
                <List sx={{ height: "calc(100% - 32px)", overflow: "auto", p: 0 }}>
                  <AnimatePresence>
                    {currentMonthHolidays.map((holiday, index) => (
                      <HolidayListItem key={holiday.id || index} holiday={holiday} index={index} />
                    ))}
                  </AnimatePresence>
                  {currentMonthHolidays.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No holidays found for {selectedDate.toFormat("MMMM yyyy")}
                      </Typography>
                    </Box>
                  )}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4} sx={{ height: "100%", overflowY: "auto", pr: 0.5 }}>
          <Stack spacing={1.5}>
            {/* Quick Info Card */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ display: "flex", alignItems: "center", fontSize: '0.9rem' }}>
                  <Celebration sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                  Quick Info
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Current Month
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {selectedDate.toFormat("MMMM yyyy")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Holidays This Month
                    </Typography>
                    <Typography variant="body2" fontWeight="600" color="#f37021">
                      {thisMonthHolidays}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Working Days
                    </Typography>
                    <Typography variant="body2" fontWeight="600" color="success.main">
                      {selectedDate.daysInMonth - thisMonthHolidays}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Upcoming Holidays */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ display: "flex", alignItems: "center", fontSize: '0.9rem' }}>
                  <EventAvailable sx={{ mr: 1, color: theme.palette.warning.main, fontSize: '1.1rem' }} />
                  Upcoming Holidays
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List sx={{ maxHeight: 200, overflow: "auto", p: 0 }}>
                  {holidays
                    .filter((holiday) => moment(holiday.start).isAfter(moment()))
                    .slice(0, 4)
                    .map((holiday, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(theme.palette.warning.main, 0.1), 
                              color: theme.palette.warning.main,
                              width: 28, 
                              height: 28 
                            }}
                          >
                            <Event fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                              {holiday.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {moment(holiday.start).format("MMM DD")} • {moment(holiday.start).fromNow()}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  {upcomingHolidays === 0 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No upcoming holidays
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Calendar Legend */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Legend
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#f37021",
                        borderRadius: 1,
                        mr: 1.5,
                      }}
                    />
                    <Typography variant="caption" fontWeight="500">Public Holiday</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: alpha("#f37021", 0.1),
                        border: `1px solid ${alpha("#f37021", 0.3)}`,
                        borderRadius: 1,
                        mr: 1.5,
                      }}
                    />
                    <Typography variant="caption" fontWeight="500">Today</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Add/Edit Holiday Modals */}
      <AddHoliday open={dialogOpen} onClose={() => setDialogOpen(false)} onHolidayAdded={fetchHolidays} />
      <EditHoliday open={editDialogOpen} onClose={() => setEditDialogOpen(false)} onHolidayUpdated={fetchHolidays} />
    </Box>
  )
}

export default ViewHoliday