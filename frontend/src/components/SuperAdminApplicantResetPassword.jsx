import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    InputAdornment,
    MenuItem,
} from "@mui/material";
import { Search } from "@mui/icons-material";

const SuperAdminApplicantResetPassword = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resetMsg, setResetMsg] = useState("");
    const [searchError, setSearchError] = useState("");

    // Auto fetch user info when searchQuery changes
    useEffect(() => {
        const fetchInfo = async () => {
            if (!searchQuery) {
                setUserInfo(null);
                setSearchError("");
                return;
            }
            setLoading(true);
            setResetMsg("");
            setSearchError("");
            try {
                const res = await axios.post(
                    "http://localhost:5000/superadmin-get-applicant",
                    { email: searchQuery }
                );
                setUserInfo(res.data);
            } catch (err) {
                setSearchError(err.response?.data?.message || "No applicant found.");
                setUserInfo(null);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchInfo();
        }, 600);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    // Reset password
    const handleReset = async () => {
        if (!userInfo) return;
        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost:5000/superadmin-reset-applicant",
                { email: searchQuery }
            );
            setResetMsg(res.data.message);
        } catch (err) {
            setSearchError(
                err.response?.data?.message || "Error resetting password"
            );
        } finally {
            setLoading(false);
        }
    };


    // Status change handler
    const handleStatusChange = async (e) => {
        const newStatus = parseInt(e.target.value, 10);

        // update UI instantly
        setUserInfo((prev) => ({ ...prev, status: newStatus }));

        try {
            // send to backend
            await axios.post("http://localhost:5000/superadmin-update-status-applicant", {
                email: userInfo.email,
                status: newStatus,
            });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };


    return (
        <Box p={3}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    mb: 2,
                    px: 2,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        color: "maroon",
                        fontSize: "36px",
                    }}
                >
                    APPLICANT PASSWORD RESET
                </Typography>

                <TextField
                    size="small"
                    placeholder="Search Email Address"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ mr: 1 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: { xs: "100%", sm: "425px" }, mt: { xs: 2, sm: 0 } }}
                />
            </Box>

            {searchError && <Typography color="error">{searchError}</Typography>}
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            {/* Info Panel Always Visible */}
            <Paper sx={{ p: 3 }}>
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
                    <TextField
                        label="User ID"
                        value={userInfo ? userInfo.user_id : ""}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label="Email"
                        value={userInfo ? userInfo.email : ""}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label="Full Name"
                        value={userInfo ? userInfo.fullName : ""}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label="Birthdate"
                        type="date"
                        value={userInfo ? userInfo.birthdate : ""}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        select
                        label="Status"
                        value={userInfo ? userInfo.status ?? "" : ""} // ✅ handles null too
                        fullWidth
                        onChange={handleStatusChange}
                    >
                        <MenuItem value={1}>Active</MenuItem>
                        <MenuItem value={0}>Inactive</MenuItem>
                    </TextField>



                </Box>

                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReset}
                        disabled={!userInfo || loading}
                    >
                        {loading ? "Processing..." : "Reset Password"}
                    </Button>
                </Box>
            </Paper>

            {resetMsg && (
                <Typography sx={{ mt: 2 }} color="green">
                    {resetMsg}
                </Typography>
            )}
        </Box>
    );
};

export default SuperAdminApplicantResetPassword;
