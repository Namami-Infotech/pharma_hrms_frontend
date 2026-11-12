"use client";
import { BASE_URL } from "../../api/endpoints";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Tooltip,
  Alert,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  RotateLeft,
  RotateRight,
  CalendarToday,
  Person,
  LocationOn,
  Search,
  Refresh,
  InfoOutlined,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function VisitTable() {
  const [visits, setVisits] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
  const isRM =
    user?.is_rm ||
    user?.isRM ||
    Boolean(user?.subordinates && user.subordinates.length > 0);
  const canSelectEmployee = isAdmin || isRM;

  const formatDateToYMD = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(
    canSelectEmployee ? "" : user?.emp_id || user?.EmpId || ""
  );
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync selectedEmpId if non-admin user loads asynchronously
  useEffect(() => {
    if (!canSelectEmployee && (user?.emp_id || user?.EmpId) && !selectedEmpId) {
      setSelectedEmpId(user.emp_id || user.EmpId);
    }
  }, [canSelectEmployee, user?.emp_id, user?.EmpId, selectedEmpId]);

  // Popup states for image
  const [openDialog, setOpenDialog] = useState(false);
  const [imageData, setImageData] = useState("");
  const [rotation, setRotation] = useState(0);
  const [address, setAddress] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (canSelectEmployee) {
      const fetchEmployees = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`
          );

          if (response.data.success) {
            const allEmps = response.data.data || [];
            if (isRM && !isAdmin) {
              const teamEmps = allEmps.filter(
                (emp) =>
                  emp.EmpId === user.emp_id ||
                  emp.RM === user.emp_id ||
                  (user.subordinates && user.subordinates.includes(emp.EmpId))
              );
              setEmployees(teamEmps);
            } else {
              setEmployees(allEmps);
            }
          }
        } catch (error) {
          console.error("Error fetching employee list:", error.message);
        }
      };
      fetchEmployees();
    }
  }, [canSelectEmployee, isAdmin, isRM, user?.emp_id, user?.subordinates, user?.tenent_id]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const formattedDate = formatDateToYMD(selectedDate);
      const url = `${BASE_URL}/visit/view_visit.php?empId=${selectedEmpId}&date=${formattedDate}`;

      const response = await axios.get(url);
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        setVisits(response.data.data);
      } else {
        setVisits([]);
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [selectedEmpId, selectedDate]);

  const handleDateChange = (event) => {
    if (event.target.value) {
      setSelectedDate(new Date(event.target.value + "T00:00:00"));
      setPage(0);
    }
  };

  const handleViewImage = async (visitId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/visit/view_one_visit.php?visit_id=${visitId}`
      );
      const base64Data = response.data.data[0].Attachment;
      setImageData(`data:image/jpeg;base64,${base64Data}`);
      setTime(
        `${formatTime(response.data.data[0].VisitTime)} - ${formatDate(
          response.data.data[0].VisitTime
        )}`
      );
      setRotation(0);
      setOpenDialog(true);

      const addressText = await fetchAddressFromLatLong(
        response.data.data[0].VisitLatLong
      );
      setAddress(addressText);
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

  const fetchAddressFromLatLong = async (latLong) => {
    if (!latLong) return "Address not available";
    const [lat, lng] = latLong.split(",").map(Number);
    if (!lat || !lng) return "Address not available";
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    try {
      const response = await axios.get(nominatimUrl);
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
      return "Address not found";
    } catch (error) {
      console.error("Error fetching address from Nominatim:", error);
      return "Address not found";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredVisits = visits
    .filter((visit) => {
      const visitDate = new Date(visit.VisitTime).toLocaleDateString();
      const matchesDate = visitDate === selectedDate.toLocaleDateString();
      if (!matchesDate) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        String(visit.CompanyName || "").toLowerCase().includes(term) ||
        String(visit.DealerName || "").toLowerCase().includes(term) ||
        String(visit.MobileNo || "").toLowerCase().includes(term) ||
        String(visit.EmpId || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(b.VisitTime) - new Date(a.VisitTime));

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Card
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2.5,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #eef2f6",
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        {/* Single-line sleek toolbar */}
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1.2,
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.2,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {/* Controls: Employee, Date, Search & Total Chip */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexWrap: "wrap",
              flex: { xs: 1, md: "initial" },
            }}
          >
            {canSelectEmployee && (
              <Autocomplete
                size="small"
                options={employees}
                getOptionLabel={(option) => `${option.Name} (${option.EmpId})`}
                value={
                  employees.find((emp) => emp.EmpId === selectedEmpId) || null
                }
                onChange={(event, newValue) => {
                  setSelectedEmpId(newValue ? newValue.EmpId : "");
                  setPage(0);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Employee"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Person sx={{ color: "#94a3b8", fontSize: 18 }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      width: { xs: "100%", sm: 200, md: 220 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.8,
                        bgcolor: "#f8fafc",
                        fontSize: "0.82rem",
                        height: 36,
                        border: "1px solid #e2e8f0",
                        "&:hover": { bgcolor: "#ffffff", borderColor: "#cbd5e1" },
                        "&.Mui-focused": {
                          bgcolor: "#ffffff",
                          borderColor: "#f37021",
                        },
                      },
                      "& fieldset": { border: "none" },
                    }}
                  />
                )}
              />
            )}

            <TextField
              type="date"
              size="small"
              value={formatDateToYMD(selectedDate)}
              onChange={handleDateChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: "#94a3b8", fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", sm: 160 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.8,
                  bgcolor: "#f8fafc",
                  fontSize: "0.82rem",
                  height: 36,
                  border: "1px solid #e2e8f0",
                  "&:hover": { bgcolor: "#ffffff", borderColor: "#cbd5e1" },
                  "&.Mui-focused": {
                    bgcolor: "#ffffff",
                    borderColor: "#f37021",
                  },
                },
                "& fieldset": { border: "none" },
              }}
            />

            <TextField
              size="small"
              placeholder="Search company, dealer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", sm: 200, md: 220 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.8,
                  bgcolor: "#f8fafc",
                  fontSize: "0.82rem",
                  height: 36,
                  transition: "all 0.2s",
                  border: "1px solid #e2e8f0",
                  "&:hover": { bgcolor: "#ffffff", borderColor: "#cbd5e1" },
                  "&.Mui-focused": {
                    bgcolor: "#ffffff",
                    borderColor: "#f37021",
                  },
                },
                "& fieldset": { border: "none" },
              }}
            />

            <Chip
              label={`Total: ${filteredVisits.length} Visits`}
              size="small"
              sx={{
                bgcolor: "rgba(243, 112, 33, 0.08)",
                color: "#f37021",
                fontWeight: 700,
                fontSize: "0.78rem",
                height: 28,
                borderRadius: 1.5,
                border: "1px solid rgba(243, 112, 33, 0.2)",
              }}
            />
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Tooltip title="Refresh visits">
              <IconButton
                onClick={fetchVisits}
                disabled={loading}
                size="small"
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                  width: 36,
                  height: 36,
                  borderRadius: 1.8,
                  "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" },
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              onClick={() => navigate("/plan-visit")}
              startIcon={<CalendarToday sx={{ fontSize: 18 }} />}
              size="small"
              sx={{
                bgcolor: "#f37021",
                borderRadius: 1.8,
                px: 2,
                height: 36,
                fontWeight: 600,
                fontSize: "0.82rem",
                color: "#fff",
                textTransform: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(243, 112, 33, 0.25)",
                "&:hover": {
                  bgcolor: "#d95300",
                  boxShadow: "0 4px 14px rgba(243, 112, 33, 0.35)",
                },
              }}
            >
              Plan Visits
            </Button>
          </Box>
        </Box>

        {/* Table Container */}
        <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <Table stickyHeader size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 700,
                    bgcolor: "#f8fafc",
                    color: "#374151",
                    fontSize: "0.8rem",
                    py: 1.4,
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #e2e8f0",
                  },
                }}
              >
                <TableCell>Company</TableCell>
                <TableCell>Dealer</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Visit By</TableCell>
                <TableCell align="center">Attachment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} sx={{ color: "#f37021", mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Loading visits data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <InfoOutlined sx={{ fontSize: 44, color: "#9ca3af", mb: 1 }} />
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#4b5563" }}
                    >
                      No visits found for the selected date
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Try selecting a different date or employee.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((visit, index) => (
                    <TableRow
                      key={`${visit.DealerID}-${index}`}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ py: 1.2 }}>
                        <Tooltip title="View on Google Maps">
                          <Box
                            component="a"
                            href={`https://www.google.com/maps?q=${visit.VisitLatLong}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: "#f37021",
                              textDecoration: "none",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              fontSize: "0.82rem",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            <LocationOn sx={{ fontSize: 16 }} />
                            {visit.CompanyName || "Location"}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ fontSize: "0.82rem", color: "#111827" }}
                        >
                          {visit.DealerName || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.8rem", color: "#64748b" }}
                        >
                          {formatTime(visit.VisitTime)} {formatDate(visit.VisitTime)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                          {visit.MobileNo || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.2 }}>
                        <Chip
                          label={visit.EmpId}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            bgcolor: "rgba(102, 126, 234, 0.1)",
                            color: "#667eea",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.2 }}>
                        <Tooltip title="View Attachment">
                          <IconButton
                            onClick={() => handleViewImage(visit.VisitID)}
                            size="small"
                            sx={{
                              color: "#f37021",
                              bgcolor: "rgba(243, 112, 33, 0.1)",
                              "&:hover": {
                                bgcolor: "rgba(243, 112, 33, 0.2)",
                              },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pinned Pagination at Bottom */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredVisits.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ flexShrink: 0, borderTop: "1px solid #f1f5f9" }}
        />
      </Card>

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
            p: 2,
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
            <Card
              sx={{
                mb: 2,
                bgcolor: "rgba(243, 112, 33, 0.04)",
                border: "1px solid rgba(243, 112, 33, 0.15)",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <CardContent sx={{ py: 1.5, flex: 1, minWidth: 200 }}>
                <Typography
                  variant="subtitle2"
                  color="#f37021"
                  gutterBottom
                  sx={{
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LocationOn sx={{ mr: 0.8, fontSize: "1rem" }} />
                  Location Details
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.82rem" }}
                >
                  {address}
                </Typography>
              </CardContent>
              <CardContent sx={{ py: 1.5, flex: 1, minWidth: 200 }}>
                <Typography
                  variant="subtitle2"
                  color="#f37021"
                  gutterBottom
                  sx={{
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CalendarToday sx={{ mr: 0.8, fontSize: "1rem" }} />
                  Timestamp
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.82rem" }}
                >
                  {time}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box sx={{ textAlign: "center", mt: 1 }}>
            {imageData ? (
              <Box
                component="img"
                src={imageData}
                alt="Visit Attachment"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "55vh",
                  transform: `rotate(${rotation}deg)`,
                  transition: "transform 0.3s ease",
                  borderRadius: 1.5,
                }}
              />
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                No attachment available for this visit.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 1.5,
            gap: 1,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <Button
            onClick={handleRotateLeft}
            startIcon={<RotateLeft />}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 1.8 }}
          >
            Rotate Left
          </Button>
          <Button
            onClick={handleRotateRight}
            startIcon={<RotateRight />}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 1.8 }}
          >
            Rotate Right
          </Button>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            size="small"
            sx={{
              borderRadius: 1.8,
              bgcolor: "#f37021",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#d95300",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VisitTable;
