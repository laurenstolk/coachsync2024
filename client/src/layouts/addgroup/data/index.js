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

function AddGroup() {
  const [profiles, setProfiles] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const { id } = useParams();

  const handleGroupNameChange = (event) => {
    const newName = event.target.value.trim(); // Trim whitespace
    const existingGroup = groups.find(
      (group) => group.name.toLowerCase() === newName.toLowerCase()
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
