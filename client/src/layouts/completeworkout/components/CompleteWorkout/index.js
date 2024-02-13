// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { FormControl, FormControlLabel, InputLabel } from "@mui/material";

import React, { useEffect, useState } from "react";

// Add supabase connection
import { supabase } from "../../../../supabaseClient";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import Checkbox from "@mui/material/Checkbox";

async function getCustomizedExercise(assignmentData) {
  const { data: customizedExercisesData } = await supabase
    .from("customized_exercise")
    .select("*, id")
    .eq("workout_id", assignmentData.workout_id);

  // Fetch exercise data separately
  const { data: exerciseData } = await supabase.from("exercise").select("*");

  // Merge exercise data with customized exercises
  const customizedExercisesWithExerciseInfo = customizedExercisesData.map((customizedExercise) => {
    const exerciseInfo = exerciseData.find(
      (exercise) => exercise.id === customizedExercise.exercise_id
    );

    const { id: customized_exercise_id, ...restCustomizedExercise } = customizedExercise;

    return {
      ...restCustomizedExercise,
      customized_exercise_id, // Add the renamed id field
      exercise_id: exerciseInfo.id, // Add the exercise_id from exerciseInfo
      ...exerciseInfo,
    };
  });

  return customizedExercisesWithExerciseInfo;
}

async function getAssignment(profile) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: assignmentData } = await supabase
    .from("assignment")
    .select("*")
    .eq("player_id", profile.id)
    .eq("date", today.toISOString().split("T")[0])
    .single();

  return assignmentData;
}

async function getWorkout(assignmentData) {
  const { data: workoutData } = await supabase
    .from("workout")
    .select("*")
    .eq("id", assignmentData.workout_id)
    .single();

  return workoutData;
}

