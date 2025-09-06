import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

const StudentSchedule = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [personData, setPerson] = useState({
      student_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
  })
  const [studentSchedule, setStudentSchedule] = useState([])
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
        fetchStudentSchedule(storedID);
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

  const fetchStudentSchedule = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student_schedule/${id}`);
      setStudentSchedule(res.data);
    } catch (error) { 
      console.error(error)
    }
  };

  const isTimeInSchedule = (start, end, day) => {
    const parseTime = (timeStr) => {
      // Converts "5:00 PM" into a Date object
      return new Date(`1970-01-01 ${timeStr}`);
    };
  
    return studentSchedule.some(entry => {
      if (entry.day_description !== day) return false;
  
      const slotStart = parseTime(start);
      const slotEnd = parseTime(end);
      const schedStart = parseTime(entry.school_time_start);
      const schedEnd = parseTime(entry.school_time_end);
  
      return slotStart >= schedStart && slotEnd <= schedEnd;
    });
  };
  
  const hasAdjacentSchedule = (start, end, day, direction = "top") => {
    const parseTime = (timeStr) => new Date(`1970-01-01 ${timeStr}`);
  
    const minutesOffset = direction === "top" ? -60 : 60;
  
    const newStart = new Date(parseTime(start).getTime() + minutesOffset * 60000);
    const newEnd   = new Date(parseTime(end).getTime() + minutesOffset * 60000);
  
    const currentEntry = studentSchedule.find(entry => {
      if (entry.day_description !== day) return false;
  
      const schedStart = parseTime(entry.school_time_start);
      const schedEnd   = parseTime(entry.school_time_end);
  
      return parseTime(start) >= schedStart && parseTime(end) <= schedEnd;
    });
  
    const adjacentEntry = studentSchedule.find(entry => {
      if (entry.day_description !== day) return false;
  
      const schedStart = parseTime(entry.school_time_start);
      const schedEnd   = parseTime(entry.school_time_end);
  
      return newStart >= schedStart && newEnd <= schedEnd;
    });
  
    if (!adjacentEntry) return false;

    if (currentEntry && adjacentEntry.course_code === currentEntry.course_code) {
      return "same"; 
    } else {
      return "different";
    }
  };
    
    const getCenterText = (start, day) => {
      const parseTime = (t) => new Date(`1970-01-01 ${t}`);
      const SLOT_HEIGHT_REM = 2.5;
    
      const slotStart = parseTime(start);
    
      for (const entry of studentSchedule) {
        if (entry.day_description !== day) continue;
    
        const schedStart = parseTime(entry.school_time_start);
        const schedEnd   = parseTime(entry.school_time_end);
    
        if (!(slotStart >= schedStart && slotStart < schedEnd)) continue;
    
        const totalHours = Math.round((schedEnd - schedStart) / (1000 * 60 * 60));
        const idxInBlock = Math.round((slotStart - schedStart) / (1000 * 60 * 60));
    
        const isOdd = totalHours % 2 === 1;
        const centerIndex = isOdd ? (totalHours - 1) / 2 : totalHours / 2;
        const isCenter = idxInBlock === centerIndex;
    
        if (!isCenter) return "";
    
        let marginTop = isOdd ? 0 : -(SLOT_HEIGHT_REM / 2);
        if (!isOdd) marginTop = `calc(${marginTop}rem - 1rem)`;
    
        let text;
        if (totalHours === 1) {
          text = (
            <>
              <span className="block truncate text-[10px]">{entry.course_code}</span>
              <span className="block truncate text-[8px]">
                {entry.room_description === "TBA" ? "TBA" : `${entry.room_description}`}
              </span>
              <span className="block truncate text-[8px]">
                {entry.prof_lastname === "TBA" ? "TBA" : `Prof. ${entry.prof_lastname}`}
              </span>
            </>
          );
        } else {
          text = (
            <>
              {entry.course_code} <br />
              ({entry.room_description === "TBA" ? "TBA" : `${entry.room_description}`})
              <br />
              {entry.prof_lastname === "TBA" ? "TBA" : `Prof. ${entry.prof_lastname}`}
            </>
          );
        }
    
        return (
          <span
            className={`relative inline-block text-center ${
              totalHours === 1 ? "text-[10px]" : "text-[11px]"
            }`}
            style={{ marginTop }}
          >
            {text}
          </span>
        );
      }
    
      return "";
    };
    
    
  return (
    <Box sx={{ p: 4, ml: '-2rem', paddingRight: 8, height: "calc(100vh - 150px)", overflowY: "auto", marginLeft: '-2rem' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Class Schedule
      </Typography>

      <TableContainer component={Paper} sx={{mb: 3 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "maroon" }}>
                <TableRow >
                  <TableCell sx={{color: "white"}}>#</TableCell>
                  <TableCell sx={{color: "white"}}>Course Description</TableCell>
                  <TableCell sx={{color: "white"}}>Course Code</TableCell>
                  <TableCell sx={{color: "white"}}>Lec</TableCell>
                  <TableCell sx={{color: "white"}}>Lab</TableCell>
                  <TableCell sx={{color: "white"}}>Units</TableCell>
                  <TableCell sx={{color: "white"}}>Section</TableCell>
                  <TableCell sx={{color: "white"}}>Schedule</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentSchedule.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{fontSize: "0.75rem"}}>{index + 1}</TableCell>
                    <TableCell sx={{fontSize: "0.75rem"}}>{row.course_description}</TableCell>
                    <TableCell sx={{fontSize: "0.75rem"}}>
                      {row.course_code}
                    </TableCell>
                    <TableCell sx={{fontSize: "0.75rem"}}>1</TableCell>
                    <TableCell sx={{fontSize: "0.75rem"}}>{row.lab_unit}</TableCell>
                    <TableCell sx={{fontSize: "0.75rem"}}>{row.course_unit}</TableCell>
                    <TableCell sx={{fontSize: "0.75rem"}}>
                      {row.program_code} {row.section_description}
                    </TableCell>
                    <TableCell sx={{fontSize: "0.75rem"}}>
                      {row.day_description}, {row.school_time_start} - {row.school_time_end} {row.room_description}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} />
                  <TableCell colSpan={2} style={{ fontWeight: '600'}}>
                    Total Units
                  </TableCell>
                  <TableCell>
                    {studentSchedule.reduce((total, row) => total + (Number(row.course_unit) || 0), 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>


      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Event */}
        <table className='mt-[0.7rem]'>
          <thead className="">
            <tr className='flex align-center'>
              <td className='min-w-[6.5rem] min-h-[2.2rem] flex items-center justify-center border border-black text-[14px] '>TIME</td>
              <td className='p-0 m-0'>
                <div className='min-w-[6.6rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>DAY</div>
                <p className='min-w-[6.6rem] text-center border border-black border-l-0 text-[11.5px] font-bold mt-[-3px]'>Official Time</p>
              </td>
              <td className='p-0 m-0'>
                <div className='min-w-[6.8rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>MONDAY</div>
                <p className='min-w-[6.8rem] text-center border border-black border-l-0 text-[11.5px] mt-[-3px]'>7:00AM - 9:00PM</p>
              </td>
              <td className='p-0 m-0'>
                <div className='min-w-[6.8rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>TUESDAY</div>
                <p className='min-w-[6.8rem] text-center border border-black border-l-0 text-[11.5px] mt-[-3px]'>7:00AM - 9:00PM</p>
              </td>
              <td className='p-0 m-0'>
                <div className='min-w-[7rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>WEDNESDAY</div>
                <p className='min-w-[7rem] text-center border border-black border-l-0 text-[11.5px] mt-[-3px]'>7:00AM - 9:00PM</p>
              </td>
              <td className='p-0 m-0'>
                <div className='min-w-[6.9rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>THURSDAY</div>
                <p className='min-w-[6.9rem] text-center border border-black border-l-0 text-[11.5px] mt-[-3px]'>7:00AM - 9:00PM</p>
              </td>
              <td className='p-0 m-0'>
                <div className='min-w-[6.8rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>FRIDAY</div>
                <p className='min-w-[6.8rem] text-center border border-black border-l-0 text-[11.5px] mt-[-3px]'>7:00AM - 9:00PM</p>
              </td>
              <td className='p-0 m-0'>
                <div className='min-w-[6.8rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>SATUDAY</div>
                <p className='min-w-[6.8rem] text-center border border-black border-l-0 text-[11.5px] mt-[-3px]'>7:00AM - 9:00PM</p>
              </td>
              <td className='p-0 m-0'>
                <div className='min-w-[6.8rem] text-center border border-black border-l-0 border-b-0 text-[14px]'>SUNDAY</div>
                <p className='min-w-[6.8rem] text-center border border-black border-l-0 text-[11.5px] mt-[-3px]'>7:00AM - 9:00PM</p>
              </td>
            </tr>
          </thead>
          <tbody className='flex flex-col mt-[-0.1px]'>
            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  07:00 AM - 08:00 AM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("7:00 AM", "8:00 AM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("7:00 AM", "8:00 AM", day) && hasAdjacentSchedule("7:00 AM", "8:00 AM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("7:00 AM", "8:00 AM", day) && hasAdjacentSchedule("7:00 AM", "8:00 AM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >
                     {getCenterText("7:00 AM", day)}
                  </div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  08:00 AM - 09:00 AM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("8:00 AM", "9:00 AM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("8:00 AM", "9:00 AM", day) && hasAdjacentSchedule("8:00 AM", "9:00 AM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("8:00 AM", "9:00 AM", day) && hasAdjacentSchedule("8:00 AM", "9:00 AM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >
                     {getCenterText("8:00 AM", day)}
                  </div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  09:00 AM - 10:00 AM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("9:00 AM", "10:00 AM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("9:00 AM", "10:00 AM", day) && hasAdjacentSchedule("9:00 AM", "10:00 AM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("9:00 AM", "10:00 AM", day) && hasAdjacentSchedule("9:00 AM", "10:00 AM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >
                     {getCenterText("9:00 AM", day)}
                  </div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  10:00 AM - 11:00 AM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("10:00 AM", "11:00 AM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("10:00 AM", "11:00 AM", day) && hasAdjacentSchedule("10:00 AM", "11:00 AM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("10:00 AM", "11:00 AM", day) && hasAdjacentSchedule("10:00 AM", "11:00 AM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >
                    {getCenterText("10:00 AM", day)}
                  </div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  11:00 AM - 12:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("11:00 AM", "12:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("11:00 AM", "12:00 PM", day) && hasAdjacentSchedule("11:00 AM", "12:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("11:00 AM", "12:00 PM", day) && hasAdjacentSchedule("11:00 AM", "12:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >
                    {getCenterText("11:00 AM", day)}
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  12:00 PM - 01:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("12:00 PM", "1:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("12:00 PM", "1:00 PM", day) && hasAdjacentSchedule("12:00 PM", "1:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("12:00 PM", "1:00 PM", day) && hasAdjacentSchedule("12:00 PM", "1:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >
                    {getCenterText("12:00 PM", day)}
                  </div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  01:00 PM - 02:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("1:00 PM", "2:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("1:00 PM", "2:00 PM", day) && hasAdjacentSchedule("1:00 PM", "2:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("1:00 PM", "2:00 PM", day) && hasAdjacentSchedule("1:00 PM", "2:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >
                    {getCenterText("1:00 PM", day)}
                  </div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  02:00 PM - 03:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("2:00 PM", "3:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("2:00 PM", "3:00 PM", day) && hasAdjacentSchedule("2:00 PM", "3:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("2:00 PM", "3:00 PM", day) && hasAdjacentSchedule("2:00 PM", "3:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >{getCenterText("2:00 PM", day)}</div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  03:00 PM - 04:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("3:00 PM", "4:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("3:00 PM", "4:00 PM", day) && hasAdjacentSchedule("3:00 PM", "4:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("3:00 PM", "4:00 PM", day) && hasAdjacentSchedule("3:00 PM", "4:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >{getCenterText("3:00 PM", day)}</div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  04:00 PM - 05:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("4:00 PM", "5:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("4:00 PM", "5:00 PM", day) && hasAdjacentSchedule("4:00 PM", "5:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("4:00 PM", "5:00 PM", day) && hasAdjacentSchedule("4:00 PM", "5:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >{getCenterText("4:00 PM", day)}</div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  05:00 PM - 06:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("5:00 PM", "6:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("5:00 PM", "6:00 PM", day) && hasAdjacentSchedule("5:00 PM", "6:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("5:00 PM", "6:00 PM", day) && hasAdjacentSchedule("5:00 PM", "6:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >{getCenterText("5:00 PM", day)}</div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  06:00 PM - 07:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("6:00 PM", "7:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("6:00 PM", "7:00 PM", day) && hasAdjacentSchedule("6:00 PM", "7:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("6:00 PM", "7:00 PM", day) && hasAdjacentSchedule("6:00 PM", "7:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >{getCenterText("6:00 PM", day)}</div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  07:00 PM - 08:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("7:00 PM", "8:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("7:00 PM", "8:00 PM", day) && hasAdjacentSchedule("7:00 PM", "8:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("7:00 PM", "8:00 PM", day) && hasAdjacentSchedule("7:00 PM", "8:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >{getCenterText("7:00 PM", day)}</div>
                </td>
              ))}
            </tr>

            <tr className='flex w-full'>
              <td className='m-0 p-0 min-w-[13.1rem]'>
                <div className='h-[2.5rem] border border-black border-t-0 text-[14px] flex items-center justify-center'>
                  08:00 PM - 09:00 PM
                </div>
              </td>

              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((day, i) => (
                <td key={day} className={`m-0 p-0 ${day==="WED" ? "min-w-[7rem]" : day==="THU" ? "min-w-[6.9rem]" : "min-w-[6.8rem]"}`}>
                  <div className={`h-[2.5rem] border border-black border-t-0 border-l-0 text-[14px] flex items-center justify-center  
                    ${isTimeInSchedule("8:00 PM", "9:00 PM", day) ? 'bg-yellow-300' : ''} 
                    ${isTimeInSchedule("8:00 PM", "9:00 PM", day) && hasAdjacentSchedule("8:00 PM", "9:00 PM", day, "top") === "same" ? "border-t-0" : ''} 
                    ${isTimeInSchedule("8:00 PM", "9:00 PM", day) && hasAdjacentSchedule("8:00 PM", "9:00 PM", day, "bottom") === "same" ? "border-b-0" : ''}`}
                  >{getCenterText("8:00 PM", day)}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Event
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No upcoming events.
            </Typography>
          </CardContent>
        </Card>
      </Box>  
    </Box>
  );
};

export default StudentSchedule;
