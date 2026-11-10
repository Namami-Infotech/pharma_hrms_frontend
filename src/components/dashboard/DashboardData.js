import { BASE_URL } from "../../api/endpoints";
// DashboardData.jsx
import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccessTime,
  CalendarMonth,
  CurrencyRupee,
  Dashboard as DashboardIcon,
  EventAvailable,
  MoreVert,
  Receipt,
  Refresh,
  Today,
  TrendingUp,
  Healing,
  DonutLarge,
  LocalAtm,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

const HoverCard = ({ children, sx = {}, ...props }) => {
  return (
    <Card
      component={motion.div}
      whileHover={{ translateY: -6 }}
      transition={{ duration: 0.18 }}
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DashboardData = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const EmpId = user?.emp_id;
  const role = user?.role || '';

  const isAdmin = ['Admin', 'admin', 'SuperAdmin', 'HR'].includes(role) ||
    (typeof role === 'string' && role.toLowerCase().includes('admin'));
  const isRM = Boolean(user?.is_rm || user?.isRM || role === 'Regional Manager' || role === 'Manager');

  const calculateStats = () => {
    const presentDays = attendanceDetails.filter((day) => day.firstIn !== 'N/A').length;
    const totalDays = attendanceDetails.length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const onTimeDays = attendanceDetails
      .filter((day) => {
        if (day.firstIn === 'N/A') return false;
        const timeStr = day.firstIn;
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        return hour24 < 10 || (hour24 === 10 && minutes <= 10);
      })
      .length;

    const punctualityRate = presentDays > 0 ? (onTimeDays / presentDays) * 100 : 0;

    const leaveBalance = {
      sick: leaveDetails?.SL || 0,
      casual: leaveDetails?.CL || 0,
      earned: leaveDetails?.EL || 0,
      total: (leaveDetails?.SL || 0) + (leaveDetails?.CL || 0) + (leaveDetails?.EL || 0),
    };

    const totalExpense = expenseDetails.reduce((sum, expense) => sum + parseFloat(expense.expenseAmount || 0), 0);
    const pendingExpense = expenseDetails
      .filter((expense) => expense.Status === 'Pending')
      .reduce((sum, expense) => sum + parseFloat(expense.expenseAmount || 0), 0);

    return {
      attendance: {
        presentDays,
        totalDays,
        attendanceRate,
        onTimeDays,
        punctualityRate,
      },
      leave: leaveBalance,
      expense: {
        total: totalExpense,
        pending: pendingExpense,
        approved: totalExpense - pendingExpense,
        count: expenseDetails.length,
      },
    };
  };

  const stats = calculateStats();

  const leaveChartData = [
    { name: 'Sick', value: stats.leave.sick, color: theme.palette.error.main },
    { name: 'Casual', value: stats.leave.casual, color: theme.palette.primary.main },
    { name: 'Earned', value: stats.leave.earned, color: theme.palette.success.main },
  ];

  const attendanceChartData = attendanceDetails
    .slice(0, 7)
    .map((day) => {
      const date = day.date;
      const hours = parseFloat(day.workingHours) || 0;
      return {
        date,
        hours,
        color: hours >= 8 ? theme.palette.success.main : theme.palette.warning.main,
      };
    })
    .reverse();

  useEffect(() => {
    fetchData();
  }, [EmpId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const empUrl = `${BASE_URL}/employee/view_employee.php?EmpId=${EmpId}`;
      const leaveBalUrl = `${BASE_URL}/leave/balance_leave.php?empid=${EmpId}`;
      
      // Admin sees everyone's expenses, RM sees subordinates + own, Employee sees only own
      const expUrl = `${BASE_URL}/expense/get_expense.php?EmpId=${EmpId}&role=${encodeURIComponent(role)}`;
      
      // Attendance: Admin sees all, RM sees team, Employee sees own
      const attUrl = isAdmin
        ? `${BASE_URL}/attendance/view_attendance.php?role=Admin`
        : isRM
        ? `${BASE_URL}/attendance/view_attendance.php?EmpId=${EmpId}&includeTeam=true&role=${encodeURIComponent(role)}`
        : `${BASE_URL}/attendance/view_attendance.php?EmpId=${EmpId}&role=${encodeURIComponent(role)}`;

      // Leaves: Admin sees everyone's leaves, RM sees subordinates + own, Employee sees only own
      const leaveReqUrl = isAdmin
        ? `${BASE_URL}/leave/get_leave.php?role=Admin`
        : `${BASE_URL}/leave/get_leave.php?empId=${EmpId}&role=${encodeURIComponent(role)}`;

      const responses = await Promise.all([
        axios.get(empUrl).catch(() => ({ data: { data: null } })),
        axios.get(leaveBalUrl).catch(() => ({ data: { data: null } })),
        axios.get(expUrl).catch(() => ({ data: { data: [] } })),
        axios.get(attUrl).catch(() => ({ data: { data: [] } })),
        axios.get(leaveReqUrl).catch(() => ({ data: { data: [] } })),
      ]);

      setEmployeeData(responses[0]?.data?.data || null);
      setLeaveDetails(responses[1]?.data?.data || null);
      setExpenseDetails(responses[2]?.data?.data || []);
      setAttendanceDetails(responses[3]?.data?.data || []);
      setLeaveRequests(responses[4]?.data?.data || []);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  // Filter attendance records by chosen date
  const filteredAttendance = attendanceDetails.filter((day) => {
    if (!selectedDate) return true;
    const raw = (day.date || '').trim();
    const parts = raw.split(/[-/]/);
    if (parts.length === 3) {
      let dStr = '';
      if (parts[0].length === 4) {
        dStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        dStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return dStr === selectedDate;
    }
    return false;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CircularProgress size={56} sx={{ color: '#f37021' }} />
        <Box sx={{ ml: 2 }}>
          <Typography variant="h6">Loading your dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={handleRefresh}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100%', boxSizing: 'border-box' }}>
      {/* Employee Header Banner */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 2.5,
          background: 'linear-gradient(135deg, #f37021 0%, #ff7a29 50%, #ea580c 100%)',
          boxShadow: '0 8px 25px rgba(243, 112, 33, 0.3)',
          color: '#ffffff',
        }}
      >
        <Grid container spacing={2} alignItems="center" sx={{ width: "100%", m: 0 }}>
          <Grid item>
            <Avatar
              sx={{
                width: { xs: 64, md: 80 },
                height: { xs: 64, md: 80 },
                bgcolor: 'rgba(255,255,255,0.25)',
                border: '3px solid rgba(255,255,255,0.6)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
              src={employeeData?.Image ? `${BASE_URL}/../${employeeData.Image}` : undefined}
            >
              {employeeData?.Name ? employeeData.Name.charAt(0) : 'A'}
            </Avatar>
          </Grid>

          <Grid item xs={12} sm>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={800} sx={{ color: '#ffffff !important' }}>
              {employeeData?.Name || user?.name || 'Administrator'}
            </Typography>

            <Typography variant="body2" sx={{ color: '#ffffff !important', opacity: 0.95, mt: 0.5, fontWeight: 500 }}>
              {employeeData?.Designation || user?.role || 'Staff'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`ID: ${employeeData?.EmpId || EmpId || 'N/A'}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#ffffff !important', fontWeight: 600 }}
              />
              <Chip
                label={employeeData?.Department || (isAdmin ? 'Management' : 'Operations')}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#ffffff !important', fontWeight: 500 }}
              />
            </Box>
          </Grid>

          <Grid item>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh sx={{ color: '#ffffff' }} />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff !important',
                  borderColor: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', borderColor: '#ffffff' },
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Container - Assets removed */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { py: 1.6, textTransform: 'none', fontWeight: 600 },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
          <Tab icon={<AccessTime />} iconPosition="start" label="Attendance" />
          <Tab icon={<EventAvailable />} iconPosition="start" label="Leave" />
          <Tab icon={<Receipt />} iconPosition="start" label="Expense" />
        </Tabs>

        {/* TAB 0: DASHBOARD OVERVIEW */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%", m: 0 }}>
            {/* Attendance Chart */}
            <Grid item xs={12} md={7}>
              <HoverCard>
                <CardHeader title="Working Hours (Recent Days)" subheader="Hours logged across working sessions" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceChartData}>
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <RechartsTooltip />
                        <Bar dataKey="hours" fill="#f37021" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </HoverCard>
            </Grid>

            {/* Leave Balance Pie */}
            <Grid item xs={12} md={5}>
              <HoverCard>
                <CardHeader title="Leave Balance" subheader="Available paid leave quotas" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leaveChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {leaveChartData.map((entry, idx) => (
                            <Cell key={`c-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color={theme.palette.error.main}>{stats.leave.sick}</Typography>
                      <Typography variant="caption" color="text.secondary">Sick (SL)</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color={theme.palette.primary.main}>{stats.leave.casual}</Typography>
                      <Typography variant="caption" color="text.secondary">Casual (CL)</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color={theme.palette.success.main}>{stats.leave.earned}</Typography>
                      <Typography variant="caption" color="text.secondary">Earned (EL)</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </HoverCard>
            </Grid>

            {/* Recent Expenses List */}
            <Grid item xs={12}>
              <HoverCard>
                <CardHeader
                  title="Recent Expenses"
                  subheader={isAdmin ? "All organization expense claims" : isRM ? "Team & personal expense claims" : "Your personal expense claims"}
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                    {expenseDetails.slice(0, 6).map((expense, index) => (
                      <React.Fragment key={expense.detailId || index}>
                        <ListItem
                          secondaryAction={
                            <Chip
                              label={expense.Status}
                              color={expense.Status === 'Approved' ? 'success' : expense.Status === 'Rejected' ? 'error' : 'warning'}
                              size="small"
                            />
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#f37021' }}>
                              <CurrencyRupee />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography fontWeight={600}>
                                {(isAdmin || isRM) && expense.employeeName ? `${expense.employeeName} (${expense.empId}) — ` : ''}
                                {expense.expenseType} — ₹{parseFloat(expense.expenseAmount || 0).toLocaleString('en-IN')}
                              </Typography>
                            }
                            secondary={<Typography variant="caption" color="text.secondary">{expense.expenseDate}</Typography>}
                          />
                        </ListItem>
                        {index < Math.min(expenseDetails.length - 1, 5) && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}

                    {expenseDetails.length === 0 && (
                      <ListItem>
                        <ListItemText primary="No expense records found" secondary="Expense claims will appear here" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </HoverCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 1: ATTENDANCE WITH CHOOSE DATE FIELD */}
        <TabPanel value={activeTab} index={1}>
          <HoverCard>
            <CardHeader
              title="Attendance History"
              subheader={selectedDate ? `Attendance records for ${selectedDate}` : "Showing all attendance records"}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    type="date"
                    size="small"
                    label="Choose Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      bgcolor: '#ffffff',
                      minWidth: 165,
                      '& .MuiInputBase-root': { fontSize: '0.85rem' },
                    }}
                  />
                  <Button
                    size="small"
                    variant={selectedDate === getTodayStr() ? "contained" : "outlined"}
                    sx={selectedDate === getTodayStr() ? { bgcolor: '#f37021', '&:hover': { bgcolor: '#d95300' } } : {}}
                    onClick={() => setSelectedDate(getTodayStr())}
                  >
                    Today
                  </Button>
                  <Button
                    size="small"
                    variant={!selectedDate ? "contained" : "outlined"}
                    sx={!selectedDate ? { bgcolor: '#f37021', '&:hover': { bgcolor: '#d95300' } } : {}}
                    onClick={() => setSelectedDate('')}
                  >
                    All Dates
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {(isAdmin || isRM) && <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>}
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Check In</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Check Out</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Working Hours</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttendance.map((day, index) => {
                      const isOnTime = day.firstIn !== 'N/A' && compareTimes(day.firstIn, '10:00 AM');

                      return (
                        <TableRow key={index} hover>
                          {(isAdmin || isRM) && (
                            <TableCell>
                              <Typography fontWeight={600} variant="body2">
                                {day.employeeName || day.empId}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {day.empId}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Today fontSize="small" sx={{ color: theme.palette.primary.main }} />
                              <Typography>{day.date}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {day.firstIn !== 'N/A' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime
                                  fontSize="small"
                                  sx={{ color: isOnTime ? theme.palette.success.main : theme.palette.warning.main }}
                                />
                                {day.firstIn}
                              </Box>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {day.lastOut !== 'N/A' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime fontSize="small" sx={{ color: theme.palette.info.main }} />
                                {day.lastOut}
                              </Box>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>{day.workingHours} hrs</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={day.firstIn !== 'N/A' ? (isOnTime ? 'On Time' : 'Late') : 'Absent'}
                              color={day.firstIn !== 'N/A' ? (isOnTime ? 'success' : 'warning') : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredAttendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={(isAdmin || isRM) ? 6 : 5} align="center">
                          <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                            No attendance records found{selectedDate ? ` for ${selectedDate}` : ''}.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </HoverCard>
        </TabPanel>

        {/* TAB 2: LEAVE WITH ALL/TEAM/OWN RECORDS */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%", m: 0 }}>
            {/* Personal Leave Balance */}
            <Grid item xs={12} md={4}>
              <HoverCard>
                <CardHeader title="Your Leave Balance" />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Sick Leave (SL)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(leaveDetails?.SL / 12) * 100 || 0}
                          sx={{
                            height: 10,
                            borderRadius: 6,
                            backgroundColor: `${theme.palette.error.light}30`,
                            '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.error.main },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="bold">{leaveDetails?.SL || 0}/12</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Healing fontSize="small" sx={{ color: theme.palette.error.main }} />
                      <Typography variant="caption" color="text.secondary">For health-related absences</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Casual Leave (CL)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(leaveDetails?.CL / 12) * 100 || 0}
                          sx={{
                            height: 10,
                            borderRadius: 6,
                            backgroundColor: `${theme.palette.primary.light}30`,
                            '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.primary.main },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="bold">{leaveDetails?.CL || 0}/12</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonth fontSize="small" sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="caption" color="text.secondary">For personal matters</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Earned Leave (EL)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(leaveDetails?.EL / 15) * 100 || 0}
                          sx={{
                            height: 10,
                            borderRadius: 6,
                            backgroundColor: `${theme.palette.success.light}30`,
                            '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.success.main },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="bold">{leaveDetails?.EL || 0}/15</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp fontSize="small" sx={{ color: theme.palette.success.main }} />
                      <Typography variant="caption" color="text.secondary">Accumulated based on service</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </HoverCard>
            </Grid>

            {/* Leave Applications List */}
            <Grid item xs={12} md={8}>
              <HoverCard>
                <CardHeader
                  title="Leave Applications"
                  subheader={isAdmin ? "All employees' leave requests" : isRM ? "Team & personal leave requests" : "Your leave requests"}
                />
                <Divider />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {(isAdmin || isRM) && <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>}
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaveRequests.map((leave, index) => (
                          <TableRow key={leave.id || leave.Id || index} hover>
                            {(isAdmin || isRM) && (
                              <TableCell>
                                <Typography fontWeight={600} variant="body2">
                                  {leave.EmployeeName || leave.EmpId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {leave.EmpId}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Chip
                                label={leave.category || leave.Category || leave.LeaveType || 'Leave'}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                                {leave.StartDate} - {leave.EndDate}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600} variant="body2">
                                {leave.TotalDays || 1}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 180 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={leave.Reason || ''}
                              >
                                {leave.Reason || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={leave.Status}
                                color={
                                  leave.Status === 'Approved'
                                    ? 'success'
                                    : leave.Status === 'Rejected'
                                    ? 'error'
                                    : 'warning'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}

                        {leaveRequests.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={(isAdmin || isRM) ? 6 : 5} align="center">
                              <Typography variant="body2" sx={{ py: 3, color: 'text.secondary' }}>
                                No leave applications found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </HoverCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 3: EXPENSE WITH ALL/TEAM/OWN RECORDS */}
        <TabPanel value={activeTab} index={3}>
          <HoverCard>
            <CardHeader
              title="Expense Claims"
              subheader={isAdmin ? "All employees' reimbursement requests" : isRM ? "Team & personal reimbursement requests" : "Your reimbursement requests"}
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {(isAdmin || isRM) && <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>}
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenseDetails.map((expense, index) => (
                      <TableRow key={expense.detailId || index} hover>
                        {(isAdmin || isRM) && (
                          <TableCell>
                            <Typography fontWeight={600} variant="body2">
                              {expense.employeeName || expense.empId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {expense.empId}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Receipt fontSize="small" sx={{ color: theme.palette.primary.main }} />
                            {expense.expenseType}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>
                            ₹{parseFloat(expense.expenseAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell>{expense.expenseDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={expense.Status}
                            color={expense.Status === 'Approved' ? 'success' : expense.Status === 'Rejected' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {expenseDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={(isAdmin || isRM) ? 5 : 4} align="center">
                          <Typography sx={{ py: 3, color: 'text.secondary' }}>No expense claims found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </HoverCard>
        </TabPanel>
      </Paper>
    </Box>
  );
};

const compareTimes = (checkInTime, shiftStartTime) => {
  if (checkInTime === 'N/A') return false;

  const [checkInHour, checkInMinute] = checkInTime.split(':');
  const checkInHourNum = parseInt(checkInHour, 10);
  const checkInMinuteNum = parseInt(checkInMinute.split(' ')[0], 10);
  const checkInPeriod = checkInTime.split(' ')[1];

  const [shiftHour, shiftMinute] = shiftStartTime.split(':');
  const shiftHourNum = parseInt(shiftHour, 10);
  const shiftMinuteNum = parseInt(shiftMinute.split(' ')[0], 10);
  const shiftPeriod = shiftStartTime.split(' ')[1];

  let checkIn24Hour = checkInHourNum;
  if (checkInPeriod === 'PM' && checkInHourNum !== 12) checkIn24Hour += 12;
  if (checkInPeriod === 'AM' && checkInHourNum === 12) checkIn24Hour = 0;

  let shift24Hour = shiftHourNum;
  if (shiftPeriod === 'PM' && shiftHourNum !== 12) shift24Hour += 12;
  if (shiftPeriod === 'AM' && shiftHourNum === 12) shift24Hour = 0;

  if (checkIn24Hour < shift24Hour) return true;
  if (checkIn24Hour === shift24Hour && checkInMinuteNum <= shiftMinuteNum) return true;
  return false;
};

export default DashboardData;
