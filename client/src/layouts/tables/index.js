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
import { useEffect, useState } from "react";


// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton"

import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Button from "@mui/material/Button"; // Import Button component
import { supabase } from "../../supabaseClient";

//for group component
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
import { Link } from "react-router-dom";
import Icon from "@mui/material/Icon";
import { fetchUserProfile } from "../../fetchUserProfile";


// Data
import playersTableData from "layouts/tables/data/playersTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import groupsTableData from "layouts/grouptable/data/groupsTableData";
import { fetchTeamInfo } from "../../fetchTeamInfo";

function Tables() {
  const { columns, rows } = playersTableData();
  // const { columns: pColumns, rows: pRows } = projectsTableData();
  const { columns: gColumns, rows: gRows} = groupsTableData();
  const [teamName, setTeamName] = useState(''); // State to hold the team name
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserProfile();
      setUser(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        if (user) {
          const teamData = await fetchTeamInfo(user); // Fetch team data with user info
          setTeamName(teamData.name); // Update team name in state
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    fetchTeamData(); // Call fetchTeamData on component mount
  }, [user]); // Run only when user changes

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle={teamName || 'Team'} />
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
                  Players
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
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
                {/* Add Create Group button */}
                <MDButton
                  variant="outlined"
                  component={Link}
                  to="/addgroup"
                  style={{ position: "absolute", top: -7, right: 40, backgroundColor: 'rgba(255, 255, 255, 0.5)',color: 'rgba(0, 0, 0, 0.6)' }}
                >
                  Add Group
                </MDButton>
              </MDBox>
              <MDBox pt={1}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {gRows.map((row, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            {/* this is the row text that is showing on the table */}
                            <TableCell style={{ paddingRight: 700, fontWeight: "bold" }}>
                              {row.name}
                            </TableCell>

                            <TableCell>{row.actions}</TableCell>

                            {/* <TableCell align="right">
                                  <Button color="dark" component={Link} to={`/addgroup/${row.id}`} onClick={() => console.log("ID:", row.groupID)}>
                                    <Icon>edit</Icon>&nbsp;edit
                                  </Button>
                                </TableCell> */}
                          </AccordionSummary>
                          <AccordionDetails>
                            {/* <TableRow>
                                {gColumns.map((column, index) => (
                                  <TableCell style={{ fontWeight: "bold" }} key={index}>{column.Header}</TableCell>
                                ))}
                              </TableRow> */}
                            <TableRow>
                              <TableCell style={{ fontWeight: "lighter" }}>{row.players}</TableCell>
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
          {/* <Grid item xs={12}>
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
                  Projects Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid> */}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
