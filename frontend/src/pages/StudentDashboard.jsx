import React, {useState, useEffect, useRef} from "react";
import '../styles/TempStyles.css';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Stack,
  Avatar
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import CertificateOfRegistration from "../components/CertificateOfRegistration";

const StudentDashboard = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [personData, setPerson] = useState({
    student_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    profile_image: '',
  });
  const [studentDetails, setStudent] = useState({
    program_description: '',
    section_description: '',
    program_code: '',
    year_level: '',
  });
  const [sy, setActiveSY] = useState({
    current_year: '',
    next_year: '',
    semester_description: ''
  });
  const [courseCount, setCourseCount] = useState({ 
    initial_course: 0, 
    passed_course: 0, 
    failed_course: 0, 
    inc_course: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole !== "student") {
        window.location.href = "/faculty_dashboard";
      } else {
        fetchPersonData(storedID);
        fetchStudentDetails(storedID);
        fetchTotalCourse(storedID);
        console.log("you are an student");
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchPersonData = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student/${id}`);
      setPerson(res.data);
    } catch (error) { 
      console.error(error)
    }
  };

  const fetchTotalCourse = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/course_count/${id}`);
      console.log("course count:", res.data);
      setCourseCount(res.data || { initial_course: 0 });
    } catch (error) {
      console.error(error)
    }
  };
        
  const fetchStudentDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student_details/${id}`);
      setStudent(res.data);
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/active_school_year`)
      .then((res) => setActiveSY(res.data[0] || {}))
      .catch((err) => console.error(err));
  }, []);

  // Course status value
  const passed = courseCount?.passed_course || 0;
  const failed = courseCount?.failed_course || 0;
  const incomplete = courseCount?.inc_course || 0;
  const total = courseCount?.initial_course || 0;

  // percentages (normalize values to 0–100)
  const passedPercent = total > 0 ? (passed / total) * 100 : 0;
  const failedPercent = total > 0 ? (failed / total) * 100 : 0;
  const incompletePercent = total > 0 ? (incomplete / total) * 100 : 0;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const divToPrintRef = useRef();

  const printDiv = () => {
    const divToPrint = divToPrintRef.current;
    if (divToPrint) {
      const newWin = window.open('', 'Print-Window');
      newWin.document.open();
      newWin.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
            
              font-family: Arial, sans-serif;
              overflow: hidden;
            }

            .print-container {
              width: 110%;
              height: 100%;

              box-sizing: border-box;
   
              transform: scale(0.90);
              transform-origin: top left;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            button {
              display: none;
            }

            .student-table {
              margin-top: 5px !important;
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 100);">
          <div class="print-container">
            ${divToPrint.innerHTML}
          </div>
        </body>
      </html>
    `);
      newWin.document.close();
    } else {
      console.error("divToPrintRef is not set.");
    }
  };

  return (
    <Box sx={{ p: 4, marginLeft: "-2rem", paddingRight: 8, height: "calc(100vh - 150px)", overflowY: "auto" }}>
      {/* Header */}
      <div style={{display: "none"}}>
        <CertificateOfRegistration ref={divToPrintRef} student_number={String(personData.student_number || '')}/>
      </div>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Student Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{marginBottom: "1rem"}} gutterBottom>
        Date: {formattedDate}
      </Typography>

      <Grid container spacing={3}>
        {/* Student Information */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                {!personData?.profile_image ? (
                  <PersonIcon sx={{ color: "maroon" }} fontSize="large" />
                ) : (
                  <Avatar
                    src={`http://localhost:5000/uploads/${personData.profile_image}`}
                    sx={{ width: 50, height: 50, mx: "auto", mb: 2 }}
                  />
                )}
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {personData.last_name}, {personData.first_name} {personData.middle_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Student No. : {personData.student_number}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Program
                  </Typography>
                  <Typography fontWeight={500}>
                    {studentDetails.program_description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    School Year
                  </Typography>
                  <Typography fontWeight={500}>{sy.current_year}-{sy.next_year}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography fontWeight={500}>Regular</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Year Level
                  </Typography>
                  <Typography fontWeight={500}>{studentDetails.year_level}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Semester
                  </Typography>
                  <Typography fontWeight={500}>{sy.semester_description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Section
                  </Typography>
                  <Typography fontWeight={500}>{studentDetails.program_code}-{studentDetails.section_description}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* PDF Download */}
        <Grid item xs={12} md={6} sx={{height: '13.1rem'}}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 150,
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <SchoolIcon sx={{color: "maroon"}} fontSize="large" />
              <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                Certificate of Registration
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{backgroundColor: "maroon"}}
                onClick={printDiv}
              >
                Download (Student's Copy)
              </Button>
            </CardContent>
          </Card>

          {/* Fees */}
          <Card sx={{ borderRadius: 3, marginTop: "1.5rem", height: "100%", boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fees
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </CardContent>
          </Card>

        </Grid>

        {/* Donut Chart (pure SVG) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ maxHeight: "368px",borderRadius: 3, boxShadow: 3, p: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Course Status
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <svg width="200" height="200" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />

                  {/* Passed */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="green"
                    strokeWidth="3"
                    strokeDasharray={`${passedPercent} ${100 - passedPercent}`}
                    strokeDashoffset="25"
                  />

                  {/* Failed */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="red"
                    strokeWidth="3"
                    strokeDasharray={`${failedPercent} ${100 - failedPercent}`}
                    strokeDashoffset={25 - passedPercent}
                  />

                  {/* Incomplete */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="orange"
                    strokeWidth="3"
                    strokeDasharray={`${incompletePercent} ${100 - incompletePercent}`}
                    strokeDashoffset={25 - passedPercent - failedPercent}
                  />

                  {/* Center Text */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="4"
                  >
                    {courseCount.initial_course} Courses
                  </text>
                </svg>
              </Box>

              <Stack direction="row" spacing={3} justifyContent="center">
                <Typography sx={{fontSize: "14px"}} color="success.main">Passed: {passed}</Typography>
                <Typography sx={{fontSize: "14px"}} color="error.main">Failed: {failed}</Typography>
                <Typography sx={{fontSize: "14px"}} color="warning.main">
                   Incomplete: {incomplete}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Typography sx={{fontSize: "14px"}} color="success.main">Course Completed: 11</Typography>
                <Typography sx={{fontSize: "14px"}} color="warning.main">
                   Course Currently taken: 8
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, minHeight: '22.8rem' }}>
              <CardContent>
                <Typography sx={{textAlign: 'center'}} variant="h6" gutterBottom>
                    Announcement
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;

