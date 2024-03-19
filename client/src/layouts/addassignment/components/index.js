import * as React from "react";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import { supabase } from "../../../supabaseClient";
import DateCalendarValue from "./calendar";
import IndeterminateCheckbox from "../components/checkboxList";

import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { useParams } from "react-router-dom";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "../../../fetchUserProfile";

function AddAssignment() {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const [workoutCount, setWorkoutCount] = useState(3);
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [selectAllPlayers, setSelectAllPlayers] = useState(false); // New state for "All Players" checkbox
  const [showPastDateError, setShowPastDateError] = useState(false); // State to control error message display
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); // State to hold error message

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
      const { data: workoutsData, error } = await supabase.from("workout").select("*");
      if (error) {
        throw error;
      }
      // Sort workouts by workout name
      workoutsData.sort((a, b) => a.workout_name.localeCompare(b.workout_name));

      setWorkouts(workoutsData || []);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profile")
        .select("*")
        .eq("team_id", user.team_id)
        .eq("player", true)
        .not("first_name", "is", null)
        .not("last_name", "is", null);
      if (profilesError) {
        throw profilesError;
      }
      setProfiles(profilesData || []);

      if (workoutId) {
        const selected = workoutsData.find((workout) => workout.id === parseInt(workoutId));
        if (selected) {
          setSelectedWorkout(selected);
          setWorkoutName(selected.workout_name);
        }
      }

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 1);
      if (!selectedDate || selectedDate >= currentDate) {
        setShowPastDateError(false);
        console.log("Selected Date:", selectedDate);
      } else {
        setShowPastDateError(true);
        setSelectedDate(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }
  useEffect(() => {
    getGroups();
  }, [workoutId, selectedDate]);

  const handleDeleteWorkout = async (workoutIdToDelete) => {
    try {
      const { error } = await supabase.from("workout").delete().eq("id", workoutIdToDelete);
      if (error) {
        throw error;
      }
      setWorkouts((prevWorkouts) =>
        prevWorkouts.filter((workout) => workout.id !== workoutIdToDelete)
      );
      toast.success("Workout deleted successfully!");
    } catch (error) {
      console.error("Error deleting workout:", error.message);
    }
  };

  const handleAssignWorkout = async () => {
    // Data validation logic
    if (!selectedWorkout) {
      setError("Workout name cannot be empty");
      return; // Prevent submission if workout name is empty
    }

    // Check if at least one exercise is selected
    if (!selectedDate) {
      setError("Please select a date");
      return; // Prevent submission if no exercise is selected
    }

    console.log("Selected Players Length:", selectedPlayers.length); // Log selected players length for debugging
    if (selectedPlayers.length === 0) {
      setError("Please select at least one player");
      return; // Prevent submission if no player is selected
    }

    // Clear error if data is valid
    setError("");

    try {
      // Insert assignment records for selected players
      const assignments = selectedPlayers.map((playerId) => ({
        workout_id: selectedWorkout.id,
        player_id: playerId,
        date: selectedDate,
        notes: workoutNotes, // You can set notes here
        completed: false, // Initialized as false
      }));

      const { data, error } = await supabase.from("assignment").insert(assignments);

      if (error) throw error;

      // Handle success with a toast notification and redirection
      toast.success("Workout assigned successfully!", {
        autoClose: 2000,
        onClose: () => {
          navigate("/viewassignment");
        },
      });
    } catch (error) {
      console.error("Error assigning workout:", error.message);
    }
  };
  const handleWorkoutChange = (event) => {
    const selectedWorkoutId = event.target.value;
    const selectedWorkout = workouts.find((workout) => workout.id === selectedWorkoutId);
    setSelectedWorkout(selectedWorkout);
    console.log("Selected Workout:", selectedWorkout);
  };
  //  Function to handle date selection
  // const handleDateChange = (newValue) => {
  //   setSelectedDate(newValue);
  //   console.log("Selected Date:", newValue);
  // };
  //  Function to handle date selection
  //  const handleDateChange = (newValue) => {
  //   if (newValue < new Date()) {
  //     // If selected date is in the past, show error message
  //     setShowPastDateError(true);
  //     setSelectedDate(null); // Reset selected date
  //   } else {
  //     setShowPastDateError(false); // Hide error message if date is valid
  //     setSelectedDate(newValue);
  //     console.log("Selected Date:", newValue);
  //   }
  // };

  const handleDateChange = (newValue) => {
    console.log("New value:", newValue);
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1); // Set currentDate to today - 1 day

    // If the selected date is before today or null, show error message
    if (!newValue || newValue >= currentDate) {
      setShowPastDateError(false);
      setSelectedDate(newValue);
      console.log("Selected Date:", newValue);
    } else {
      setShowPastDateError(true);
      setSelectedDate(null); // Reset selected date
    }
  };

  const handlePlayerSelection = (event, values) => {
    // Extract the IDs of selected players
    const selectedPlayerIds = values.map((player) => player.id);
    setSelectedPlayers(selectedPlayerIds); // Update the selectedPlayers state
    console.log("Selected Players info!:", selectedPlayerIds); // Log selected players for debugging
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

  const handleSelectAllPlayersChange = (event) => {
    const checked = event.target.checked;
    setSelectAllPlayers(checked);

    if (checked) {
      const allPlayerIds = profiles.map((profile) => profile.id);
      setSelectedPlayers(allPlayerIds);
    } else {
      setSelectedPlayers([]);
    }
  };

  return (
    <Card id="workout-form">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h4" fontWeight="medium">
          Assign Workout
        </MDTypography>
      </MDBox>

      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <FormControl fullWidth>
            <InputLabel>Workout Name</InputLabel>
            <Select
              sx={{ width: "50%", minHeight: "43px" }}
              label="Workout"
              variant="outlined"
              value={selectedWorkout ? selectedWorkout.id : ""} // Update the value to selectedWorkout.id
              onChange={handleWorkoutChange} // Update the change handler
              IconComponent={() => (
                <span style={{ fontSize: 24, marginLeft: -6 }}>
                  <ArrowDropDownIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
                </span>
              )}
            >
              {workouts.map((workout) => (
                <MenuItem key={workout.id} value={workout.id}>
                  {workout.workout_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>
      </MDBox>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {/* assigned on: (calendar) */}
          <MDBox pt={1} pb={2} px={2}>
            <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
              <MDTypography variant="h9">Assign On:</MDTypography>
              <DateCalendarValue value={selectedDate} onChange={handleDateChange} />
              {showPastDateError && (
                <MDTypography variant="caption" color="error">
                  Please select a valid future date.
                </MDTypography>
              )}
            </MDBox>
          </MDBox>
          {/* assignment notes: (textfield) */}
          <MDBox pt={1} pb={2} px={2}>
            <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
              <MDTypography variant="h9">Assignment Notes:</MDTypography>

              <br></br>
              <TextField
                id="filled-textarea"
                label="Assigned Workout Notes"
                multiline
                variant="filled"
                value={workoutNotes} // Set the value of the TextField to workoutNotes
                onChange={(event) => setWorkoutNotes(event.target.value)} // Update workoutNotes when the user types
              />
            </MDBox>
          </MDBox>
        </Grid>

        <Grid item xs={6}>
          {/* assigned to: (player list) */}
          <MDBox pt={1} pb={2} px={2}>
            <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
              <MDTypography variant="h9">Assign To:</MDTypography>
              <br></br>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox checked={selectAllPlayers} onChange={handleSelectAllPlayersChange} />
                  }
                  label="All Players"
                />
              </FormGroup>
            </MDBox>
            <br></br>
            {/* search players and be able to select multiple */}
            <MDBox>
              <Autocomplete
                multiple
                id="workout-id"
                options={profiles
                  .filter((profile) => profile.first_name && profile.last_name) // Filter out profiles with null first_name or last_name
                  .map((profile) => ({
                    id: profile.id,
                    name: `${profile.first_name} ${profile.last_name}`,
                  }))}
                getOptionLabel={(option) => option.name} // Display player names
                onChange={handlePlayerSelection} // Update selectedPlayers state with IDs
                renderInput={(params) => (
                  <TextField {...params} label="Search for players here" placeholder="Assign to:" />
                )}
              />
            </MDBox>
            <br></br>
            <MDBox>
              <MDTypography variant="body2" color="secondary">
                Groups:
              </MDTypography>
              <IndeterminateCheckbox
                onSelectPlayers={(players) => {
                  console.log("Selected Players:", players);
                  const selectedPlayerIds = players; // Assign the players array directly to selectedPlayerIds
                  console.log("Selected Player IDs:", selectedPlayerIds);
                  setSelectedPlayers(selectedPlayerIds);
                }}
                onChange={(event) =>
                  handlePlayerSelection(
                    event,
                    profiles.filter((profile) => profile.player)
                  )
                }
              />
              {/* <IndeterminateCheckbox onSelectPlayers={(players) => setSelectedPlayers(players)} /> */}
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
      <MDBox display="flex" justifyContent="flex-end" px={2} pb={2}>
        <Button variant="contained" color="primary" onClick={handleAssignWorkout}>
          <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
            Assign
          </MDTypography>
        </Button>
      </MDBox>
      {error && (
        <MDBox px={2} py={1}>
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        </MDBox>
      )}
    </Card>
  );
}
export default AddAssignment;
