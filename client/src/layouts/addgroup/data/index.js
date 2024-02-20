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
    setGroupName(newName);
    setIsDuplicate(!!existingGroup);
  };

  const handleCreateGroup = () => {
    if (!isDuplicate) {
      // Logic to create a new group goes here
    }
  };

  const handleTryNewName = () => {
    setGroupName("");
    setIsDuplicate(false);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profile")
          .select("*");
        if (profilesError) throw profilesError;
        setProfiles(profilesData);

        // Fetch memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from("team_group_membership")
          .select("*");
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

  //   const handleAddExercise = () => {
  //     setExerciseCount((prevCount) => prevCount + 1);
  //     setSelectedExercises((prevSelectedExercises) => [
  //       ...prevSelectedExercises,
  //       { reps: "", sets: "", duration: "", notes: "" },
  //     ]);
  //   };

  //   const handleRemoveExercise = () => {
  //     setExerciseCount((prevCount) => Math.max(1, prevCount - 1)); // Ensure exercise count doesn't go below 1
  //     setSelectedExercises((prevSelectedExercises) => {
  //       const newSelectedExercises = [...prevSelectedExercises];
  //       newSelectedExercises.pop(); // Remove the last exercise
  //       return newSelectedExercises;
  //     });
  //   };

  //   const handleSubmit = async () => {
  //     const workoutData = {
  //       workout_name: document.getElementById("workout-name").value,
  //     };
  //     try {
  //       // Insert the workout record
  //       const { data: workoutResult, error: workoutError } = await supabase
  //         .from("workout")
  //         .upsert([workoutData])
  //         .select();
  //       if (workoutError) {
  //         console.error("Error adding workout:", workoutError);
  //         // Handle the error here
  //       } else {
  //         console.log("Workout added successfully!");
  //         toast.success("Workout successfully created!", {
  //           autoClose: 2000,
  //           onClose: () => {
  //             navigate("/dashboard");
  //           },
  // });
  // }

  //       // Insert customized_exercise records
  //       const exerciseRecords = selectedExercises.map((exercise) => ({
  //         sets: exercise.sets === "" ? null : parseInt(exercise.sets, 10),
  //         reps: exercise.reps === "" ? null : parseInt(exercise.reps, 10),
  //         coach_notes: exercise.notes,
  //         workout_id: workoutResult[0].id, // Use the workout id from the result
  //         exercise_id: exercise.exerciseId,
  //         duration: exercise.duration === "" ? null : parseInt(exercise.duration, 10),
  //       }));

  //       const { data: exerciseResult, error: exerciseError } = await supabase
  //         .from("customized_exercise")
  //         .upsert(exerciseRecords)
  //         .select();
  //       if (exerciseError) {
  //         console.error("Error adding exercise records:", exerciseError);
  //         // Handle the error here
  //       } else {
  //         console.log("Exercise records added successfully!");
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //     // Your form submission logic here
  //     console.log("Workout Name:", workoutData);
  //     console.log("Selected Exercises:", selectedExercises);
  //   };

  return (
    <Card id="group-form">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h4" fontWeight="medium">
          Create Group
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <TextField
            id="group-name"
            label="Group Name"
            variant="outlined"
            value={groupName}
            onChange={handleGroupNameChange}
            sx={{ width: "30%" }}
          />
          <Dialog open={isDuplicate} onClose={handleTryNewName}>
            <DialogTitle>{`${groupName} group already exists`}</DialogTitle>
            <DialogContent>
              <p>
                A group with the name &quot;{groupName}&quot; already exists. Please try a different
                name.
              </p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleTryNewName} color="primary">
                Try a New Name
              </Button>
            </DialogActions>
          </Dialog>
        </MDBox>
      </MDBox>

      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <FormControl fullWidth>
            <Autocomplete
              multiple
              id="player-names"
              options={profiles
                .filter((profile) => profile.first_name && profile.last_name)
                .map((profile) => `${profile.first_name} ${profile.last_name}`)}
              renderInput={(params) => (
                <TextField {...params} label="Search for players here" placeholder="Assign to:" />
              )}
              onChange={(event, newValue) => setSelectedPlayers(newValue)}
            />
          </FormControl>
        </MDBox>
      </MDBox>
      <br></br>
      <MDBox px={2} pb={2}>
        <Button variant="contained" color="primary">
          {/* onClick={handleSubmit} */}
          <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
            Create Group
          </MDTypography>
        </Button>
      </MDBox>
    </Card>
  );
}
export default AddGroup;
