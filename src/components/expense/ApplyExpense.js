'use client';
import { BASE_URL } from "../../api/endpoints";

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Fade,
  Slide,
  Alert,
  LinearProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Tooltip,
  Divider,
  Grid,
  Paper,
  Badge,
  Zoom
} from '@mui/material';
import {
  AddCircleOutline,
  RemoveCircleOutline,
  CloudUpload,
  Receipt,
  AttachMoney,
  CalendarToday,
  Category,
  Delete,
  Preview,
  CheckCircle,
  Error as ErrorIcon,
  Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const expenseCategories = [
  { value: 'Travel', label: 'Travel', icon: '✈️', color: '#2196F3' },
  { value: 'Food', label: 'Food & Dining', icon: '🍽️', color: '#FF9800' },
  { value: 'Accommodation', label: 'Accommodation', icon: '🏨', color: '#9C27B0' },
  { value: 'Transportation', label: 'Transportation', icon: '🚗', color: '#4CAF50' },
  { value: 'Office Supplies', label: 'Office Supplies', icon: '📝', color: '#607D8B' },
  { value: 'Communication', label: 'Communication', icon: '📞', color: '#E91E63' },
  { value: 'Training', label: 'Training', icon: '📚', color: '#3F51B5' },
  { value: 'Other', label: 'Other', icon: '📋', color: '#795548' }
];

function ApplyExpense({ open, onClose, onExpenseApplied }) {
  const { user } = useAuth();
  const [expenseEntries, setExpenseEntries] = useState([
    { 
      empId: user?.emp_id || '', 
      expenseDate: '', 
      expenseType: '', 
      expenseAmount: '', 
      image: null, 
      imagePreview: null,
      Status: "Pending" 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (index, field, value) => {
    const newEntries = [...expenseEntries];
    newEntries[index][field] = value;
    setExpenseEntries(newEntries);
    
    // Clear error for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const handleAddEntry = () => {
    setExpenseEntries([
      ...expenseEntries, 
      { 
        empId: user?.emp_id || '', 
        expenseDate: '', 
        expenseType: '', 
        expenseAmount: '', 
        image: null, 
        imagePreview: null,
        Status: "Pending" 
      }
    ]);
  };

  const handleRemoveEntry = (index) => {
    const newEntries = expenseEntries.filter((_, i) => i !== index);
    setExpenseEntries(newEntries);
  };

  const onDrop = useCallback((acceptedFiles, index) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newEntries = [...expenseEntries];
        newEntries[index].image = reader.result;
        newEntries[index].imagePreview = reader.result;
        setExpenseEntries(newEntries);
      };
      reader.readAsDataURL(file);
    }
  }, [expenseEntries]);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    expenseEntries.forEach((entry, index) => {
      if (!entry.expenseDate) {
        newErrors[`${index}-expenseDate`] = 'Date is required';
        isValid = false;
      }
      if (!entry.expenseType) {
        newErrors[`${index}-expenseType`] = 'Category is required';
        isValid = false;
      }
      if (!entry.expenseAmount || parseFloat(entry.expenseAmount) <= 0) {
        newErrors[`${index}-expenseAmount`] = 'Valid amount is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors before submitting',
        severity: 'error'
      });
      return;
    }

    if (!user || !user.emp_id) {
      setSnackbar({
        open: true,
        message: 'User is not authenticated',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { expenses: expenseEntries };
      const response = await axios.post(
        `${BASE_URL}/expense/apply_expense.php`, 
        payload
      );
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Expenses submitted successfully!',
          severity: 'success'
        });
        onExpenseApplied();
        setTimeout(() => onClose(), 1500);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to submit expenses',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error submitting expenses. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    return expenseEntries.reduce((total, entry) => {
      return total + (parseFloat(entry.expenseAmount) || 0);
    }, 0);
  };

  const getCategoryIcon = (category) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat ? cat.icon : '📋';
  };

  const getCategoryColor = (category) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat ? cat.color : '#795548';
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          textAlign: 'center',
          py: 3
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Receipt sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              Submit Expenses
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              Add your business expenses with receipts
            </Typography>
          </motion.div>
        </DialogTitle>

        <DialogContent sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          p: 3
        }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="h6">Total Entries</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {expenseEntries.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{getTotalAmount().toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          <AnimatePresence>
            {expenseEntries.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  elevation={4}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip
                        icon={<Receipt />}
                        label={`Expense ${index + 1}`}
                        sx={{ color: "#8d0638ff" }}
                        variant="outlined"
                      />
                      {expenseEntries.length > 1 && (
                        <Tooltip title="Remove Entry">
                          <IconButton
                            onClick={() => handleRemoveEntry(index)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Expense Date"
                          type="date"
                          value={entry.expenseDate}
                          onChange={(e) => handleChange(index, 'expenseDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          fullWidth
                          error={!!errors[`${index}-expenseDate`]}
                          helperText={errors[`${index}-expenseDate`]}
                          InputProps={{
                            startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors[`${index}-expenseType`]}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={entry.expenseType}
                            onChange={(e) => handleChange(index, 'expenseType', e.target.value)}
                            label="Category"
                            startAdornment={<Category sx={{ mr: 1, color: 'action.active' }} />}
                          >
                            {expenseCategories.map((category) => (
                              <MenuItem key={category.value} value={category.value}>
                                <Box display="flex" alignItems="center">
                                  <span style={{ marginRight: 8, fontSize: '1.2em' }}>
                                    {category.icon}
                                  </span>
                                  {category.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                          {errors[`${index}-expenseType`] && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                              {errors[`${index}-expenseType`]}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Amount"
                          type="number"
                          value={entry.expenseAmount}
                          onChange={(e) => handleChange(index, 'expenseAmount', e.target.value)}
                          variant="outlined"
                          fullWidth
                          error={!!errors[`${index}-expenseAmount`]}
                          helperText={errors[`${index}-expenseAmount`]}
                          InputProps={{
                            startAdornment: <AttachMoney sx={{ color: 'action.active' }} />
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <ReceiptUpload
                          entry={entry}
                          index={index}
                          onDrop={(files) => onDrop(files, index)}
                        />
                      </Grid>
                    </Grid>

                    {entry.imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Receipt Preview:
                          </Typography>
                          <img
                            src={entry.imagePreview || "/placeholder.svg"}
                            alt="Receipt preview"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '150px',
                              borderRadius: '8px',
                              border: '2px solid #e0e0e0'
                            }}
                          />
                        </Box>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Box display="flex" justifyContent="center" mt={2}>
              <Tooltip title="Add Another Expense">
                <Button
                  onClick={handleAddEntry}
                  variant="outlined"
                  startIcon={<AddCircleOutline />}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#764ba2',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)'
                    }
                  }}
                >
                  Add Another Expense
                </Button>
              </Tooltip>
            </Box>
          </motion.div>
        </DialogContent>

        <DialogActions sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          p: 3,
          gap: 2
        }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
              }
            }}
          >
            {loading ? 'Submitting...' : `Submit ${expenseEntries.length} Expense${expenseEntries.length > 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}

// Receipt Upload Component
function ReceiptUpload({ entry, index, onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        }
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
      <Typography variant="body2" color="textSecondary">
        {isDragActive ? 'Drop receipt here' : 'Upload Receipt'}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        Drag & drop or click to select
      </Typography>
    </Box>
  );
}

export default ApplyExpense;
