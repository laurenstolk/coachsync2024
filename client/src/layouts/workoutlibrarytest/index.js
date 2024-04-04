/**
 =========================================================
 * Material Dashboard 2 React - v2.2.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-react
 * Copyright 2023 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Button from "@mui/material/Button"; // Import Button component
import { useState } from "react"; // Import useState hook

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "examples/Tables/DataTable";
import { Link } from "react-router-dom";
import Icon from "@mui/material/Icon";

// Data
import workoutDetailsData from "layouts/workoutlibrarytest/workoutDetails/workoutDetailsData";

function Tables() {
  const { columns, rows } = workoutDetailsData();

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Saved Workouts" />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={4}>
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
                  Saved Workouts
                </MDTypography>
                {/* Add Workout button */}
                <Button
                  variant="outlined"
                  component={Link}
                  to="/addworkout"
                  color="inherit"
                  style={{ position: "absolute", top: -7, right: 20 }}
                >
                  Add Workout
                </Button>
              </MDBox>
              <MDBox pt={1}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {rows.map((row, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            {/* this is the row text that is showing on the table */}
                            <TableCell style={{ paddingRight: 700 }}>{row.workout}</TableCell>
                            <TableCell align="right">
                            </TableCell>
                            <TableCell align="right">
                              <Button color="error" onClick={() => handleDelete(row)}>
                                <Icon>delete</Icon>&nbsp;delete
                              </Button>
                            </TableCell>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableHead>
                              <TableRow>
                                {columns.map((column, index) => (
                                  <TableCell key={index}>{column.Header}</TableCell> // the column header
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableRow>
                              <TableCell style={{ paddingRight: 20 }}>{row.first}</TableCell>
                              <TableCell style={{ paddingRight: 20 }}>{row.last}</TableCell>
                              <TableCell style={{ paddingRight: 20 }}>{row.position}</TableCell>
                            </TableRow>
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
