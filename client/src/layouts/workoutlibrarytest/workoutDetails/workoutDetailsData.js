import { useEffect, useState } from "react";

import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDProgress from "components/MDProgress";
import MDButton from "components/MDButton";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

//accordian table stuff
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Add supabase connection
import { supabase } from "../../../supabaseClient";

export default function data() {
  const [workouts, setWorkouts] = useState([]);
  async function getWorkouts() {
    try {
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workout")
        .select("*");
      if (workoutsError) throw workoutsError;

      const { data: customizedexerciseData, error: customizedexerciseError } = await supabase
        .from("customized_exercise")
        .select("*");
      if (customizedexerciseError) throw customizedexerciseError;

      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercise")
        .select("*");
      if (exerciseError) throw exerciseError;

      const workoutsWithExercises = workoutsData.map((workout) => {
        const customizedexercise = customizedexerciseData.find(
          (customizedexercise) => customizedexercise.workout_id === workout.id
        );
        if (customizedexercise) {
          const exercise = exerciseData.find(
            (exercise) => exercise.id === customizedexercise.exercise_id
          );
          return { ...workout, customizedexercise, exercise };
        }
        return workout;
      });
      setWorkouts(workoutsWithExercises);
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getWorkouts();
  }, []);

  return {
    columns: [
      { Header: "Exercise", accessor: "exercise", width: "20%", align: "left" },
      { Header: "Sets", accessor: "set", width: "10%", align: "left" },
      { Header: "Reps", accessor: "rep", width: "10%", align: "left" },
      { Header: "Duration", accessor: "duration", width: "20%", align: "left" },
      { Header: "Coach's Notes", accessor: "coachsnote", width: "40%", align: "left" },
    ],

    rows: workouts
      // .filter((group) => group.team && group.team.name)
      .map((workout) => ({
        exercise: (
          <MDBox display="flex" py={1} pr={2.8} pl={2}>
            {workout.exercise}
          </MDBox>
        ),
        set: (
          <MDBox display="flex" py={1} pr={2.8}>
            {workout.set}
          </MDBox>
        ),
        rep: (
          <MDTypography variant="text" pr={4}>
            {workout.rep}
          </MDTypography>
        ),
        duration: (
          <MDTypography variant="text" pr={4}>
            {workout.duration}
          </MDTypography>
        ),
        coachsnote: (
          <MDTypography variant="text" pr={4}>
            {workout.coachsnote}
          </MDTypography>
        ),
        edit: (
          <MDBox>
            <MDButton variant="text" color="dark" pr={4}>
              <Icon>edit</Icon>&nbsp;edit
            </MDButton>
          </MDBox>
        ),
        delete: (
          <MDBox mr={1}>
            <MDButton variant="text" color="error" pr={1}>
              <Icon>delete</Icon>&nbsp;delete
            </MDButton>
          </MDBox>
        ),
        // workoutID: (
        //   <MDTypography variant="primary" fontWeight="medium">
        //     {workout.id}
        //   </MDTypography>
        // ),
      })),
  };
}
