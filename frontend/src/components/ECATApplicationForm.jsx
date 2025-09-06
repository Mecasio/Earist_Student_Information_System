import { useRef, useState, useEffect } from "react";
import { Box, Container, } from "@mui/material";
import EaristLogo from "../assets/EaristLogo.png";
import axios from "axios";
import { FcPrint } from "react-icons/fc";
import { useLocation } from "react-router-dom";

const ECATApplicationForm = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [person, setPerson] = useState({
    profile_img: "",
    campus: "",
    academicProgram: "",
    classifiedAs: "",
    program: "",
    program2: "",
    program3: "",
    yearLevel: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    extension: "",
    nickname: "",
    height: "",
    weight: "",
    lrnNumber: "",
    gender: "",
    pwdType: "",
    pwdId: "",
    birthOfDate: "",
    age: "",
    birthPlace: "",
    languageDialectSpoken: "",
    citizenship: "",
    religion: "",
    civilStatus: "",
    tribeEthnicGroup: "",
    otherEthnicGroup: "",
    cellphoneNumber: "",
    emailAddress: "",
    telephoneNumber: "",
    facebookAccount: "",
    presentStreet: "",
    presentBarangay: "",
    presentZipCode: "",
    presentRegion: "",
    presentProvince: "",
    presentMunicipality: "",
    presentDswdHouseholdNumber: "",
    permanentStreet: "",
    permanentBarangay: "",
    permanentZipCode: "",
    permanentRegion: "",
    permanentProvince: "",
    permanentMunicipality: "",
    permanentDswdHouseholdNumber: "",
    father_deceased: "",
    father_family_name: "", father_given_name: "", father_middle_name: "", father_ext: "", father_contact: "", father_occupation: "",
    father_income: "", father_email: "", mother_deceased: "", mother_family_name: "", mother_given_name: "", mother_middle_name: "",
    mother_contact: "", mother_occupation: "", mother_income: "", guardian: "", guardian_family_name: "", guardian_given_name: "",
    guardian_middle_name: "", guardian_ext: "", guardian_nickname: "", guardian_address: "", guardian_contact: "", guardian_email: "",
  });
  // ✅ Fetch person data from backend
  const fetchPersonData = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/person/${id}`);
      setPerson(res.data); // make sure backend returns the correct format
    } catch (error) {
      console.error("Failed to fetch person:", error);
    }
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryPersonId = queryParams.get("person_id");

  // do not alter
  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const loggedInPersonId = localStorage.getItem("person_id");
    const searchedPersonId = sessionStorage.getItem("admin_edit_person_id");

    if (!storedUser || !storedRole || !loggedInPersonId) {
      window.location.href = "/login";
      return;
    }

    setUser(storedUser);
    setUserRole(storedRole);

    // Allow Applicant, Admin, SuperAdmin to view ECAT
    const allowedRoles = ["registrar", "applicant", "superadmin"];
    if (allowedRoles.includes(storedRole)) {
      const targetId = searchedPersonId || queryPersonId || loggedInPersonId;
      setUserID(targetId);
      fetchPersonData(targetId);
      return;
    }

    window.location.href = "/login";
  }, [queryPersonId]);


  const [shortDate, setShortDate] = useState("");


  useEffect(() => {
    const updateDates = () => {
      const now = new Date();

      // Format 1: MM/DD/YYYY
      const formattedShort = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
      setShortDate(formattedShort);

      // Format 2: MM DD, YYYY hh:mm:ss AM/PM
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours() % 12 || 12).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";


    };

    updateDates(); // Set initial values
    const interval = setInterval(updateDates, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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
        margin: 10mm 10mm 10mm 10mm; /* reasonable print margins */
      }

      html, body {
        margin: 0;
        margin-top: -115px;
        padding: 0;
        font-family: Arial, sans-serif;
        width: auto;
        height: auto;
        overflow: visible;
      }

      .print-container {
        width: 100%;
        box-sizing: border-box;
      }

         .student-table {
    margin-top: 130px !important;
  }


      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      button {
        display: none;
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

  const [curriculumOptions, setCurriculumOptions] = useState([]);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/applied_program");
        setCurriculumOptions(response.data);
      } catch (error) {
        console.error("Error fetching curriculum options:", error);
      }
    };

    fetchCurriculums();
  }, []);

  console.log("person.program:", person.program);
  console.log("curriculumOptions:", curriculumOptions);

  {
    curriculumOptions.find(
      (item) =>
        item?.curriculum_id?.toString() === (person?.program ?? "").toString()
    )?.program_description || (person?.program ?? "")

  }

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

  return (

    <Box sx={{ height: 'calc(95vh - 80px)', overflowY: 'auto', paddingRight: 1, backgroundColor: 'transparent' }}>
      <div ref={divToPrintRef}>
        <div>
          <style>
            {`
          @media print {
            button {
              display: none;
            }
          }
        `}
          </style>


        </div>
        <Container>
          <h1 style={{ fontSize: "40px", fontWeight: "bold", textAlign: "Left", color: "maroon", marginTop: "25px" }}> ECAT APPLICATION FORM</h1>
          <hr style={{ border: "1px solid #ccc", width: "44%" }} />
          <button
            onClick={printDiv}
            style={{
              marginBottom: "1rem",
              padding: "10px 20px",
              border: "2px solid black",
              backgroundColor: "#f0f0f0",
              color: "black",
              borderRadius: "5px",
              marginTop: "20px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "background-color 0.3s, transform 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d3d3d3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
            onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FcPrint size={20} />
              Print ECAT Application Form
            </span>
          </button>

        </Container>


        <table
          className="student-table"
          style={{
            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
            border: "2px solid black"
          }}
        >
          <tbody>
            <tr>
              {/* LEFT - Logo */}
              <td colSpan={9} style={{ textAlign: "center" }}>
                <img
                  src={EaristLogo}
                  alt="Earist Logo"
                  style={{
                    width: "120px",
                    height: "120px",
                    display: "block",
                    marginTop: "-7px",
                  }}
                />
              </td>

              {/* CENTER - School Info */}
              <td colSpan={15} style={{
                textAlign: "center",
                fontFamily: "Arial",
                fontSize: "10px",
                lineHeight: "1.5",
              }}>
                <div style={{ fontSize: "12px", letterSpacing: "1px", marginLeft: "-60px" }}>Republic of the Philippines</div>
                <div style={{ fontSize: "12px", letterSpacing: "1px", marginLeft: "-60px" }}><b>EULOGIO "AMANG" RODRIGUEZ</b></div>
                <div style={{ fontSize: "12px", letterSpacing: "1px", marginLeft: "-60px" }}><b>INSTITUTE OF SCIENCE AND TECHNOLOGY </b></div>
                <div style={{ fontSize: "12px", letterSpacing: "1px", marginLeft: "-60px" }}>Nagtahan, Sampaloc, Manila 1008</div>
                <div style={{ fontSize: "9px", marginLeft: "-60px" }}><b>STUDENT ADMISSION REGISTRATION AND RECORDS MANAGEMENT SERVICES</b></div>

                <div style={{ fontSize: "20px", fontWeight: "bold", marginLeft: "-60px", letterSpacing: "1px" }}>
                  ECAT APPLICATION FORM
                </div>
              </td>

              {/* RIGHT - Document Metadata Table */}
              <td colSpan={15} style={{ padding: 0 }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "Arial, sans-serif",
                  textAlign: "Left",
                  fontSize: "11px"
                }}>
                  <tbody>
                    {[
                      "Document No.",
                      "Revision No.",
                      "Process Type:",
                      "Effective Date:",
                    ].map((label, index) => (
                      <tr key={index}>
                        <td style={{ border: "2px solid black", padding: "4px", fontWeight: "bold" }}>{label}</td>
                        <td style={{ border: "2px solid black", padding: "4px" }}>
                          <input
                            type="text"
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              fontSize: "12px",
                              textAlign: "left",
                              background: "none",
                            }}
                          />
                        </td>
                      </tr>
                    ))}

                    {/* Page Number */}
                    <tr>
                      <td colSpan={2} style={{ border: "2px solid black", textAlign: "center", padding: "4px", fontWeight: "bold" }}>
                        Page 1 of 1
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ✅ Replace invalid <tr> with valid spacer table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td colSpan={40} style={{
                height: "10px",
                padding: 0,
                border: "none"
              }}></td>
            </tr>
          </tbody>
        </table>



        <table

          style={{

            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
          }}
        >
          <tbody>

            <tr>
              <td
                colSpan={24}
                rowSpan={3}
                style={{
                  border: "2px solid black",
                  textAlign: "justify",
                  padding: "8px",
                  fontWeight: "bold",
                  fontSize: "11px",
                  verticalAlign: "top",
                }}
              >
                <div>TO THE APPLICANT</div>
                Read carefully the ECAT Guidelines and Requirements before accomplishing this form.
                Please write LEGIBLY and CORRECTLY in PRINT LETTERS without erasures.
                <div>ONLY APPLICATION FORMS ACCOMPLISHED CORRECTLY AND COMPLETELY WILL BE PROCESSED.</div>
              </td>
              <td colSpan={1}></td>
              <td
                colSpan={15}
                style={{
                  border: "2px solid black",
                  textAlign: "left",
                  padding: "8px",
                  fontWeight: "bold",
                  fontSize: "10px",
                  verticalAlign: "top",
                }}
              >
                COURSE APPLIED FOR (Preferred Course):
              </td>
            </tr>
            <tr>
              <td colSpan={1}></td>
              <td
                colSpan={15}
                style={{
                  border: "2px solid black",
                  textAlign: "left",
                  padding: "8px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  verticalAlign: "top",
                }}
              >
                <div>Course & Major:</div>
                <div style={{ fontFamily: "Times New Roman", fontSize: "14px", paddingTop: "2px", fontWeight: "Normal" }}>
                  {curriculumOptions.length > 0
                    ? curriculumOptions.find(
                      (item) =>
                        item?.curriculum_id?.toString() === (person?.program ?? "").toString()
                    )?.program_description || (person?.program ?? "")
                    : "Loading..."}
                </div>
              </td>
            </tr>
          </tbody>
        </table>


        <table
          style={{
            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
          }}
        >
          <tbody>


            <tr>
              <td colSpan={40} style={{ padding: "8px" }}>
                {/* ENTRY STATUS heading */}
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serif",
                    marginBottom: "4px",
                    textAlign: "left",
                  }}
                >
                  ENTRY STATUS
                </div>

                {/* Flex container with 3 rows (one for each entry status + right side input) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {/* Row 1 */}
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div>( ) Currently Enrolled as Grade 12 Student</div>
                    <div>
                      Date of Graduation:
                      <input
                        type="text"
                        style={{
                          border: "none",
                          borderBottom: "1px solid black",
                          width: "150px",
                          marginLeft: "10px",
                          fontSize: "12px",
                          fontFamily: "Arial, sans-serif",
                          background: "none",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div>( ) Senior High School Graduate</div>
                    <div>
                      Year Graduated:
                      <input
                        type="text"
                        style={{
                          border: "none",
                          borderBottom: "1px solid black",
                          width: "150px",
                          marginLeft: "15px",
                          fontSize: "12px",
                          fontFamily: "Arial, sans-serif",
                          background: "none",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div>( ) ALS Passer (equivalent to Senior High)</div>
                    <div>
                      ( ) Transferee from:
                      <input
                        type="text"
                        style={{
                          border: "none",
                          borderBottom: "1px solid black",
                          width: "150px",
                          marginLeft: "10px",
                          fontSize: "12px",
                          fontFamily: "Arial, sans-serif",
                          background: "none",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>

          </tbody>
        </table>


        <table

          style={{

            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
          }}
        >
          <tbody>

            <tr>
              <td
                colSpan={40}
                style={{
                  height: "0.2in",
                  fontSize: "72.5%",

                  color: "white",
                }}
              >
                <b>
                  <b style={{
                    color: "black",
                    fontFamily: "Times new Roman",
                    fontSize: '15px',
                    textAlign: "center",
                    display: "block",
                    fontStyle: 'italic',
                    border: "2px solid black"
                  }}>
                    {"\u00A0\u00A0"}PERSONAL INFORMATION (Please print your name as written in your NSO/PSA Birth Certificate)
                  </b>

                </b>
              </td>
            </tr>

            <tr>
              <td
                style={{ height: "5px" }} colSpan={40}>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40} style={{ paddingTop: "5px" }}>
                <span style={{ fontWeight: "bold", marginRight: "10px", marginLeft: "1px" }}>Name:</span>{" "}
                <span
                  style={{
                    display: "inline-block",
                    borderBottom: "1px solid black",
                    width: "92%",
                    verticalAlign: "bottom",
                  }}
                >
                  <span style={{ display: "inline-block", width: "20%", textAlign: "center" }}>{person.last_name}</span>
                  <span style={{ display: "inline-block", width: "20%", textAlign: "center" }}>{person.first_name}</span>
                  <span style={{ display: "inline-block", width: "20%", textAlign: "center" }}>{person.middle_name}</span>
                  <span style={{ display: "inline-block", width: "20%", textAlign: "center" }}>{person.extension}</span>
                  <span style={{ display: "inline-block", width: "20%", textAlign: "center" }}>{person.nickname}</span>
                </span>
              </td>
            </tr>

            <tr>
              <td colSpan={40} style={{ fontFamily: "Times New Roman", fontSize: "14px", paddingTop: "2px" }}>
                <div style={{ width: "88%", marginLeft: "100px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ width: "20%", textAlign: "center" }}>Last Name</span>
                  <span style={{ width: "20%", textAlign: "center" }}>Given Name</span>
                  <span style={{ width: "20%", textAlign: "center" }}>Middle Name</span>
                  <span style={{ width: "20%", textAlign: "center" }}>Ext. Name</span>
                  <span style={{ width: "20%", textAlign: "center" }}>Nickname</span>
                </div>
              </td>
            </tr>


            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Gender:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "160px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                    textAlign: "Center"
                  }}
                >
                  {person.gender === 0 ? "Male" : person.gender === 1 ? "Female" : ""}
                </span>{" "}
                <b>Civil Status:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "160px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                    textAlign: "Center"
                  }}
                >
                  {person.civilStatus}
                </span>{" "}
                <b>Date of Birth:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "170px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                    textAlign: "Center"
                  }}
                >
                  {person.birthOfDate &&
                    new Date(person.birthOfDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </span>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Place of Birth:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "160px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                    textAlign: "Center"
                  }}
                >
                  {person.birthPlace}
                </span>{" "}
                <b>Nationality:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "164px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                    textAlign: "Center"
                  }}
                >
                  {person.citizenship}
                </span>{" "}
                <b>Religion:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "160px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                    textAlign: "Center"
                  }}
                >
                  {person.religion}
                </span>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Cellphone Number:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "210px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                  }}
                >
                  {person.cellphoneNumber}
                </span>{" "}
                <b>Email Address:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "294px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                  }}
                >
                  {person.emailAddress}
                </span>
              </td>
            </tr>

            <tr>
              <td colSpan={40} style={{ fontFamily: "Times New Roman", fontSize: "15px", }}>
                <span style={{ fontWeight: "bold", marginRight: "10px", marginLeft: "-5px" }}>Permanent Address:</span>{" "}
                <span
                  style={{
                    display: "inline-block",
                    borderBottom: "1px solid black",
                    width: "80.5%",
                    verticalAlign: "bottom",
                  }}
                >
                  <span style={{ display: "inline-block", width: "30%", textAlign: "center", fontSize: "12px" }}>
                    {person.presentStreet}
                  </span>
                  <span style={{ display: "inline-block", width: "10%", textAlign: "center", fontSize: "12px" }}>
                    {person.presentBarangay}
                  </span>
                  <span style={{ display: "inline-block", width: "20%", textAlign: "center", fontSize: "12px" }}>
                    {person.presentMunicipality}
                  </span>
                  <span style={{ display: "inline-block", width: "30%", textAlign: "center", fontSize: "12px" }}>
                    {person.presentProvince}
                  </span>
                  <span style={{ display: "inline-block", width: "10%", textAlign: "center", fontSize: "12px" }}>
                    {person.presentZipCode}
                  </span>
                </span>
              </td>
            </tr>

            <tr>
              <td colSpan={40} style={{ fontFamily: "Times New Roman", fontSize: "14px", paddingTop: "2px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "92%",
                    marginLeft: "60px", // aligns label with start of 92% span
                  }}
                >
                  <span style={{ width: "30%", textAlign: "center", }}>No. Street</span>
                  <span style={{ width: "10%", textAlign: "center", }}>Barangay</span>
                  <span style={{ width: "20%", textAlign: "center", }}>City</span>
                  <span style={{ width: "30%", textAlign: "center", }}>Province</span>
                  <span style={{ width: "10%", textAlign: "center", }}>Zipcode</span>
                </div>
              </td>
            </tr>



            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b style={{ marginRight: "50px" }}>Residence:</b>{" "}
                <span style={{ marginRight: "20px" }}>( ) With Parents</span>
                <span style={{ marginRight: "20px" }}>( ) With Relatives</span>
                <span style={{ marginRight: "20px" }}>( ) With Guardian</span>
                <span>( ) Boarding</span>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Are you a member of any indigenous group?</b>{" "}
                {person.tribeEthnicGroup === "Others" ? (
                  <>
                    (✓) YES ( ) NO If YES, please specify{" "}
                    <span
                      style={{
                        borderBottom: "1px solid black",
                        display: "inline-block",
                        width: "200px",
                        marginLeft: "10px"
                      }}
                    >

                    </span>
                  </>
                ) : (
                  <>
                    ( ) YES (✓) NO If YES, please specify{" "}
                    <span
                      style={{
                        borderBottom: "1px solid black",
                        display: "inline-block",
                        width: "200px",
                        marginLeft: "10px"
                      }}
                    ></span>
                  </>
                )}
              </td>
            </tr>


          </tbody>
        </table>

        {/* ✅ Replace invalid <tr> with valid spacer table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td colSpan={40} style={{
                height: "10px",
                padding: 0,
                border: "none"
              }}></td>
            </tr>
          </tbody>
        </table>



        <table

          style={{

            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
          }}
        >
          <tbody>


            <tr>
              <td
                colSpan={40}
                style={{
                  height: "0.2in",
                  fontSize: "72.5%",

                  color: "white",
                }}
              >
                <b>
                  <b style={{
                    color: "black",
                    fontFamily: "Times new Roman",
                    fontSize: '15px',
                    textAlign: "center",
                    display: "block",
                    fontStyle: 'italic',
                    border: "2px solid black"
                  }}>
                    {"\u00A0\u00A0"}FAMILY BACKGROUND
                  </b>

                </b>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Father's Name:</b>
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "360px",
                    marginLeft: "10px",
                    marginRight: "15px",
                    fontFamily: "times new roman",

                    fontSize: "14px",

                  }}
                >
                  {`${person.father_given_name || ""} ${person.father_middle_name || ""} ${person.father_family_name || ""} ${person.father_ext || ""}`.toUpperCase()}

                </span>
                <span style={{ fontWeight: "normal", fontSize: "14px" }}>
                  ({person.father_deceased === "1" ? " " : "✓"}) Living&nbsp;&nbsp;
                  ({person.father_deceased === "1" ? "✓" : " "}) Deceased
                </span>


              </td>
            </tr>




            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Occupation:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "150px",
                    marginLeft: "10px",
                    fontFamily: "times new roman",


                    fontSize: "14px"
                  }}
                >
                  {person.father_occupation}
                </span>{" "}
                <b>Monthly Income:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "150px",
                    marginLeft: "10px",
                    fontFamily: "times new roman",

                    fontSize: "14px"
                  }}
                >
                  {person.father_income}
                </span>{" "}
                <b>Contact No:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "145px",
                    marginLeft: "10px",
                    fontFamily: "times new roman",

                    fontSize: "14px"
                  }}
                >
                  {person.father_contact}
                </span>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Mother's Name:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "350px",
                    marginLeft: "10px",
                    marginRight: "15px",
                    fontFamily: "times new roman",
                    fontSize: "14px",

                  }}
                >
                  {`${person.mother_given_name || ""} ${person.mother_middle_name || ""} ${person.mother_family_name || ""}`.toUpperCase()}

                </span>{" "}
                <span style={{ fontWeight: "normal", fontSize: "14px" }}>
                  ({person.mother_deceased === "Yes" ? " " : "✓"}) Living&nbsp;&nbsp;
                  ({person.mother_deceased === "Yes" ? "✓" : " "}) Deceased
                </span>

              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Occupation:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "150px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px"
                  }}
                >
                  {person.mother_occupation}
                </span>{" "}
                <b>Monthly Income:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "150px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px"
                  }}
                >
                  {person.mother_income}
                </span>{" "}
                <b>Contact No:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "145px",
                    marginLeft: "10px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px"
                  }}
                >
                  {person.mother_contact}
                </span>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Guardian's Name:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "200px",
                    marginLeft: "10px",

                    fontSize: "14px",
                    fontFamily: "Times New Roman"
                  }}
                >
                  {`${person.guardian_given_name || ""} ${person.guardian_middle_name || ""} ${person.guardian_family_name || ""} ${person.guardian_ext || ""}`.toUpperCase()}

                </span>{" "}
                <b>Relationship to the Applicant:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "220px",
                    marginLeft: "10px",

                    fontSize: "14px",
                    fontFamily: "Times New Roman"
                  }}
                >
                  Guardian
                </span>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Occupation:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "150px",
                    marginLeft: "10px",
                  }}
                ></span>{" "}
                <b>Monthly Income:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "150px",
                    marginLeft: "10px",
                  }}
                >
                  0
                </span>{" "}
                <b>Contact No:</b>{" "}
                <span
                  style={{
                    borderBottom: "1px solid black",
                    display: "inline-block",
                    width: "145px",
                    marginLeft: "10px",
                  }}
                >
                  {person.guardian_contact}
                </span>
              </td>
            </tr>




          </tbody>
        </table>

        {/* ✅ Replace invalid <tr> with valid spacer table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td colSpan={40} style={{
                height: "10px",
                padding: 0,
                border: "none"
              }}></td>
            </tr>
          </tbody>
        </table>




        <table

          style={{

            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
          }}
        >
          <tbody>




            <tr>
              <td
                colSpan={40}
                style={{
                  height: "0.2in",
                  fontSize: "72.5%",

                  color: "white",
                }}
              >
                <b>
                  <b style={{
                    color: "black",
                    fontFamily: "Times new Roman",
                    fontSize: '15px',
                    textAlign: "center",
                    display: "block",
                    fontStyle: 'italic',
                    border: "2px solid black"
                  }}>
                    {"\u00A0\u00A0"}EDUCATIONAL BACKGROUND
                  </b>

                </b>
              </td>
            </tr>

            <tr>
              <td
                style={{ height: "5px" }} colSpan={40}>
              </td>
            </tr>


            {/* Line 1 */}
            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Last school attended or where you are currently completing Secondary Level Education:</b>
              </td>
            </tr>

            {/* Line 2 */}
            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Name of School:</b>{" "}
                <span style={{ borderBottom: "1px solid black", display: "inline-block", width: "653px" }}></span>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              {/* Complete Address */}
              <td colSpan={20}>
                <b>Complete Address:</b>{" "}
                <span
                  style={{
                    display: "inline-block",
                    borderBottom: "1px solid black",
                    width: "225px",
                    position: "relative",
                    paddingBottom: "5px",
                    marginLeft: "10px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {person.completeAddress}
                  </div>
                </span>
              </td>

              {/* LRN */}
              <td colSpan={20}>
                <b>Learner's Reference No.:</b>{" "}
                <span
                  style={{
                    display: "inline-block",
                    borderBottom: "1px solid black",
                    width: "53%",
                    position: "relative",
                    paddingBottom: "10px",
                    marginLeft: "10px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      marginTop: "-8px",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {person.lrnNumber}
                  </div>
                </span>
              </td>
            </tr>


            {/* Line 4 */}
            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>Do you have any PHYSICAL DISABILITY OR CONDITION that requires special attention or</b>
              </td>
            </tr>

            <tr style={{ fontFamily: "Times New Roman", fontSize: "15px", textAlign: "left" }}>
              <td colSpan={40}>
                <b>would make it difficult for you to take a regular test?</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {[
                  "Blindness", "Low-vision", "Leprosy Cured persons", "Hearing Impairment", "Locomotor Disability",
                  "Dwarfism", "Intellectual Disability", "Mental Illness", "Autism Spectrum Disorder", "Cerebral Palsy",
                  "Muscular Dystrophy", "Chronic Neurological conditions", "Specific Learning Disabilities",
                  "Multiple Sclerosis", "Speech and Language disability", "Thalassemia", "Hemophilia",
                  "Sickle cell disease", "Multiple Disabilities including"
                ].includes(person.pwdType) ? (
                  <>
                    ( ) NO&nbsp;&nbsp;(✓) YES (specify):{" "}
                    <span
                      style={{
                        borderBottom: "1px solid black",
                        display: "inline-block",
                        width: "230px"
                      }}
                    >
                      {person.pwdType}
                    </span>
                  </>
                ) : (
                  <>
                    (✓) NO&nbsp;&nbsp;( ) YES (specify):{" "}
                    <span
                      style={{
                        borderBottom: "1px solid black",
                        display: "inline-block",
                        width: "230px"
                      }}
                    ></span>
                  </>
                )}
              </td>
            </tr>

          </tbody>
        </table>





        <table
          style={{
            border: "2px solid black",
            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
            marginTop: "20px"
          }}
        >
          <tbody>
            <tr>
              <td
                colSpan={40}
                style={{
                  height: "0.2in",
                  fontSize: "72.5%",

                  color: "white",
                }}
              >
                <b>
                  <b style={{
                    color: "black",
                    fontFamily: "Times new Roman",
                    fontSize: '15px',
                    textAlign: "center",
                    display: "block",
                    border: "2px solid black",
                    fontStyle: 'italic'
                  }}>
                    {"\u00A0\u00A0"}ATTESTATION
                  </b>

                </b>
              </td>
            </tr>
            <tr>
              <td colSpan={40} style={{
                fontSize: "12px",
                textAlign: "justify",
                color: "black",
                fontFamily: "arial",
                padding: "8px",
                lineHeight: "1.5",
              }}>
                <strong>
                  I certify that the information given above is true, complete, and accurate to the best of my knowledge and belief.

                  I promise to abide by the rules and regulations of Eulogio "Amang" Rodriguez Institute of Science and Technology
                  regarding the ECAT and my possible admission.

                  I am aware that any false or misleading information and/or statement may result in the refusal or disqualification
                  of my admission to the Institution.
                </strong>
              </td>
            </tr>
            <tr>
              <td colSpan={40}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "20px 40px 0 40px",
                    fontFamily: "Times New Roman",
                    fontSize: "14px",
                  }}
                >
                  {/* LEFT: Applicant */}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        borderBottom: "1px solid black",
                        width: "300px",
                        marginBottom: "5px",
                        paddingBottom: "3px",
                        fontWeight: "bold",
                        height: "20px", // gives consistent line height
                      }}
                    >
                      {`${person.first_name || ""} ${person.middle_name || ""} ${person.last_name || ""} ${person.extension || ""}`.toUpperCase()}
                    </div>
                    <div>Applicant</div>
                    <div style={{ fontSize: "12px" }}>(signature over printed name)</div>
                  </div>

                  {/* RIGHT: Date */}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        borderBottom: "1px solid black",
                        width: "300px",
                        marginBottom: "5px",
                        paddingBottom: "3px",
                        height: "20px",
                      }}
                    >
                      &nbsp;
                    </div>
                    <div>Date</div>
                  </div>
                </div>
              </td>
            </tr>

          </tbody>
        </table>



        <table

          style={{

            borderCollapse: "collapse",
            fontFamily: "Arial, Helvetica, sans-serif",
            width: "8in",
            margin: "0 auto",
            textAlign: "center",
            tableLayout: "fixed",
          }}
        >
          <tbody>

            <tr>
              <td
                style={{ height: "15px" }} colSpan={40}>
              </td>
            </tr>
            <tr>
              <td
                colSpan={30}
                rowSpan={3}
                style={{
                  border: "2px solid black",
                  textAlign: "left",
                  padding: "8px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  verticalAlign: "top",
                }}
              >
                This document is a sole property of Eulogio "Amang" Rodriguez Institute of Science and Technology (EARIST, Manila).
                Any disclosure, unauthorized reproduction or use is strictly prohibited except with permission from EARIST Manila.
              </td>
              <td
                colSpan={5}
                style={{
                  borderLeft: "2px solid black",
                  borderTop: "2px solid black",
                  padding: "8px",
                  fontSize: "12px",
                }}
              >
                {/* Placeholder cell, row 1 right side */}
              </td>
              <td
                colSpan={5}
                style={{
                  borderRight: "2px solid black",
                  borderTop: "2px solid black",
                  padding: "8px",
                  fontSize: "12px",
                }}
              >
                {/* Placeholder cell, row 1 right side */}
              </td>
            </tr>

            {/* Second row on right side */}
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "2px solid black",
                  padding: "8px",
                  fontSize: "12px",
                }}
              >
                {/* Placeholder cell, row 2 right side */}
              </td>
              <td
                colSpan={5}
                style={{
                  border: "2px solid black",
                  padding: "8px",
                  fontSize: "12px",
                }}
              >
                {/* Placeholder cell, row 2 right side */}
              </td>
            </tr>

            {/* Third row on right side */}
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "2px solid black",
                  padding: "8px",
                  fontSize: "12px",
                }}
              >
                {/* Placeholder cell, row 3 right side */}
              </td>
              <td
                colSpan={5}
                style={{
                  border: "2px solid black",
                  padding: "8px",
                  fontSize: "12px",
                }}
              >
                {/* Placeholder cell, row 3 right side */}
              </td>
            </tr>
          </tbody>
        </table>







      </div>
    </Box >
  );
};

export default ECATApplicationForm;