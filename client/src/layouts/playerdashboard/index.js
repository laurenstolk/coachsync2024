/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import Button from "@mui/material/Button"; // Import Button component

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { fetchUserProfile } from "../../fetchUserProfile";
import PsychologyAlt from "@mui/icons-material/PsychologyAlt";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function PlayerDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [wellnessData, setWellnessData] = useState([]); //for chart will remove once new chart is in
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [checkinCompleted, setCheckinCompleted] = useState(false);
  const [checkinFrequency, setCheckinFrequency] = useState("");
  const [nextCheckinDay, setNextCheckinDay] = useState("");
  const [assignedWorkout, setAssignedWorkout] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [user, setUser] = useState(null);

  const getFormattedDate = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserProfile();
      setUser(data);

      setCurrentDate(getFormattedDate(today));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWorkoutCompletion();
      fetchAssignedWorkout();
      console.log("user info: ", user);
    }

    const fetchCheckinCompletion = async () => {
      try {
        // Fetch data from the checkin table to check if the check-in is completed for today
        const { data: checkinData, error: checkinError } = await supabase
          .from("checkin")
          .select("player_id")
          .eq("player_id", user.id)
          .eq("date", today.toISOString().split("T")[0]);

        if (checkinError) throw checkinError;

        setCheckinCompleted(checkinData.length > 0);
      } catch (error) {
        console.error("Error fetching check-in completion:", error.message);
      }
    };

    fetchCheckinCompletion(); // Call the check-in completion function

    // Fetch checkin_frequency from the team table
    const fetchTeamCheckinFrequency = async () => {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from("team")
          .select("checkin_frequency")
          .eq("id", user.team_id)
          .single();

        if (teamError) throw teamError;

        setCheckinFrequency(teamData.checkin_frequency || ""); // Set default value if checkin_frequency is null
      } catch (error) {
        console.error("Error fetching team data:", error.message);
      }
    };

    fetchTeamCheckinFrequency();

    // Calculate and set the next check-in day
    const getNextCheckinDay = () => {
      const currentDayOfWeek = today.getDay();
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      // Extract individual digits from the checkin_frequency
      const frequencyDigits = checkinFrequency.split("").map(Number);

      // Find the next available check-in day
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDayOfWeek + i) % 7;
        if (frequencyDigits.includes(nextDayIndex + 1)) {
          return daysOfWeek[nextDayIndex];
        }
      }

      return null; // Return null if no scheduled check-in days found
    };

    const nextCheckinDay = getNextCheckinDay();
    setNextCheckinDay(nextCheckinDay);

    // ... (other code)
  }, [user, today, checkinFrequency]);

  // Determine if check-in is required for today
  const isCheckinRequired = () => {
    const currentDayOfWeek = today.getDay();
    const frequencyDigits = checkinFrequency.split("").map(Number);
    return frequencyDigits.includes(currentDayOfWeek + 1);
  };

  const checkinRequired = isCheckinRequired();

  async function fetchWorkoutCompletion() {
    try {
      // Fetch data from the assignment table to check if the workout is completed for today
      const { data: completionData, error: completionError } = await supabase
        .from("assignment")
        .select("completed")
        .eq("player_id", user.id)
        .eq("date", today.toISOString().split("T")[0]);

      if (completionError) throw completionError;

      if (completionData.length > 0) {
        setWorkoutCompleted(completionData[0].completed);
      } else {
        setWorkoutCompleted(false);
      }
    } catch (error) {
      console.error("Error fetching workout completion:", error.message);
    }
  }

  async function fetchAssignedWorkout() {
    try {
      // Fetch data from the assignment table to check if there are assigned workouts for today
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignment")
        .select("workout_id")
        .eq("player_id", user.id)
        .eq("date", today.toISOString().split("T")[0]);
  
      if (assignmentError) throw assignmentError;
  
      if (assignmentData.length > 0) {
        const workoutIds = assignmentData.map((assignment) => assignment.workout_id);
        
        // Fetching workout names for the fetched workout ids
        const { data: workoutData, error: workoutError } = await supabase
          .from("workout")
          .select("workout_name")
          .in("id", workoutIds);
  
        if (workoutError) throw workoutError;
  
        const workoutNames = workoutData.map((workout) => workout.workout_name);
        
        // Set the assignedWorkout state to the array of workout names
        setAssignedWorkout(workoutNames);
      } else {
        setAssignedWorkout(null);
      }
    } catch (error) {
      console.error("Error fetching assigned workout:", error.message);
    }
  }
  
  // Calculate the font size based on the number of assigned workouts
 // Calculate the font size based on the number of assigned workouts
 let fontSize;
 console.log("Assigned workouts:", assignedWorkout);
 if (assignedWorkout !== null) {
   if (Array.isArray(assignedWorkout)) {
     const numAssignedWorkouts = assignedWorkout.length;
     if (numAssignedWorkouts === 1 || numAssignedWorkouts === 0) {
       fontSize = 25;
     } else if (numAssignedWorkouts === 2) {
       fontSize = 18;
     } else {
       fontSize = 13; // Adjusted font size for multiple workouts
     }
   } else {
     fontSize = 25; // Default font size if assignedWorkout is not an array
   }
 } else {
   fontSize = 25; // Default font size if assignedWorkout is null or undefined
 }
 console.log("Font size:", fontSize);

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Dashboard" />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="today"
                title="Today's Date"
                count={currentDate}
                percentage={{
                  label: "Win the day",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5} >
            <ComplexStatisticsCard
              icon={<AssignmentTurnedInIcon>Workout</AssignmentTurnedInIcon>}
              title="Assigned Workouts"
              count={
                assignedWorkout !== null && Array.isArray(assignedWorkout) ? (
                  assignedWorkout.map((workout, index) => (
                    <div key={index} style={{ display: "inline-block" }}>
                     <span style={{ fontSize: `${fontSize}px` }}>{workout}</span>
                      {index !== assignedWorkout.length - 1 && <span style={{ fontSize: `${fontSize}px` }}>, </span>}
                    </div>
                  ))
                ) : (
                  assignedWorkout || "No assigned workout."
                )
              }
              percentage={{
                color: "success",
                amount: "",
                label: "Just updated",
              }}
            />
          </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={<FitnessCenterIcon>Workout</FitnessCenterIcon>}
                title="Workout Complete?"
                count={
                  assignedWorkout !== null ? (
                    workoutCompleted ? (
                      "Your workout is complete."
                    ) : (
                      <Button
                        style={{ border: "2px solid", color: "inherit" }}
                        component={Link}
                        to="/completeworkout"
                      >
                        No. Complete Workout?
                      </Button>
                    )
                  ) : (
                    "No assigned workout."
                  )
                }
                percentage={{
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon={<PsychologyAlt>Wellness</PsychologyAlt>}
                title="Check-in Status"
                count={
                  checkinCompleted && currentDate === getFormattedDate(today) ? (
                    "Check-in complete."
                  ) : checkinRequired ? (
                    <Button
                      style={{ border: "2px solid", color: "inherit" }}
                      component={Link}
                      to="/completecheckin"
                    >
                      No. Complete Check-in?
                    </Button>
                  ) : (
                    "No check-in required."
                  )
                }
                percentage={{
                  color: checkinCompleted ? "success" : "error",
                  amount: "",
                  label: nextCheckinDay
                    ? `Next check-in: ${nextCheckinDay}`
                    : "No scheduled check-in",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5} mb={9}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Check-in History"
                  description="Check-in results from the past week."
                  date="Updated Today"
                  chart={{
                    labels: wellnessData.map((item) => {
                      const date = new Date(item.wDateCompleted);
                      date.setUTCHours(0, 0, 0, 0); // Set the time to midnight UTC to ensure consistency
                      return `${date.toLocaleString("en-US", {
                        month: "long",
                      })} ${date.getUTCDate()}`;
                    }),
                    datasets: {
                      label: "Percentage of Players Completed Wellness",
                      data: wellnessData.map((item) => {
                        const percentage = item.count; // Assuming item.count is already in the range of 0 to 100
                        return percentage.toFixed(2); // Round to two decimal places
                      }),
                    },
                    options: {
                      scales: {
                        y: {
                          beginAtZero: true,
                          suggestedMax: 100, // Ensure the maximum value on the y-axis is 100
                        },
                      },
                    },
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
