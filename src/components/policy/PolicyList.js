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
  CircularProgress
} from "@mui/material"
import { PictureAsPdf, Done, Close, Add, Policy, Visibility, Description } from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import AddPolicyDialog from "./AddPolicy"
import { useAuth } from "../auth/AuthContext"

// Compact Stats Card Component
const StatsCard = ({ title, value, color, icon }) => {
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

// Policy Card for Mobile View
const PolicyCard = ({ policy, onView, onToggle, isHR }) => {
  const theme = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          borderLeft: `3px solid ${policy.IsActive ? theme.palette.success.main : theme.palette.error.main}`,
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", flexGrow: 1, gap: 1.5 }}>
              <Avatar sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                color: theme.palette.primary.main, 
                width: 32, 
                height: 32 
              }}>
                <Description fontSize="small" />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem', lineHeight: 1.3 }}>
                  {policy.PolicyName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {policy.PolicyDescription}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={policy.IsActive ? "Active" : "Inactive"}
              size="small"
              color={policy.IsActive ? "success" : "error"}
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
            <Tooltip title="View PDF">
              <Button
                startIcon={<PictureAsPdf />}
                onClick={() => onView(policy.PolicyPDF)}
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
                View PDF
              </Button>
            </Tooltip>

            {isHR && (
              <Tooltip title={policy.IsActive ? "Deactivate" : "Activate"}>
                <IconButton
                  onClick={() => onToggle(policy.Id, policy.IsActive ? "disable" : "enable")}
                  size="small"
                  sx={{
                    bgcolor: policy.IsActive ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                    color: policy.IsActive ? theme.palette.error.main : theme.palette.success.main,
                    "&:hover": {
                      bgcolor: policy.IsActive ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2),
                    }
                  }}
                >
                  {policy.IsActive ? <Close fontSize="small" /> : <Done fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PolicyList() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${BASE_URL}/policy/view_policy.php?Tenent_Id=${user.tenent_id}`,
      )
      if (response.data.success) {
        setPolicies(response.data.data)
      } else {
        setError("Failed to fetch policies")
      }
    } catch (err) {
      setError("Error fetching policies")
      console.error("Error fetching policies:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePolicyStatus = async (policyId, action) => {
    try {
      const response = await axios.post(`${BASE_URL}/policy/disable_policy.php`, {
        PolicyId: policyId,
        action,
      })
      if (response.data.success) {
        fetchPolicies()
      } else {
        setError(`Failed to ${action} policy`)
      }
    } catch (err) {
      setError(`Error ${action}ing policy`)
      console.error(`Error ${action}ing policy:`, err)
    }
  }

  const handleOpenDialog = () => setDialogOpen(true)
  const handleCloseDialog = () => setDialogOpen(false)
  const handlePolicyAdded = () => fetchPolicies()

  useEffect(() => {
    fetchPolicies()
  }, [user.tenent_id])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewPDF = (pdfBase64) => {
    try {
      const byteCharacters = atob(pdfBase64)
      const byteArrays = []

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512)
        const byteNumbers = new Array(slice.length)
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }

      const blob = new Blob(byteArrays, { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error opening PDF:", error)
      setError("Error opening PDF file")
    }
  }

  const filteredPolicies = policies.filter((policy) => {
    if (user && user.role === "HR") return true
    return policy.IsActive === 1
  })

  const getPolicyStats = () => {
    const active = policies.filter((policy) => policy.IsActive === 1).length
    const inactive = policies.filter((policy) => policy.IsActive === 0).length
    return { active, inactive, total: policies.length }
  }

  const stats = getPolicyStats()

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} thickness={4} />
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700" color="#8d0638ff" gutterBottom>
              Company Policies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and view company policies and documents
            </Typography>
          </Box>
          {user && user.role === "HR" && (
            <Button
              variant="contained"
              onClick={handleOpenDialog}
              startIcon={<Add />}
              size="small"
              sx={{ 
                borderRadius: 2,
                bgcolor: "#8d0638ff",
                "&:hover": {
                  bgcolor: "#6d0430ff",
                }
              }}
            >
              Add Policy
            </Button>
          )}
        </Box>

        {/* Stats Cards for HR */}
        {user && user.role === "HR" && policies.length > 0 && (
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <StatsCard
                title="Total Policies"
                value={stats.total}
                color={theme.palette.primary.main}
                icon={<Policy />}
              />
            </Grid>
            <Grid item xs={4}>
              <StatsCard
                title="Active"
                value={stats.active}
                color={theme.palette.success.main}
                icon={<Done />}
              />
            </Grid>
            <Grid item xs={4}>
              <StatsCard
                title="Inactive"
                value={stats.inactive}
                color={theme.palette.error.main}
                icon={<Close />}
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
        {filteredPolicies.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Policy sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Policies Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role === "HR" ? "Add your first company policy to get started." : "No active policies at the moment."}
            </Typography>
          </Box>
        ) : isMobile ? (
          // Card View for Mobile
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ fontSize: '0.9rem' }}>
              Policies ({filteredPolicies.length})
            </Typography>
            <AnimatePresence>
              {filteredPolicies
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((policy) => (
                  <PolicyCard
                    key={policy.PolicyId}
                    policy={policy}
                    onView={handleViewPDF}
                    onToggle={handleTogglePolicyStatus}
                    isHR={user?.role === "HR"}
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
                      <Description sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Policy Name
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Description</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Status</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Visibility sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      View
                    </Box>
                  </TableCell>
                  {user && user.role === "HR" && (
                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredPolicies
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((policy, index) => (
                      <motion.tr
                        key={policy.PolicyId}
                        component={TableRow}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ 
                              mr: 1.5, 
                              width: 28, 
                              height: 28, 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontSize: '0.8rem'
                            }}>
                              <Description fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                              {policy.PolicyName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 300,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: '0.8rem'
                            }}
                          >
                            {policy.PolicyDescription}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={policy.IsActive ? "Active" : "Inactive"}
                            size="small"
                            color={policy.IsActive ? "success" : "error"}
                            sx={{ height: 24, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Tooltip title="View PDF">
                            <IconButton
                              onClick={() => handleViewPDF(policy.PolicyPDF)}
                              size="small"
                              sx={{
                                color: "#8d0638ff",
                                bgcolor: alpha("#8d0638ff", 0.1),
                                "&:hover": {
                                  bgcolor: alpha("#8d0638ff", 0.2),
                                }
                              }}
                            >
                              <PictureAsPdf fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        {user && user.role === "HR" && (
                          <TableCell sx={{ py: 1 }}>
                            <Tooltip title={policy.IsActive ? "Deactivate" : "Activate"}>
                              <IconButton
                                onClick={() => handleTogglePolicyStatus(policy.Id, policy.IsActive ? "disable" : "enable")}
                                size="small"
                                sx={{
                                  bgcolor: policy.IsActive ? 
                                    alpha(theme.palette.error.main, 0.1) : 
                                    alpha(theme.palette.success.main, 0.1),
                                  color: policy.IsActive ? 
                                    theme.palette.error.main : 
                                    theme.palette.success.main,
                                  "&:hover": {
                                    bgcolor: policy.IsActive ? 
                                      alpha(theme.palette.error.main, 0.2) : 
                                      alpha(theme.palette.success.main, 0.2),
                                  }
                                }}
                              >
                                {policy.IsActive ? <Close fontSize="small" /> : <Done fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {filteredPolicies.length > 0 && (
          <TablePagination
            component="div"
            count={filteredPolicies.length}
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

      {/* Add Policy Dialog */}
      <AddPolicyDialog open={dialogOpen} onClose={handleCloseDialog} onPolicyAdded={handlePolicyAdded} />
    </Box>
  )
}

export default PolicyList