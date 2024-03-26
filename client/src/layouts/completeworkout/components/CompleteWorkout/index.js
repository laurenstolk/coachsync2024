// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Divider, FormControl, FormControlLabel, InputLabel } from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";

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

async function getAssignments(profile) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: assignmentData, error } = await supabase
    .from("assignment")
    .select("*")
    .eq("player_id", profile.id)
    .eq("date", today.toISOString().split("T")[0]);

  if (error) {
    console.error("Error fetching assignments:", error);
    return null;
  }
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
  const [assignment, setAssignment] = useState([]);
  // const [workout, setWorkout] = useState(null);
  // const [customizedExercises, setCustomizedExercises] = useState([]);
  const [customizedExercisesData, setCustomizedExercises] = useState([]);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedExercisesMap, setCompletedExercisesMap] = useState({});

  // Add a useMemo hook to check if any exercises are completed
  const anyExercisesCompleted = useMemo(() => {
    return completedExercises.length > 0;
  }, [completedExercises]);

  useEffect(() => {
    const initializeCompletedExercisesMap = () => {
      const initialMap = {};
      assignment.forEach((assignmentItem) => {
        initialMap[assignmentItem.assignment.id] = [];
      });
      setCompletedExercisesMap(initialMap);
    };
    initializeCompletedExercisesMap();
  }, [assignment]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await fetchUserProfile();
        const assignmentData = await getAssignments(profileData);

        if (!assignmentData || assignmentData.length === 0) {
          setIsLoading(false);
          return;
        }

        const assignmentsPromises = assignmentData.map(async (assignment) => {
          const customizedExercisesData = await getCustomizedExercise(assignment);
          const workoutData = await getWorkout(assignment);
          return { assignment, customizedExercisesData, workoutData };
        });

        // Resolve all promises
        const resolvedAssignments = await Promise.all(assignmentsPromises);
        // Update state with the fetched data
        setAssignment(resolvedAssignments);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data");
        setIsLoading(false); // Ensure loading is set to false even in case of errors
      }
    };
    fetchData();
  }, []);

  const allExercisesCompleted = useMemo(() => {
    return customizedExercisesData.length === completedExercises.length;
  }, [customizedExercisesData, completedExercises]);

  const handleExerciseCompletionChange = (assignmentId, exercise) => {
    setCompletedExercisesMap((prevCompletedExercisesMap) => {
      const prevCompletedExercises = prevCompletedExercisesMap[assignmentId];
      const isAlreadyCompleted = prevCompletedExercises.some(
        (completedExercise) =>
          completedExercise.customized_exercise_id === exercise.customized_exercise_id
      );
      if (!isAlreadyCompleted) {
        return {
          ...prevCompletedExercisesMap,
          [assignmentId]: [...prevCompletedExercises, exercise],
        };
      } else {
        return {
          ...prevCompletedExercisesMap,
          [assignmentId]: prevCompletedExercises.filter(
            (completedExercise) =>
              completedExercise.customized_exercise_id !== exercise.customized_exercise_id
          ),
        };
      }
    });
  };

  const handleNotesChange = (assignmentIndex, exerciseIndex, value) => {
    setCompletedExercisesMap((prevCompletedExercisesMap) => {
      // Make a copy of the previous state
      const updatedCompletedExercisesMap = { ...prevCompletedExercisesMap };

      // Get the assignment ID using the assignment index
      const assignmentId = assignment[assignmentIndex].assignment.id;

      // Get the exercise ID using the exercise index
      const exerciseId =
        assignment[assignmentIndex].customizedExercisesData[exerciseIndex].customized_exercise_id;

      // Initialize the completed exercises array for the assignment ID if it doesn't exist
      if (!updatedCompletedExercisesMap[assignmentId]) {
        updatedCompletedExercisesMap[assignmentId] = [];
      }

      // Find the exercise in the completed exercises array
      const completedExerciseIndex = updatedCompletedExercisesMap[assignmentId].findIndex(
        (exercise) => exercise.customized_exercise_id === exerciseId
      );

      // If the exercise is found, update its notes or add a new exercise if not found
      if (completedExerciseIndex !== -1) {
        // Update the notes for the found exercise
        updatedCompletedExercisesMap[assignmentId][completedExerciseIndex].notes = value;
      } else {
        // Add a new exercise to the array with the provided notes
        updatedCompletedExercisesMap[assignmentId].push({
          customized_exercise_id: exerciseId,
          notes: value,
        });
      }

      // Return the updated state
      return updatedCompletedExercisesMap;
    });
  };

  const handleSubmit = async (assignmentItem) => {
    try {
      const { assignment, customizedExercisesData } = assignmentItem;
      const assignmentId = assignment.id;
      const completedExercises = completedExercisesMap[assignmentId];

      // Check if all exercises are completed
      const allExercisesCompleted = customizedExercisesData.length === completedExercises.length;

      if (allExercisesCompleted) {
        // If all exercises are completed, update the 'completed' field of the assignment to TRUE
        const { data: updateResult, error: updateError } = await supabase
          .from("assignment")
          .update({ completed: true })
          .eq("id", assignmentId); // Use assignmentId instead of assignment.id

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
        assignment_id: assignmentId, // Use assignmentId instead of assignment.id
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

      // Your submission logic
      toast.success("Workout completed and notes added successfully!", {
        autoClose: 2000,
        onClose: () => {
          navigate("/playerdashboard");
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
  if (!assignment || assignment.length == 0) {
    return (
      <Card id="delete-account">
        <MDBox pt={3} px={2}>
          <MDTypography variant="h4" fontWeight="medium">
            There is no assigned workout(s) for today.
          </MDTypography>
        </MDBox>
        <MDBox pt={1} pb={2} px={2}></MDBox>
      </Card>
    );
  } else {
    return (
      <div>
        {assignment.map((assignmentItem, assignmentIndex) => (
          <div key={`assignment-${assignmentIndex}`} style={{ marginBottom: "20px" }}>
            <Card>
              <MDBox pt={3} px={2}>
                <MDTypography variant="h4" fontWeight="medium">
                  {assignmentItem.workoutData ? assignmentItem.workoutData.workout_name : "Unknown"}
                </MDTypography>
                {assignmentItem.assignment.completed && (
                  <div>
                    <MDTypography variant="body1">
                      You have already completed this workout
                    </MDTypography>
                    <Divider
                      style={{ backgroundColor: "black" }}
                      sx={{ my: 2, height: 4 }}
                    ></Divider>
                  </div>
                )}
              </MDBox>

              {!assignmentItem.assignment.completed && ( // Conditionally render if assignment is not completed
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
                    {assignmentItem.customizedExercisesData.map(
                      (customizedExercise, exerciseIndex) => (
                        <MDBox mb={2} key={`exercise-${exerciseIndex}`}>
                          <FormControl>
                            <MDBox display="flex" flexDirection="column">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={
                                      completedExercisesMap[assignmentItem.assignment.id] &&
                                      completedExercisesMap[assignmentItem.assignment.id].some(
                                        (completedExercise) =>
                                          completedExercise.customized_exercise_id ===
                                          customizedExercise.customized_exercise_id
                                      )
                                    }
                                    onChange={() =>
                                      handleExerciseCompletionChange(
                                        assignmentItem.assignment.id,
                                        customizedExercise
                                      )
                                    }
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
                                        {customizedExercise.reps &&
                                          `Reps: ${customizedExercise.reps}`}
                                        {customizedExercise.reps &&
                                          (customizedExercise.sets ||
                                            customizedExercise.duration) &&
                                          " | "}
                                        {customizedExercise.sets &&
                                          `Sets: ${customizedExercise.sets}`}
                                        {customizedExercise.sets &&
                                          customizedExercise.duration &&
                                          " | "}
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
                                      onChange={(event) =>
                                        handleNotesChange(
                                          assignmentIndex,
                                          exerciseIndex,
                                          event.target.value
                                        )
                                      }
                                    />
                                  </div>
                                }
                              />
                            </MDBox>
                          </FormControl>
                        </MDBox>
                      )
                    )}
                  </MDBox>
                </MDBox>
              )}
              {!assignmentItem.assignment.completed && ( // Conditionally render if assignment is not completed
                // Submit button
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubmit(assignmentItem)}
                  style={{ color: "white" }}
                  //disabled={!allExercisesCompleted} // Disable the button if not all exercises are completed
                >
                  Submit
                </Button>
              )}
            </Card>
          </div>
        ))}
      </div>
    );
  }
}
export default CompleteWorkout;
