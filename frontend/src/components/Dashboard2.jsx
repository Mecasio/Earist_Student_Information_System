import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Box, TextField, Container, Card, Typography, FormControl, FormHelperText, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from "@mui/material";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import InfoIcon from "@mui/icons-material/Info";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";


const Dashboard2 = (props) => {
  const navigate = useNavigate();
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [person, setPerson] = useState({
    solo_parent: "", father_deceased: "", father_family_name: "", father_given_name: "", father_middle_name: "",
    father_ext: "", father_nickname: "", father_education: "", father_education_level: "", father_last_school: "", father_course: "", father_year_graduated: "", father_school_address: "", father_contact: "", father_occupation: "", father_employer: "",
    father_income: "", father_email: "", mother_deceased: "", mother_family_name: "", mother_given_name: "", mother_middle_name: "", mother_ext: "", mother_nickname: "", mother_education: "", mother_education_level: "", mother_last_school: "", mother_course: "",
    mother_year_graduated: "", mother_school_address: "", mother_contact: "", mother_occupation: "", mother_employer: "", mother_income: "", mother_email: "", guardian: "", guardian_family_name: "", guardian_given_name: "",
    guardian_middle_name: "", guardian_ext: "", guardian_nickname: "", guardian_address: "", guardian_contact: "", guardian_email: "", annual_income: "",
  });

  // do not alter
  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");
    const keys = JSON.parse(localStorage.getItem("dashboardKeys") || "{}");
    navigate(`/dashboard/${keys.step2}`);


    const overrideId = props?.adminOverridePersonId; // new

    if (overrideId) {
      // Admin editing other person
      setUserRole("superadmin");
      setUserID(overrideId);
      fetchPersonData(overrideId);
      return;
    }

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole === "applicant") {
        fetchPersonData(storedID);
      } else {
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);


const keys = JSON.parse(localStorage.getItem("dashboardKeys") || "{}");

