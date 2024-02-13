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

// Data
import groupsTableData from "layouts/grouptable/data/groupsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";

function Tables() {
  const { columns, rows } = groupsTableData();

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Team Groups" />
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
                  Groups
                </MDTypography>
              </MDBox>
              <MDBox pt={1}>
                <TableContainer component={Paper}>
                  <Table>
                    {/* <TableHead>
                        <TableRow>
                        {columns.map((column, index) => (
                            <TableCell key={index}>{column.Header}</TableCell> // the column header
                        ))}
                        </TableRow>
                    </TableHead> */}
                    <TableBody>
                      {rows.map((row, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            {/* this is the row text that is showing on the table */}
                            <TableCell>{row.group}</TableCell>
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

                              <TableCell align="right">{row.edit}</TableCell>
                              <TableCell align="right">{row.delete}</TableCell>
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
