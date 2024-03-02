// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
// import { fetchUserProfile } from '../../../fetchUserProfile';
import { fetchUserProfile } from "../../../fetchUserProfile";

function AddGroup() {
  const [profiles, setProfiles] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      console.log("user info: ", user);
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
        .eq("team_id", user.team_id)
        .eq("player", true);
      if (profilesError) throw profilesError;
      if (profilesData != null) {
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

      const { data: teamData, error: teamError } = await supabase
        .from("team_group")
        .select("*")
        .eq("team_id", user.team_id);
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

  const handleGroupNameChange = (event) => {
    setGroupName(event.target.value.toLowerCase()); // Convert to lowercase
  };

  const handleCreateGroup = async () => {
    const groupName = document.getElementById("group-name").value.toLowerCase(); // Convert to lowercase
    try {
      // Check if the group name already exists
      const { data: existingGroups, error: existingGroupsError } = await supabase
        .from("team_group")
        .select("name")
        .eq("team_id", user.team_id);

      if (existingGroupsError) {
        console.error("Error checking existing groups:", existingGroupsError);
        // Handle the error here
        return;
      }

      // Check if the entered groupName already exists
      const groupNames = existingGroups.map((group) => group.name.toLowerCase());
      if (groupNames.includes(groupName)) {
        alert("Group name already exists.");
        // Handle the error here (e.g., display a message to the user)
        return;
      }
      // Query the profile table to find the coach's user ID
      const { data: coachProfile, error: coachError } = await supabase
        .from("profile")
        .select("id")
        .eq("team_id", user.team_id)
        .eq("player", false)
        .single();

      if (coachError) {
        console.error("Error retrieving coach information:", coachError);
        // Handle the error here
        return;
      }

      // Ensure that coachProfile is not null
      if (!coachProfile) {
        console.error("Coach information not found.");
        // Handle the error here
        return;
      }

      // Construct group data with the coach's user ID
      const groupData = {
        name: groupName,
        team_id: user.team_id,
        coach_user_id: coachProfile.id,
      };

      // Insert group data into the team_group table
      const { data: newGroup, error: groupError } = await supabase
        .from("team_group")
        .upsert([groupData])
        .select();

      if (groupError) {
        console.error("Error adding group:", groupError);
        // Handle the error here
        return;
      }

      console.log("Group added successfully:", newGroup);

      // Insert membership records for each selected player
      const membershipData = selectedPlayers.map((playerId) => ({
        player_user_id: playerId,
        team_group_id: newGroup[0].id, // Assuming the newly created group ID is available in newGroup[0].id
      }));

      const { error: membershipError } = await supabase
        .from("team_group_membership")
        .insert(membershipData);

      if (membershipError) {
        console.error("Error adding group membership:", membershipError);
        // Handle the error here
        return;
      }

      console.log("Group successfully created!");
      toast.success("Group successfully created!", {
        autoClose: 2000,
        onClose: () => {
          navigate("/tables");
        },
      });
    } catch (error) {
      console.error("Error:", error);
      // Handle the error here
    }
  };

  return (
    <Card id="group-form">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h4" fontWeight="medium">
          Create Group
        </MDTypography>
      </MDBox>

      <MDBox pt={1} pb={2} px={2}>
        <TextField
          id="group-name"
          label="Group Name"
          variant="outlined"
          value={groupName}
          onChange={handleGroupNameChange}
          sx={{ width: "30%" }}
        />
      </MDBox>

      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <FormControl fullWidth>
            <Autocomplete
              multiple
              id="player-names"
              options={profiles
                .filter((profile) => profile.first_name && profile.last_name)
                .map((profile) => ({
                  id: profile.id,
                  name: `${profile.first_name} ${profile.last_name}`,
                }))}
              getOptionLabel={(option) => option.name} // Use option.name as the display value
              onChange={(event, newValue) =>
                setSelectedPlayers(newValue.map((player) => player.id))
              } // Map selected options to their IDs
              renderInput={(params) => (
                <TextField {...params} label="Search for players here" placeholder="Assign to:" />
              )}
            />
          </FormControl>
        </MDBox>
      </MDBox>

      <br></br>
      <MDBox px={2} pb={2}>
        <Button variant="contained" color="primary" onClick={handleCreateGroup}>
          <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
            Create Group
          </MDTypography>
        </Button>
      </MDBox>
    </Card>
  );
}
export default AddGroup;
