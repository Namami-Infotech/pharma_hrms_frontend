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
  Close,
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
import ApplyExpense from './ApplyExpense';

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin = user && ['Admin', 'admin', 'SuperAdmin'].includes(user.role);
  const isRM = user && (user.is_rm || user.isRM || Boolean(user.subordinates && user.subordinates.length > 0));
  const canApproveOrReject = isAdmin || isRM;

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

  useEffect(() => {
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

  const handleViewImage = (imageData) => {
    if (!imageData) return;

    let finalSrc = String(imageData).trim();

    // If it's a full URL or relative path
    if (
      finalSrc.startsWith("http://") ||
      finalSrc.startsWith("https://") ||
      finalSrc.startsWith("blob:")
    ) {
      // If URL points to remote dev domain or starts with old domain, rewrite to current backend if on localhost
      if (
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
        finalSrc.includes("namami-infotech.com")
      ) {
        finalSrc = finalSrc.replace(/https?:\/\/namami-infotech\.com\/(?:SAFEGUARD\/src|HR-SMILE-BACKEND)/, "http://localhost:5000");
      }
    } else if (finalSrc.startsWith("/")) {
      const backendOrigin = BASE_URL.replace(/\/SAFEGUARD\/api\/?$/, "");
      finalSrc = `${backendOrigin}${finalSrc}`;
    } else if (finalSrc.startsWith("data:image/")) {
      // Already valid data URI
    } else {
      // Plain base64 string
      finalSrc = `data:image/png;base64,${finalSrc}`;
    }

    setSelectedImage(finalSrc);
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
    <Box sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr 1fr",
            },
            gap: { xs: 1.5, sm: 2 },
            mb: 1.5,
            flexShrink: 0,
            width: "100%",
          }}
        >
          <Card
            elevation={0}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              p: 0.5,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mb: 0.5 }}>Total Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {formatCurrency(stats.total)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(243, 112, 33, 0.1)", color: "#f37021", width: 48, height: 48 }}>
                  <AttachMoney sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              p: 0.5,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mb: 0.5 }}>Approved</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981" }}>
                    {stats.approved}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", color: "#10b981", width: 48, height: 48 }}>
                  <CheckCircle sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              p: 0.5,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mb: 0.5 }}>Pending</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                    {stats.pending}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", width: 48, height: 48 }}>
                  <Pending sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              p: 0.5,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mb: 0.5 }}>Rejected</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#ef4444" }}>
                    {stats.rejected}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", width: 48, height: 48 }}>
                  <ErrorIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </motion.div>

      {/* Search, Filter, Export & Add Expense - All in One Place */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card elevation={0} sx={{ mb: 1.5, flexShrink: 0, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <CardContent sx={{ p: 1.2, px: 1.5, "&:last-child": { pb: 1.2 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.2,
                width: "100%",
              }}
            >
              {/* Left: Search + Status Filter */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap", flex: 1, minWidth: { xs: "100%", md: 450 } }}>
                <TextField
                  size="small"
                  placeholder="Search by employee name or expense type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "#94a3b8", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: { xs: "100%", sm: 260, md: 320 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.8,
                      height: 36,
                      fontSize: "0.82rem",
                    },
                  }}
                />

                <TextField
                  select
                  size="small"
                  label="Filter by Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{
                    width: { xs: "100%", sm: 170 },
                    flexShrink: 0,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.8,
                      height: 36,
                      fontSize: "0.82rem",
                    },
                  }}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Box>

              {/* Right: Export + Add Expense */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                <Button
                  variant="outlined"
                  startIcon={<GetApp sx={{ fontSize: 18 }} />}
                  onClick={exportToCsv}
                  size="small"
                  sx={{
                    borderRadius: 1.8,
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    bgcolor: "#ffffff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    height: 36,
                    px: 2,
                    flex: { xs: 1, sm: "none" },
                    "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                  }}
                >
                  Export
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Add sx={{ fontSize: 18 }} />}
                  onClick={() => setCreateExpenseOpen(true)}
                  size="small"
                  sx={{
                    borderRadius: 1.8,
                    bgcolor: '#f37021',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    textTransform: 'none',
                    height: 36,
                    px: 2,
                    boxShadow: '0 2px 6px rgba(243, 112, 33, 0.25)',
                    flex: { xs: 1, sm: "none" },
                    '&:hover': {
                      bgcolor: '#d95300',
                    }
                  }}
                >
                  Add Expense
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense List */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <TableContainer component={Paper} elevation={0} sx={{ flex: 1, minHeight: 0, overflowY: "auto", borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Employee</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Receipt</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</TableCell>
                  {canApproveOrReject && (
                    <TableCell sx={{ color: '#475569', fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: 'center' }}>Action</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((expense, index) => (
                    <TableRow
                      key={expense.detailId || index}
                      hover
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
                          <Typography fontWeight="bold" sx={{ color: "#f37021" }}>
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
                            label={expense.Status}
                            color={getStatusColor(expense.Status)}
                            size="small"
                            sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                          />
                        </TableCell>
                        {canApproveOrReject && (
                          <TableCell sx={{ textAlign: 'center' }}>
                            {expense.Status === 'Pending' ? (
                              <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusChange(expense.detailId, 'Approved')}
                                    sx={{
                                      color: '#16a34a',
                                      bgcolor: 'rgba(22, 163, 74, 0.12)',
                                      border: '1px solid rgba(22, 163, 74, 0.3)',
                                      '&:hover': {
                                        bgcolor: 'rgba(22, 163, 74, 0.25)',
                                      },
                                    }}
                                  >
                                    <Check fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusChange(expense.detailId, 'Rejected')}
                                    sx={{
                                      color: '#dc2626',
                                      bgcolor: 'rgba(220, 38, 38, 0.12)',
                                      border: '1px solid rgba(220, 38, 38, 0.3)',
                                      '&:hover': {
                                        bgcolor: 'rgba(220, 38, 38, 0.25)',
                                      },
                                    }}
                                  >
                                    <Close fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                Processed
                              </Typography>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
              </TableBody>
              <TableFooter
                  sx={{
                      position: "sticky",
                      bottom: 0,
                      zIndex: 3,
                      backgroundColor: "#ffffff",
                      // "& .MuiTableCell-root": {
                      //   backgroundColor: "#ffffff",
                      //   borderTop: "1px solid #e2e8f0",
                      // },
                    }}
               >
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
      </Box>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receipt Image</DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {selectedImage && (
            <Box sx={{ maxWidth: '100%', textAlign: 'center' }}>
              <img
                src={selectedImage}
                alt="Receipt"
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button removed as requested */}

      {/* Create / Apply Expense Dialog */}
      <ApplyExpense
        open={createExpenseOpen}
        onClose={() => setCreateExpenseOpen(false)}
        onExpenseApplied={() => {
          setCreateExpenseOpen(false);
          fetchExpenses();
        }}
      />

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
