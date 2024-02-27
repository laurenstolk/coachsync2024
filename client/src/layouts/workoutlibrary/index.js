import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { supabase } from "../../supabaseClient";

function Tables() {
  const [workouts, setWorkouts] = useState([]);
  const [customizedExercises, setCustomizedExercises] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [editableExerciseId, setEditableExerciseId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("workout")
          .select("*");
        const { data: customizedExercisesData, error: customizedExercisesError } = await supabase
          .from("customized_exercise")
          .select("*");
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("exercise")
          .select("*");

        if (workoutsError || customizedExercisesError || exercisesError) {
          throw new Error("Error fetching data");
        }

        setWorkouts(workoutsData || []);
        setCustomizedExercises(customizedExercisesData || []);
        setExercises(exercisesData || []);
      } catch (error) {
        console.error("Error fetching data:", error.message);
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
    setEditableExerciseId(exerciseId);
  };

  const handleInputChange = (e, id, field) => {
    const value = e.target.value;
    setCustomizedExercises(prevState => {
      const updatedExercises = prevState.map(exercise => {
        if (exercise.id === id) {
          return { ...exercise, [field]: value };
        }
        return exercise;
      });
      return updatedExercises;
    });
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

      setCustomizedExercises(prevState =>
        prevState.map(item => (item.id === exercise.id ? { ...item, ...exercise } : item))
      );

      toast.success("Exercise updated successfully!");
    } catch (error) {
      console.error("Error updating exercise:", error.message);
      toast.error("Error updating exercise");
    }
  };

  // Rest of your component code...

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Saved Workouts" />
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
              Saved Workouts
            </Typography>
            <Button variant="outlined" component={Link} to="/addworkout" color="inherit">
              Add Workout
            </Button>
          </Box>
        </Card>
      </Box>
      <Grid container spacing={1} sx={{ marginBottom: 5 }}>
        {workouts.map((workout) => (
          <Grid item xs={12} key={workout.id}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ display: "flex", gridTemplateColumns: "center" }}
              >
                <Typography sx={{ flexGrow: 1 }}>{workout.workout_name}</Typography>
                <Button
                  variant="text"
                  color="primary" // Change back to primary color
                  endIcon={<Icon>arrow_right_alt</Icon>}
                  component={Link}
                  to={`/addassignment/${workout.id}`}
                >
                  Assign
                </Button>
                <Button color="error" onClick={() => handleDeleteWorkout(workout.id)}>
                  <Icon>delete</Icon>
                </Button>
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
                              <TableCell align="center">{matchedExercise ? matchedExercise.name : ""}</TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <input
                                    type="number"
                                    value={exercise.sets}
                                    onChange={(e) => handleInputChange(e, exercise.id, 'sets')}
                                  />
                                ) : (
                                  exercise.sets
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <input
                                    type="number"
                                    value={exercise.reps}
                                    onChange={(e) => handleInputChange(e, exercise.id, 'reps')}
                                  />
                                ) : (
                                  exercise.reps
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={exercise.duration}
                                    onChange={(e) => handleInputChange(e, exercise.id, 'duration')}
                                  />
                                ) : (
                                  exercise.duration
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={exercise.coach_notes}
                                    onChange={(e) => handleInputChange(e, exercise.id, 'coach_notes')}
                                  />
                                ) : (
                                  exercise.coach_notes
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {isEditable ? (
                                  <Button color="primary" onClick={() => handleUpdate(exercise)}>
                                    <Icon>save</Icon> Save
                                  </Button>
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
      <Footer />
      <ToastContainer /> {/* Add this line for toast notifications */}
    </DashboardLayout>
  );
}

export default Tables;
