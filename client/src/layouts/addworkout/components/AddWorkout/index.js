// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function AddWorkout() {
  const navigate = useNavigate();
  const [exerciseCount, setExerciseCount] = useState(3);
  const [exercises, setExercises] = useState([]);
  const [exercisesByCategory, setExercisesByCategory] = useState({});
  const [error, setError] = useState(""); // State to hold error message

  const [selectedExercises, setSelectedExercises] = useState(
    Array.from({ length: exerciseCount }, () => ({
      exerciseId: "",
      reps: "",
      sets: "",
      duration: "",
      notes: "",
    }))
  );
  const handleExerciseChange = (index, field, value) => {
    setSelectedExercises((prevSelectedExercises) => {
      const newSelectedExercises = [...prevSelectedExercises];
      newSelectedExercises[index][field] = value;
      return newSelectedExercises;
    });
  };

  async function getExercises() {
    try {
      const profileData = await fetchUserProfile();

      let { data: teamData, error } = await supabase
        .from("team")
        .select("*")
        .eq("id", profileData.team_id)
        .single();

      let { data: trainingExercisesData, error: trainingExercisesError } = await supabase
        .from("exercise")
        .select("*")
        .eq("category", "14")
        .eq("sport", teamData.sport_id);
      if (trainingExercisesError) throw error;

      let { data: otherExercisesData, error: otherExercisesError } = await supabase
        .from("exercise")
        .select("*")
        .not("category", "eq", "14");

      // Assuming trainingExercisesData and otherExercisesData are arrays
      let exerciseData = [...trainingExercisesData, ...otherExercisesData];

      let { data: categoryData, error: categoryError } = await supabase
        .from("category")
        .select("*");
      if (categoryError) throw categoryError;

      if (categoryData != null) {
        const categoryMap = {};
        categoryData.forEach((category) => {
          categoryMap[category.category_id] = category.category_name;
        });

        exerciseData.sort((a, b) => a.name.localeCompare(b.name));

        const exercisesGroupedByCategory = {};
        exerciseData.forEach((exercise) => {
          const categoryName = categoryMap[exercise.category];
          if (!exercisesGroupedByCategory[categoryName]) {
            exercisesGroupedByCategory[categoryName] = [];
          }
          exercisesGroupedByCategory[categoryName].push(exercise);
        });

        setExercises(exerciseData);
        setExercisesByCategory(exercisesGroupedByCategory);
      }
    } catch (error) {
      alert(error);
    }
  }
  useEffect(() => {
    getExercises();
  }, []);

  const handleAddExercise = () => {
    setExerciseCount((prevCount) => prevCount + 1);
    setSelectedExercises((prevSelectedExercises) => [
      ...prevSelectedExercises,
      { reps: "", sets: "", duration: "", notes: "" },
    ]);
  };

  const handleRemoveExercise = () => {
    setExerciseCount((prevCount) => Math.max(1, prevCount - 1)); // Ensure exercise count doesn't go below 1
    setSelectedExercises((prevSelectedExercises) => {
      const newSelectedExercises = [...prevSelectedExercises];
      newSelectedExercises.pop(); // Remove the last exercise
      return newSelectedExercises;
    });
  };

  const handleSubmit = async () => {
    // Data validation logic
    if (!document.getElementById("workout-name").value.trim()) {
      setError("Workout name cannot be empty");
      return; // Prevent submission if workout name is empty
    }

    // Check if at least one exercise is selected
    if (selectedExercises.length === 0) {
      setError("You must select at least one exercise to create a workout");
      return; // Prevent submission if no exercise is selected
    }

    // Check if each selected exercise has data in sets, reps, coach notes, or duration
    const hasMissingData = selectedExercises.some((exercise) => {
      return !(exercise.sets || exercise.reps || exercise.duration || exercise.notes);
    });

    if (hasMissingData) {
      setError("Please provide some information (sets, reps, duration, etc.) for the exercise(s)");
      return; // Prevent submission if any selected exercise is missing data
    }

    // Clear error if data is valid
    setError("");
    const workoutData = {
      workout_name: document.getElementById("workout-name").value,
    };
    try {
      // Insert the workout record
      const { data: workoutResult, error: workoutError } = await supabase
        .from("workout")
        .upsert([workoutData])
        .select();
      if (workoutError) {
        console.error("Error adding workout:", workoutError);
        // Handle the error here
      } else {
        toast.success("Workout successfully created!", {
          autoClose: 2000,
          onClose: () => {
            navigate("/workoutlibrary");
          },
        });
      }

      // Insert customized_exercise records
      const exerciseRecords = selectedExercises.map((exercise) => ({
        sets: exercise.sets === "" ? null : parseInt(exercise.sets, 10),
        reps: exercise.reps === "" ? null : parseInt(exercise.reps, 10),
        coach_notes: exercise.notes,
        workout_id: workoutResult[0].id, // Use the workout id from the result
        exercise_id: exercise.exerciseId,
        duration: exercise.duration === "" ? null : parseInt(exercise.duration, 10),
      }));

      const { data: exerciseResult, error: exerciseError } = await supabase
        .from("customized_exercise")
        .upsert(exerciseRecords)
        .select();
      if (exerciseError) {
        console.error("Error adding exercise records:", exerciseError);
        // Handle the error here
      } else {
      }
    } catch (error) {
      console.error("Error:", error);
    }
    // Your form submission logic here
  };

  return (
    <Card id="workout-form">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h4" fontWeight="medium">
          Add Workout
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <TextField
            id="workout-name"
            label="Workout Name"
            variant="outlined"
            sx={{ width: "50%" }}
          />
        </MDBox>
      </MDBox>

      {selectedExercises.map((exercise, index) => (
        <MDBox key={index} pt={1} pb={2} px={2}>
          <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
            <MDBox mb={2}>
              <FormControl sx={{ width: "50%" }}>
                <InputLabel>Exercise</InputLabel>
                <Select
                  sx={{ minHeight: "43px" }}
                  label="Exercise"
                  variant="outlined"
                  value={exercise.exerciseId} // Set value to exerciseId
                  onChange={(event) =>
                    handleExerciseChange(index, "exerciseId", event.target.value)
                  }
                  IconComponent={() => (
                    <span style={{ fontSize: 24, marginLeft: -5 }}>
                      <ArrowDropDownIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    </span>
                  )}
                >
                  {Object.entries(exercisesByCategory).map(([category, exercises]) => [
                    <MenuItem
                      key={category}
                      disabled
                      style={{
                        color: "blueviolet",
                        fontWeight: "bold",
                        backgroundColor: "lightgray",
                      }}
                    >
                      {category}
                    </MenuItem>,
                    exercises.map((exercise) => (
                      <MenuItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </MenuItem>
                    )),
                  ])}
                </Select>
              </FormControl>
            </MDBox>
          </MDBox>
          <MDBox
            component="ul"
            display="flex"
            flexDirection="row"
            justifyContent="right"
            p={0}
            m={0}
          >
            <MDBox mb={2} mr={2}>
              <TextField
                label="Sets"
                variant="outlined"
                value={exercise.sets}
                onChange={(event) => handleExerciseChange(index, "sets", event.target.value)}
              />
            </MDBox>
            <MDBox mb={2} mr={2}>
              <TextField
                label="Reps"
                variant="outlined"
                value={exercise.reps}
                onChange={(event) => handleExerciseChange(index, "reps", event.target.value)}
              />
            </MDBox>
            <MDBox mb={2} mr={2}>
              <TextField
                label="Duration"
                variant="outlined"
                value={exercise.duration}
                onChange={(event) => handleExerciseChange(index, "duration", event.target.value)}
              />
            </MDBox>
            <MDBox mb={2} mr={2}>
              <TextField
                label="Notes"
                variant="outlined"
                value={exercise.notes}
                onChange={(event) => handleExerciseChange(index, "notes", event.target.value)}
              />
            </MDBox>
          </MDBox>
        </MDBox>
      ))}

      <MDBox
        px={2}
        pb={2}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          cursor: "pointer",
        }}
      >
        <div onClick={handleAddExercise}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <AddCircleIcon sx={{ fontSize: 50, color: "#1976D2", marginRight: 1 }} />
            <MDTypography variant="body2" color="textSecondary">
              Add Exercise
            </MDTypography>
          </span>
        </div>
      </MDBox>

      <MDBox
        mb={2}
        mr={2}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          cursor: "pointer",
        }}
      >
        <div onClick={handleRemoveExercise}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <RemoveCircleOutlineIcon sx={{ fontSize: 50, color: "#FF0000", marginRight: 1 }} />
            <MDTypography variant="body2" color="textSecondary">
              Remove Exercise
            </MDTypography>
          </span>
        </div>
      </MDBox>

      <MDBox px={2} pb={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
            Submit
          </MDTypography>
        </Button>
      </MDBox>
      {/* Display error message if present */}
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

export default AddWorkout;
