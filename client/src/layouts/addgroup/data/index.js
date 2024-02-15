// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';


import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";


import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from 'react-router-dom';
// import { fetchUserProfile } from '../../../fetchUserProfile';



function AddGroup() {
    const [profiles, setProfiles] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const { id } = useParams();


    useEffect(() => {
        async function fetchData() {
            try {
                // //fetch user profile
                // const userProfile = await fetchUserProfile();
                // console.log("User Profile:", userProfile); // Add this console log
                // const currentUserTeamId = userProfile.team_id;

                // Fetch profiles
                const { data: profilesData, error: profilesError } = await supabase.from("profile").select("*");
                if (profilesError) throw profilesError;
                setProfiles(profilesData);

                // Fetch memberships
                const { data: membershipData, error: membershipError } = await supabase.from("team_group_membership").select("*");
                if (membershipError) throw membershipError;
                setMemberships(membershipData);

                // Fetch groups
                const { data: teamData, error: teamError } = await supabase.from("team_group").select("*");
                if (teamError) throw teamError;
                setGroups(teamData);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchData();
    }, []);

    const handleGroupNameChange = (event) => {
        setGroupName(event.target.value);
    };

    // const handleCreateGroup = async () => {
    //     if (groupName.trim() === '') {
    //         console.error('Group name cannot be empty');
    //         return;
    //     }
    //     console.log("Data being inserted:", {
    //         name: groupName,
    //         team_id: 6, // Update with your dynamic value
    //         coach_user_id: '7a67e500-aa25-4306-9d53-d204623ec00d' // Update with your dynamic value
    //     });
    
    //     if (selectedPlayers.length > 0) {
    //         try {
    //             // Insert a new group into the team_group table
    //             const { data: newGroup, error: groupError } = await supabase
    //                 .from("team_group")
    //                 .insert([{ 
    //                     name: groupName, 
    //                     // Update these values as needed
    //                     team_id: '6',
    //                     coach_user_id: '7a67e500-aa25-4306-9d53-d204623ec00d' 
    //                 }]);
    //                 console.log("new group data:", groupName);
    //             // Check for any errors during insertion
    //             if (groupError) {
    //                 console.error('Error inserting data:', groupError.message);
    //                 return;
    //             }
    
    //             console.log("New Group data:", newGroup);
    
    //             // Data insertion was successful
    //             // You can proceed with any additional logic here
    //         } catch (error) {
    //             console.error('Error:', error.message);
    //         }
    //     }
    // };
    const handleCreateGroup = async () => {
        const groupName = document.getElementById("group-name").value;
        const groupData = {
            name: groupName,
            team_id: 6, // Assuming team_id is a constant or retrieved from somewhere else
            coach_user_id: '7a67e500-aa25-4306-9d53-d204623ec00d', // Assuming coach_user_id is a constant or retrieved from somewhere else
        };
    
        try {
            // Insert group data into the team_group table
            const { data: newGroup, error: groupError } = await supabase.from("team_group").upsert([groupData]).select();
    
            if (groupError) {
                console.error("Error adding group:", groupError);
                // Handle the error here
                return;
            }
    
            console.log("Group added successfully:", newGroup);
    
             // Insert membership records for each selected player
            const membershipData = selectedPlayers.map(playerId => ({
                player_user_id: playerId,
                team_group_id: newGroup[0].id, // Assuming the newly created group ID is available in newGroup[0].id
            }));

            const { error: membershipError } = await supabase.from("team_group_membership").insert(membershipData);

            if (membershipError) {
                console.error("Error adding group membership:", membershipError);
                // Handle the error here
                return;
            }

            console.log("Group membership added successfully!");
            toast.success("Group and membership added successfully!", {
                autoClose: 2000,
                onClose: () => {
                    // Redirect to a relevant page
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
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search for players here"
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
                    Create Group
                </MDTypography>
            </Button>
            </MDBox>
        </Card>
    );
}
export default AddGroup;