"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react"
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
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Business,
  Person,
  LocationOn,
  Phone,
  Email,
  GetApp,
  Store,
  Download,
  Visibility,
  Add,
} from "@mui/icons-material"
import { motion } from "framer-motion"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"
import AddDealers from "./AddDealers"

// Color palette
const COLORS = {
  primary: '#8d0638ff',
  secondary: '#667eea',
  background: '#f8fafc',
  surface: '#ffffff',
  text: {
    primary: '#1a202c',
    secondary: '#718096'
  }
}

function DealerList() {
  const { user } = useAuth()
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openAddModal, setOpenAddModal] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const fetchData = async () => {
    try {
      if (!user || !user.emp_id || !user.tenent_id) {
        setError("User is not authenticated")
        setLoading(false)
        return
      }

      const employeeResponse = await axios.get(
        `${BASE_URL}/employee/list_employee.php`,
        { params: { Tenent_Id: user.tenent_id } },
      )

      if (!employeeResponse.data.success) {
        setError("Error fetching employee data")
        setLoading(false)
        return
      }

      const dealerResponse = await axios.get(
        `${BASE_URL}/dealer/get_dealers.php`,
        { params: { empId: user.emp_id, role: user.role } },
      )

      if (!dealerResponse.data.success) {
        setError(dealerResponse.data.message)
        setLoading(false)
        return
      }

      setDealers(dealerResponse.data.data.reverse())
    } catch (error) {
      setError("Error fetching data")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const exportToCsv = () => {
    const csvRows = [
      [
        "Dealer ID",
        "Dealer Name",
        "Company Name",
        "Address",
        "Contact Info",
        "Email",
        "Remarks",
        "Added By",
      ],
    ]

    dealers.forEach(({ DealerID, DealerName, Address, ContactInfo, CompanyName, MailId, Remarks, AddedByName }) => {
      csvRows.push([
        `"${DealerID}"`,
        `"${DealerName}"`,
        `"${CompanyName}"`,
        `"${Address}"`,
        `"${ContactInfo}"`,
        `"${MailId}"`,
        `"${Remarks}"`,
        `"${AddedByName}"`,
      ])
    })

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute("download", "dealers.csv")
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={60} sx={{ mr: 2, color: COLORS.primary }} />
          <Typography variant="h6" color="text.secondary">
            Loading dealer data...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3, background: COLORS.background, minHeight: '100vh' }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: `${COLORS.primary}15`,
                color: COLORS.primary,
                mr: 2,
                width: 56,
                height: 56
              }}
            >
              <Store sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: COLORS.primary,
                  mb: 0.5,
                }}
              >
                Leads & Dealer Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Register, manage and track all leads and dealer records in one place
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpenAddModal(true)}
            startIcon={<Add />}
            sx={{
              bgcolor: COLORS.primary,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              color: '#fff',
              boxShadow: `0 4px 14px ${COLORS.primary}40`,
              "&:hover": {
                bgcolor: '#70042c',
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 20px ${COLORS.primary}60`
              },
              transition: 'all 0.2s ease',
            }}
          >
            + Add Lead
          </Button>
        </Box>
      </motion.div>

      {/* Stats and Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: COLORS.surface,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={isMobile ? "column" : "row"}
              justifyContent="space-between"
              alignItems={isMobile ? "stretch" : "center"}
              spacing={3}
            >
              <Box>
                <Typography variant="h3" fontWeight={700} color={COLORS.primary} gutterBottom>
                  {dealers.length}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Total Leads / Dealers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active records in the system
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenAddModal(true)}
                  startIcon={<Add />}
                  sx={{
                    bgcolor: COLORS.primary,
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    color: '#fff',
                    "&:hover": { 
                      bgcolor: '#70042c',
                      transform: 'translateY(-1px)',
                      boxShadow: `0 6px 20px ${COLORS.primary}40`
                    },
                    transition: 'all 0.2s ease',
                    minWidth: 140,
                  }}
                >
                  + Add Lead
                </Button>
                <Button
                  variant="outlined"
                  onClick={exportToCsv}
                  startIcon={<Download />}
                  sx={{
                    borderColor: COLORS.secondary,
                    color: COLORS.secondary,
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    "&:hover": { 
                      borderColor: '#5a6fd8',
                      bgcolor: `${COLORS.secondary}10`,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                    minWidth: 140,
                  }}
                >
                  Export CSV
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dealers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card sx={{ 
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: COLORS.surface,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: 'grey.50',
                  '& th': {
                    fontWeight: 600,
                    color: COLORS.text.primary,
                    fontSize: '0.875rem',
                    py: 2,
                    borderBottom: `2px solid ${theme.palette.divider}`
                  }
                }}>
                  <TableCell>Dealer ID</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Added By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dealers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dealer, index) => (
                  <TableRow
                    key={dealer.DealerID}
                    sx={{
                      "&:hover": { 
                        bgcolor: 'action.hover',
                        transform: 'scale(1)'
                      },
                      transition: 'all 0.2s ease',
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={dealer.DealerID} 
                        size="small" 
                        sx={{
                          bgcolor: `${COLORS.primary}15`,
                          color: COLORS.primary,
                          fontWeight: 600,
                          borderRadius: 1.5
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.secondary, fontSize: '0.875rem' }}>
                          <Business fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {dealer.CompanyName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981', fontSize: '0.875rem' }}>
                          <Person fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" noWrap>
                          {dealer.DealerName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={dealer.Address} arrow>
                        <Typography variant="body2" sx={{ 
                          maxWidth: 200, 
                          overflow: "hidden", 
                          textOverflow: "ellipsis",
                          whiteSpace: 'nowrap'
                        }}>
                          {dealer.Address}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {dealer.ContactInfo}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={dealer.MailId} arrow>
                        <Typography variant="body2" sx={{ 
                          maxWidth: 150, 
                          overflow: "hidden", 
                          textOverflow: "ellipsis",
                          whiteSpace: 'nowrap'
                        }}>
                          {dealer.MailId}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={dealer.Remarks} arrow>
                        <Typography variant="body2" sx={{ 
                          maxWidth: 150, 
                          overflow: "hidden", 
                          textOverflow: "ellipsis",
                          whiteSpace: 'nowrap'
                        }}>
                          {dealer.Remarks || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={dealer.AddedByName} 
                        size="small" 
                        sx={{
                          bgcolor: `${COLORS.secondary}15`,
                          color: COLORS.secondary,
                          fontWeight: 500,
                          borderRadius: 1.5
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    count={dealers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      "& .MuiTablePagination-toolbar": {
                        bgcolor: 'grey.50',
                      },
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Card>
      </motion.div>

      {/* Dynamic Add Lead / Dealer Modal Form */}
      <AddDealers
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onDealerAdded={fetchData}
      />
    </Container>
  )
}

export default DealerList