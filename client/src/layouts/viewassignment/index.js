import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { supabase } from "../../supabaseClient";
import React, { useState } from "react";
import {
  Box,
  Button,
  Icon,
  Typography,
  Paper,
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
import { toast } from "react-toastify";
// import { Link } from "react-router-dom";
// import Button from "@mui/material/Button"; // Import Button component
// import { useState, useEffect } from "react";
// import PropTypes from "prop-types";

function formatDate(dateString) {
  const date = new Date(dateString);
  // Adding a day to the date
  date.setDate(date.getDate() + 1);
  const options = { weekday: "long", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function Tables() {
  const { columns, rows } = Data();
  const [assignments, setAssignments] = useState([]);
  // Map over the rows and convert the date to a string if it's a React element
  const formattedRows = rows.map((row) => {
    // If the date is a React element, extract its content
    const date = typeof row.date === "object" ? row.date.props.children : row.date;
    // If the date is in a different format, convert it to 'YYYY-MM-DD'
    const formattedDate = new Date(date).toISOString().split("T")[0];
    // Return the row with the formatted date
    return { ...row, date: formattedDate };
  });
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayString = `${year}-${month}-${day}`;
  const assignedToday = formattedRows.filter((row) => row.date === todayString);
  const upcomingAssignments = formattedRows.filter((row) => row.date > todayString);
  const pastAssignments = formattedRows.filter((row) => row.date < todayString);

  const handleDeleteAssignment = async (assignmentId) => {
    if (!assignmentId) {
      console.error("Invalid assignmentId:", assignmentId);
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
    if (confirmDelete) {
      try {
        const { error } = await supabase.from("assignment").delete().eq("id", assignmentId);
        if (error) {
          throw error;
        }
        setAssignments((prevAssignments) =>
          prevAssignments.filter((assignment) => assignment.id !== assignmentId)
        );
        toast.success("Assignment deleted successfully!", {
          autoClose: 2000,
          onClose: () => {
            window.location.reload();
          },
        });
      } catch (error) {
        console.error("Error deleting workout:", error.message);
        toast.error("Error deleting workout");
      }
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Assigned Workouts Library" />

      {/* Assigned Today Table */}
      <Box mt={4}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            backgroundImage: "linear-gradient(to right, #1976d2, #6ab7ff)",
            color: "white",
          }}
        >
          <Box
            p={2}
            sx={{
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Assigned Today
            </Typography>
          </Box>
        </Card>
      </Box>
      {/* <Grid container spacing={1} justifyContent="center"> */}
      {assignedToday.length === 0 ? (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            <Typography variant="subtitle1" fontSize="15px">
              No Assigned Workouts Today
            </Typography>
          </Box>
        </Grid>
      ) : (
        assignedToday.map((row, index) => (
          <Grid item xs={12} key={index}>
            {/* Accordion for each group */}
          </Grid>
        ))
      )}
      {/* </Grid> */}
      <Grid container spacing={1} sx={{ marginBottom: 5 }}>
        {assignedToday.map((row, index) => (
          <Grid item xs={12} key={index}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {formatDate(row.date)} -{" "}
                </Typography>
                <Typography sx={{ flexGrow: 1 }}>{row.workout_name}</Typography>
                <Button color="error" onClick={() => handleDeleteAssignment(row.id.props.children)}>
                  <Icon>delete</Icon>
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell align="left" style={{ fontWeight: "bold" }}>
                          Assigned to:
                        </TableCell>
                        <TableCell align="left" style={{ fontWeight: "bold" }}>
                          Notes:
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="left">{row.player_ids}</TableCell>
                        <TableCell align="left">{row.notes}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      {/* Upcoming Assignments Table */}
      <Box>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            backgroundImage: "linear-gradient(to right, #1976d2, #6ab7ff)",
            color: "white",
          }}
        >
          <Box
            p={2}
            sx={{
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Upcoming Assignments
            </Typography>
          </Box>
        </Card>
      </Box>
      {/* <Grid container spacing={1} justifyContent="center"> */}
      {upcomingAssignments.length === 0 ? (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            <Typography variant="subtitle1" fontSize="15px">
              No Upcoming Assigned Workouts
            </Typography>
          </Box>
        </Grid>
      ) : (
        upcomingAssignments.map((row, index) => (
          <Grid item xs={12} key={index}>
            {/* Accordion for each group */}
          </Grid>
        ))
      )}
      {/* </Grid> */}
      <Grid container spacing={1} sx={{ marginBottom: 5 }}>
        {upcomingAssignments.map((upcomingAssignment, index) => (
          <Grid item xs={12} key={index}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {formatDate(upcomingAssignment.date)} -
                </Typography>
                <Typography sx={{ flexGrow: 1 }}>{upcomingAssignment.workout_name}</Typography>
                <Button
                  color="error"
                  onClick={() => handleDeleteAssignment(upcomingAssignment.id.props.children)}
                >
                  <Icon>delete</Icon>
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell align="left" style={{ fontWeight: "bold" }}>
                          Assigned to:
                        </TableCell>
                        <TableCell align="left" style={{ fontWeight: "bold" }}>
                          Notes:
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="left">{upcomingAssignment.player_ids}</TableCell>
                        <TableCell align="left">{upcomingAssignment.notes}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      {/* Past Assignments Table */}
      <Box>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            backgroundImage: "linear-gradient(to right, #1976d2, #6ab7ff)",
            color: "white",
          }}
        >
          <Box
            p={2}
            sx={{
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Past Assignments
            </Typography>
          </Box>
        </Card>
      </Box>
      {/* <Grid container spacing={1} justifyContent="center"> */}
      {pastAssignments.length === 0 ? (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            <Typography variant="subtitle1" fontSize="15px">
              No Past Assigned Workouts
            </Typography>
          </Box>
        </Grid>
      ) : (
        pastAssignments.map((row, index) => (
          <Grid item xs={12} key={index}>
            {/* Accordion for each group */}
          </Grid>
        ))
      )}
      {/* </Grid> */}
      <Grid container spacing={1} sx={{ marginBottom: 5 }}>
        {pastAssignments.map((pastAssignment, index) => (
          <Grid item xs={12} key={index}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ display: "flex" }}>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {formatDate(pastAssignment.date)} -
                </Typography>
                <Typography sx={{ flexGrow: 1 }}>{pastAssignment.workout_name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell align="left" style={{ fontWeight: "bold" }}>
                          Assigned to:
                        </TableCell>
                        <TableCell align="left" style={{ fontWeight: "bold" }}>
                          Notes:
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="left">{pastAssignment.player_ids}</TableCell>
                        <TableCell align="left">{pastAssignment.notes}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
