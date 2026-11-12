"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TablePagination,
  Button,
  Card,
  Chip,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Business,
  Person,
  Phone,
  Download,
  Add,
  Search,
  Refresh,
  InfoOutlined,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import AddDealers from "./AddDealers";

// Color palette
const COLORS = {
  primary: "#f37021",
  secondary: "#667eea",
  background: "#f8fafc",
  surface: "#ffffff",
  text: {
    primary: "#1a202c",
    secondary: "#718096",
  },
};

function DealerList() {
  const { user } = useAuth();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchData = async () => {
    try {
      if (!user || !user.emp_id || !user.tenent_id) {
        setError("User is not authenticated");
        setLoading(false);
        return;
      }

      const employeeResponse = await axios.get(
        `${BASE_URL}/employee/list_employee.php`,
        { params: { Tenent_Id: user.tenent_id } }
      );

      if (!employeeResponse.data.success) {
        setError("Error fetching employee data");
        setLoading(false);
        return;
      }

      const dealerResponse = await axios.get(
        `${BASE_URL}/dealer/get_dealers.php`,
        { params: { empId: user.emp_id, role: user.role } }
      );

      if (!dealerResponse.data.success) {
        setError(dealerResponse.data.message);
        setLoading(false);
        return;
      }

      const rawData = Array.isArray(dealerResponse.data.data)
        ? dealerResponse.data.data
        : [];
      const sorted = [...rawData].sort((a, b) => {
        const idA = parseInt(a.DealerID || a.ActivityId || 0, 10);
        const idB = parseInt(b.DealerID || b.ActivityId || 0, 10);
        if (!isNaN(idA) && !isNaN(idB) && idA !== idB) {
          return idB - idA; // Recent/highest ID on top
        }
        const dateA = new Date(a.CreatedAt || a.CreateDate || 0).getTime();
        const dateB = new Date(b.CreatedAt || b.CreateDate || 0).getTime();
        return dateB - dateA; // Recent date on top
      });

      setDealers(sorted);
    } catch (error) {
      setError("Error fetching data");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
    ];

    dealers.forEach(
      ({
        DealerID,
        DealerName,
        Address,
        ContactInfo,
        CompanyName,
        MailId,
        Remarks,
        AddedByName,
      }) => {
        csvRows.push([
          `"${DealerID}"`,
          `"${DealerName}"`,
          `"${CompanyName}"`,
          `"${Address}"`,
          `"${ContactInfo}"`,
          `"${MailId}"`,
          `"${Remarks}"`,
          `"${AddedByName}"`,
        ]);
      }
    );

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "dealers.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredDealers = dealers.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(d.DealerID || "").toLowerCase().includes(term) ||
      String(d.DealerName || "").toLowerCase().includes(term) ||
      String(d.CompanyName || "").toLowerCase().includes(term) ||
      String(d.Address || "").toLowerCase().includes(term) ||
      String(d.ContactInfo || "").toLowerCase().includes(term) ||
      String(d.MailId || "").toLowerCase().includes(term) ||
      String(d.State || d["Dealer State"] || "").toLowerCase().includes(term) ||
      String(d.AddedByName || "").toLowerCase().includes(term)
    );
  });

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
            gap: 1.5,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {/* Search + Counter */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flex: { xs: 1, sm: "initial" },
            }}
          >
            <TextField
              size="small"
              placeholder="Search leads, dealers, company, phone..."
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
                width: { xs: "100%", sm: 280, md: 320 },
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
              label={`Total: ${filteredDealers.length} Leads`}
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
            <Tooltip title="Refresh list">
              <IconButton
                onClick={fetchData}
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
              variant="outlined"
              onClick={exportToCsv}
              startIcon={<Download sx={{ fontSize: 18 }} />}
              size="small"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                borderRadius: 1.8,
                px: 1.8,
                height: 36,
                fontWeight: 600,
                fontSize: "0.82rem",
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  borderColor: "#5a6fd8",
                  bgcolor: "rgba(102, 126, 234, 0.08)",
                },
              }}
            >
              Export CSV
            </Button>

            <Button
              variant="contained"
              onClick={() => setOpenAddModal(true)}
              startIcon={<Add sx={{ fontSize: 18 }} />}
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
              Add Doctor / Lead
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 1.5, py: 0.5 }}>
            {error}
          </Alert>
        )}

        {/* Table Container */}
        <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <Table stickyHeader size="small" sx={{ minWidth: 850 }}>
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
                <TableCell sx={{ whiteSpace: "nowrap" }}>Dealer ID</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Company</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Contact Person</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>State</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Address</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Added By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} sx={{ color: "#f37021", mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Loading leads and dealer data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredDealers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <InfoOutlined sx={{ fontSize: 44, color: "#9ca3af", mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#4b5563" }}>
                      No leads or dealers found
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      {searchTerm
                        ? "Try clearing your search query."
                        : "Click '+ Add Doctor / Lead' to register your first record."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDealers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((dealer) => (
                    <TableRow
                      key={dealer.DealerID}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          label={dealer.DealerID}
                          size="small"
                          sx={{
                            bgcolor: `${COLORS.primary}15`,
                            color: COLORS.primary,
                            fontWeight: 600,
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: COLORS.secondary,
                              fontSize: "0.8rem",
                            }}
                          >
                            <Business sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {dealer.CompanyName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: "#10b981",
                              fontSize: "0.8rem",
                            }}
                          >
                            <Person sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="body2" noWrap>
                            {dealer.DealerName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={500}>
                          {dealer.State || dealer["Dealer State"] || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={dealer.Address || ""} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dealer.Address || "-"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2">
                            {dealer.ContactInfo || "-"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={dealer.MailId || ""} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 150,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dealer.MailId || "-"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={dealer.Remarks || ""} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 150,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dealer.Remarks || "-"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          label={dealer.AddedByName || dealer.AddedByEmpId || "Admin"}
                          size="small"
                          sx={{
                            bgcolor: `${COLORS.secondary}15`,
                            color: COLORS.secondary,
                            fontWeight: 600,
                            borderRadius: 1.5,
                          }}
                        />
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
          count={filteredDealers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ flexShrink: 0, borderTop: "1px solid #f1f5f9" }}
        />
      </Card>

      {/* Dynamic Add Lead / Dealer Modal Form */}
      <AddDealers
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onDealerAdded={fetchData}
      />
    </Box>
  );
}

export default DealerList;