function CompleteWorkout() {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [customizedExercises, setCustomizedExercises] = useState([]);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await fetchUserProfile();
        const assignmentData = await getAssignment(profileData);

        if (!assignmentData) {
          setIsLoading(false);
          return;
        }

        setAssignment(assignmentData);
        const customizedExercisesData = await getCustomizedExercise(assignmentData);
        setCustomizedExercises(customizedExercisesData);
        const workoutData = await getWorkout(assignmentData);
        setWorkout(workoutData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data");
      }
    };
    fetchData();
  }, []);

  // Function to handle checkbox change for completed exercises
  // Function to handle checkbox change for completed exercises
  const handleExerciseCompletionChange = (exercise) => {
    setCompletedExercises((prevCompletedExercises) => {
      const isAlreadyCompleted = prevCompletedExercises.some(
        (completedExercise) =>
          completedExercise.customized_exercise_id === exercise.customized_exercise_id
      );

      if (isAlreadyCompleted) {
        // If the exercise is already completed, remove it from completedExercises
        const updatedCompletedExercises = prevCompletedExercises.filter(
          (completedExercise) =>
            completedExercise.customized_exercise_id !== exercise.customized_exercise_id
        );
        return updatedCompletedExercises;
      } else {
        // If the exercise is not completed, add it to completedExercises
        return [...prevCompletedExercises, exercise];
      }
    });
  };

  const handleNotesChange = (index, value) => {
    setCustomizedExercises((prevCustomizedExercises) => {
      const updatedExercises = [...prevCustomizedExercises];
      updatedExercises[index].notes = value; // Update the notes for the corresponding exercise
      return updatedExercises;
    });
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      // Check if all exercises are completed
      const allExercisesCompleted = customizedExercises.length === completedExercises.length;

      if (allExercisesCompleted) {
        // If all exercises are completed, update the 'completed' field of the assignment to TRUE
        const { data: updateResult, error: updateError } = await supabase
          .from("assignment")
          .update({ completed: true })
          .eq("id", assignment.id);

        if (updateError) {
          console.error("Error updating assignment:", updateError);
        } else {
          console.log("Assignment marked as completed successfully!");
        }
      }

      const completionRecords = completedExercises.map((exercise) => ({
        date_completed: new Date().toISOString().split("T")[0],
        player_notes: exercise.notes,
        customized_exercise_id: exercise.customized_exercise_id,
        assignment_id: assignment.id,
      }));

      const { data: completionResult, error: completionError } = await supabase
        .from("exercise_completion")
        .upsert(completionRecords)
        .select();

      if (completionError) {
        console.error("Error adding completion records:", completionError);
      } else {
        console.log("Completion records added successfully!");
      }
    } catch (error) {
      console.error("Error: ", error);
    }

    try {
      // Your submission logic
      toast.success("Workout completed and notes added successfully!", {
        autoClose: 2000,
        onClose: () => {
          navigate("/exerciselibrary");
        },
      });
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  };

  // Render the form
  if (isLoading) {
    return (
      <Card id="delete-account">
        <MDBox pt={3} px={2}>
          <MDTypography variant="h4" fontWeight="medium">
            Loading...
          </MDTypography>
        </MDBox>
        <MDBox pt={1} pb={2} px={2}></MDBox>
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card id="delete-account">
        <MDBox pt={3} px={2}>
          <MDTypography variant="h4" fontWeight="medium">
            There is no assigned workout for today.
          </MDTypography>
        </MDBox>
        <MDBox pt={1} pb={2} px={2}></MDBox>
      </Card>
    );
  }

  if (assignment.completed) {
    return (
      <Card id="delete-account">
        <MDBox pt={3} px={2}>
          <MDTypography variant="h4" fontWeight="medium">
            Congrats! You already completed today&apos;s workout.
          </MDTypography>
          <MDTypography variant="body1">Here&apos;s a summary of the workout:</MDTypography>
          <MDBox>
            <MDTypography variant="body2">
              <strong>Workout Name:</strong> {workout ? workout.workout_name : "Unknown"}
            </MDTypography>
            <MDTypography variant="body2">
              <strong>Date:</strong> {assignment.date}
            </MDTypography>
            <MDTypography variant="body2">
              <strong>Exercises:</strong>
            </MDTypography>
            {customizedExercises.map((exercise, index) => (
              <MDTypography variant="body2" key={index}>
                - {exercise.name} ({exercise.reps ? `Reps: ${exercise.reps}` : ""}
                {exercise.reps && exercise.sets ? ", " : ""}
                {exercise.sets ? `Sets: ${exercise.sets}` : ""}
                {(exercise.reps || exercise.sets) && exercise.duration ? ", " : ""}
                {exercise.duration ? `Duration: ${exercise.duration}` : ""})
              </MDTypography>
            ))}
          </MDBox>
        </MDBox>
        <MDBox pt={1} pb={2} px={2}></MDBox>
      </Card>
    );
  } else {
    return (
      <Card id="delete-account">
        <MDBox pt={3} px={2}>
          <MDTypography variant="h4" fontWeight="medium">
            {workout ? workout.workout_name : "Today's Workout"}
          </MDTypography>
        </MDBox>

        <MDBox pt={1} pb={2} px={2}>
          <InputLabel>Exercises</InputLabel>
          <MDBox
            component="ul"
            display="flex"
            flexDirection="column"
            p={0}
            m={0}
            className="MuiFormControlLabel-root"
          >
            {" "}
            {/* Add the className here */}
            <MDBox mb={2}>
              <FormControl>
                <MDBox display="flex" flexDirection="column">
                  {customizedExercises.map((customizedExercise, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={completedExercises.includes(customizedExercise)}
                          onChange={() => handleExerciseCompletionChange(customizedExercise)}
                          name={customizedExercise.name}
                        />
                      }
                      label={
                        <div>
                          <MDTypography variant="body1" fontWeight="medium">
                            {customizedExercise.name}
                          </MDTypography>
                          {(customizedExercise.reps ||
                            customizedExercise.sets ||
                            customizedExercise.duration) && (
                            <MDTypography variant="body2">
                              {customizedExercise.reps && `Reps: ${customizedExercise.reps}`}
                              {customizedExercise.reps &&
                                customizedExercise.sets &&
                                customizedExercise.duration &&
                                " | "}
                              {customizedExercise.sets && `Sets: ${customizedExercise.sets}`}
                              {customizedExercise.sets && customizedExercise.duration && " | "}
                              {customizedExercise.duration &&
                                `Duration: ${customizedExercise.duration}`}
                            </MDTypography>
                          )}
                          <MDTypography variant="body2" color="text">
                            Coach Notes: {customizedExercise.coach_notes}
                          </MDTypography>
                          <TextField
                            label="Notes"
                            variant="outlined"
                            size="small"
                            fullWidth
                            multiline
                            rows={1}
                            placeholder="Enter notes..."
                            onChange={(event) => handleNotesChange(index, event.target.value)}
                          />
                        </div>
                      }
                    />
                  ))}
                </MDBox>
              </FormControl>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Submit button */}
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Card>
    );
  }
}
export default CompleteWorkout;
