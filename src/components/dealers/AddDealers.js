"use client";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../api/endpoints";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    CircularProgress,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Alert,
    IconButton,
} from '@mui/material';
import { LocationOn, CloudUpload, Delete, Close } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useGeolocated } from 'react-geolocated';

const BRAND_COLOR = '#8d0638ff';

function AddDealers({ open, onClose, onDealerAdded }) {
    const { user } = useAuth();
    const { coords } = useGeolocated({
        positionOptions: { enableHighAccuracy: true },
        userDecisionTimeout: 5000,
    });

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [latLong, setLatLong] = useState('');
    const [loadingFields, setLoadingFields] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Fetch dynamic checkpoints whenever the dialog opens
    useEffect(() => {
        if (open) {
            fetchFields();
            setErrorMsg('');
            setSuccessMsg('');
            setFormErrors({});
        }
    }, [open]);

    // Update GPS coordinates
    useEffect(() => {
        if (coords) {
            setLatLong(`${coords.latitude},${coords.longitude}`);
        } else if (navigator.geolocation && !latLong) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLatLong(`${pos.coords.latitude},${pos.coords.longitude}`),
                (err) => console.log('Geolocation note:', err.message)
            );
        }
    }, [coords, latLong]);

    const fetchFields = async () => {
        setLoadingFields(true);
        try {
            const res = await axios.get(`${BASE_URL}/dealer/get_dealer_fields.php`);
            if (res.data && res.data.success) {
                const fetchedFields = res.data.data || [];
                setFields(fetchedFields);

                // Initialize form values
                const initial = {};
                fetchedFields.forEach(f => {
                    initial[f.Id] = f.Value || '';
                });
                setFormData(initial);
            } else {
                setErrorMsg(res.data.message || 'Failed to load form fields.');
            }
        } catch (err) {
            console.error('Error fetching dealer fields:', err);
            setErrorMsg('Unable to connect to server to fetch form fields.');
        } finally {
            setLoadingFields(false);
        }
    };

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
        if (formErrors[fieldId]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[fieldId];
                return updated;
            });
        }
    };

    const handleImageUpload = (fieldId, e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            handleInputChange(fieldId, reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const errors = {};
        for (const field of fields) {
            if (field.Mandatory) {
                const val = formData[field.Id];
                if (val === undefined || val === null || String(val).trim() === '') {
                    errors[field.Id] = `${field.Description} is required.`;
                }
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        setErrorMsg('');
        setSuccessMsg('');

        if (!validateForm()) {
            setErrorMsg('Please fill in all mandatory fields.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                checkpoints: formData,
                latLong: latLong || '',
                addedByEmpId: user ? user.emp_id : ''
            };

            const response = await axios.post(`${BASE_URL}/dealer/add_dealers.php`, payload);

            if (response.data && response.data.success) {
                setSuccessMsg('Dealer registered successfully!');
                setTimeout(() => {
                    if (onDealerAdded) onDealerAdded();
                    onClose();
                }, 800);
            } else {
                setErrorMsg(response.data.message || 'Failed to add dealer.');
            }
        } catch (err) {
            console.error('Error adding dealer:', err);
            setErrorMsg(err.response?.data?.message || err.message || 'Error saving dealer details.');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render individual dynamic input based on TypeId
    const renderFieldInput = (field) => {
        const isRequired = !!field.Mandatory;
        const hasError = !!formErrors[field.Id];
        const helperText = formErrors[field.Id] || '';
        const value = formData[field.Id] !== undefined ? formData[field.Id] : '';
        const descLower = (field.Description || '').toLowerCase();

        // 1. Text field
        if (field.TypeId === 1) {
            const isMultiline = descLower.includes('address') || descLower.includes('remark');
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    label={field.Description}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    multiline={isMultiline}
                    rows={isMultiline ? 2 : 1}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 2. Number field
        if (field.TypeId === 2) {
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    type="number"
                    label={field.Description}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 3. Date field
        if (field.TypeId === 3) {
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    type="date"
                    label={field.Description}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 4. Image / File field
        if (field.TypeId === 4) {
            return (
                <Box key={field.Id} sx={{ border: '1px dashed #ccc', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: hasError ? 'error.main' : 'text.secondary' }}>
                        {field.Description} {isRequired && '*'}
                    </Typography>
                    {value ? (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <img
                                src={value}
                                alt={field.Description}
                                style={{ maxHeight: 90, maxWidth: '100%', borderRadius: 4, objectFit: 'contain' }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleInputChange(field.Id, '')}
                                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' } }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            startIcon={<CloudUpload />}
                            sx={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}
                        >
                            Upload Image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleImageUpload(field.Id, e)}
                            />
                        </Button>
                    )}
                    {hasError && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {helperText}
                        </Typography>
                    )}
                </Box>
            );
        }

        // 5. Dropdown field
        if (field.TypeId === 5) {
            const rawOptions = field.Options ? field.Options.split(',') : [];
            const options = rawOptions.map(opt => opt.trim()).filter(Boolean);

            return (
                <FormControl key={field.Id} fullWidth size="small" required={isRequired} error={hasError}>
                    <InputLabel id={`label - ${ field.Id } `}>{field.Description}</InputLabel>
                    <Select
                        labelId={`label - ${ field.Id } `}
                        label={field.Description}
                        value={value}
                        onChange={(e) => handleInputChange(field.Id, e.target.value)}
                    >
                        {options.map((opt, idx) => (
                            <MenuItem key={idx} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </Select>
                    {hasError && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                            {helperText}
                        </Typography>
                    )}
                </FormControl>
            );
        }

        // Fallback for any other type
        return (
            <TextField
                key={field.Id}
                fullWidth
                size="small"
                label={field.Description}
                required={isRequired}
                error={hasError}
                helperText={helperText}
                value={value}
                onChange={(e) => handleInputChange(field.Id, e.target.value)}
            />
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    backgroundColor: BRAND_COLOR,
                    color: "white",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 3,
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Add New Dealer
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                        Form dynamically loaded from database checkpoints
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, pt: 3 }}>
                {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMsg('')}>
                        {errorMsg}
                    </Alert>
                )}

                {successMsg && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                        {successMsg}
                    </Alert>
                )}

                {loadingFields ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                        <CircularProgress size={36} sx={{ color: BRAND_COLOR, mr: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            Loading dynamic fields from database...
                        </Typography>
                    </Box>
                ) : fields.length === 0 ? (
                    <Alert severity="warning">
                        No active dealer checkpoint fields found in the database. Please configure checkpoints first.
                    </Alert>
                ) : (
                    <Grid container spacing={2.5}>
                        {fields.map((field) => {
                            const descLower = (field.Description || '').toLowerCase();
                            const isWide = descLower.includes('address') || descLower.includes('remark') || field.TypeId === 4;
                            return (
                                <Grid item xs={12} sm={isWide ? 12 : 6} key={field.Id}>
                                    {renderFieldInput(field)}
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, color: latLong ? '#10b981' : 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                        {latLong ? `GPS: ${ latLong } ` : "Acquiring GPS..."}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} color="inherit" disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitting || loadingFields || fields.length === 0}
                        sx={{
                            backgroundColor: BRAND_COLOR,
                            color: "white",
                            px: 3,
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: '#70042c',
                            }
                        }}
                    >
                        {submitting ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Saving...
                            </>
                        ) : (
                            'Save Dealer'
                        )}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default AddDealers;
