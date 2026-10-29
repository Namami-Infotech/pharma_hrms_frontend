"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  IconButton,
  Grid,
  TablePagination,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Fade,
  Autocomplete,
  Fab,
  Zoom,
  alpha,
  FormControl,
  MenuItem,
  InputLabel,
  Select
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Close,
  CheckCircle,
  Search,
  LocationOn,
  Business,
  Person,
  Refresh,
  Visibility,
  Place,
  MyLocation,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

// Office Card Component for Mobile View
const OfficeCard = ({ office, onEdit, onDelete, theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2, boxShadow: theme.shadows[8] }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          mb: 2,
          borderLeft: `4px solid ${office.IsActive ? theme.palette.success.main : theme.palette.error.main}`,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[8],
            transition: "all 0.2s ease",
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: office.IsActive
                    ? theme.palette.primary.main
                    : theme.palette.grey[400],
                  mr: 2,
                  width: 48,
                  height: 48,
                }}
              >
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {office.OfficeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {office.Id}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={office.IsActive ? "Active" : "Inactive"}
              color={office.IsActive ? "success" : "error"}
              size="small"
            />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Person
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                />
                <Typography variant="body2">
                  Employee: {office.EmpId}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Place
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.secondary.main }}
                />
                <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                  {office.LatLong}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MyLocation
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.info.main }}
                />
                <Typography variant="body2">
                  Distance: {office.Distance}m
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Tooltip title="Edit Office">
              <IconButton
                size="small"
                sx={{ color: "#8d0638ff" }}
                onClick={() => onEdit(office)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Office">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(office)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ icon, title, value, color, subtitle }) => {
  const theme = useTheme();

  return (
    <Card
      component={motion.div}
      whileHover={{
        translateY: -5,
        boxShadow: theme.shadows[8],
        transition: { duration: 0.2 },
      }}
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{ bgcolor: `${alpha(color, 0.2)}`, color: color, width: 48, height: 48 }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

function OfficeManagement() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [offices, setOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
  // Remove EmpId: "",
  OfficeName: "",
  LatLong: "",
  // Distance: "",
  IsActive: 1,
});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchOffices();
    fetchEmployees();
  }, []);

  const fetchOffices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/employee/get_office.php`
      );
      if (response.data.success) {
        setOffices(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setError("Failed to fetch offices");
      }
    } catch (error) {
      setError("Error fetching offices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`
      );
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleOpenForm = (mode, office = null) => {
    setFormMode(mode);
    if (mode === "edit" && office) {
      setSelectedOffice(office);
      setFormData({
        EmpId: office.EmpId || "",
        OfficeName: office.OfficeName || "",
        LatLong: office.LatLong || "",
        Distance: office.Distance || "",
        IsActive: office.IsActive || 1,
      });
    } else {
      setSelectedOffice(null);
      setFormData({
        EmpId: "",
        OfficeName: "",
        LatLong: "",
        Distance: "",
        IsActive: 1,
      });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setError("");
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  // Remove EmpId from required fields check
  const requiredFields = ["OfficeName", "LatLong"];
  for (const field of requiredFields) {
    if (!formData[field]) {
      alert(`Please fill in all required fields. Missing: ${field}`);
      setSubmitting(false);
      return;
    }
  }

  try {
    const url = `${BASE_URL}/employee/add_office.php`;
    const payload = {
      EmpId: "NI003", // Hardcoded EmpId
      OfficeName: formData.OfficeName,
      LatLong: formData.LatLong,
      Distance: "100",
      IsActive: formData.IsActive,
    };

    console.log("Sending office data:", payload);
    const response = await axios.post(url, payload);

    if (response.data.success) {
      alert(`Office ${formMode === "add" ? "added" : "updated"} successfully!`);
      handleCloseForm();
      fetchOffices();
    } else {
      alert(response.data.message || `Failed to ${formMode === "add" ? "add" : "update"} office`);
    }
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    alert(`Error: ${error.response ? error.response.data.message : error.message}`);
  } finally {
    setSubmitting(false);
  }
};

  const handleDeleteOffice = async (office) => {
    if (!window.confirm(`Are you sure you want to delete the office "${office.OfficeName}"?`)) {
      return;
    }

    try {
      // Since there's no delete API, we'll deactivate the office
      const response = await axios.post(
        `${BASE_URL}/employee/add_office.php`,
        {
          ...office,
          IsActive: 0,
        }
      );

      if (response.data.success) {
        alert("Office deactivated successfully!");
        fetchOffices();
      } else {
        alert("Failed to deactivate office: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting office:", error);
      alert("Error deactivating office: " + error.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredOffices = (Array.isArray(offices) ? offices : []).filter((office) => {
    if (!office) return false;

    const lowerCaseSearchTerm = (searchTerm || "").toLowerCase().trim();
    const matchesSearch =
      !lowerCaseSearchTerm ||
      (office.OfficeName && office.OfficeName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (office.EmpId && office.EmpId.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (office.LatLong && office.LatLong.toLowerCase().includes(lowerCaseSearchTerm));

    const matchesStatus =
      filterStatus === "" ||
      (office.IsActive !== undefined && office.IsActive !== null && office.IsActive.toString() === filterStatus);

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalOffices = offices.length;
  const activeOffices = offices.filter((office) => office.IsActive).length;
  const inactiveOffices = totalOffices - activeOffices;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 1, md: 2 },
        py: { xs: 1, md: 1 },
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1800 }}>
        {/* Header Section */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            background: "linear-gradient(135deg, #f8f0f4 0%, #fff 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="#8d0638ff"
              sx={{ flexGrow: 1 }}
            >
              Office Management
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mt: { xs: 2, md: 0 } }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchOffices}
                  sx={{
                    bgcolor: "#fff",
                    color: "#8d0638ff",
                    "&:hover": { bgcolor: "#f2e6eb" },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenForm("add")}
                sx={{
                  bgcolor: "#8d0638ff",
                  color: "white",
                  "&:hover": { bgcolor: "#6b042d" },
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Add Office
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          

          {/* Search and Filters */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search offices by name, employee ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  "&:hover": { bgcolor: "#fefefe" },
                }}
              />
            </Grid>

            

            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("");
                }}
                sx={{
                  borderRadius: 2,
                  borderColor: alpha("#8d0638ff", 0.5),
                  color: "#8d0638ff",
                  "&:hover": {
                    borderColor: "#8d0638ff",
                    bgcolor: alpha("#8d0638ff", 0.04),
                  },
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Office List */}
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Office List ({filteredOffices.length})
              </Typography>
              <AnimatePresence>
                {filteredOffices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((office) => (
                    <OfficeCard
                      key={office.Id}
                      office={office}
                      onEdit={handleOpenForm}
                      onDelete={handleDeleteOffice}
                      theme={theme}
                    />
                  ))}
              </AnimatePresence>
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#8d0638ff" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Business sx={{ mr: 1 }} />
                        Office Name
                      </Box>
                    </TableCell>
                    {/* <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person sx={{ mr: 1 }} />
                        Employee ID
                      </Box>
                    </TableCell> */}
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocationOn sx={{ mr: 1 }} />
                        Location Coordinates
                      </Box>
                    </TableCell>
                   
                    {/* <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Status
                    </TableCell> */}
                    {/* <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Actions
                    </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredOffices
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((office, index) => (
                        <motion.tr
                          key={office.Id}
                          component={TableRow}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          sx={{
                            "&:hover": {
                              bgcolor: theme.palette.action.hover,
                              transform: "scale(1.01)",
                              transition: "all 0.2s ease",
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                sx={{
                                  mr: 2,
                                  width: 32,
                                  height: 32,
                                  bgcolor: theme.palette.primary.main,
                                }}
                              >
                                <Business fontSize="small" />
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">
                                {office.OfficeName}
                              </Typography>
                            </Box>
                          </TableCell>
                          {/* <TableCell>
                            <Typography variant="body2">
                              {office.EmpId}
                            </Typography>
                          </TableCell> */}
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                              }}
                            >
                              {office.LatLong}
                            </Typography>
                          </TableCell>
                         
                          {/* <TableCell>
                            <Chip
                              label={office.IsActive ? "Active" : "Inactive"}
                              color={office.IsActive ? "success" : "error"}
                              size="small"
                            />
                          </TableCell> */}
                          {/* <TableCell>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="Edit Office">
                                <IconButton
                                  size="small"
                                  sx={{ color: "#8d0638ff" }}
                                  onClick={() => handleOpenForm("edit", office)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Office">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteOffice(office)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell> */}
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredOffices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Add/Edit Office Dialog */}
        <Dialog
          open={openForm}
          onClose={handleCloseForm}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#8d0638ff",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Business sx={{ mr: 1 }} />
              {formMode === "add" ? "Add New Office" : "Edit Office"}
            </Box>
            <IconButton onClick={handleCloseForm} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <LocationOn sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Office Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Office Name"
                    value={formData.OfficeName}
                    onChange={(e) =>
                      setFormData({ ...formData, OfficeName: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location Coordinates"
                    placeholder="e.g., 28.6129,77.2295"
                    value={formData.LatLong}
                    onChange={(e) =>
                      setFormData({ ...formData, LatLong: e.target.value })
                    }
                    required
                    helperText="Format: latitude,longitude"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                

                
              </Grid>
            </form>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: "#f5f5f5" }}>
            <Button onClick={handleCloseForm} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={20} /> : <CheckCircle />
              }
              sx={{ bgcolor: "#8d0638ff", color: "white" }}
            >
              {submitting
                ? "Saving..."
                : formMode === "add"
                  ? "Add Office"
                  : "Update Office"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <Zoom in={true}>
          <Fab
            color="primary"
            onClick={() => handleOpenForm("add")}
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: theme.zIndex.speedDial,
              bgcolor: '#8d0638ff',
              '&:hover': {
                bgcolor: '#6d0430ff',
              }
            }}
            size="medium"
          >
            <Add />
          </Fab>
        </Zoom>
      </Box>
    </Box>
  );
}

export default OfficeManagement;