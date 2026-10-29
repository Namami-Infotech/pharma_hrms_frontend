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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccessTime,
  CalendarMonth,
  Laptop,
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
import { format } from 'date-fns';


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

const StatCard = ({ icon, title, value, color, subtitle, progress }) => {
  
  const theme = useTheme();
  const accent = color || theme.palette.primary.main;
  return (
    <HoverCard sx={{ height: '100%', borderLeft: `4px solid ${accent}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 0.2 }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: `${accent}20`,
              color: accent,
              width: 52,
              height: 52,
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
            }}
          >
            {icon}
          </Avatar>
        </Box>

        {typeof progress === 'number' && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 6,
                backgroundColor: `${accent}20`,
                '& .MuiLinearProgress-bar': { backgroundColor: accent },
              }}
            />
          </Box>
        )}
      </CardContent>
    </HoverCard>
  );
};

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};


const DashboardData = () => {
  
  const [employeeData, setEmployeeData] = useState(null);
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [assetDetails, setAssetDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const EmpId = user?.emp_id;

  
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

    const assetCount = assetDetails.length;

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
      asset: {
        count: assetCount,
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
      const responses = await Promise.all([
        axios.get(`${BASE_URL}/employee/view_employee.php?EmpId=${EmpId}`),
        axios.get(`${BASE_URL}/leave/balance_leave.php?empid=${EmpId}`),
        axios.get(`${BASE_URL}/expense/get_expense.php?EmpId=${EmpId}`),
        axios.get(`${BASE_URL}/attendance/view_attendance.php?EmpId=${EmpId}`),
        axios.get(`${BASE_URL}/assets/get_issue_asset.php?EmpId=${EmpId}`),
      ]);

      setEmployeeData(responses[0].data.data);
      setLeaveDetails(responses[1].data.data);
      setExpenseDetails(responses[2].data.data || []);
      setAttendanceDetails(responses[3].data.data || []);
      setAssetDetails(responses[4].data.data || []);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CircularProgress size={56} />
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
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100%' }}>
      
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main || '#8d0638'} 0%, ${theme.palette.secondary?.main || '#b81652'} 100%)`,
          color: 'common.white',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
                <Avatar
                  src={employeeData?.Pic}
                  alt={employeeData?.Name}
                  sx={{
                    width: { xs: 72, md: 96 },
                    height: { xs: 72, md: 96 },
                    border: '3px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                  }}
                />
              </motion.div>

              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 0.2, color: 'common.white' }}>
                  {employeeData?.Name || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.95, color: 'common.white' }}>
                  {employeeData?.Designation || 'N/A'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<Avatar sx={{ bgcolor: 'transparent' }}><Typography sx={{ color: 'white', fontSize: 12 }}>ID</Typography></Avatar>}
                    label={` ${employeeData?.EmpId || 'N/A'}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600 }}
                    size="small"
                  />
                  {employeeData?.Department && (
                    <Chip
                      label={employeeData.Department}
                      sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white' }}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

     
      {/* <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<DonutLarge />}
            title="Attendance Rate"
            value={`${stats.attendance.attendanceRate.toFixed(0)}%`}
            color={theme.palette.primary.main}
            subtitle={`${stats.attendance.presentDays}/${stats.attendance.totalDays} days present`}
            progress={stats.attendance.attendanceRate}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventAvailable />}
            title="Leave Balance"
            value={stats.leave.total}
            color={theme.palette.success.main}
            subtitle="Available leaves"
            progress={Math.min((stats.leave.total / 30) * 100, 100)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<LocalAtm />}
            title="Total Expenses"
            value={`₹${Number(stats.expense.total || 0).toFixed(0)}`}
            color={theme.palette.warning.main}
            subtitle={`${stats.expense.count} claims`}
            
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Laptop />}
            title="Assets Assigned"
            value={stats.asset.count}
            color={theme.palette.info.main}
            subtitle="Company assets"
          />
        </Grid>
      </Grid> */}

      
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
          <Tab icon={<Laptop />} iconPosition="start" label="Assets" />
        </Tabs>

        
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            
            <Grid item xs={12} md={8}>
              <HoverCard>
                <CardHeader title="Recent Attendance" action={<IconButton><MoreVert /></IconButton>} />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceChartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [`${value} hrs`, 'Working Hours']} />
                        <Bar dataKey="hours" name="Working Hours">
                          {attendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Last 7 Days Summary</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle fontSize="small" sx={{ color: theme.palette.success.main }} />
                          <Typography variant="body2">On Time: {stats.attendance.onTimeDays}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime fontSize="small" sx={{ color: theme.palette.warning.main }} />
                          <Typography variant="body2">Late: {stats.attendance.presentDays - stats.attendance.onTimeDays}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </HoverCard>
            </Grid>

            
            <Grid item xs={12} md={4}>
              <HoverCard sx={{ height: '100%' }}>
                <CardHeader title="Leave Balance" action={<IconButton><MoreVert /></IconButton>} />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leaveChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {leaveChartData.map((entry, idx) => <Cell key={`c-${idx}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color={theme.palette.error.main}>{stats.leave.sick}</Typography>
                      <Typography variant="caption" color="text.secondary">Sick</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color={theme.palette.primary.main}>{stats.leave.casual}</Typography>
                      <Typography variant="caption" color="text.secondary">Casual</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="h6" color={theme.palette.success.main}>{stats.leave.earned}</Typography>
                      <Typography variant="caption" color="text.secondary">Earned</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </HoverCard>
            </Grid>

            
            <Grid item xs={12} md={6}>
              <HoverCard>
                <CardHeader title="Recent Expenses" action={<IconButton><MoreVert /></IconButton>} />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
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
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              <CurrencyRupee />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography fontWeight={600}>{expense.expenseType} — ₹{expense.expenseAmount}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{expense.expenseDate}</Typography>}
                          />
                        </ListItem>
                        {index < Math.min(expenseDetails.length - 1, 5) && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}

                    {expenseDetails.length === 0 && (
                      <ListItem>
                        <ListItemText primary="No expense records found" secondary="Submit your first expense claim" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </HoverCard>
            </Grid>

            
            <Grid item xs={12} md={6}>
              <HoverCard>
                <CardHeader title="Assigned Assets" action={<IconButton><MoreVert /></IconButton>} />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {assetDetails.slice(0, 6).map((asset, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                              <Laptop />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography fontWeight={600}>{asset.asset_name}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{asset.make_name} {asset.model_name}</Typography>}
                          />
                          <Tooltip title="Serial Number">
                            <Chip label={asset.serial_number} size="small" variant="outlined" />
                          </Tooltip>
                        </ListItem>
                        {index < Math.min(assetDetails.length - 1, 5) && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}

                    {assetDetails.length === 0 && (
                      <ListItem>
                        <ListItemText primary="No assets assigned" secondary="Contact IT department for equipment" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </HoverCard>
            </Grid>
          </Grid>
        </TabPanel>

       
        <TabPanel value={activeTab} index={1}>
          <HoverCard>
            <CardHeader
              title="Attendance History"
              subheader="Recent attendance records"
              action={<Button variant="outlined" startIcon={<CalendarMonth />} size="small">View Calendar</Button>}
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Working Hours</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceDetails.map((day, index) => {
                      const isOnTime = day.firstIn !== 'N/A' && compareTimes(day.firstIn, '10:00 AM');

                      return (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Today fontSize="small" sx={{ color: theme.palette.primary.main }} />
                              <Typography>{day.date}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {day.firstIn !== 'N/A' ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccessTime fontSize="small" sx={{ color: isOnTime ? theme.palette.success.main : theme.palette.warning.main }} />{day.firstIn}</Box> : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {day.lastOut !== 'N/A' ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccessTime fontSize="small" sx={{ color: theme.palette.info.main }} />{day.lastOut}</Box> : 'N/A'}
                          </TableCell>
                          <TableCell><Typography fontWeight={600}>{day.workingHours} hrs</Typography></TableCell>
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

                    {attendanceDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body1" sx={{ py: 3 }}>No attendance records found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </HoverCard>
        </TabPanel>

        
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <HoverCard>
                <CardHeader title="Leave Balance" />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Sick Leave</Typography>
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
                    <Typography variant="subtitle1" gutterBottom>Casual Leave</Typography>
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
                    <Typography variant="subtitle1" gutterBottom>Earned Leave</Typography>
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

            <Grid item xs={12} md={8}>
              <HoverCard>
                <CardHeader
                  title="Leave Applications"
                  action={<Button variant="contained" size="small" startIcon={<EventAvailable />}>Apply Leave</Button>}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    Your recent leave applications will appear here
                  </Typography>
                </CardContent>
              </HoverCard>
            </Grid>
          </Grid>
        </TabPanel>

        
        <TabPanel value={activeTab} index={3}>
          <HoverCard>
            <CardHeader title="Expense Claims" subheader="Your expense reimbursement requests" action={<Button variant="contained" startIcon={<Receipt />} size="small">New Claim</Button>} />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenseDetails.map((expense, index) => (
                      <TableRow key={expense.detailId || index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Receipt fontSize="small" sx={{ color: theme.palette.primary.main }} />
                            {expense.expenseType}
                          </Box>
                        </TableCell>
                        <TableCell><Typography fontWeight={600}>₹{expense.expenseAmount}</Typography></TableCell>
                        <TableCell>{expense.expenseDate}</TableCell>
                        <TableCell>
                          <Chip label={expense.Status} color={expense.Status === 'Approved' ? 'success' : expense.Status === 'Rejected' ? 'error' : 'warning'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details"><IconButton size="small"><MoreVert fontSize="small" /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}

                    {expenseDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center"><Typography sx={{ py: 3 }}>No expense claims found</Typography></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </HoverCard>
        </TabPanel>

        
        <TabPanel value={activeTab} index={4}>
          <HoverCard>
            <CardHeader title="Assigned Assets" subheader="Company assets issued to you" />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset</TableCell>
                      <TableCell>Make</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetDetails.map((asset, index) => (
                      <TableRow key={index} hover>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Laptop fontSize="small" sx={{ color: theme.palette.info.main }} />{asset.asset_name}</Box></TableCell>
                        <TableCell>{asset.make_name}</TableCell>
                        <TableCell>{asset.model_name}</TableCell>
                        <TableCell><Typography fontWeight={600}>{asset.serial_number}</Typography></TableCell>
                        <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                      </TableRow>
                    ))}

                    {assetDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center"><Typography sx={{ py: 3 }}>No assets assigned</Typography></TableCell>
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
  if (checkIn24Hour === shift24Hour && checkInMinuteNum <= shiftMinuteNum + 10) return true;
  return false;
};

export default DashboardData;