import * as React from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import PropTypes from "prop-types"; // Import PropTypes
import { fetchUserProfile } from "../../../fetchUserProfile";

export default function IndeterminateCheckbox({ onSelectPlayers }) {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserProfile();
      setUser(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      getGroups();
      console.log("user info: ", user);
    }
  }, [user]); // Add user as a dependency

  async function getGroups() {
    try {
      if (!user) {
        return; // Exit early if user is null
      }
      const { data: teamGroups, error } = await supabase
        .from("team_group")
        .select("*")
        .eq("team_id", user.team_id);
      if (error) throw error;

      const { data: teamMemberships, error: membershipsError } = await supabase
        .from("team_group_membership")
        .select("*");
      if (membershipsError) throw membershipsError;

      const { data: profiles, error: profilesError } = await supabase
        .from("profile")
        .select("*")
        .eq("team_id", user.team_id)
        .eq("player", true);
      if (profilesError) throw profilesError;

      const formattedGroups = teamGroups.map((teamGroup) => {
        const groupMemberships = teamMemberships.filter(
          (membership) => membership.team_group_id === teamGroup.id
        );
        const members = groupMemberships.map((membership) =>
          profiles.find((profile) => profile.id === membership.player_user_id)
        );
        return { ...teamGroup, members };
      });

      setGroups(formattedGroups);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }
  useEffect(() => {
    getGroups();
  }, []);

  const handleGroupChange = (event, groupIndex) => {
    const newGroups = [...groups];
    const newCheckedState = event.target.checked;
    newGroups[groupIndex].members = newGroups[groupIndex].members.map((member) => ({
      ...member,
      checked: newCheckedState,
    }));
    newGroups[groupIndex].checked = newCheckedState; // Update group checkbox state
    setGroups(newGroups);

    // Pass the selected players to the parent component
    const selectedPlayers = newGroups
      .flatMap((group) => group.members)
      .filter((member) => member.checked)
      .map((member) => member.id);
    onSelectPlayers(selectedPlayers);
  };

  const handleMemberChange = (event, groupIndex, memberIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].members[memberIndex].checked = event.target.checked;
    // Check if all members of the group are checked
    const allChecked = newGroups[groupIndex].members.every((member) => member.checked);
    // Update group checkbox state
    newGroups[groupIndex].checked = allChecked;
    setGroups(newGroups);

    // Pass the selected players to the parent component
    const selectedPlayers = newGroups
      .flatMap((group) => group.members)
      .filter((member) => member.checked)
      .map((member) => member.id);
    onSelectPlayers(selectedPlayers);
  };

  return (
    <div>
      {groups.map((group, groupIndex) => (
        <div key={group.id}>
          <FormControlLabel
            label={group.name}
            control={
              <Checkbox
                checked={group.checked || false}
                onChange={(event) => handleGroupChange(event, groupIndex)}
              />
            }
          />
          <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
            {group.members.map((member, memberIndex) => (
              <FormControlLabel
                key={member.id}
                label={`${member.first_name} ${member.last_name}`}
                control={
                  <Checkbox
                    checked={member.checked || false}
                    onChange={(event) => handleMemberChange(event, groupIndex, memberIndex)}
                  />
                }
              />
            ))}
          </Box>
        </div>
      ))}
    </div>
  );
}

IndeterminateCheckbox.propTypes = {
  onSelectPlayers: PropTypes.func.isRequired,
};
