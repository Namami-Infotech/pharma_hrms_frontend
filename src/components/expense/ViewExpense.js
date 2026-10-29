'use client';
import { BASE_URL } from "../../api/endpoints";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TableFooter,
  TablePagination,
  Button,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Fab,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Skeleton,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Check,
  Cancel,
  Search,
  FilterList,
  GetApp,
  Visibility,
  MoreVert,
  TrendingUp,
  AttachMoney,
  Receipt,
  Person,
  CalendarToday,
  Category,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  Add
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

function EnhancedViewExpense() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expenses, setExpenses] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState(isMobile ? 'card' : 'table');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/employee/list_employee.php`,
          { params: { Tenent_Id: user.tenent_id } }
        );

        if (response.data.success) {
          const filteredEmployees = response.data.data.filter(
            emp => emp.Tenent_Id === user.tenent_id
          );
          setEmployeeData(filteredEmployees);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        setError('Error fetching employee data');
        console.error('Error:', error);
      }
    };

    fetchEmployeeData();
  }, [user.tenent_id]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (employeeData.length === 0) return;

      try {
        if (!user || !user.emp_id) {
          setError('User is not authenticated');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/expense/get_expense.php`,
          { params: { EmpId: user.emp_id, role: user.role } }
        );

        if (response.data.success) {
          const filteredExpenses = response.data.data.filter(expense =>
            employeeData.some(emp => emp.EmpId === expense.empId && emp.Tenent_Id === user.tenent_id)
          );

          const expenseData = filteredExpenses.map(expense => {
            const employee = employeeData.find(emp => emp.EmpId === expense.empId);
            return {
              ...expense,
              employeeName: employee ? employee.Name : 'Unknown'
            };
          });

          setExpenses(expenseData);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        setError('Error fetching expense data');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user, employeeData, user.tenent_id]);

  const handleStatusChange = async (detailId, status) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/expense/update_expense.php`,
        { detailId, status, role: user.role }
      );

      if (response.data.success) {
        setExpenses(prevExpenses =>
          prevExpenses.map(expense =>
            expense.detailId === detailId ? { ...expense, Status: status } : expense
          )
        );
        setSnackbar({
          open: true,
          message: `Expense ${status.toLowerCase()} successfully!`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating expense status',
        severity: 'error'
      });
    }
  };

  const handleViewImage = (base64Data) => {
    if (!base64Data.startsWith('data:image/')) {
      base64Data = `data:image/png;base64,${base64Data}`;
    }
    setSelectedImage(base64Data);
    setImageDialogOpen(true);
  };

  const exportToCsv = () => {
    const csvRows = [
      ['Employee Name', 'Expense Date', 'Expense Type', 'Expense Amount', 'Status']
    ];

    filteredExpenses.forEach(({ employeeName, expenseDate, expenseType, expenseAmount, Status }) => {
      csvRows.push([
        employeeName,
        formatDate(expenseDate),
        expenseType,
        expenseAmount,
        Status
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle />;
      case 'Rejected': return <ErrorIcon />;
      case 'Pending': return <Pending />;
      default: return <Pending />;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.expenseType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || expense.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatistics = () => {
    const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.expenseAmount), 0);
    const approved = filteredExpenses.filter(e => e.Status === 'Approved').length;
    const pending = filteredExpenses.filter(e => e.Status === 'Pending').length;
    const rejected = filteredExpenses.filter(e => e.Status === 'Rejected').length;

    return { total, approved, pending, rejected, count: filteredExpenses.length };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#8d0638ff" }}>
            💰 Expense Management
          </Typography>
          <Box display="flex" gap={2}>
            <Tooltip title="Export to CSV">
              <Button
                variant="contained"
                startIcon={<GetApp />}
                onClick={exportToCsv}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                }}
              >
                Export
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={4}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Total Amount</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(stats.total)}
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={4}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Approved</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.approved}
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={4}
              sx={{
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Pending</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.pending}
                    </Typography>
                  </Box>
                  <Pending sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={4}
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Rejected</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.rejected}
                    </Typography>
                  </Box>
                  <ErrorIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card elevation={3} sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by employee name or expense type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {viewMode === 'table' ? 'Card View' : 'Table View'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {viewMode === 'table' ? (
          <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Receipt</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  {user?.role === 'HR' && (
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredExpenses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((expense, index) => (
                      <motion.tr
                        key={expense.detailId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        component={TableRow}
                        sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {expense.employeeName.charAt(0)}
                            </Avatar>
                            {expense.employeeName}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                        <TableCell>
                          <Chip
                            label={expense.expenseType}
                            size="small"
                            sx={{ borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold" sx={{ color: "#8d0638ff" }}>
                            {formatCurrency(expense.expenseAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {expense.image ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewImage(expense.image)}
                              sx={{ borderRadius: 2 }}
                            >
                              View
                            </Button>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No Receipt
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(expense.Status)}
                            label={expense.Status}
                            color={getStatusColor(expense.Status)}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </TableCell>
                        {user?.role === 'HR' && (
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Approve">
                                <IconButton
                                  color="success"
                                  size="small"
                                  onClick={() => handleStatusChange(expense.detailId, 'Approved')}
                                  disabled={expense.Status === 'Approved' || expense.Status === 'Rejected'}
                                >
                                  <Check />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleStatusChange(expense.detailId, 'Rejected')}
                                  disabled={expense.Status === 'Approved' || expense.Status === 'Rejected'}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    count={filteredExpenses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredExpenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((expense, index) => (
                  <Grid item xs={12} sm={6} md={4} key={expense.detailId}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        elevation={4}
                        sx={{
                          borderRadius: 3,
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            transition: 'transform 0.3s ease'
                          }
                        }}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                {expense.employeeName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {expense.employeeName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {formatDate(expense.expenseDate)}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              icon={getStatusIcon(expense.Status)}
                              label={expense.Status}
                              color={getStatusColor(expense.Status)}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            />
                          </Box>

                          <Box mb={2}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Category
                            </Typography>
                            <Chip
                              label={expense.expenseType}
                              variant="outlined"
                              size="small"
                              sx={{ borderRadius: 2 }}
                            />
                          </Box>

                          <Box mb={2}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Amount
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: "#8d0638ff" }}>
                              {formatCurrency(expense.expenseAmount)}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            {expense.image ? (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleViewImage(expense.image)}
                                sx={{ borderRadius: 2 }}
                              >
                                View Receipt
                              </Button>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No Receipt
                              </Typography>
                            )}

                            {user?.role === 'HR' && expense.Status === 'Pending' && (
                              <Box display="flex" gap={1}>
                                <Tooltip title="Approve">
                                  <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() => handleStatusChange(expense.detailId, 'Approved')}
                                  >
                                    <Check />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleStatusChange(expense.detailId, 'Rejected')}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
            </AnimatePresence>
          </Grid>
        )}
      </motion.div>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receipt Image</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Receipt"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EnhancedViewExpense;
