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

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// STOP UNDO

import {
  Stack,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Data
import workoutsTableData from "layouts/tables/data/workoutsTableData";
import exerciseTable from "layouts/tables/data/exercisesTableData";

function Tables() {
  const { columns, rows } = workoutsTableData();
  const { eCols, eRows } = exerciseTable();
  //   const { columns: pColumns, rows: pRows } = projectsTableData();

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Saved Workouts" />
      <MDBox pt={3} pb={3}>
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
                  Saved Workouts
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer component={Paper}>
                  {/* <DataTable
                    table={{ columns, rows }} //these are being drawn from the workoutsTableData
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  /> */}
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ minWidth: "150px" }}>Name</TableCell>
                        <TableCell style={{ minWidth: "150px" }}>Exercises</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, rowIndex) => (
                        <Accordion key={rowIndex}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <TableCell style={{ minWidth: "150px" }}>{row.name}</TableCell>
                            <TableCell style={{ minWidth: "150px" }}>{row.exercises}</TableCell>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 2 }}>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                {/* <Avatar sx={{ bgcolor: "info.main" }}>{row.coach[0].toUpperCase()}</Avatar> */}
                                <Stack>
                                  <Typography variant="h6">{row.coach}</Typography>
                                  <Typography variant="caption">{row.date}</Typography>
                                </Stack>
                                <IconButton aria-label="more options">
                                  <Tooltip title="More options">
                                    <MoreVertIcon />
                                  </Tooltip>
                                </IconButton>
                              </Stack>
                              <MDTypography variant="body2" color="text.secondary">
                                {row.description}
                              </MDTypography>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Exercise</TableCell>
                                    <TableCell>Sets</TableCell>
                                    <TableCell>Reps</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell>Coach&apos;s Notes</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {eRows.map((exercise, exerciseIndex) => (
                                    <TableRow key={exerciseIndex}>
                                      <TableCell>{eRows.name}</TableCell>
                                      <TableCell>{eRows.sets}</TableCell>
                                      <TableCell>{eRows.reps}</TableCell>
                                      <TableCell>{eRows.duration}</TableCell>
                                      <TableCell>{eRows.notes}</TableCell>
                                    </TableRow>
                                  ))}
                                  {/*  <TableRow>
                                    <TableCell style={{ minWidth: "150px" }}>{row.name}</TableCell>
                                      <TableCell style={{ minWidth: "150px" }}>{row.exercises}</TableCell>
                                    </TableRow> */}
                                </TableBody>
                              </Table>
                            </Stack>
                            {/* <TableHead>
                              <TableRow>
                                {columns.map((column, colIndex) => (
                                  <TableCell key={colIndex}>{column.Header}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableRow>
                              <TableCell style={{ paddingRight: 20 }}>{row.name}</TableCell>
                              <TableCell style={{ paddingRight: 20 }}>{row.exercises}</TableCell>

                              <TableCell align="right">{row.edit}</TableCell>
                              <TableCell align="right">{row.delete}</TableCell>                     
                            </TableRow> */}
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