const steps = [
  { label: "Personal Information", icon: <PersonIcon />, path: `/dashboard/${keys.step1}` },
  { label: "Family Background", icon: <FamilyRestroomIcon />, path: `/dashboard/${keys.step2}` },
  { label: "Educational Attainment", icon: <SchoolIcon />, path: `/dashboard/${keys.step3}` },
  { label: "Health Medical Records", icon: <HealthAndSafetyIcon />, path: `/dashboard/${keys.step4}` },
  { label: "Other Information", icon: <InfoIcon />, path: `/dashboard/${keys.step5}` },
];


  const [activeStep, setActiveStep] = useState(1);
  const [clickedSteps, setClickedSteps] = useState(Array(steps.length).fill(false));

  const handleStepClick = (index) => {
    if (isFormValid()) {
      setActiveStep(index);
      const newClickedSteps = [...clickedSteps];
      newClickedSteps[index] = true;
      setClickedSteps(newClickedSteps);
      navigate(steps[index].path); // ✅ actually move to step
    } else {
      alert("Please fill all required fields before proceeding.");
    }
  };
  const fetchPersonData = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/person/${id}`);

      // Sanitize null values and set state
      const safePerson = Object.fromEntries(
        Object.entries(res.data).map(([key, val]) => [key, val ?? ""])
      );

      setPerson(safePerson);

      // ✅ Set dropdown based on existing deceased values
      if (res.data.solo_parent === 1) {
        if (res.data.father_deceased === 1) {
          setSoloParentChoice("Mother");
        } else if (res.data.mother_deceased === 1) {
          setSoloParentChoice("Father");
        }
      }
    } catch (error) {
      console.error("Failed to fetch person data:", error);
    }
  };


  // Do not alter
  const handleUpdate = async (updatedPerson) => {
    try {
      await axios.put(`http://localhost:5000/api/person/${userID}`, updatedPerson);
      console.log("Auto-saved");
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  // Real-time save on every character typed
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    const updatedPerson = {
      ...person,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    };

    // If updating either mother_income or father_income, calculate total and set annual_income
    if (name === "mother_income" || name === "father_income") {
      const motherIncome = parseFloat(name === "mother_income" ? value : updatedPerson.mother_income) || 0;
      const fatherIncome = parseFloat(name === "father_income" ? value : updatedPerson.father_income) || 0;
      const totalIncome = motherIncome + fatherIncome;

      let annualIncomeBracket = "";
      if (totalIncome <= 80000) {
        annualIncomeBracket = "80,000 and below";
      } else if (totalIncome <= 135000) {
        annualIncomeBracket = "80,000 to 135,000";
      } else if (totalIncome <= 250000) {
        annualIncomeBracket = "135,000 to 250,000";
      } else if (totalIncome <= 500000) {
        annualIncomeBracket = "250,000 to 500,000";
      } else if (totalIncome <= 1000000) {
        annualIncomeBracket = "500,000 to 1,000,000";
      } else {
        annualIncomeBracket = "1,000,000 and above";
      }

      updatedPerson.annual_income = annualIncomeBracket;
    }

    setPerson(updatedPerson);
    handleUpdate(updatedPerson); // No delay, real-time save
  };


  const handleBlur = async () => {
    try {
      await axios.put(`http://localhost:5000/api/person/${userID}`, person);
      console.log("Auto-saved");
    } catch (err) {
      console.error("Auto-save failed", err);
    }
  };

  const [isFatherDeceased, setIsFatherDeceased] = useState(false);
  const [isMotherDeceased, setIsMotherDeceased] = useState(false);

  useEffect(() => {
    setIsFatherDeceased(person.father_deceased === 1);
  }, [person.father_deceased]);

  useEffect(() => {
    setIsMotherDeceased(person.mother_deceased === 1);
  }, [person.mother_deceased]);



  // No need for local states like isFatherDeceased, etc. if you're using person state directly
  useEffect(() => {
    if (person.parent_type === "Mother") {
      setPerson((prev) => ({
        ...prev,
        father_deceased: 1,
        mother_deceased: 0,
      }));
    } else if (person.parent_type === "Father") {
      setPerson((prev) => ({
        ...prev,
        mother_deceased: 1,
        father_deceased: 0,
      }));
    }
  }, [person.parent_type]);



  const [errors, setErrors] = useState({});

  const isFormValid = () => {
    const requiredFields = [];

    // If father is NOT deceased, require father fields:
    if (person.father_deceased !== 1) {
      requiredFields.push(
        "father_family_name", "father_given_name", "father_middle_name", "father_nickname",
        "father_contact", "father_occupation", "father_employer", "father_income", "father_email"
      );

      // but only require education details if father_education !== 1
      if (person.father_education !== 1) {
        requiredFields.push(
          "father_education_level", "father_last_school", "father_course", "father_year_graduated", "father_school_address"
        );
      }
    }

    // If mother is NOT deceased, require mother fields:
    if (person.mother_deceased !== 1) {
      requiredFields.push(
        "mother_family_name", "mother_given_name", "mother_middle_name", "mother_nickname",
        "mother_contact", "mother_occupation", "mother_employer", "mother_income", "mother_email"
      );

      // only require education details if mother_education !== 1
      if (person.mother_education !== 1) {
        requiredFields.push(
          "mother_education_level", "mother_last_school", "mother_course", "mother_year_graduated", "mother_school_address"
        );
      }
    }

    // Guardian fields always required:
    requiredFields.push(
      "guardian", "guardian_family_name", "guardian_given_name", "guardian_middle_name",
      "guardian_nickname", "guardian_address", "guardian_contact"
    );

    // Annual income always required:
    requiredFields.push("annual_income");

    let newErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      const value = person[field];
      const stringValue = value?.toString().trim();

      if (!stringValue) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };



  const [soloParentChoice, setSoloParentChoice] = useState("");


  const links = [
    { to: "/ecat_application_form", label: "ECAT Application Form" },
    { to: "/admission_form_process", label: "Admission Form Process" },
    { to: "/personal_data_form", label: "Personal Data Form" },
    { to: "/office_of_the_registrar", label: "Application For EARIST College Admission" },
    { to: "/admission_services", label: "Application/Student Satisfactory Survey" },
    { to: "/admission_services", label: "Examination Permit" },
  ];


  // 🔒 Disable right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // 🔒 Block DevTools shortcuts silently
  document.addEventListener('keydown', (e) => {
    const isBlockedKey =
      e.key === 'F12' ||
      e.key === 'F11' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'U');

    if (isBlockedKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  });


  // dot not alter
  return (
    <Box sx={{ height: "calc(100vh - 140px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent" }}>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: "10px",
            backgroundColor: "#fffaf5",
            border: "1px solid #6D2323",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
            whiteSpace: "nowrap", // Prevent text wrapping
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#6D2323",
              borderRadius: "8px",
              width: 40,
              height: 40,
              flexShrink: 0,
            }}
          >
            <ErrorIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>

          {/* Text in one row */}
          <Typography
            sx={{
              fontSize: "15px",
              fontFamily: "Arial",
              color: "#3e3e3e",
            }}
          >
            <strong style={{ color: "maroon" }}>Notice:</strong> &nbsp;
            <strong>1.</strong> Kindly type <strong>'NA'</strong> in boxes where there are no possible answers to the information being requested. &nbsp; | &nbsp;
            <strong>2.</strong> To use the letter <strong>'Ñ'</strong>, press <kbd>ALT</kbd> + <kbd>165</kbd>; for <strong>'ñ'</strong>, press <kbd>ALT</kbd> + <kbd>164</kbd>. &nbsp; | &nbsp;
            <strong>3.</strong> This is the list of all printable files.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mt: 2,
          pb: 1,

          justifyContent: "center", // Centers all cards horizontally
        }}
      >
        {links.map((lnk, i) => (
          <motion.div
            key={i}
            style={{ flex: "0 0 calc(30% - 16px)" }} // fixed width for consistent centering
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card
              sx={{
                minHeight: 60,
                borderRadius: 2,

                border: "2px solid #6D2323",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center", // Centers content inside each card
                textAlign: "center",
                p: 1.5,
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "0.3s ease-in-out",
                },
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 35, color: "#6D2323", mr: 1.5 }} />
              <Link
                to={lnk.to}
                style={{
                  textDecoration: "none",
                  color: "#6D2323",
                  fontFamily: "Arial",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                }}
              >
                {lnk.label}
              </Link>
            </Card>
          </motion.div>
        ))}
      </Box>

      <Container>


        <Container>
          <h1 style={{ fontSize: "50px", fontWeight: "bold", textAlign: "center", color: "maroon", marginTop: "25px" }}>APPLICANT FORM</h1>
          <div style={{ textAlign: "center" }}>Complete the applicant form to secure your place for the upcoming academic year at EARIST.</div>
        </Container>
        <br />

        <Box sx={{ display: "flex", justifyContent: "center", width: "100%", px: 4 }}>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => handleStepClick(index)}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: activeStep === index ? "#6D2323" : "#E8C999",
                    color: activeStep === index ? "#fff" : "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  sx={{
                    mt: 1,
                    color: activeStep === index ? "#6D2323" : "#000",
                    fontWeight: activeStep === index ? "bold" : "normal",
                    fontSize: 14,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    height: "2px",
                    backgroundColor: "#6D2323",
                    flex: 1,
                    alignSelf: "center",
                    mx: 2,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>

        <br />

        <form>
          <Container
            maxWidth="100%"
            sx={{
              backgroundColor: "#6D2323",
              border: "2px solid black",
              maxHeight: "500px",
              overflowY: "auto",
              color: "white",
              borderRadius: 2,
              boxShadow: 3,
              padding: "4px",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography style={{ fontSize: "20px", padding: "10px", fontFamily: "Arial Black" }}>Step 2: Family Background</Typography>
            </Box>
          </Container>


          <Container maxWidth="100%" sx={{ backgroundColor: "#f1f1f1", border: "2px solid black", padding: 4, borderRadius: 2, boxShadow: 3 }}>
            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Family Background:</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />




            <Box display="flex" gap={3} width="100%" alignItems="center">
              {/* Solo Parent Checkbox */}
              <Box marginTop="10px" display="flex" alignItems="center" gap={1}>
                <Checkbox
                  name="solo_parent"
                  checked={person.solo_parent === 1}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    const newPerson = {
                      ...person,
                      solo_parent: checked ? 1 : 0,
                      father_deceased: checked && soloParentChoice === "Mother" ? 1 : checked ? 0 : null,
                      mother_deceased: checked && soloParentChoice === "Father" ? 1 : checked ? 0 : null,
                    };

                    setPerson(newPerson);
                    handleUpdate(newPerson); // Save immediately
                  }}
                  onBlur={handleBlur}
                  sx={{ width: 25, height: 25 }}
                />
                <label style={{ fontFamily: "Arial" }}>Solo Parent</label>
              </Box>

              {/* Parent Type Dropdown */}
              {person.solo_parent === 1 && (
                <FormControl size="small" style={{ width: "200px" }}>
                  <InputLabel id="parent-select-label">- Parent- </InputLabel>
                  <Select
                    labelId="parent-select-label"
                    value={soloParentChoice}
                    onChange={(e) => {
                      const choice = e.target.value;
                      setSoloParentChoice(choice);

                      const updatedPerson = {
                        ...person,
                        father_deceased: choice === "Mother" ? 1 : 0,
                        mother_deceased: choice === "Father" ? 1 : 0,
                      };

                      setPerson(updatedPerson);
                      handleUpdate(updatedPerson);
                    }}
                  >
                    <MenuItem value="Father">Father</MenuItem>
                    <MenuItem value="Mother">Mother</MenuItem>
                  </Select>
                </FormControl>
              )}


            </Box>

            <br />



            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Father's Details</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box sx={{ mb: 2 }}>
              {/* Father Deceased Checkbox */}
              {/* Father Deceased Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    name="father_deceased"
                    value={person.father_deceased} // 👈 Added value
                    checked={person.father_deceased === 1}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      // Call your form handler
                      handleChange(e);

                      // Update local state
                      setPerson((prev) => ({
                        ...prev,
                        father_deceased: checked ? 1 : 0,
                      }));
                    }}
                    onBlur={handleBlur}
                  />
                }
                label="Father Deceased"
              />
              <br />

              {/* Show Father's Info ONLY if not deceased */}
              {!isFatherDeceased && (
                <>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Family Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        placeholder="Enter Father Last Name"
                        name="father_family_name"
                        value={person.father_family_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_family_name} helperText={errors.father_family_name ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Given Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="father_given_name"
                        placeholder="Enter Father First Name"
                        value={person.father_given_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_given_name} helperText={errors.father_given_name ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Middle Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="father_middle_name"
                        placeholder="Enter Father Middle Name"
                        value={person.father_middle_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_middle_name} helperText={errors.father_middle_name ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Extension</Typography>
                      <FormControl fullWidth size="small" required error={!!errors.father_ext}>
                        <InputLabel id="father-ext-label">Extension</InputLabel>
                        <Select
                          labelId="father-ext-label"
                          id="father_ext"
                          name="father_ext"
                          value={person.father_ext || ""}
                          label="Extension"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <MenuItem value=""><em>Select Extension</em></MenuItem>
                          <MenuItem value="Jr.">Jr.</MenuItem>
                          <MenuItem value="Sr.">Sr.</MenuItem>
                          <MenuItem value="I">I</MenuItem>
                          <MenuItem value="II">II</MenuItem>
                          <MenuItem value="III">III</MenuItem>
                          <MenuItem value="IV">IV</MenuItem>
                          <MenuItem value="V">V</MenuItem>
                        </Select>
                        {errors.father_ext && (
                          <FormHelperText>This field is required.</FormHelperText>
                        )}
                      </FormControl>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Nickname</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="father_nickname"
                        placeholder="Enter Father Nickname"
                        value={person.father_nickname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_nickname} helperText={errors.father_nickname ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Father's Educational Background
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />
                  <Box display="flex" gap={3} alignItems="center">
                    {/* Father's Education Not Applicable Checkbox */}
                    <Checkbox
                      name="father_education"
                      checked={person.father_education === 1}
                      onChange={(e) => {
                        const isChecked = e.target.checked;

                        const updatedPerson = {
                          ...person,
                          father_education: isChecked ? 1 : 0,
                          ...(isChecked
                            ? {
                              father_education_level: "",
                              father_last_school: "",
                              father_course: "",
                              father_year_graduated: "",
                              father_school_address: "",
                            }
                            : {}),
                        };

                        setPerson(updatedPerson);
                        handleUpdate(updatedPerson); // Immediate update (optional)
                      }}
                      onBlur={handleBlur}
                      sx={{ width: 25, height: 25 }}
                    />
                    <label style={{ fontFamily: "Arial" }}>Father's education not applicable</label>
                  </Box>




                  {/* Father Educational Details (conditionally rendered) */}
                  {person.father_education !== 1 && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Education Level</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter Father Education Level"
                          name="father_education_level"
                          value={person.father_education_level}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_education_level}
                          helperText={errors.father_education_level ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Last School</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="father_last_school"
                          placeholder="Enter Father Last School"
                          value={person.father_last_school}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_last_school}
                          helperText={errors.father_last_school ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Course</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="father_course"
                          placeholder="Enter Father Course"
                          value={person.father_course}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_course}
                          helperText={errors.father_course ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Year Graduated</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="father_year_graduated"
                          placeholder="Enter Father Year Graduated"
                          value={person.father_year_graduated}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_year_graduated}
                          helperText={errors.father_year_graduated ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father School Address</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="father_school_address"
                          placeholder="Enter Father School Address"
                          value={person.father_school_address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_school_address}
                          helperText={errors.father_school_address ? "This field is required." : ""}
                        />
                      </Box>
                    </Box>
                  )}


                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Father's Contact Information
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Contact</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="father_contact"
                        placeholder="Enter Father Contact"
                        value={person.father_contact}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_contact} helperText={errors.father_contact ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Occupation</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="father_occupation"
                        value={person.father_occupation}
                        placeholder="Enter Father Occupation"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_occupation} helperText={errors.father_occupation ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Employer</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="father_employer"
                        placeholder="Enter Father Employer"
                        value={person.father_employer}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_employer} helperText={errors.father_employer ? "This field is required." : ""}
                      />
                    </Box>
                    {/* Father Income */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Income</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="father_income"
                        placeholder="Enter Father Income"
                        value={person.father_income}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_income}
                        helperText={errors.father_income ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" mb={1}>Father Email Address</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      name="father_email"
                      placeholder="Enter your Father Email Address (e.g., username@gmail.com)"
                      value={person.father_email}
                      onChange={handleChange}
                      onBlur={handleBlur}

                    />
                  </Box>
                </>
              )}
            </Box>


            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Mother's Details</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />
            <Box sx={{ mb: 2 }}>
              {/* Mother Deceased Checkbox */}

              <FormControlLabel
                control={
                  <Checkbox
                    name="mother_deceased"
                    value={person.mother_deceased} // 👈 Added value
                    checked={person.mother_deceased === 1}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      // Call your form handler
                      handleChange(e);

                      // Update local state
                      setPerson((prev) => ({
                        ...prev,
                        mother_deceased: checked ? 1 : 0,
                      }));
                    }}
                    onBlur={handleBlur}
                  />
                }
                label="Mother Deceased"
              />
              <br />

              {/* Show Mother's Info ONLY if not deceased */}
              {!isMotherDeceased && (
                <>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Family Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_family_name"
                        placeholder="Enter your Mother Last Name"
                        value={person.mother_family_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_family_name}
                        helperText={errors.mother_family_name ? "This field is required." : ""}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother First Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_given_name"
                        placeholder="Enter your Mother First Name"
                        value={person.mother_given_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_given_name}
                        helperText={errors.mother_given_name ? "This field is required." : ""}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Middle Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_middle_name"
                        placeholder="Enter your Mother Middle Name"
                        value={person.mother_middle_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_middle_name}
                        helperText={errors.mother_middle_name ? "This field is required." : ""}
                      />
                    </Box>

                    {/* Mother Extension */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Extension</Typography>
                      <FormControl fullWidth size="small" >
                        <InputLabel id="mother-ext-label">Extension</InputLabel>
                        <Select
                          labelId="mother-ext-label"
                          id="mother_ext"
                          name="mother_ext"
                          value={person.mother_ext || ""}
                          label="Extension"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <MenuItem value=""><em>Select Extension</em></MenuItem>
                          <MenuItem value="Jr.">Jr.</MenuItem>
                          <MenuItem value="Sr.">Sr.</MenuItem>
                          <MenuItem value="I">I</MenuItem>
                          <MenuItem value="II">II</MenuItem>
                          <MenuItem value="III">III</MenuItem>
                          <MenuItem value="IV">IV</MenuItem>
                          <MenuItem value="V">V</MenuItem>
                        </Select>

                      </FormControl>
                    </Box>


                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Nickname</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_nickname"
                        placeholder="Enter your Mother Nickname"
                        value={person.mother_nickname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_nickname}
                        helperText={errors.mother_nickname ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>


                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Mother's Educational Background
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />

                  <Box display="flex" gap={3} alignItems="center">
                    {/* Mother's Education Not Applicable Checkbox */}
                    <Checkbox
                      name="mother_education"
                      checked={person.mother_education === 1}
                      onChange={(e) => {
                        const isChecked = e.target.checked;

                        const updatedPerson = {
                          ...person,
                          mother_education: isChecked ? 1 : 0,
                          ...(isChecked
                            ? {
                              mother_education_level: "",
                              mother_last_school: "",
                              mother_course: "",
                              mother_year_graduated: "",
                              mother_school_address: "",
                            }
                            : {}),
                        };

                        setPerson(updatedPerson);
                        handleUpdate(updatedPerson); // Optional: Immediate save
                      }}
                      onBlur={handleBlur}
                      sx={{ width: 25, height: 25 }}
                    />
                    <label style={{ fontFamily: "Arial" }}>Mother's education not applicable</label>
                  </Box>

                  {/* Mother Educational Details (conditionally rendered) */}
                  {person.mother_education !== 1 && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Education Level</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="mother_education_level"
                          placeholder="Enter your Mother Education Level"
                          value={person.mother_education_level}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_education_level}
                          helperText={errors.mother_education_level ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Last School</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="mother_last_school"
                          placeholder="Enter your Mother Last School Attended"
                          value={person.mother_last_school}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_last_school}
                          helperText={errors.mother_last_school ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Course</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="mother_course"
                          placeholder="Enter your Mother Course"
                          value={person.mother_course}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_course}
                          helperText={errors.mother_course ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Year Graduated</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="mother_year_graduated"
                          placeholder="Enter your Mother Year Graduated"
                          value={person.mother_year_graduated}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_year_graduated}
                          helperText={errors.mother_year_graduated ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother School Address</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="mother_school_address"
                          placeholder="Enter your Mother School Address"
                          value={person.mother_school_address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_school_address}
                          helperText={errors.mother_school_address ? "This field is required." : ""}
                        />
                      </Box>
                    </Box>
                  )}

                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Mother's Contact Information
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Contact</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_contact"
                        placeholder="Enter your Mother Contact"
                        value={person.mother_contact}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_contact} helperText={errors.mother_contact ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Occupation</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_occupation"
                        placeholder="Enter your Mother Occupation"
                        value={person.mother_occupation}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_occupation} helperText={errors.mother_occupation ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Employer</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_employer"
                        placeholder="Enter your Mother Employer"
                        value={person.mother_employer}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_employer} helperText={errors.mother_employer ? "This field is required." : ""}
                      />
                    </Box>

                    {/* Mother Income */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Income</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="mother_income"
                        placeholder="Enter your Mother Income"
                        value={person.mother_income}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_income}
                        helperText={errors.mother_income ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" mb={1}>Mother Email</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      required
                      name="mother_email"
                      placeholder="Enter your Mother Email Address (e.g., username@gmail.com)"
                      value={person.mother_email}
                      onChange={handleChange}
                      onBlur={handleBlur}

                    />
                  </Box>
                </>
              )}
            </Box>


            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>In Case of Emergency</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" mb={1}>Guardian</Typography>
              <FormControl style={{ marginBottom: "10px", width: "200px" }} size="small" required error={!!errors.guardian}>
                <InputLabel id="guardian-label">Guardian</InputLabel>
                <Select
                  labelId="guardian-label"
                  id="guardian"
                  name="guardian"
                  value={person.guardian || ""}
                  label="Guardian"
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <MenuItem value=""><em>Select Guardian</em></MenuItem>
                  <MenuItem value="Father">Father</MenuItem>
                  <MenuItem value="Mother">Mother</MenuItem>
                  <MenuItem value="Brother/Sister">Brother/Sister</MenuItem>
                  <MenuItem value="Uncle">Uncle</MenuItem>
                  <MenuItem value="StepFather">Stepfather</MenuItem>
                  <MenuItem value="StepMother">Stepmother</MenuItem>
                  <MenuItem value="Cousin">Cousin</MenuItem>
                  <MenuItem value="Father in Law">Father-in-law</MenuItem>
                  <MenuItem value="Mother in Law">Mother-in-law</MenuItem>
                  <MenuItem value="Sister in Law">Sister-in-law</MenuItem>
                  <MenuItem value="Spouse">Spouse</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>

              </FormControl>
            </Box>



            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'nowrap' }}>
              {/* Guardian Family Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Family Name</Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  name="guardian_family_name"
                  placeholder="Enter your Guardian Family Name"
                  value={person.guardian_family_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_family_name}
                  helperText={errors.guardian_family_name ? "This field is required." : ""}
                />
              </Box>

              {/* Guardian First Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian First Name</Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  name="guardian_given_name"
                  placeholder="Enter your Guardian First Name"
                  value={person.guardian_given_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_given_name}
                  helperText={errors.guardian_given_name ? "This field is required." : ""}
                />
              </Box>

              {/* Guardian Middle Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Middle Name</Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  name="guardian_middle_name"
                  placeholder="Enter your Guardian Middle Name"
                  value={person.guardian_middle_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_middle_name}
                  helperText={errors.guardian_middle_name ? "This field is required." : ""}
                />
              </Box>

              {/* Guardian Name Extension */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Name Extension</Typography>
                <FormControl fullWidth size="small" required error={!!errors.guardian_ext}>
                  <InputLabel id="guardian-ext-label">Extension</InputLabel>
                  <Select
                    labelId="guardian-ext-label"
                    id="guardian_ext"
                    name="guardian_ext"
                    value={person.guardian_ext || ""}
                    label="Extension"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value=""><em>Select Extension</em></MenuItem>
                    <MenuItem value="Jr.">Jr.</MenuItem>
                    <MenuItem value="Sr.">Sr.</MenuItem>
                    <MenuItem value="I">I</MenuItem>
                    <MenuItem value="II">II</MenuItem>
                    <MenuItem value="III">III</MenuItem>
                    <MenuItem value="IV">IV</MenuItem>
                    <MenuItem value="V">V</MenuItem>
                  </Select>
                  {errors.guardian_ext && (
                    <FormHelperText>This field is required.</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Guardian Nickname */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Nickname</Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  name="guardian_nickname"
                  placeholder="Enter your Guardian Nickname"
                  value={person.guardian_nickname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_nickname}
                  helperText={errors.guardian_nickname ? "This field is required." : ""}
                />
              </Box>
            </Box>

            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Guardian's Contact Information</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="subtitle2" mb={1}>Guardian Address</Typography>
              <TextField
                fullWidth
                size="small"
                required
                name="guardian_address"
                placeholder="Enter your Guardian Address"
                value={person.guardian_address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.guardian_address}
                helperText={errors.guardian_address ? "This field is required." : ""}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Contact</Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  name="guardian_contact"
                  placeholder="Enter your Guardian Contact Number"
                  value={person.guardian_contact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.guardian_contact} helperText={errors.guardian_contact ? "This field is required." : ""}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Email</Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  name="guardian_email"
                  placeholder="Enter your Guardian Email Address (e.g., username@gmail.com)"
                  value={person.guardian_email}
                  onChange={handleChange}
                  onBlur={handleBlur}

                />
              </Box>
            </Box>

            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Family (Annual Income)</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            {/* Annual Income */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="subtitle2" mb={1}>Annual Income</Typography>
              <FormControl fullWidth size="small" required error={!!errors.annual_income}>
                <InputLabel id="annual-income-label">Annual Income</InputLabel>
                <Select
                  labelId="annual-income-label"
                  name="annual_income"
                  value={person.annual_income || ""}
                  label="Annual Income"
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <MenuItem value=""><em>Select Annual Income</em></MenuItem>
                  <MenuItem value="80,000 and below">80,000 and below</MenuItem>
                  <MenuItem value="80,000 to 135,000">80,000 to 135,000</MenuItem>
                  <MenuItem value="135,000 to 250,000">135,000 to 250,000</MenuItem>
                  <MenuItem value="250,000 to 500,000">250,000 to 500,000</MenuItem>
                  <MenuItem value="500,000 to 1,000,000">500,000 to 1,000,000</MenuItem>
                  <MenuItem value="1,000,000 and above">1,000,000 and above</MenuItem>
                </Select>
                {errors.annual_income && (
                  <FormHelperText>This field is required.</FormHelperText>
                )}
              </FormControl>
            </Box>


         <Box display="flex" justifyContent="space-between" mt={4}>
  {/* Previous Page Button */}
  <Button
    variant="contained"
    onClick={() => navigate(`/dashboard/${keys.step1}`)} // ✅ FIXED
    startIcon={
      <ArrowBackIcon
        sx={{
          color: "#000",
          transition: "color 0.3s",
        }}
      />
    }
    sx={{
      backgroundColor: "#E8C999",
      color: "#000",
      "&:hover": {
        backgroundColor: "#6D2323",
        color: "#fff",
        "& .MuiSvgIcon-root": {
          color: "#fff",
        },
      },
    }}
  >
    Previous Step
  </Button>

  {/* Next Step Button */}
  <Button
    variant="contained"
    onClick={() => {
      handleUpdate();

      if (isFormValid()) {
        navigate(`/dashboard/${keys.step3}`); // ✅ Goes to next step
      } else {
        alert("Please complete all required fields before proceeding.");
      }
    }}
    endIcon={
      <ArrowForwardIcon
        sx={{
          color: "#fff",
          transition: "color 0.3s",
        }}
      />
    }
    sx={{
      backgroundColor: "#6D2323",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#E8C999",
        color: "#000",
        "& .MuiSvgIcon-root": {
          color: "#000",
        },
      },
    }}
  >
    Next Step
  </Button>
</Box>


          </Container>
        </form>
      </Container>
    </Box>
  );
};


export default Dashboard2;
