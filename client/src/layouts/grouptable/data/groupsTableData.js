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

// for edit button
import { Link, useNavigate } from "react-router-dom"; // Import Link component
import { fetchUserProfile } from "../../../fetchUserProfile";


export default function data() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserProfile();
      setUser(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      getGroups(); // Call getProfiles when user changes
      console.log("user info: ", user)
    }
  }, [user]); // Add user as a dependency



  async function getGroups() {
    try {
      if (!user) {
        return; // Exit early if user is null
      }
      const { data: profilesData, error: profilesError } = await supabase
        .from("profile")
        .select("*")
        // .eq("team_id", user.team_id)
        // .eq("player", true)
      if (profilesError) throw profilesError;
      if (data != null) {
        setProfiles(profilesData);
      }
      // const { data: profilesData, error: profilesError } = await supabase
      //   .from("profile")
      //   .select("*");
      // if (profilesError) throw profilesError;

      const { data: membershipData, error: membershipError } = await supabase
        .from("team_group_membership")
        .select("*");
      if (membershipError) throw membershipError;

      const { data: teamData, error: teamError } = await supabase.from("team_group").select("*").eq("team_id", user.team_id)
      ;
      if (teamError) throw teamError;

      const groupsWithMembership = teamData
        .map((team) => {
          const groupMembers = membershipData.filter(
            (membership) => membership.team_group_id === team.id
          );
          const players = groupMembers.map((membership) => {
            const player = profilesData.find((profile) => profile.id === membership.player_user_id);

            return player;
          });
          return { ...team, players };
        })
        .filter((group) => group.players.length > 0);

      setGroups(groupsWithMembership);
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getGroups();
  }, []);

  const handleDeleteGroup = async (groupId) => {
    try {
      // Delete the group with the given ID
      await supabase.from("team_group").delete().eq("id", groupId);

      // Delete group memberships associated with the group
      await supabase.from("team_group_membership").delete().eq("team_group_id", groupId);

      // Filter out the deleted group from the state
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error deleting group:", error.message);
    }
  };

  return {
    columns: [
      // { Header: "Group Name", accessor: "name", width: "20%", align: "left" },
      { Header: "Players", accessor: "players", width: "80%", align: "left" },
    ],

    rows: groups.map((group) => ({
      name: (
        <MDBox display="flex" py={1} pr={2.8} pl={2}>
          {group.name}
        </MDBox>
      ),
      players: (
        <MDTypography variant="text" pr={4}>
          {group.players.map((player, index) => (
            <span key={player.id}>
              {player.first_name} {player.last_name}
              {index < group.players.length - 1 && ", "}
            </span>
          ))}
        </MDTypography>
      ),
      actions: (
        <MDBox display="flex">
          {/* <Link to={`/editgroup/${group.id}`} onClick={() => console.log("Group ID:", group.id)}>  */}
          <MDButton variant="text" color="dark" onClick={() => navigate(`/editgroup/${group.id}`)}>
            <Icon>edit</Icon>&nbsp;edit
          </MDButton>

          <MDButton variant="text" color="error" onClick={() => handleDeleteGroup(group.id)}>
            <Icon>delete</Icon>&nbsp;Delete
          </MDButton>
        </MDBox>
      ),
    })),
  };
}
