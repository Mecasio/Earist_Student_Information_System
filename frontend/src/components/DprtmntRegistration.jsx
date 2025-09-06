import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Container,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const DepartmentRegistration = () => {
  const [department, setDepartment] = useState({ dep_name: '', dep_code: '' });
  const [departmentList, setDepartmentList] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchDepartment();
  }, []);

  const fetchDepartment = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get_department');
      setDepartmentList(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddingDepartment = async () => {
    if (!department.dep_name || !department.dep_code) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post('http://localhost:5000/department', department);
      fetchDepartment();
      setDepartment({ dep_name: '', dep_code: '' });
      setOpenModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangesForEverything = (e) => {
    const { name, value } = e.target;
    setDepartment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", mt: 4, px: 2 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="maroon"
        textAlign="center"
        gutterBottom
      >
        Department Registration
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "maroon", "&:hover": { backgroundColor: "#800000" } }}
          onClick={() => setOpenModal(true)}
        >
          Add Department
        </Button>
      </Box>

      <Grid container spacing={2}>
        {departmentList.map((department) => (
          <Grid item xs={12} sm={6} md={3} key={department.dprtmnt_id}>
            <Card
              variant="outlined"
              sx={{
                borderColor: "maroon",
                borderWidth: "3px",
                height: "100%", // allow card to fill the grid height
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 160, // set a consistent card height
              }}
            >
              <CardContent
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {department.dprtmnt_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Code: {department.dprtmnt_code}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>


      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add New Department
          <IconButton onClick={() => setOpenModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Department Name"
              name="dep_name"
              value={department.dep_name}
              onChange={handleChangesForEverything}
              fullWidth
            />
            <TextField
              label="Department Code"
              name="dep_code"
              value={department.dep_code}
              onChange={handleChangesForEverything}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "maroon", color: "white", "&:hover": { backgroundColor: "#800000" } }}
            onClick={handleAddingDepartment}
          >
            Save
          </Button>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentRegistration;
