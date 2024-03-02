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
import MDProgress from "components/MDProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import AssignmentCompleted from "./components/AssignmentCompleted";
import AssignmentNotCompleted from "./components/AssignmentNotCompleted";
import { fetchUserProfile } from "../../fetchUserProfile";
import profile from "../profile";

export default function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { sales, tasks } = reportsLineChartData;
  const [assignedWorkoutNames, setAssignedWorkoutNames] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [wellnessData, setWellnessData] = useState([]);
  const [wellnessCompletionData, setWellnessCompletionData] = useState([]);
  const [completedWorkoutData, setCompletedWorkoutData] = useState([]);
  const [currentDate, setCurrentDate] = useState("");

  const getWellness = async() => {
    const { data: wellnessCheckinData, error: wellnessError } = await supabase
        .from("checkin")
        .select("*");

    if (wellnessError) {
      console.error("Error fetching wellness checkin data:", wellnessError.message);
    } else {
      // Count occurrences of each date
      const wellnessCountMap = new Map();
      wellnessCheckinData.forEach((item) => {
        const wDateCompleted = item.date;

        if (wellnessCountMap.has(wDateCompleted)) {
          wellnessCountMap.set(wDateCompleted, wellnessCountMap.get(wDateCompleted) + 1);
        } else {
          wellnessCountMap.set(wDateCompleted, 1);
        }
      });
      // Convert the map to an array for use in the chart
      const wellnessChartData = Array.from(wellnessCountMap).map(([wDateCompleted, count]) => ({
        wDateCompleted,
        count: count / 5,
      }));

      wellnessChartData.sort((a, b) => new Date(a.wDateCompleted) - new Date(b.wDateCompleted));

      setWellnessData(wellnessChartData);
    }
  }

  const getCheckinCompletionData = async (date, playerIds) => {
    const formattedDate = date.toISOString().split("T")[0];
    console.log("Current date:", formattedDate);
    console.log("Player IDs:", playerIds);

    try {
      const { data: wellnessCheckinData, error: wellnessError } = await supabase
        .from("checkin")
        .select("*")
        .eq("date", formattedDate)
        .in("player_id", playerIds);
      console.log("wellnessCheckinData: ", wellnessCheckinData);

      if (wellnessError) {
        console.error("Error fetching wellness checkin data:", wellnessError.message);
        return;
      }

      // Initialize wellnessCountMap with the current date
      const wellnessCountMap = new Map([[formattedDate, wellnessCheckinData.length]]);

      // Calculate the completed wellness percentage
      const totalWellnessExpected = playerIds.length * 5; // Assuming each person has 5 wellness check-ins
      console.log("totalWellnessExpected: ", totalWellnessExpected);
      const totalWellnessCompleted = wellnessCountMap.get(formattedDate) || 0;
      console.log("totalWellnessCompleted: ", totalWellnessCompleted);
      const completedPercentage = (totalWellnessCompleted / totalWellnessExpected) * 100;
      console.log("completedPercentage: ", completedPercentage);

      // Set wellnessData to an array containing the completed percentage
      setWellnessCompletionData([{ wDateCompleted: formattedDate, count: completedPercentage }]);
    } catch (error) {
      console.error("Error fetching wellness checkin data:", error.message);
    }
  };

  const getExerciseCompletionData = async () => {
    const { data: exerciseCompletionData, error: exerciseError } = await supabase
      .from("exercise_completion")
      .select("*"); // You can customize the columns you want to select

    if (exerciseError) {
      console.error("Error fetching exercise completion data:", exerciseError.message);
    } else {
      // Count occurrences of each date_completed
      const exerciseCountMap = new Map();
      exerciseCompletionData.forEach((item) => {
        const dateCompleted = item.date_completed;

        if (exerciseCountMap.has(dateCompleted)) {
          exerciseCountMap.set(dateCompleted, exerciseCountMap.get(dateCompleted) + 1);
        } else {
          exerciseCountMap.set(dateCompleted, 1);
        }
      });
      // Convert the map to an array for use in the chart
      const exerciseChartData = Array.from(exerciseCountMap).map(([dateCompleted, count]) => ({
        dateCompleted,
        count,
      }));

      setExerciseData(exerciseChartData);
    }
  };

  const getWorkoutCompletionData = async (date, playerIds) => {
    const formattedDate = date.toISOString().split("T")[0];
    console.log("Current date:", formattedDate);
    console.log("Player IDs:", playerIds);

    try {
      // Fetch workout completion data for the specified date and players
      const { data: completedWorkoutsData, error: workoutError } = await supabase
        .from("assignment")
        .select("*")
        .eq("date", formattedDate)
        .eq("completed", true)
        .in("player_id", playerIds);
      console.log("completed workouts: ", completedWorkoutsData);

      if (workoutError) {
        console.error("Error fetching workout completion data:", workoutError.message);
        return;
      }

      // Calculate the completed workout percentage
      const totalWorkoutsExpected = playerIds.length; // Assuming each player has one workout assigned per day
      console.log("total workouts expected: ", totalWorkoutsExpected);
      const totalWorkoutsCompleted = completedWorkoutsData.length;
      console.log("total workouts completed: ", totalWorkoutsCompleted);
      const completedPercentage = (totalWorkoutsCompleted / totalWorkoutsExpected) * 100;
      console.log("completed workout percentage: ", completedPercentage);

      // Set workoutData state to an array containing the completed percentage
      setCompletedWorkoutData([{ dateCompleted: formattedDate, count: completedPercentage }]);
    } catch (error) {
      console.error("Error fetching workout completion data:", error.message);
    }
  };

  const getAssignedWorkouts = async (date, playerIds) => {
    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("assignment")
        .select("*")
        .in("player_id", playerIds)
        .eq("date", today.toISOString().split("T")[0]);
      console.log("my team's today's workouts: ", assignmentsData);

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError.message);
        return;
      }

      // Extract unique workout_ids
      const workoutIds = new Set();
      assignmentsData.forEach((assignment) => {
        workoutIds.add(assignment.workout_id);
      });

      // Convert workoutIds set to an array
      const workoutIdsArray = Array.from(workoutIds);
      console.log("Unique workout_ids:", workoutIdsArray);

      // Fetch workout names corresponding to unique workout_ids
      const { data: workoutData, error: workoutError } = await supabase
        .from("workout") // Assuming the table name is "workouts"
        .select("workout_name") // Assuming the column name is "name"
        .in("id", workoutIdsArray); // Pass the array directly without converting again

      if (workoutError) {
        console.error("Error fetching workouts:", workoutError.message);
        return;
      }

      if (workoutData && workoutData.length > 0) {
        // Extract workout names from the data
        const workoutNames = workoutData.map((workout) => workout.workout_name);
        console.log("Unique workout names:", workoutNames);

        // Store workout names in assignedWorkoutNames state
        setAssignedWorkoutNames(workoutNames);
      }
    } catch (error) {
      console.error("Error fetching assigned workouts:", error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let playerIds;

      try {
        const profileData = await fetchUserProfile();
        const { data: profilesData, error: profilesError } = await supabase
          .from("profile")
          .select("id")
          .filter("team_id", "eq", profileData.team_id);
        console.log("profilesData: ", profilesData);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError.message);
          return;
        }

        if (profilesData && profilesData.length > 0) {
          playerIds = profilesData.map((profile) => profile.id);
          console.log("playerIds: ", playerIds);
        }

        await getWellness();
        await getAssignedWorkouts(today, playerIds);
        await getExerciseCompletionData();
        await getCheckinCompletionData(today, playerIds);
        await getWorkoutCompletionData(today, playerIds);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, []);

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
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="check"
                title="Assigned Workouts"
                // Replace "Run 1 mile" with the assigned workout name variable
                count={
                  <Link to="/workoutlibrary" style={{ textDecoration: "none", color: "inherit" }}>
                    {assignedWorkoutNames.length > 0
                      ? assignedWorkoutNames.join(", ")
                      : "No assigned workout"}
                  </Link>
                }
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Completed Wellness"
                count={`${wellnessCompletionData.length > 0 ? wellnessCompletionData[0].count + "%" : "0%"}`}
                // percentage={{
                //   color: "success",
                //   amount: `${wellnessData.length > 0 ? "+" + (wellnessData[0].count - yesterdayWellnessCount) + "%" : "+0%"}`,
                //   label: "than yesterday",
                // }}
              />
              <MDProgress
                value={wellnessCompletionData.length > 0 ? wellnessCompletionData[0].count : 0}
                color="info"
                variant="gradient"
                label={false}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Completed Workouts"
                count={`${completedWorkoutData.length > 0 ? completedWorkoutData[0].count + "%" : "0%"}`}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
              <MDProgress
                  value={completedWorkoutData.length > 0 ? completedWorkoutData[0].count : 0}
                  color="success"
                  variant="gradient"
                  label={false}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Exercise Completion"
                  description="The number of players who completed their assigned workout."
                  date="Updated today"
                  chart={{
                    labels: exerciseData.map((item) => item.dateCompleted),
                    datasets: {
                      label: "Number of Players",
                      data: exerciseData.map((item) => item.count),
                    },
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Wellness Completion"
                  description="Number of players who completed their wellness per day"
                  date="Updated Today"
                  chart={{
                    labels: wellnessData.map((item) => item.wDateCompleted),
                    datasets: {
                      label: "Wellnesses Completed",
                      data: wellnessData.map((item) => item.count),
                    },
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <AssignmentNotCompleted />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <AssignmentCompleted />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}