import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Data from "layouts/viewassignment/data/viewAssignmentData";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button"; // Import Button component
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// function Tables() {
//   const { columns, rows } = Data();
//   // Set today's date
//   // const today = new Date().toISOString().split('T')[0];
//   const currentDate = new Date();
//   // Get the current date in "YYYY-MM-DD" format
//   const year = currentDate.getFullYear();
//   const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-based
//   const day = String(currentDate.getDate()).padStart(2, '0');

//   const formattedCurrentDate = `${year}-${month}-${day}`;

// console.log("formatted date:", formattedCurrentDate); // Output: "2024-02-20"

// const rowsToShow = rows.filter(row => {
//   if (row.assignment && row.assignment.date instanceof Date) {
//     const formattedRowDate = row.assignment.date.toISOString().split('T')[0];
//     console.log("formatted row date:", formattedRowDate);
//     return formattedRowDate === formattedCurrentDate;
//   }
//   return false;
// });

//   return (
//     <DashboardLayout>
//       <DashboardNavbar pageTitle="Assigned Workouts Library" />
//       <MDBox pt={6} pb={3}>
//         <Grid container spacing={6}>
//           <Grid item xs={12}>
//             <Card>
//               <MDBox
//                 mx={2}
//                 mt={-3}
//                 py={3}
//                 px={2}
//                 variant="gradient"
//                 bgColor="info"
//                 borderRadius="lg"
//                 coloredShadow="info"
//               >
//                 <MDTypography variant="h6" color="white">
//                   Assigned Workouts
//                 </MDTypography>
//                 <Button variant="outlined" component={Link} to="/addassignment" color="inherit"  style={{ position: 'absolute', top: -7, right: 20 }}>
//                     Assign a Workout
//                   </Button>
//               </MDBox>
//               <MDBox pt={3}>
//                 <TableContainer component={Card}>
//                   <Table>
//                     <TableBody>
//                     {rows.map((row, index) => (
//                       <Accordion key={index}>
//                           <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                             <TableCell style={{ fontWeight: 'bold'}}>{row.date}</TableCell>
//                           </AccordionSummary>
//                           <AccordionDetails>
//                             <TableContainer>
//                               <Table>
//                                 <TableBody>
//                                   <TableRow>
//                                     <TableCell>Assigned Workout: {row.workout_name}</TableCell>
//                                   </TableRow>
//                                   <TableRow>
//                                     <TableCell>Assigned to: {row.player_ids}</TableCell>
//                                   </TableRow>
//                                   <TableRow>
//                                     <TableCell>Notes: {row.notes}</TableCell>
//                                   </TableRow>
//                                   <TableRow>
//                                     <TableCell>
//                                       <MDTypography variant="body2">
//                                         <a href={`/savedworkouts/${index}`}>
//                                           View
//                                         </a>
//                                       </MDTypography>
//                                     </TableCell>
//                                   </TableRow>
//                                 </TableBody>
//                               </Table>
//                             </TableContainer>
//                           </AccordionDetails>
//                         </Accordion>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </MDBox>
//             </Card>
//           </Grid>
//         </Grid>
//       </MDBox>
//       <Footer />
//     </DashboardLayout>
//   );
// }
//   export default Tables;

// split into three tables: Today, Upcoming, &
function Tables() {
  const { columns, rows } = Data();
  console.log("Rows data:", rows);
  // Map over the rows and convert the date to a string if it's a React element
  const formattedRows = rows.map((row) => {
    // If the date is a React element, extract its content
    const date = typeof row.date === "object" ? row.date.props.children : row.date;
    // If the date is in a different format, convert it to 'YYYY-MM-DD'
    const formattedDate = new Date(date).toISOString().split("T")[0];
    // Return the row with the formatted date
    return { ...row, date: formattedDate };
  });

  console.log("Formatted rows:", formattedRows);

  const today = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD' format

  const assignedToday = formattedRows.filter((row) => row.date === today);
  const upcomingAssignments = formattedRows.filter((row) => row.date > today);
  const pastAssignments = formattedRows.filter((row) => row.date < today);

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Assigned Workouts Library" />
      <MDBox pt={6} pb={3}>
        {/* Assigned Today Table */}
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="primary"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Assigned Today
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer component={Card}>
                  <Table>
                    <TableBody>
                      {assignedToday.map((row, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <TableCell style={{ fontWeight: "bold" }}>{row.date}</TableCell>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableContainer>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Assigned Workout: {row.workout_name}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Assigned to: {row.player_ids}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Notes: {row.notes}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <MDTypography variant="body2">
                                        <Link to={`/savedworkouts/${index}`}>View</Link>
                                      </MDTypography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Upcoming Assignments Table */}
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Upcoming Assignments
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer component={Card}>
                  <Table>
                    <TableBody>
                      {upcomingAssignments.map((row, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <TableCell style={{ fontWeight: "bold" }}>{row.date}</TableCell>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableContainer>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Assigned Workout: {row.workout_name}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Assigned to: {row.player_ids}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Notes: {row.notes}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <MDTypography variant="body2">
                                        <Link to={`/savedworkouts/${index}`}>View</Link>
                                      </MDTypography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Past Assignments Table */}
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="secondary"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Past Assignments
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer component={Card}>
                  <Table>
                    <TableBody>
                      {pastAssignments.map((row, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <TableCell style={{ fontWeight: "bold" }}>{row.date}</TableCell>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableContainer>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Assigned Workout: {row.workout_name}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Assigned to: {row.player_ids}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Notes: {row.notes}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <MDTypography variant="body2">
                                        <Link to={`/savedworkouts/${index}`}>View</Link>
                                      </MDTypography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
