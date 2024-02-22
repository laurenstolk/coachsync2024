import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useParams } from 'react-router-dom';
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import FormControl from "@mui/material/FormControl";

function EditGroup() {
    const [profiles, setProfiles] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        async function fetchData() {
            try {
                if (id) {
                    // Fetch group data based on the provided ID
                    const { data: groupData, error: groupError } = await supabase
                        .from("team_group")
                        .select("*")
                        .eq("id", id)
                        .single();

                    if (groupError) throw groupError;

                    // Set the group name
                    setGroupName(groupData.name);

                    // Fetch memberships for this group
                    const { data: membershipData, error: membershipError } = await supabase
                        .from("team_group_membership")
                        .select("player_user_id")
                        .eq("team_group_id", id);

                    if (membershipError) throw membershipError;

                    // Set the selected players
                    setSelectedPlayers(membershipData.map(membership => membership.player_user_id));
                }

                // Fetch profiles
                const { data: profilesData, error: profilesError } = await supabase.from("profile").select("*");
                if (profilesError) throw profilesError;
                setProfiles(profilesData);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchData();
    }, [id]);

    const handleGroupNameChange = (event) => {
        setGroupName(event.target.value);
    };

    const handleCreateGroup = async () => {
        // Your logic for updating the group goes here
    };

    return (
        <Card id="group-form">
            <MDBox pt={3} px={2}>
                <MDTypography variant="h4" fontWeight="medium">
                    Edit Group
                </MDTypography>
            </MDBox>

            <MDBox pt={1} pb={2} px={2}>
                <TextField
                    id="group-name"
                    label="Group Name"
                    variant="outlined"
                    value={groupName}
                    onChange={handleGroupNameChange}
                    sx={{ width: '30%' }}
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
                                .map((profile) => ({ id: profile.id, name: `${profile.first_name} ${profile.last_name}` }))
                            }
                            getOptionLabel={(option) => option.name} // Use option.name as the display value
                            onChange={(event, newValue) => setSelectedPlayers(newValue.map(player => player.id))} // Map selected options to their IDs
                            value={selectedPlayers.map(playerId => profiles.find(profile => profile.id === playerId))}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Assigned Players"
                                    placeholder="Assign to:"
                                />
                            )}
                        />
                    </FormControl>
                </MDBox>
            </MDBox>

            <br></br>
            <MDBox px={2} pb={2}>
                <Button variant="contained" color="primary" onClick={handleCreateGroup}>
                    <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
                        Save Changes
                    </MDTypography>
                </Button>
            </MDBox>
        </Card>
    );
}

export default EditGroup;
