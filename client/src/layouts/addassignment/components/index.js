// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DateCalendarValue from "./calendar";
import IndeterminateCheckbox from "../components/checkboxList";

const exerciseChoices = ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4", "Exercise 5"];

function AddAssignment() {
  const navigate = useNavigate();
  const [workoutCount, setWorkoutCount] = useState(3);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState(
    Array.from({ length: workoutCount }, () => ({
      id: "",
      workout_name: "",
    }))
  );
  const handleWorkoutChange = (index, field, value) => {
    setSelectedWorkouts(() => {
      const newSelectedWorkouts = [...prevSelectedWorkouts];
      newSelectedWorkouts[index][field] = value;
      return newSelectedWorkouts;
    });
  };

  async function getWorkouts() {
    try {
      let { data, error } = await supabase.from("workout").select("*");

      if (error) throw error;

      if (data != null) {
        setWorkouts(data);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getWorkouts();
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
  //         });
  //       }

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
              sx={{ minHeight: "43px" }}
              label="Workout"
              variant="outlined"
              value={selectedWorkouts}
              onChange={(event) => setSelectedWorkouts([{ id: event.target.value }])}
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
              <DateCalendarValue />
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
              >
                {/* the notes will go here */}
              </TextField>
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
                <FormControlLabel control={<Checkbox defaultUnChecked />} label="All Players" />
              </FormGroup>
            </MDBox>
            <br></br>
            {/* search players and be able to select multiple */}
            <MDBox>
              <Autocomplete
                multiple
                id="workout-id"
                options={workouts.map((workout) => workout.workout_name)} // Assuming workout.workout_name is an array
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
              <IndeterminateCheckbox></IndeterminateCheckbox>
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
      <MDBox display="flex" justifyContent="flex-end" px={2} pb={2}>
        <Button variant="contained" color="primary">
          <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
            Assign
          </MDTypography>
        </Button>
      </MDBox>
    </Card>
  );
}

//     <Card id="workout-form">
//       <MDBox pt={3} px={2}>
//         <MDTypography variant="h4" fontWeight="medium">
//           Assign Workout
//         </MDTypography>
//       </MDBox>
//       {/* <MDBox pt={1} pb={2} px={2}>
//         <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
//           <TextField id="workout_name" label="Workout Name" variant="outlined" />
//         </MDBox>
//       </MDBox> */}

//       {selectedWorkouts.map((workout, index) => (
//         <MDBox key={index} pt={1} pb={2} px={2}>
//           <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
//             <MDBox mb={2}>
//               <FormControl fullWidth>
//                 <InputLabel>Workout Name</InputLabel>
//                 <Select
//                   sx={{ minHeight: "43px" }}
//                   id="id"
//                   label="Workout"
//                   variant="outlined"
//                   // value={selectedExercises}
//                   value={workout.id}
//                   //onChange={handleExerciseChange}
//                   onChange={(event) =>
//                     handleWorkoutChange(index, "workoutId", event.target.value)
//                   }
//                 >
//                   {workouts.map((workout, index) => (
//                     <MenuItem key={index} value={workout.id}>
//                       {workout.workout_name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </MDBox>
//           </MDBox>
//           <MDBox
//             component="ul"
//             display="flex"
//             flexDirection="row"
//             justifyContent="right"
//             p={0}
//             m={0}
//           >
//           </MDBox>
//         </MDBox>
//       ))}

//       {/* <MDBox px={2} pb={2}>
//         <Button variant="contained" color="primary" onClick={handleSubmit}>
//           <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
//             Submit
//           </MDTypography>
//         </Button>
//       </MDBox> */}
//     </Card>
//   );
// }

export default AddAssignment;
