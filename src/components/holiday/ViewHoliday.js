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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700" color="#8d0638ff" gutterBottom>
              Holiday Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and view company holidays
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh Data">
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
              variant={viewMode === "calendar" ? "contained" : "outlined"}
              startIcon={<ViewModule />}
              onClick={() => setViewMode("calendar")}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "contained" : "outlined"}
              startIcon={<ViewList />}
              onClick={() => setViewMode("list")}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              List
            </Button>
          </Box>
        </Box>

        {/* Controls */}
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <DatePicker
                views={["year", "month"]}
                value={selectedDate}
                onChange={handleMonthYearChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Month & Year"
                    fullWidth
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <CalendarMonth sx={{ mr: 1, color: "text.secondary" }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="outlined" 
              startIcon={<Download />} 
              fullWidth
              size="small"
              sx={{ borderRadius: 2, py: 1 }}
            >
              Export
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            {user && user.role === "HR" && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setDialogOpen(true)}
                fullWidth
                size="small"
                sx={{ 
                  borderRadius: 2, 
                  py: 1,
                  bgcolor: "#8d0638ff",
                  "&:hover": {
                    bgcolor: "#6d0430ff",
                  }
                }}
              >
                Add Holiday
              </Button>
            )}
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
      <Grid container spacing={2}>
        {/* Calendar/List View */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              height: 550,
              background: 'white',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            {viewMode === "calendar" ? (
              <Box sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  {selectedDate.toFormat("MMMM yyyy")} Calendar
                </Typography>
                <Box
                  sx={{
                    height: "calc(100% - 32px)",
                    borderRadius: 1,
                    overflow: "hidden",
                    "& .rbc-calendar": {
                      height: "100%",
                      fontFamily: 'inherit',
                    },
                    "& .rbc-event": {
                      backgroundColor: "#8d0638ff",
                      borderRadius: "4px",
                      border: "none",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      padding: '2px 4px',
                    },
                    "& .rbc-today": {
                      backgroundColor: `${alpha("#8d0638ff", 0.08)}`,
                    },
                    "& .rbc-header": {
                      backgroundColor: alpha("#8d0638ff", 0.9),
                      color: "white",
                      fontWeight: "600",
                      padding: "6px",
                      fontSize: '0.8rem',
                    },
                    "& .rbc-month-view": {
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: "8px",
                    },
                    "& .rbc-date-cell": {
                      fontSize: '0.8rem',
                      padding: '4px',
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
                        backgroundColor: "#8d0638ff",
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
              <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
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
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
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
                    <Typography variant="body2" fontWeight="600" color="#8d0638ff">
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
                        bgcolor: "#8d0638ff",
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
                        bgcolor: alpha("#8d0638ff", 0.1),
                        border: `1px solid ${alpha("#8d0638ff", 0.3)}`,
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