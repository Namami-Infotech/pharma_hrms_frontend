import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../api/endpoints";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    TextField,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Select,
    InputLabel,
    FormControl,
    TablePagination,
    TableFooter, IconButton, Menu,
    Box, Typography
} from '@mui/material';
import axios from 'axios';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useAuth } from '../auth/AuthContext'; // Adjust import according to your project structure

const AssetList = () => {
    const { user } = useAuth(); // Custom hook to get user information
    const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
    const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);
    const [assets, setAssets] = useState([]);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [selectedAsset, setSelectedAsset] = useState('');
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employeeMap, setEmployeeMap] = useState({});

    // New state for manual EmpId entry
    const [manualEmpId, setManualEmpId] = useState('');
    const [assetDetails, setAssetDetails] = useState({
        serialNumber: '',
        makeName: '',
        modelName: ''
    });
    const [statusData, setStatusData] = useState({
        issueId: '', // Use issueId instead of assetId for clarity
        status: ''
    });

    const [newAssetData, setNewAssetData] = useState({
        productName: '',
        addedDate: new Date().toISOString().split('T')[0] // Initialize with today's date
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuIssueId, setMenuIssueId] = useState(null); // Store the issue ID related to the clicked menu

    const handleMenuClick = (event, issueId) => {
        setAnchorEl(event.currentTarget);
        setMenuIssueId(issueId); // Set the issueId for the clicked menu
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };



    useEffect(() => {
        fetchAssets();
        fetchAvailableAssets();
    }, [page, rowsPerPage]);

    const fetchAssets = async () => {
        try {
            const params = {
                role: isAdmin ? 'Admin' : (isRM ? 'RM' : 'Employee'),
                EmpId: isAdmin ? undefined : user.emp_id,
                page,
                limit: rowsPerPage
            };

            const [assetsResponse, employeesResponse] = await Promise.all([
                axios.get(`${BASE_URL}/assets/get_issue_asset.php`, { params }),
                axios.get(`${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`)
            ]);

            if (employeesResponse.data.success) {
                const employees = employeesResponse.data.data.filter(emp => emp.Tenent_Id === user.tenent_id); // Filter employees by Tenent_Id

                const employeeMap = employees.reduce((map, emp) => {
                    map[emp.EmpId] = emp.Name; // Map EmpId to Name
                    return map;
                }, {});

                setEmployeeMap(employeeMap);

                if (assetsResponse.data.success) {
                    const filteredAssets = assetsResponse.data.data
                        .filter(asset => employeeMap[asset.emp_id]) // Show only assets for employees in the same Tenent_Id
                        .map(asset => ({
                            ...asset,
                            emp_name: employeeMap[asset.emp_id] || 'Unknown' // Replace EmpId with Name
                        }));

                    setAssets(filteredAssets);
                } else {
                    setSnackbarMessage(assetsResponse.data.message);
                    setOpenSnackbar(true);
                }
            } else {
                setSnackbarMessage(employeesResponse.data.message);
                setOpenSnackbar(true);
            }
        } catch (error) {
            setSnackbarMessage('Error fetching assets.');
            setOpenSnackbar(true);
        }
    };


    const fetchAvailableAssets = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/assets/get_asset.php`);
            if (response.data.success) {
                setAvailableAssets(response.data.data);
            } else {
                setSnackbarMessage(response.data.message);
                setOpenSnackbar(true);
            }
        } catch (error) {
            setSnackbarMessage('Error fetching available assets.');
            setOpenSnackbar(true);
        }
    };

    const handleIssueAssetClick = () => {
        setIssueDialogOpen(true);
    };

    const handleIssueAssetSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/assets/issue_asset.php`, {
                EmpId: manualEmpId, // Use the manually entered EmpId
                assets: [
                    {
                        asset_id: selectedAsset,
                        status: 'Issued',
                        serial_number: assetDetails.serialNumber,
                        make_name: assetDetails.makeName,
                        model_name: assetDetails.modelName,
                        remark: 'Issued to the employee'
                    }
                ]
            });

            if (response.data.success) {
                setSnackbarMessage('Asset issued successfully.');
                fetchAssets(); // Refresh the assets list
                // Clear fields
                setManualEmpId('');
                setSelectedAsset('');
                setAssetDetails({
                    serialNumber: '',
                    makeName: '',
                    modelName: ''
                });
            } else {
                setSnackbarMessage(response.data.message);
            }
        } catch (error) {
            setSnackbarMessage('Error issuing asset.');
        } finally {
            setLoading(false);
            setIssueDialogOpen(false);
        }
    };

    const handleAddNewAsset = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/assets/add_asset.php`, {
                product_name: newAssetData.productName,
                added_date: newAssetData.addedDate
            });

            if (response.data.success) {
                setSnackbarMessage('New asset added successfully.');
                // Update the available assets list
                fetchAvailableAssets();
                // Clear fields
                setNewAssetData({
                    productName: '',
                    addedDate: new Date().toISOString().split('T')[0] // Reset to today's date
                });
            } else {
                setSnackbarMessage(response.data.message);
            }
        } catch (error) {
            setSnackbarMessage('Error adding new asset.');
        }
    };

    const handleDialogClose = () => {
        setIssueDialogOpen(false);
        // Clear the fields
        setManualEmpId('');
        setSelectedAsset('');
        setAssetDetails({
            serialNumber: '',
            makeName: '',
            modelName: ''
        });
        setNewAssetData({
            productName: '',
            addedDate: new Date().toISOString().split('T')[0] // Reset to today's date
        });
    };
    const handleStatusChangeSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/assets/update_asset_status.php`, {
                issue_id: menuIssueId,
                status: statusData.status
            });
            if (response.data.success) {
                setSnackbarMessage('Asset status updated successfully.');
                fetchAssets(); // Refresh the assets list
            } else {
                setSnackbarMessage(response.data.message);
            }
        } catch (error) {
            setSnackbarMessage('Error updating asset status.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (status) => {
        setStatusData({ ...statusData, status }); // Set the status before submission
        handleStatusChangeSubmit();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>
                        Asset Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3, fontSize: "0.85rem" }}>
                        Manage company equipment, issue devices, and track asset distribution
                    </Typography>
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        onClick={handleIssueAssetClick}
                        sx={{ backgroundColor: "#f37021", color: "white", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "#d95300" } }}
                    >
                        Issue Asset
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <TableRow>
                            <TableCell sx={{ color: "#475569", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>EmpId</TableCell>
                            <TableCell sx={{ color: "#475569", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Asset Name</TableCell>
                            <TableCell sx={{ color: "#475569", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Serial Number</TableCell>
                            <TableCell sx={{ color: "#475569", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Status</TableCell>
                            <TableCell sx={{ color: "#475569", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Remark</TableCell>
                            <TableCell sx={{ color: "#475569", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Issue Date</TableCell>
                            <TableCell sx={{ color: "#475569", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.map((asset) => (
                            <TableRow key={asset.id}>
                                <TableCell>{asset.emp_name}</TableCell>
                                <TableCell>{asset.asset_name}</TableCell>
                                <TableCell>{asset.serial_number}</TableCell>
                                <TableCell>{asset.status}</TableCell>
                                <TableCell>{asset.remark}</TableCell>
                                <TableCell>{new Date(asset.issue_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={(e) => handleMenuClick(e, asset.id)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        {isAdmin ? (
                                            <>
                                                <MenuItem onClick={() => handleStatusChange('Issued')}>Issued</MenuItem>
                                                <MenuItem onClick={() => handleStatusChange('Returned')}>Returned</MenuItem>
                                                <MenuItem onClick={() => handleStatusChange('Received by Admin')}>Received by Admin</MenuItem>
                                            </>
                                        ) : (
                                            <>
                                                <MenuItem onClick={() => handleStatusChange('Received')}>Received</MenuItem>
                                                <MenuItem onClick={() => handleStatusChange('Not Received')}>Not Received</MenuItem>
                                                <MenuItem onClick={() => handleStatusChange('Return')}>Return</MenuItem>
                                                <MenuItem onClick={() => handleStatusChange('Replace')}>Replace</MenuItem>
                                            </>
                                        )}
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={assets.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            {/* Issue Asset Dialog */}
            <Dialog open={issueDialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Issue Asset</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Employee ID"
                        fullWidth
                        value={manualEmpId}
                        onChange={(e) => setManualEmpId(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <FormControl fullWidth style={{ marginBottom: '20px' }}>
                        <InputLabel>Asset</InputLabel>
                        <Select
                            value={selectedAsset}
                            onChange={(e) => setSelectedAsset(e.target.value)}
                            label="Asset"
                        >
                            {availableAssets.map((asset) => (
                                <MenuItem key={asset.id} value={asset.id}>
                                    {asset.product_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Serial Number"
                        fullWidth
                        value={assetDetails.serialNumber}
                        onChange={(e) => setAssetDetails({ ...assetDetails, serialNumber: e.target.value })}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="Make Name"
                        fullWidth
                        value={assetDetails.makeName}
                        onChange={(e) => setAssetDetails({ ...assetDetails, makeName: e.target.value })}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="Model Name"
                        fullWidth
                        value={assetDetails.modelName}
                        onChange={(e) => setAssetDetails({ ...assetDetails, modelName: e.target.value })}
                        style={{ marginBottom: '20px' }}
                    />

                    <p>If want to add new assets</p>
                    <TextField
                        label="New Asset Name"
                        fullWidth
                        value={newAssetData.productName}
                        onChange={(e) => setNewAssetData({ ...newAssetData, productName: e.target.value })}
                        style={{ marginBottom: '20px' }}
                    />
                    {/* You can remove or adjust this field if you don't need to let users specify the added date */}
                    <TextField
                        label="Added Date"
                        type="date"
                        fullWidth
                        value={newAssetData.addedDate}
                        onChange={(e) => setNewAssetData({ ...newAssetData, addedDate: e.target.value })}
                        style={{ marginBottom: '20px' }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <Button
                        variant="contained"
                        color="#f37021"
                        onClick={handleAddNewAsset}
                        style={{ marginTop: '20px' }}
                    >
                        Add New Asset
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="#f37021">
                        Cancel
                    </Button>
                    <Button onClick={handleIssueAssetSubmit} color="#f37021" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Issue'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </Box>
    );
};

export default AssetList;
