import { useEffect, useState } from "react";

import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDProgress from "components/MDProgress";
import MDButton from "components/MDButton";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

//accordian table stuff
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

// Add supabase connection
import { supabase } from "../../../supabaseClient";

export default function data() {
  const [groups, setGroups] = useState([]);
  async function getGroups() {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profile")
        .select("*");
      if (profilesError) throw profilesError;

      const { data: membershipData, error: membershipError } = await supabase
        .from("team_group_membership")
        .select("*");
      if (membershipError) throw membershipError;

      const { data: teamData, error: teamError } = await supabase.from("team_group").select("*");
      if (teamError) throw teamError;

      const groupsWithMembership = profilesData.map((profile) => {
        const membership = membershipData.find(
          (membership) => membership.player_user_id === profile.id
        );
        if (membership) {
          const team = teamData.find((team) => team.id === membership.team_group_id);
          return { ...profile, membership, team };
        }
        return profile;
      });
      setGroups(groupsWithMembership);
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getGroups();
  }, []);

  return {
    columns: [
      { Header: "First Name", accessor: "first", width: "20%", align: "left" },
      { Header: "Last Name", accessor: "last", width: "20%", align: "left" },
      { Header: "Position", accessor: "position", width: "40%", align: "left" },
      // { Header: "Group", accessor: "group", width: "40%", align: "left" }, // New column for group name
      // { Header: "Edit", accessor: "edit", width: "10%", align: "right" },
      // { Header: "Delete", accessor: "delete", width: "10%", align: "right" },
    ],

    rows: groups
      .filter((group) => group.team && group.team.name) // Filter out rows with empty first or last name
      .map((group) => ({
        first: (
          <MDBox display="flex" py={1} pr={2.8} pl={2}>
            {group.first_name}
          </MDBox>
        ),
        last: (
          <MDBox display="flex" py={1} pr={2.8}>
            {group.last_name}
          </MDBox>
        ),
        position: (
          <MDTypography variant="text" pr={50}>
            {group.position}
          </MDTypography>
        ),
        group: (
          <MDTypography variant="primary" fontWeight="medium">
            {group.team ? group.team.name : ""} {/* Display group name if available */}
          </MDTypography>
        ),
        edit: (
          <MDBox>
            <MDButton variant="text" color="dark" pr={4}>
              <Icon>edit</Icon>&nbsp;edit
            </MDButton>
          </MDBox>
        ),
        delete: (
          <MDBox mr={1}>
            <MDButton variant="text" color="error" pr={4}>
              <Icon>delete</Icon>&nbsp;delete
            </MDButton>
          </MDBox>
        ),
      })),
  };
}
