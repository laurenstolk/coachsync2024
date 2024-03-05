import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Icon,
  Typography,
  Card,
  Box,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { supabase } from "../../supabaseClient";
import MDButton from "components/MDButton";

function Tables() {
  const [workouts, setWorkouts] = useState([]);
  const [customizedExercises, setCustomizedExercises] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [editableExerciseId, setEditableExerciseId] = useState(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [originalExerciseData, setOriginalExerciseData] = useState(null);
  const [exercisesByCategory, setExercisesByCategory] = useState({});
  const [openCoachNotesDialog, setOpenCoachNotesDialog] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState(null);
  const [editedCoachNotes, setEditedCoachNotes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("workout")
          .select("*");
        const { data: customizedexerciseData, error: customizedExercisesError } = await supabase
          .from("customized_exercise")
          .select("*");
        const { data: exerciseData, error: exercisesError } = await supabase
          .from("exercise")
          .select("*");
        const { data: categoryData, error: categoryError } = await supabase
          .from("category")
          .select("*");

        if (categoryError) throw categoryError;

        if (categoryData != null) {
          const categoryMap = {};
          categoryData.forEach((category) => {
            categoryMap[category.category_id] = category.category_name;
          });

          const exercisesGroupedByCategory = {};
          exerciseData.forEach((exercise) => {
            const categoryName = categoryMap[exercise.category];
            if (!exercisesGroupedByCategory[categoryName]) {
              exercisesGroupedByCategory[categoryName] = [];
            }
            exercisesGroupedByCategory[categoryName].push(exercise);
          });
          setExercisesByCategory(exercisesGroupedByCategory);
        }
        if (workoutsError || customizedExercisesError || exercisesError) {
          throw new Error("Error fetching data");
        }

        setWorkouts(workoutsData || []);
        setCustomizedExercises(customizedexerciseData || []);
        setExercises(exerciseData || []);

      } catch (error) {
        alert(error);
      }
    };
    fetchData();
  }, []);

  const handleDeleteWorkout = async (workoutId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this workout?");
    if (confirmDelete) {
      try {
        const { error } = await supabase.from("workout").delete().eq("id", workoutId);
        if (error) {
          throw error;
        }
        // Update the workouts state after deletion
        setWorkouts((prevWorkouts) => prevWorkouts.filter((workout) => workout.id !== workoutId));
        toast.success("Workout deleted successfully!");
        console.log("Workout deleted successfully!");
      } catch (error) {
        console.error("Error deleting workout:", error.message);
        toast.error("Error deleting workout");
      }
    }
  };

  const handleDeleteCustomExercise = async (exerciseId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this custom exercise?");
    if (confirmDelete) {
      try {
        const { error } = await supabase.from("customized_exercise").delete().eq("id", exerciseId);
        if (error) {
          throw error;
        }
        // Update the customizedExercises state after deletion
        setCustomizedExercises((prevExercises) => prevExercises.filter((exercise) => exercise.id !== exerciseId));
        toast.success("Custom exercise deleted successfully!");
        console.log("Custom exercise deleted successfully!");
      } catch (error) {
        console.error("Error deleting custom exercise:", error.message);
        toast.error("Error deleting custom exercise");
      }
    }
  };

  const handleEdit = (exerciseId) => {
    // Find the exercise by ID
    const exerciseToEdit = customizedExercises.find((exercise) => exercise.id === exerciseId);
    if (exerciseToEdit) {
      // Save the original exercise data before editing
      setOriginalExerciseData({ ...exerciseToEdit });
      setEditableExerciseId(exerciseId);
    }
  };

  const handleInputChange = (e, id, field) => {
    const value = e.target.value;
    setCustomizedExercises((prevState) => {
      const updatedExercises = prevState.map((exercise) => {
        if (exercise.id === id) {
          return { ...exercise, [field]: value };
        }
        return exercise;
      });
      return updatedExercises;
    });
  };

  const handleSummaryClick = (workoutId) => {
    setExpandedWorkoutId(workoutId === expandedWorkoutId ? null : workoutId);
  };

  const handleUpdate = async (exercise) => {
    try {
      const { data, error } = await supabase
        .from("customized_exercise")
        .update({
          sets: exercise.sets,
          reps: exercise.reps,
          duration: exercise.duration,
          coach_notes: exercise.coach_notes,
        })
        .eq("id", exercise.id);

      if (error) {
        throw error;
      }

      console.log("Exercise updated successfully:", data);
      setEditableExerciseId(null);

      setCustomizedExercises((prevState) =>
        prevState.map((item) => (item.id === exercise.id ? { ...item, ...exercise } : item))
      );

      toast.success("Exercise updated successfully!");
    } catch (error) {
      console.error("Error updating exercise:", error.message);
      toast.error("Error updating exercise");
    }
  };

  const handleAddCustomExercise = async (workoutId) => {
    try {
      const { data: exerciseData, error } = await supabase.from("exercise").select("*");

      if (error) {
        throw error;
      }

      const newCustomExercise = {
        id: customizedExercises.length + 1, // Just a temporary ID until it's saved to the database
        workout_id: workoutId,
        exercise_id: exerciseData[0].id, // Select the first exercise by default
        sets: 0,
        reps: 0,
        duration: "",
        coach_notes: "",
      };

      setCustomizedExercises([...customizedExercises, newCustomExercise]);
      setEditableExerciseId(newCustomExercise.id); // Trigger edit immediately after adding
      // Remove the confirm message
      // toast.success("Custom exercise added successfully!");
    } catch (error) {
      console.error("Error adding custom exercise:", error.message);
      toast.error("Error adding custom exercise");
    }
  };

  const handleCancel = () => {
    // Revert the exercise data back to its original state
    if (originalExerciseData) {
      setCustomizedExercises((prevState) =>
        prevState.map((exercise) =>
          exercise.id === editableExerciseId ? { ...originalExerciseData } : exercise
        )
      );
      // Clear the original exercise data state
      setOriginalExerciseData(null);
    }
    // Reset the editable exercise ID to null
    setEditableExerciseId(null);
  };

  const handleCoachNotesEditClick = (exerciseId, coachNotes) => {
    setCurrentExerciseId(exerciseId);
    setEditedCoachNotes(coachNotes);
    setOpenCoachNotesDialog(true);
  };

  const handleCoachNotesSave = async () => {
    try {
      // Update the coach's notes locally before making the API call
      setCustomizedExercises((prevState) =>
        prevState.map((exercise) =>
          exercise.id === currentExerciseId ? { ...exercise, coach_notes: editedCoachNotes } : exercise
        )
      );

      const { data, error } = await supabase
        .from("customized_exercise")
        .update({
          coach_notes: editedCoachNotes,
        })
        .eq("id", currentExerciseId);

      if (error) {
        throw error;
      }

      console.log("Coach's notes updated successfully:", data);
      setOpenCoachNotesDialog(false);
    } catch (error) {
      console.error("Error updating coach's notes:", error.message);
      toast.error("Error updating coach's notes");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Workout Library" />
      <Box mb={3}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            backgroundImage: "linear-gradient(to right, #1976d2, #6ab7ff)",
            color: "white",
          }}
        >
          <Box
            p={2}
            sx={{
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Workout Library
            </Typography>
            <MDButton style={{backgroundColor: 'rgba(255, 255, 255, 0.5)',color: 'rgba(0, 0, 0, 0.6)'}} component={Link} to="/addworkout" >
              Add Workout
            </MDButton>
            
          </Box>
        </Card>
      </Box>
      <Grid container spacing={1} sx={{ marginBottom: 5 }}>
        {workouts.map((workout) => (
          <Grid item xs={12} key={workout.id}>
            <Accordion
              expanded={expandedWorkoutId === workout.id}
              onChange={handleSummaryClick}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ display: "flex", alignItems: "center" }}
                onClick={(e) => handleSummaryClick(workout.id)}
              >
                <Typography sx={{ flexGrow: 1 }}>{workout.workout_name}</Typography>
                <Button
                  variant="text"
                  color="primary"
                  endIcon={<Icon>arrow_right_alt</Icon>}
                  component={Link}
                  to={`/addassignment/${workout.id}`}
                >
                  Assign
                </Button>
                <Button color="error" onClick={() => handleDeleteWorkout(workout.id)}>
                  <Icon>delete</Icon>
                </Button>
                {expandedWorkoutId === workout.id && (
                  <Button
                    variant="text"
                    color="primary"
                    endIcon={<AddIcon />}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event propagation
                      handleAddCustomExercise(workout.id);
                    }}
                    sx={{ color: "black" }}
                  >
                    Add Exercise to Workout
                  </Button>
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ marginTop: 2, marginBottom: 2 }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>
                          Exercise
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>
                          Sets
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>
                          Reps
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>
                          Duration
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>
                          Coach&apos;s Notes
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                      {customizedExercises
                        .filter((exercise) => exercise.workout_id === workout.id)
                        .map((exercise) => {
                          const matchedExercise = exercises.find((ex) => ex.id === exercise.exercise_id);
                          const isEditable = editableExerciseId === exercise.id;
                          return (
                            <TableRow key={exercise.id}>
                              <TableCell align="center">
                                {isEditable ? (
                                  <Select
                                    sx={{ minHeight: "43px" }}
                                    label="Exercise"
                                    value={exercise.exercise_id}
                                    onChange={(event) =>
                                      handleInputChange(event, exercise.id, "exercise_id")
                                    }
                                  >
                                    {Object.entries(exercisesByCategory)
                                      .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
                                      .map(([category, exercises]) => [
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
                                        exercises
                                          .sort((exerciseA, exerciseB) =>
                                            exerciseA.name.localeCompare(exerciseB.name)
                                          )
                                          .map((exercise) => (
                                            <MenuItem key={exercise.id} value={exercise.id}>
                                            {exercise.name}
                                            </MenuItem>
                                          )),
                                      ])}
                                  </Select>
                                ) : (
                                  matchedExercise ? matchedExercise.name : ""
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <TextField
                                    type="number"
                                    value={exercise.sets}
                                    onChange={(e) => handleInputChange(e, exercise.id, "sets")}
                                  />
                                ) : (
                                  exercise.sets
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <TextField
                                    type="number"
                                    value={exercise.reps}
                                    onChange={(e) => handleInputChange(e, exercise.id, "reps")}
                                  />
                                ) : (
                                  exercise.reps
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <TextField
                                    type="text"
                                    value={exercise.duration}
                                    onChange={(e) => handleInputChange(e, exercise.id, "duration")}
                                  />
                                ) : (
                                  exercise.duration
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <>
                                    <Typography sx={{ fontWeight: 300, fontSize: "0.9rem" }}>{exercise.coach_notes}</Typography>
                                    <Button
                                      variant="text"
                                      color="inherit"
                                      onClick={() => handleCoachNotesEditClick(exercise.id, exercise.coach_notes)}
                                      startIcon={<EditIcon />}
                                    />
                                  </>
                                ) : (
                                  <Typography sx={{ fontWeight: 300, fontSize: "0.9rem" }}>{exercise.coach_notes}</Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <>
                                    <Button color="primary" onClick={() => handleUpdate(exercise)}>
                                      <Icon>save</Icon> Save
                                    </Button>
                                    <Button color="error" onClick={handleCancel}>
                                      <Icon>cancel</Icon> Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button color="inherit" onClick={() => handleEdit(exercise.id)}>
                                      <Icon>edit</Icon> Edit
                                    </Button>
                                    <Button color="error" onClick={() => handleDeleteCustomExercise(exercise.id)}>
                                      <Icon>delete</Icon> Delete
                                    </Button>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
      <Dialog open={openCoachNotesDialog} onClose={() => setOpenCoachNotesDialog(false)}>
        <DialogTitle>Edit Coach&apos;s Notes</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            value={editedCoachNotes}
            onChange={(e) => setEditedCoachNotes(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCoachNotesDialog(false)}>Cancel</Button>
          <Button onClick={handleCoachNotesSave} variant="contained" color="primary" sx={{ color: "#fff" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
