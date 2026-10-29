"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
  Paper,
  alpha,
  Avatar,
  Grid,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { 
  Receipt, 
  Payment, 
  CalendarToday, 
  AttachMoney, 
  Schedule,
  CheckCircle,
  Pending,
  Warning,
  Add,
  Visibility,
  Edit
} from "@mui/icons-material"
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"

// Compact Stats Card Component for Invoices
const InvoiceStatsCard = ({ title, value, color, icon, subtitle }) => {
  const theme = useTheme()

  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
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
            <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.75rem' }}>
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

// Status Chip Component
const StatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    const config = {
      'Received': { color: 'success', icon: <CheckCircle fontSize="small" /> },
      'Paid': { color: 'info', icon: <Payment fontSize="small" /> },
      'Pending': { color: 'warning', icon: <Pending fontSize="small" /> },
      'Overdue': { color: 'error', icon: <Warning fontSize="small" /> }
    }
    return config[status] || { color: 'default', icon: <Pending fontSize="small" /> }
  }

  const { color, icon } = getStatusConfig(status)

  return (
    <Chip
      icon={icon}
      label={status}
      color={color}
      size="small"
      variant="filled"
      sx={{ height: 24, fontSize: '0.7rem', fontWeight: 500 }}
    />
  )
}

// UTR Update Dialog Component
const UTRUpdateDialog = ({ open, onClose, invoice, onUpdateUTR }) => {
  const [utrNumber, setUtrNumber] = useState("")

  useEffect(() => {
    if (open) {
      setUtrNumber(invoice?.utr_no || "")
    }
  }, [open, invoice])

  const handleSubmit = () => {
    if (utrNumber.trim() && invoice) {
      onUpdateUTR(invoice.id, utrNumber.trim())
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="600">
          Update UTR Number
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Invoice: {invoice?.invoice_no}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="UTR Number"
          fullWidth
          variant="outlined"
          value={utrNumber}
          onChange={(e) => setUtrNumber(e.target.value)}
          placeholder="Enter UTR number from your bank transaction"
          sx={{ mt: 1 }}
        />
        <Alert severity="info" sx={{ mt: 2, fontSize: '0.8rem' }}>
          After making the payment, enter the UTR number provided by your bank to update the payment status.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!utrNumber.trim()}
          sx={{
            bgcolor: "#8d0638ff",
            "&:hover": {
              bgcolor: "#6d0430ff",
            }
          }}
        >
          Update UTR
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Invoice Card for Mobile View
const InvoiceCard = ({ invoice, onView, onUpdateUTR, isAdmin }) => {
  const theme = useTheme()
  const [utrDialogOpen, setUtrDialogOpen] = useState(false)

  // FIXED: Overdue starts from day after due date
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(invoice.invoice_due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today && invoice.invoice_status === 'Pending';
  }

  const overdue = isOverdue();
 
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            mb: 2,
            borderLeft: `3px solid ${
              invoice.invoice_status === 'Paid' ? theme.palette.success.main :
              overdue ? theme.palette.error.main : theme.palette.warning.main
            }`,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            "&:hover": {
              boxShadow: theme.shadows[4],
              transform: "translateY(-2px)",
              transition: "all 0.2s ease-in-out",
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", flexGrow: 1, gap: 1.5 }}>
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: theme.palette.primary.main, 
                  width: 32, 
                  height: 32 
                }}>
                  <Receipt fontSize="small" />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem', lineHeight: 1.3 }}>
                    {invoice.invoice_no}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Amount: ₹{parseFloat(invoice.invoice_total_amount).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
              <StatusChip status={overdue ? 'Overdue' : invoice.invoice_status} />
            </Box>

            {/* Invoice Details */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Issue Date
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Due Date
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="500" 
                  sx={{ 
                    fontSize: '0.8rem',
                    color: overdue ? theme.palette.error.main : 'inherit'
                  }}
                >
                  {new Date(invoice.invoice_due_date).toLocaleDateString()}
                </Typography>
              </Grid>
              {invoice.utr_no && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    UTR Number
                  </Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                    {invoice.utr_no}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Amount Breakdown */}
            <Box sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.05), 
              p: 1, 
              borderRadius: 1, 
              mb: 2 
            }}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Base
                  </Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                    ₹{parseFloat(invoice.invoice_amount).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    GST
                  </Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                    ₹{parseFloat(invoice.invoice_amount_gst).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                    ₹{parseFloat(invoice.invoice_total_amount).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
              <Tooltip title="View Invoice">
                <Button
                  startIcon={<Visibility />}
                  onClick={() => onView(invoice.invoice_copy)}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    bgcolor: alpha("#8d0638ff", 0.1),
                    color: "#8d0638ff",
                    "&:hover": {
                      bgcolor: alpha("#8d0638ff", 0.2),
                    }
                  }}
                >
                  View
                </Button>
              </Tooltip>

              {/* FIXED: Removed isAdmin check - allow all users to update UTR for pending invoices */}
              {invoice.invoice_status === 'Pending' && (
                <Tooltip title="Update UTR Number">
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setUtrDialogOpen(true)}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      fontSize: '0.75rem'
                    }}
                  >
                    UTR
                  </Button>
                </Tooltip>
              )}
            </Box>

            {/* Warning for overdue invoices */}
            {overdue && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 1.5,
                  fontSize: '0.7rem',
                  py: 0.5,
                  '& .MuiAlert-message': { padding: '4px 0' }
                }}
              >
                Please pay immediately to prevent service disruption
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* UTR Update Dialog */}
      <UTRUpdateDialog
        open={utrDialogOpen}
        onClose={() => setUtrDialogOpen(false)}
        invoice={invoice}
        onUpdateUTR={onUpdateUTR}
      />
    </>
  )
}

