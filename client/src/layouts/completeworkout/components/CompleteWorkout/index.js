
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
  console.log("Assignment Data:", assignmentData); // Log assignmentData to ensure it's correct
  const { data: customizedExercisesData } = await supabase
    .from("customized_exercise")
    .select("*, id")
    .eq("workout_id", assignmentData.workout_id);
    console.log("Customized Exercises Data:", customizedExercisesData); // Log customizedExercisesData to see what's retrieved
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
    console.log("Customized Exercises with Exercise Info:", customizedExercisesWithExerciseInfo); // Log the merged data
  });
  return customizedExercisesWithExerciseInfo;
}
async function getAssignments(profile) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log("today: ", today.toISOString().split("T")[0]);
  const { data: assignmentData, error } = await supabase
    .from("assignment")
    .select("*")
    .eq("player_id", profile.id)
    .eq("date", today.toISOString().split("T")[0]);
  
  if (error) {
    console.error("Error fetching assignments:", error);
    return null;
  }
  console.log("assignments: ", assignmentData);
  return assignmentData;
}
async function getWorkout(assignmentData) {
  const { data: workoutData } = await supabase
    .from("workout")
    .select("*")
    .eq("id", assignmentData.workout_id)
    .single();
  console.log("assignment workoutid:", assignmentData.workout_id)
  
  return workoutData;
}

