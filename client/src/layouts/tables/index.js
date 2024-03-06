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
import MDButton from "components/MDButton";

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
  Box,
  Typography,
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
  const { columns: gColumns, rows: gRows } = groupsTableData();
  const [teamName, setTeamName] = useState(""); // State to hold the team name
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
        console.error("Error fetching team data:", error);
      }
    };

    fetchTeamData(); // Call fetchTeamData on component mount
  }, [user]); // Run only when user changes
//STOP UNDO
  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle={teamName || "Team"} />
      <Box mb={3}>
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
              Players
            </Typography>
          </Box>
        </Card>
      </Box>
      
      
        <Grid container spacing={6} sx={{ marginBottom: 5 }}>
          <Grid item xs={12}>
            
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />

            </Grid>
          </Grid>

      <Box mb={3} sx={{ marginTop: 12 }}> 
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
              Groups
            </Typography>
          </Box>
        </Card>
      </Box>
      <Grid container spacing={1} sx={{ marginBottom: 5 }}>
        {gRows.map((row, index) => (
          <Grid item xs={12} key={index}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography sx={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "0.9rem" }}>
                  {row.name}
                </Typography>
                </AccordionSummary>
              <AccordionDetails sx={{ marginTop: 2, marginBottom: 2 }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell align="left" style={{ fontWeight: "bold" }}>Players In This Group:</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="left">{row.players}</TableCell>
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
