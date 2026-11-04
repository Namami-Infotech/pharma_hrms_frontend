"use client";
import { BASE_URL } from "../../api/endpoints";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Stack,
  Grid,
  Fade,
  Tooltip,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
  Paper,
} from '@mui/material';
import {
  Visibility,
  RotateLeft,
  RotateRight,
  CalendarToday,
  Person,
  Business,
  Schedule,
  LocationOn,
  ArrowBack,
  Description,
  ExpandMore,
  ExpandLess,
  Search,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

function PlanVisit() {
  const [visits, setVisits] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
  const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);
  const canSelectEmployee = isAdmin || isRM;

  const formatDateToYMD = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(canSelectEmployee ? "" : (user?.emp_id || user?.EmpId || ""));
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [expandedRemark, setExpandedRemark] = useState(null);

  // Sync selectedEmpId if non-admin user loads asynchronously
  useEffect(() => {
    if (!canSelectEmployee && (user?.emp_id || user?.EmpId) && !selectedEmpId) {
      setSelectedEmpId(user.emp_id || user.EmpId);
    }
  }, [canSelectEmployee, user?.emp_id, user?.EmpId, selectedEmpId]);

  // Popup states for image
  const [openDialog, setOpenDialog] = useState(false);
  const [imageData, setImageData] = useState('');
  const [rotation, setRotation] = useState(0);
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (canSelectEmployee) {
      const fetchEmployees = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
          );

          if (response.data.success) {
            const allEmps = response.data.data || [];
            if (isRM && !isAdmin) {
              const teamEmps = allEmps.filter(
                (emp) => emp.EmpId === user.emp_id || emp.RM === user.emp_id || (user?.subordinates && user.subordinates.includes(emp.EmpId))
              );
              setEmployees(teamEmps);
            } else {
              setEmployees(allEmps);
            }
          } else {
            console.log("Failed to fetch employee list");
          }
        } catch (error) {
          console.log("Error fetching employee list:", error.message);
        }
      };
      fetchEmployees();
    }
  }, [user.role, user.tenent_id]);

  const fetchVisits = async () => {
    setLoading(true);
    setNoData(false);
    try {
      const formattedDate = formatDateToYMD(selectedDate);
      const effectiveEmpId = selectedEmpId || (!canSelectEmployee ? (user?.emp_id || user?.EmpId || '') : '');
      const userRole = user?.role || user?.Role || '';

      let url = `${BASE_URL}/visit/plan.php?date=${encodeURIComponent(formattedDate)}`;
      if (userRole) {
        url += `&role=${encodeURIComponent(userRole)}`;
      }
      if (effectiveEmpId) {
        url += `&empId=${encodeURIComponent(effectiveEmpId)}`;
      } else {
        url += `&empId=`;
      }

      const response = await axios.get(url);
      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setVisits(response.data.data);
      } else {
        setVisits([]);
        setNoData(true);
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setVisits([]);
      setNoData(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, [selectedEmpId, selectedDate]);

  const handleDateChange = (event) => {
    if (event.target.value) {
      setSelectedDate(new Date(event.target.value + "T00:00:00"));
    }
  };

  const handleViewImage = async (visitId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/visit/view_one_visit.php?visit_id=${visitId}`,
      );
      const base64Data = response.data.data[0].Attachment;
      setImageData(`data:image/jpeg;base64,${base64Data}`);
      setTime(`${formatTime(response.data.data[0].VisitTime)} - ${formatDate(response.data.data[0].VisitTime)}`);
      setRotation(0);
      setOpenDialog(true);

      const address = await fetchAddressFromLatLong(response.data.data[0].VisitLatLong);
      setAddress(address);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleRotateLeft = () => {
    setRotation((prevRotation) => prevRotation - 90);
  };

  const handleRotateRight = () => {
    setRotation((prevRotation) => prevRotation + 90);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleReadMore = (visitId) => {
    setExpandedRemark(prev => (prev === visitId ? null : visitId));
  };

  const fetchAddressFromLatLong = async (latLong) => {
    const [lat, lng] = latLong.split(",").map(Number);
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    try {
      const response = await axios.get(nominatimUrl);
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address from Nominatim:", error);
      return "Address not found";
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatPlanDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section with Separate Buttons */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3, 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700" color="#f37021" gutterBottom>
              Planned Visits
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage scheduled employee visits
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => navigate("/visit")}
              startIcon={<Visibility />}
              sx={{
                borderRadius: 2,
                borderColor: alpha("#f37021", 0.5),
                color: "#f37021",
                fontWeight: "600",
                px: 2.5,
                py: 0.8,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#f37021",
                  bgcolor: alpha("#f37021", 0.06),
                },
              }}
            >
              View All Visits
            </Button>
            <Button
              variant="contained"
              startIcon={<CalendarToday />}
              sx={{
                borderRadius: 2,
                bgcolor: "#f37021",
                color: "white",
                fontWeight: "600",
                px: 2.5,
                py: 0.8,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#d95300",
                },
              }}
            >
              Plan Visits
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Controls Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 3, 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {canSelectEmployee && (
            <Grid item xs={12} sm={6} md={5}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.Name} (${option.EmpId})`}
                value={employees.find((emp) => emp.EmpId === selectedEmpId) || null}
                onChange={(event, newValue) => {
                  setSelectedEmpId(newValue ? newValue.EmpId : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Employee"
                    variant="outlined"
                    fullWidth
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <Person sx={{ mr: 1, color: "action.active" }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={canSelectEmployee ? 6 : 8} md={canSelectEmployee ? 4 : 8}>
            <TextField
              type="date"
              value={formatDateToYMD(selectedDate)}
              onChange={handleDateChange}
              variant="outlined"
              fullWidth
              label="Select Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1, color: "action.active" }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={canSelectEmployee ? 3 : 4}>
            <Button
              variant="contained"
              fullWidth
              onClick={fetchVisits}
              startIcon={<Search />}
              size="small"
              sx={{
                borderRadius: 2,
                bgcolor: "#f37021",
                fontWeight: "600",
                py: 1,
                "&:hover": {
                  bgcolor: "#d95300",
                },
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Content Section */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : noData ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: "center", 
            borderRadius: 2,
            background: 'white',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            No planned visits found for the selected date.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Try selecting a different date or employee.
          </Typography>
        </Paper>
      ) : (
        <Fade in={!loading}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              background: 'white',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead sx={{ bgcolor: "#f37021" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                        Visited By
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Business sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                        Dealer
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarToday sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                        Planned Date
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Description sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                        Remarks
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visits
                    .sort((a, b) => new Date(b.Plan_Visit || b.create_time || b.VisitTime || 0) - new Date(a.Plan_Visit || a.create_time || a.VisitTime || 0))
                    .map((visit, index) => (
                      <TableRow
                        key={`${visit.DealerID}-${index}`}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <TableCell sx={{ py: 1 }}>
                          <Chip 
                            label={visit.EmpName || visit.Name || "N/A"} 
                            size="small" 
                            sx={{ 
                              height: 24, 
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                            }} 
                          />
                        </TableCell>

                        <TableCell sx={{ py: 1 }}>
                          <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                            {visit.DealerName}
                          </Typography>
                          {visit.CompanyName && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {visit.CompanyName}
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell sx={{ py: 1 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                              {formatPlanDate(visit.Plan_Visit)}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ py: 1 }}>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.8rem',
                                display: '-webkit-box',
                                WebkitLineClamp: expandedRemark === visit.VisitID ? 'unset' : 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {visit.Remarks || "No remarks provided"}
                            </Typography>
                            {visit.Remarks && visit.Remarks.length > 100 && (
                              <Button
                                size="small"
                                onClick={() => handleReadMore(visit.VisitID)}
                                endIcon={expandedRemark === visit.VisitID ? <ExpandLess /> : <ExpandMore />}
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  minWidth: 'auto',
                                  p: 0,
                                  color: "#f37021",
                                  '&:hover': {
                                    backgroundColor: 'transparent',
                                    color: "#6d052cff",
                                  }
                                }}
                              >
                                {expandedRemark === visit.VisitID ? "Show Less" : "Read More"}
                              </Button>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ py: 1 }}>
                          <Tooltip title="View Attachment">
                            <IconButton
                              onClick={() => handleViewImage(visit.VisitID)}
                              size="small"
                              sx={{
                                color: "#f37021",
                                bgcolor: alpha("#f37021", 0.1),
                                "&:hover": {
                                  bgcolor: alpha("#f37021", 0.2),
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>
      )}

      {/* Enhanced Image Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#f37021",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Visibility />
            <Typography variant="h6" fontWeight="600">
              Visit Attachment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          {address && (
            <Card sx={{ mb: 2, bgcolor: alpha("#f37021", 0.04), border: `1px solid ${alpha("#f37021", 0.1)}`, display: 'flex' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" color="#f37021" gutterBottom sx={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, fontSize: '1rem' }} />
                  Location Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {address}
                </Typography>
              </CardContent>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" color="#f37021" gutterBottom sx={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1, fontSize: '1rem' }} />
                  Timestamp
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {time}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box sx={{ textAlign: "center", mt: 2 }}>
            {imageData ? (
              <Box
                component="img"
                src={imageData}
                alt="Visit Attachment"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  transform: `rotate(${rotation}deg)`,
                  transition: "transform 0.3s ease",
                  borderRadius: 1,
                }}
              />
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                No attachment available for this visit.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button 
            onClick={handleRotateLeft} 
            startIcon={<RotateLeft />} 
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Rotate Left
          </Button>
          <Button 
            onClick={handleRotateRight} 
            startIcon={<RotateRight />} 
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Rotate Right
          </Button>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained"
            size="small"
            sx={{ 
              borderRadius: 2,
              bgcolor: "#f37021",
              fontWeight: "600",
              "&:hover": {
                bgcolor: "#6d052cff",
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PlanVisit;