function CompleteWorkout() {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState([]);
  const [workout, setWorkout] = useState(null);
 // const [customizedExercises, setCustomizedExercises] = useState([]);
  const [customizedExercisesData, setCustomizedExercises] = useState([])
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedExercisesMap, setCompletedExercisesMap] = useState({});

   // Add a useMemo hook to check if any exercises are completed
  const anyExercisesCompleted = useMemo(() => {
    return completedExercises.length > 0;
  }, [completedExercises]);
  // console.log('Customized Exercises Length:', customizedExercisesData.length);
  console.log('Completed Exercises Length:', completedExercises.length);
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
          console.log('Customized (data) Exercises Length:', customizedExercisesData.length); // Log customized exercises length
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
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const profileData = await fetchUserProfile();
  //       const assignmentData = await getAssignments(profileData);
  
  //       if (!assignmentData || assignmentData.length === 0) {
  //         setIsLoading(false);
  //         return;
  //       }
  
  //       const assignmentsPromises = assignmentData.map(async (assignment) => {
  //         const customizedExercisesData = await getCustomizedExercise(assignment);
  //         const workoutData = await getWorkout(assignment);
  //         return { assignment, customizedExercisesData, workoutData };
  //       });
  
  //       // Resolve all promises
  //       const resolvedAssignments = await Promise.all(assignmentsPromises);
  
  //       // Update state with the fetched data
  //       setAssignment(resolvedAssignments);
  //       setIsLoading(false);
  
  //       // Log the lengths after setting the state
  //       console.log('Customized Exercises Length:', resolvedAssignments[0].customizedExercisesData.length);
  //       console.log('Completed Exercises Length:', completedExercises.length);
  
  //     } catch (error) {
  //       console.error("Error fetching data");
  //       setIsLoading(false); // Ensure loading is set to false even in case of errors
  //     }
  //   };
  
  //   fetchData();
  // }, []);
  //       setAssignment(assignmentData);
  //       const customizedExercisesData = await getCustomizedExercise(assignmentData);
  //       setCustomizedExercises(customizedExercisesData);
  //       const workoutData = await getWorkout(assignmentData);
  //       setWorkout(workoutData);
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching data");
  //     }
  //   };
  //   fetchData();
  // }, []);
  // Add a useMemo hook to calculate whether all exercises are completed
  const allExercisesCompleted = useMemo(() => {
    console.log("cust ex leng:", customizedExercisesData.length)
    return customizedExercisesData.length === completedExercises.length;
  }, [customizedExercisesData, completedExercises]);
  // Function to handle checkbox change for completed exercises
  // const handleExerciseCompletionChange = (exercise) => {
  //   console.log('Exercise:', exercise);
  //   setCompletedExercises((prevCompletedExercises) => {
  //     const isAlreadyCompleted = prevCompletedExercises.some(
  //       (completedExercise) =>
  //         completedExercise.customized_exercise_id === exercise.customized_exercise_id
  //     );
  //     console.log("already completed", completedExercises)
  //     if (isAlreadyCompleted) {
  //       console.log('Removing exercise from completed:', exercise);
  //       // If the exercise is already completed, remove it from completedExercises
  //       const updatedCompletedExercises = prevCompletedExercises.filter(
  //         (completedExercise) =>
  //           completedExercise.customized_exercise_id !== exercise.customized_exercise_id
  //       );
  //       return updatedCompletedExercises;
  //     } else {
  //       console.log('Adding exercise to completed:', exercise);
  //       // If the exercise is not completed, add it to completedExercises
  //       return [...prevCompletedExercises, exercise];
  //     }
  //   });
  // };
  // const handleExerciseCompletionChange = (exercise) => {
  //   console.log('Exercise:', exercise);
  //   setCompletedExercises((prevCompletedExercises) => {
  //     const isAlreadyCompleted = prevCompletedExercises.some(
  //       (completedExercise) =>
  //         completedExercise.customized_exercise_id === exercise.customized_exercise_id
  //     );
  //     console.log("already completed", completedExercises)
  
  //     if (!isAlreadyCompleted) {
  //       console.log('Adding exercise to completed:', exercise);
  //       // If the exercise is not completed, add it to completedExercises
  //       return [...prevCompletedExercises, exercise];
  //     } else {
  //       console.log('Removing exercise from completed:', exercise);
  //       // If the exercise is already completed, remove it from completedExercises
  //       const updatedCompletedExercises = prevCompletedExercises.filter(
  //         (completedExercise) =>
  //           completedExercise.customized_exercise_id !== exercise.customized_exercise_id
  //       );
  //       console.log("already completed final", updatedCompletedExercises)
  //       return updatedCompletedExercises;
  //     }
  //   });
  // };
 const handleExerciseCompletionChange = (assignmentId, exercise) => {
    setCompletedExercisesMap((prevCompletedExercisesMap) => {
      const prevCompletedExercises = prevCompletedExercisesMap[assignmentId];
      const isAlreadyCompleted = prevCompletedExercises.some(
        (completedExercise) => completedExercise.customized_exercise_id === exercise.customized_exercise_id
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
            (completedExercise) => completedExercise.customized_exercise_id !== exercise.customized_exercise_id
          ),
        };
      }
    });
  };
  // const handleNotesChange = (index, value) => {
  //   setCustomizedExercises((prevCustomizedExercises) => {
  //     const updatedExercises = [...prevCustomizedExercises];
  //     updatedExercises[index].notes = value; // Update the notes for the corresponding exercise
  //     return updatedExercises;
  //   });
  // };
  // const handleNotesChange = (index, value) => {
  //   setCustomizedExercises((prevCustomizedExercises) => {
  //     // Check if the exercise at the given index exists
  //     if (prevCustomizedExercises[index]) {
  //       const updatedExercises = [...prevCustomizedExercises];
  //       updatedExercises[index].notes = value; // Update the notes for the corresponding exercise
  //       return updatedExercises;
  //     } else {
  //       // Handle the case where the exercise at the given index does not exist
  //       console.error(`Exercise at index ${index} does not exist`);
  //       return prevCustomizedExercises;
  //     }
  //   });
  // };
  const handleNotesChange = (assignmentIndex, exerciseIndex, value) => {
    setAssignment((prevAssignment) => {
      // Make a shallow copy of the assignment array
      const updatedAssignment = [...prevAssignment];
      // Check if the assignment at the given index exists
      if (updatedAssignment[assignmentIndex]) {
        // Make a shallow copy of the customized exercises array
        const updatedCustomizedExercises = [...updatedAssignment[assignmentIndex].customizedExercisesData];
        // Check if the exercise at the given index exists
        if (updatedCustomizedExercises[exerciseIndex]) {
          // Update the notes for the corresponding exercise
          updatedCustomizedExercises[exerciseIndex].notes = value;
          // Update the customized exercises array within the assignment
          updatedAssignment[assignmentIndex].customizedExercisesData = updatedCustomizedExercises;
          // Update the state with the modified assignment array
          return updatedAssignment;
        } else {
          // Handle the case where the exercise at the given index does not exist
          console.error(`Exercise at index ${exerciseIndex} does not exist`);
          return prevAssignment;
        }
      } else {
        // Handle the case where the assignment at the given index does not exist
        console.error(`Assignment at index ${assignmentIndex} does not exist`);
        return prevAssignment;
      }
    });
  };
  // Function to handle form submission
  // const handleSubmit = async () => {
  //   try {
  //     // console.log('Customized Exercises Length:', customizedExercises.length);
  //     // console.log('Completed Exercises Length:', completedExercises.length);
  //     // Check if all exercises are completed
  //     const allExercisesCompleted =  resolvedAssignments[0].customizedExercisesData.length === completedExercises.length;
  //     if (allExercisesCompleted) {
  //       // If all exercises are completed, update the 'completed' field of the assignment to TRUE
  //       const { data: updateResult, error: updateError } = await supabase
  //         .from("assignment")
  //         .update({ completed: true })
  //         .eq("id", assignment.id);
  //       if (updateError) {
  //         console.error("Error updating assignment:", updateError);
  //       } else {
  //         console.log("Assignment marked as completed successfully!");
  //       }
  //     }
  //     const completionRecords = completedExercises.map((exercise) => ({
  //       date_completed: new Date().toISOString().split("T")[0],
  //       player_notes: exercise.notes,
  //       customized_exercise_id: exercise.customized_exercise_id,
  //       assignment_id: assignment.id,
  //     }));
  //     const { data: completionResult, error: completionError } = await supabase
  //       .from("exercise_completion")
  //       .upsert(completionRecords)
  //       .select();
  //     if (completionError) {
  //       console.error("Error adding completion records:", completionError);
  //     } else {
  //       console.log("Completion records added successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error: ", error);
  //   }
  //   try {
  //     // Your submission logic
  //     toast.success("Workout completed and notes added successfully!", {
  //       autoClose: 2000,
  //       onClose: () => {
  //         navigate("/playerdashboard");
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error:", error);
  //     // Handle error
  //   }
  // };
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
  if (!assignment) {
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
          <div key={`assignment-${assignmentIndex}`} style={{ marginBottom: '20px' }}>
            <Card>
              <MDBox pt={3} px={2}>
                <MDTypography variant="h4" fontWeight="medium">
                  {assignmentItem.workoutData ? assignmentItem.workoutData.workout_name : "Unknown"}
                </MDTypography>
                {assignmentItem.assignment.completed && (
                  <div>
                    <MDTypography variant="body1">You have already completed this workout</MDTypography>
                    <Divider style={{ backgroundColor: 'black' }} sx={{ my: 2, height: 4 }}></Divider>
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
                    {assignmentItem.customizedExercisesData.map((customizedExercise, exerciseIndex) => (
                      <MDBox mb={2} key={`exercise-${exerciseIndex}`}>
                        <FormControl>
                          <MDBox display="flex" flexDirection="column">
                            <FormControlLabel
                              control={
                                // <Checkbox
                                //   checked={completedExercises.includes(customizedExercise)}
                                //   onChange={() => handleExerciseCompletionChange(customizedExercise)}
                                //   name={customizedExercise.name}
                                // />
                                <Checkbox
                                checked={
                                  completedExercisesMap[assignmentItem.assignment.id] &&
                                  completedExercisesMap[assignmentItem.assignment.id].some(
                                    (completedExercise) =>
                                      completedExercise.customized_exercise_id === customizedExercise.customized_exercise_id
                                  )
                                }
                                onChange={() =>
                                  handleExerciseCompletionChange(assignmentItem.assignment.id, customizedExercise)
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
                                        {customizedExercise.reps && `Reps: ${customizedExercise.reps}`}
                                        {customizedExercise.reps &&
                                          (customizedExercise.sets || customizedExercise.duration) &&
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
                                    onChange={(event) => handleNotesChange(assignmentIndex, exerciseIndex, event.target.value)}
                                  />
                                </div>
                              }
                            />
                          </MDBox>
                        </FormControl>
                      </MDBox>
                    ))}
                  </MDBox>
                </MDBox>
              )}
              {!assignmentItem.assignment.completed && ( // Conditionally render if assignment is not completed
                // Submit button
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubmit(assignmentItem)}
                  style={{ color: 'white' }} 
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
}}
export default CompleteWorkout;
