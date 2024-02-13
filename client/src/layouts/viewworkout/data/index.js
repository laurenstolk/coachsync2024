import { useEffect, useState } from "react";

import Icon from "@mui/material/Icon";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom"; // Import Link from React Router

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Add supabase connection
import { supabase } from "../../../supabaseClient";

export default function Data() {
  const [workouts, setWorkouts] = useState([]);
  const [customizedExercises, setCustomizedExercises] = useState([]);
  const [exercises, setExercises] = useState([]);

  async function ViewWorkout() {
    try {
      // Fetch data from the workout table
      const { data: workoutData, error: workoutError } = await supabase.from("workout").select("*");
      if (workoutError) throw workoutError;
      if (workoutData != null) {
        setWorkouts(workoutData);
      }

      // Fetch data from the customized_exercise table
      const { data: custexerciseData, error: custexerciseError } = await supabase
        .from("customized_exercise")
        .select("*");
      if (custexerciseError) throw custexerciseError;
      if (custexerciseData != null) {
        setCustomizedExercises(custexerciseData);
      }

      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercise")
        .select("*");
      if (exerciseError) throw exerciseError;
      if (exerciseData != null) {
        setExercises(exerciseData);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    ViewWorkout();
  }, []);

  return {
    columns: [
      { Header: "name", accessor: "name", width: "20%", align: "left" },
      { Header: "exercises", accessor: "exercises", width: "40%", align: "left" },
      // { Header: "sets", accessor: "sets", width: "20%", align: "left" },
      // { Header: "reps", accessor: "reps", width: "20%", align: "left" },
      // { Header: "duration", accessor: "duration", width: "20%", align: "left" },
      // { Header: "notes", accessor: "notes", width: "10%", align: "left" },
      { Header: "", accessor: "view", width: "10%", align: "left" },
      // { Header: "delete", accessor: "delete", width: "10%", align: "left" },
    ],
    rows: workouts.map((workout, index) => {
      // Find customized exercises that belong to the current workout
      //const matchedExercises = customizedExercises.filter(exercise => exercise.workout_id === workout.id);
      const matchedExercises = customizedExercises.filter(
        (exercise) => exercise.workout_id === workout.id
      );

      // Map matched exercises to their corresponding data from the exercise table
      const mappedExercises = matchedExercises.map((customizedExercise) => {
        const correspondingExercise = exercises.find(
          (exercise) => exercise.id === customizedExercise.exercise_id
        );
        return correspondingExercise ? correspondingExercise : "hhh";
      });

      console.log("mapped: ", mappedExercises);

      return {
        name: (
          <MDBox display="flex" py={1}>
            {workout.workout_name}
          </MDBox>
        ),

        exercises: (
          <MDBox display="flex" py={1}>
            {mappedExercises.length > 0
              ? mappedExercises.map((mappedExercises, index) => (
                  <span key={index}>
                    {mappedExercises.name}
                    {index < mappedExercises.length - 1 ? ", " : ""}
                  </span>
                ))
              : "No exercises found"}
          </MDBox>
        ),
        // sets: (
        //   <MDBox display="flex" py={1}>
        //     {matchedExercises.length > 0 ?
        //       matchedExercises.map((matchedExercises, index) => (
        //         <span key={index}>
        //           {matchedExercises.sets}{index < matchedExercises.length - 1 ? ", " : ""}
        //         </span>
        //       ))
        //       :
        //       ""
        //     }
        //   </MDBox>
        // ),
        // reps: (
        //   <MDBox display="flex" py={1}>
        //     {matchedExercises.length > 0 ?
        //       matchedExercises.map((matchedExercises, index) => (
        //         <span key={index}>
        //           {matchedExercises.reps}{index < matchedExercises.length - 1 ? ", " : ""}
        //         </span>
        //       ))
        //       :
        //       ""
        //     }
        //   </MDBox>
        // ),
        // duration: (
        //   <MDBox display="flex" py={1}>
        //     {matchedExercises.length > 0 ?
        //       matchedExercises.map((matchedExercises, index) => (
        //         <span key={index}>
        //           {matchedExercises.duration}{index < matchedExercises.length - 1 ? ", " : ""}
        //         </span>
        //       ))
        //       :
        //       ""
        //     }
        //   </MDBox>
        // ),
        // notes: (
        //   <MDBox display="flex" py={1}>
        //     {matchedExercises.length > 0 ?
        //       matchedExercises.map((matchedExercises, index) => (
        //         <span key={index}>
        //           {matchedExercises.coach_notes}{index < matchedExercises.length - 1 ? ", " : ""}
        //         </span>
        //       ))
        //       :
        //       ""
        //     }
        //   </MDBox>
        // ),
        // edit: (
        //   <Link to={`././addworkout/components/index.js/${workout.id}`}>
        //     <MDButton variant="text" color="dark">
        //       <span style={{ display: 'flex', alignItems: 'center' }}>
        //         <Icon>edit</Icon>
        //         <span style={{ marginLeft: '5px' }}>Edit</span>
        //       </span>
        //     </MDButton>
        //   </Link>
        // ),
        view: (
          <Link to={`././addworkout/components/index.js/${workout.id}`}>
            <MDButton variant="text" color="primary">
              <span style={{ display: "flex", alignItems: "center" }}>
                <ArrowForwardIcon fontSize="medium"></ArrowForwardIcon>
                <span style={{ marginLeft: "5px" }}>view</span>
              </span>
            </MDButton>
          </Link>
        ),
      };
    }),
  };
}