// Table Row Component for Desktop
const InvoiceTableRow = ({ invoice, onView, onUpdateUTR, isAdmin, index }) => {
  // Date format function for dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '-'
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  }

  const theme = useTheme()
  const [utrDialogOpen, setUtrDialogOpen] = useState(false)

  // FIXED: Overdue starts from day after due date
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(invoice.invoice_due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today && invoice.invoice_status === 'Pending';
  }

  const overdue = isOverdue();

  return (
    <>
      <motion.tr
        component={TableRow}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        sx={{
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
          ...(overdue && {
            bgcolor: alpha(theme.palette.error.main, 0.04),
            "&:hover": {
              bgcolor: alpha(theme.palette.error.main, 0.08),
            }
          })
        }}
      >
        <TableCell sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              onClick={() => onView(invoice.invoice_copy)}
              sx={{ 
                mr: 1.5, 
                width: 28, 
                height: 28, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
              <Receipt fontSize="small" />
            </Avatar>
            <Box>
              <Typography onClick={() => onView(invoice.invoice_copy)} variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                {invoice.invoice_no}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total: ₹{parseFloat(invoice.invoice_total_amount).toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {formatDate(invoice.invoice_date)}
          </Typography>
        </TableCell>
        <TableCell sx={{ py: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.8rem',
              color: overdue ? theme.palette.error.main : 'inherit',
              fontWeight: overdue ? 600 : 'normal'
            }}
          >
            {formatDate(invoice.invoice_due_date)}
            {overdue && (
              <Warning color="error" sx={{ fontSize: '0.8rem', ml: 0.5 }} />
            )}
          </Typography>
        </TableCell>
        <TableCell sx={{ py: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
              ₹{parseFloat(invoice.invoice_total_amount).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Base: ₹{parseFloat(invoice.invoice_amount).toLocaleString('en-IN')} + 
              GST: ₹{parseFloat(invoice.invoice_amount_gst).toLocaleString('en-IN')}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ py: 1 }}>
          <StatusChip status={overdue ? 'Overdue' : invoice.invoice_status} />
        </TableCell>
        <TableCell sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {invoice.utr_no || '-'}
          </Typography>
        </TableCell>
        <TableCell sx={{ py: 1 }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="View Invoice">
              <IconButton
                onClick={() => onView(invoice.invoice_copy)}
                size="small"
                sx={{
                  color: "#8d0638ff",
                  bgcolor: alpha("#8d0638ff", 0.1),
                  "&:hover": {
                    bgcolor: alpha("#8d0638ff", 0.2),
                  }
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* FIXED: Removed isAdmin check - allow all users to update UTR for pending invoices */}
            {invoice.invoice_status === 'Pending' && (
              <Tooltip title="Update UTR Number">
                <IconButton
                  onClick={() => setUtrDialogOpen(true)}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.info.main, 0.2),
                    }
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </motion.tr>

      {/* UTR Update Dialog for Desktop */}
      <UTRUpdateDialog
        open={utrDialogOpen}
        onClose={() => setUtrDialogOpen(false)}
        invoice={invoice}
        onUpdateUTR={onUpdateUTR}
      />
    </>
  )
}

function InvoiceList() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isAdmin = user?.role === "HR" // This is now only used for display purposes

  // Date format function for dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '-'
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  }

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${BASE_URL}/invoices/get_invoices.php`
      )
      if (response.data.success) {
        setInvoices(response.data.data)
      } else {
        setError("Failed to fetch invoices")
      }
    } catch (err) {
      setError("Error fetching invoices")
      console.error("Error fetching invoices:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUTR = async (invoiceId, utrNumber) => {
    try {
      const response = await axios.post(`${BASE_URL}/invoices/update_invoice.php`, {
        id: invoiceId,
        utr_no: utrNumber,
      })
      if (response.data.success) {
        fetchInvoices() // Refresh the list
      } else {
        setError("Failed to update UTR number")
      }
    } catch (err) {
      setError("Error updating UTR number")
      console.error("Error updating UTR:", err)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewInvoice = (invoiceUrl) => {
    window.open(invoiceUrl, "_blank")
  }

  const getInvoiceStats = () => {
    const total = invoices.length
    const paid = invoices.filter(invoice => invoice.invoice_status === 'Received').length
    const pending = invoices.filter(invoice => invoice.invoice_status === 'Pending').length
    
    // FIXED: Overdue calculation - starts from day after due date
    const overdue = invoices.filter(invoice => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueDate = new Date(invoice.invoice_due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today && invoice.invoice_status === 'Pending';
    }).length
    
    const totalAmount = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.invoice_total_amount), 0)
    const pendingAmount = invoices
      .filter(invoice => invoice.invoice_status === 'Pending')
      .reduce((sum, invoice) => sum + parseFloat(invoice.invoice_total_amount), 0)

    return { total, paid, pending, overdue, totalAmount, pendingAmount }
  }

  const stats = getInvoiceStats()

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 0, bgcolor: "#f8fafc", minHeight: "100vh" }}>
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700" color="#8d0638ff" gutterBottom>
              Invoice Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage your subscription invoices
            </Typography>
          </Box>
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 0,
              borderRadius: 2,
              border: `1px solid ${theme.palette.warning.light}`,
              '& .MuiAlert-message': { width: '100%' },
              
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" fontWeight="500">
                 Please pay before due date to prevent discontinuation
              </Typography>
              
            </Box>
          </Alert>
        </Box>

        {/* Stats Cards */}
        {invoices.length > 0 && (
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <InvoiceStatsCard
                title="Total Invoices"
                value={stats.total}
                color={theme.palette.primary.main}
                icon={<Receipt />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <InvoiceStatsCard
                title="Received"
                value={stats.paid}
                color={theme.palette.success.main}
                icon={<CheckCircle />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <InvoiceStatsCard
                title="Pending"
                value={stats.pending}
                color={theme.palette.warning.main}
                icon={<Pending />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <InvoiceStatsCard
                title="Overdue"
                value={stats.overdue}
                color={theme.palette.error.main}
                icon={<Warning />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <InvoiceStatsCard
                title="Pending Amount"
                value={`₹${stats.pendingAmount.toLocaleString('en-IN')}`}
                color={theme.palette.info.main}
                icon={<CurrencyRupeeIcon />}
                subtitle="Total due"
              />
            </Grid>
          </Grid>
        )}
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

      {/* Main Content */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        {invoices.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Receipt sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Invoices Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your invoices will appear here once generated.
            </Typography>
          </Box>
        ) : isMobile ? (
          // Card View for Mobile
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem' }}>
              Invoices ({invoices.length})
            </Typography>
            <AnimatePresence>
              {invoices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleViewInvoice}
                    onUpdateUTR={handleUpdateUTR}
                    isAdmin={isAdmin}
                  />
                ))}
            </AnimatePresence>
          </Box>
        ) : (
          // Table View for Desktop
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead sx={{ bgcolor: "#8d0638ff" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Receipt sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Invoice No.
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Due Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Amount</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Status</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>UTR Number</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {invoices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((invoice, index) => (
                      <InvoiceTableRow
                        key={invoice.id}
                        invoice={invoice}
                        onView={handleViewInvoice}
                        onUpdateUTR={handleUpdateUTR}
                        isAdmin={isAdmin}
                        index={index}
                      />
                    ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {invoices.length > 0 && (
          <TablePagination
            component="div"
            count={invoices.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ 
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          />
        )}
      </Paper>
    </Box>
  )
}

export default InvoiceList