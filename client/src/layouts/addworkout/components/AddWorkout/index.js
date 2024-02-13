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

const exerciseChoices = ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4", "Exercise 5"];

function AddWorkout() {
  const navigate = useNavigate();
  const [exerciseCount, setExerciseCount] = useState(3);
  const [exercises, setExercises] = useState([]);
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
      let { data, error } = await supabase.from("exercise").select("*");

      if (error) throw error;

      if (data != null) {
        setExercises(data);
      }
    } catch (error) {
      alert(error.message);
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
        console.log("Workout added successfully!");
        toast.success("Workout successfully created!", {
          autoClose: 2000,
          onClose: () => {
            navigate("/dashboard");
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
        console.log("Exercise records added successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    // Your form submission logic here
    console.log("Workout Name:", workoutData);
    console.log("Selected Exercises:", selectedExercises);
  };

  return (
    <Card id="workout-form">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h4" fontWeight="medium">
          Create Workout
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <TextField id="workout-name" label="Workout Name" variant="outlined" />
        </MDBox>
      </MDBox>

      {selectedExercises.map((exercise, index) => (
        <MDBox key={index} pt={1} pb={2} px={2}>
          <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
            <MDBox mb={2}>
              <FormControl fullWidth>
                <InputLabel>Exercise</InputLabel>
                <Select
                  sx={{ minHeight: "43px" }}
                  id="exercise-id"
                  label="Exercise"
                  variant="outlined"
                  // value={selectedExercises}
                  value={exercise.id}
                  //onChange={handleExerciseChange}
                  onChange={(event) =>
                    handleExerciseChange(index, "exerciseId", event.target.value)
                  }
                >
                  {exercises.map((exercise, index) => (
                    <MenuItem key={index} value={exercise.id}>
                      {exercise.name}
                    </MenuItem>
                  ))}
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
          <AddCircleIcon sx={{ fontSize: 50, color: "#1976D2", marginRight: 1 }} />
          <MDTypography variant="body2" color="textSecondary">
            Add Exercise
          </MDTypography>
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
          <RemoveCircleOutlineIcon sx={{ fontSize: 50, color: "#FF0000", marginRight: 1 }} />
          <MDTypography variant="body2" color="textSecondary">
            Remove Exercise
          </MDTypography>
        </div>
      </MDBox>

      <MDBox px={2} pb={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
            Submit
          </MDTypography>
        </Button>
      </MDBox>
    </Card>
  );
}

export default AddWorkout;
