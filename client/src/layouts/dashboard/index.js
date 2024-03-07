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

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import AssignmentCompleted from "./components/AssignmentCompleted";
import AssignmentNotCompleted from "./components/AssignmentNotCompleted";
import { fetchUserProfile } from "../../fetchUserProfile";
import VerticalBarChart from "../../examples/Charts/BarCharts/VerticalBarChart";

export default function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [assignedWorkoutNames, setAssignedWorkoutNames] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [wellnessData, setWellnessData] = useState([]);
  const [wellnessAverageData, setWellnessAverageData] = useState([]);
  const [wellnessCompletionData, setWellnessCompletionData] = useState([]);
  const [completedWorkoutData, setCompletedWorkoutData] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [playerIds, setPlayerIds] = useState([]);

  const getWellnessChartData = async (endDate, playerIds, checkinCount) => {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // Adjust the start date to include 7 days, including today

    const { data: wellnessCheckinData, error: wellnessError } = await supabase
      .from("checkin")
      .select("*")
      .in("player_id", playerIds)
      .gte("date", startDate.toISOString()) // Filter by start date
      .lte("date", endDate.toISOString()); // Filter by end date

    if (wellnessError) {
      console.error("Error fetching wellness checkin data:", wellnessError.message);
    } else {
      // Initialize wellnessCountMap with all 7 days within the past week
      const wellnessCountMap = new Map();
      for (let i = 0; i <= 6; i++) {
        // Change the loop condition to include today
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        wellnessCountMap.set(date.toISOString().split("T")[0], 0); // Set initial count to 0
      }

      // Update counts based on wellnessCheckinData
      wellnessCheckinData.forEach((item) => {
        const wDateCompleted = item.date;

        if (wellnessCountMap.has(wDateCompleted)) {
          wellnessCountMap.set(wDateCompleted, wellnessCountMap.get(wDateCompleted) + 1);
        }
      });

      // Convert the map to an array for use in the chart
      const wellnessChartData = Array.from(wellnessCountMap).map(([wDateCompleted, count]) => ({
        wDateCompleted,
        count: (count / checkinCount / playerIds.length) * 100,
      }));

      wellnessChartData.sort((a, b) => new Date(a.wDateCompleted) - new Date(b.wDateCompleted));

      setWellnessData(wellnessChartData);
    }
  };

  const getCheckinCompletionData = async (date, playerIds, checkinCount) => {
    const formattedDate = date.toISOString().split("T")[0];

    try {
      const { data: wellnessCheckinData, error: wellnessError } = await supabase
        .from("checkin")
        .select("*")
        .eq("date", formattedDate)
        .in("player_id", playerIds);
      console.log("wellnesscheckindata: ", wellnessCheckinData);

      if (wellnessError) {
        console.error("Error fetching wellness checkin data:", wellnessError.message);
        return;
      }

      // Initialize wellnessCountMap with the current date
      const wellnessCountMap = new Map([[formattedDate, wellnessCheckinData.length]]);
      console.log("wellnessCountMap: ", wellnessCountMap);

      // Calculate the completed wellness percentage
      const totalWellnessExpected = playerIds.length * checkinCount;
      console.log("total wellness expected: ", totalWellnessExpected);
      const totalWellnessCompleted = wellnessCountMap.get(formattedDate) || 0;
      console.log("total wellness completed: ", totalWellnessCompleted);
      const completedPercentage = Math.round(
        (totalWellnessCompleted / totalWellnessExpected) * 100
      );
      console.log("completed wellness percentage: ", completedPercentage);

      // Set wellnessData to an array containing the completed percentage
      setWellnessCompletionData([{ wDateCompleted: formattedDate, count: completedPercentage }]);
    } catch (error) {
      console.error("Error fetching wellness checkin data:", error.message);
    }
  };

  const getWorkoutChartData = async (endDate, playerIds) => {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // Adjust the start date to include 7 days, including today

    // Initialize workoutCountMap with dates of the last 7 days
    const workoutCountMap = new Map();
    for (let i = 0; i <= 6; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      workoutCountMap.set(date.toISOString().split("T")[0], 0);
    }

    const { data: workoutCompletionData, error: workoutError } = await supabase
      .from("assignment")
      .select("*")
      .eq("completed", true) // Filter by completed workouts
      .gte("date", startDate.toISOString()) // Filter by start date
      .lte("date", endDate.toISOString()) // Filter by end date
      .in("player_id", playerIds);
    console.log("past week's workout completion data: ", workoutCompletionData);

    if (workoutError) {
      console.error("Error fetching exercise completion data:", workoutError.message);
    } else {
      // Populate counts in workoutCountMap
      workoutCompletionData.forEach((item) => {
        const dateCompleted = item.date; // Assuming "date" is the field for completion date

        if (workoutCountMap.has(dateCompleted)) {
          workoutCountMap.set(dateCompleted, workoutCountMap.get(dateCompleted) + 1);
        }
      });
      console.log("workoutcountmap: ", workoutCountMap);

      // Convert the map to an array for use in the chart
      const workoutChartData = Array.from(workoutCountMap).map(([dateCompleted, count]) => ({
        dateCompleted,
        count: (count / playerIds.length) * 100,
      }));

      // Sort workoutData and wellnessData arrays by date in ascending order
      workoutChartData.sort((a, b) => new Date(a.dateCompleted) - new Date(b.dateCompleted));
      workoutChartData.sort((a, b) => new Date(a.wDateCompleted) - new Date(b.wDateCompleted));

      setWorkoutData(workoutChartData);
    }
  };

  const getWorkoutCompletionData = async (date, playerIds) => {
    const formattedDate = date.toISOString().split("T")[0];

    try {
      // Fetch workout completion data for the specified date and players
      const { data: completedWorkoutsData, error: workoutError } = await supabase
        .from("assignment")
        .select("*")
        .eq("date", formattedDate)
        .eq("completed", true)
        .in("player_id", playerIds);
      console.log("completedworkoustdata: ", completedWorkoutsData);

      const { data: expectedWorkoutsData, error: expectedWorkoutError } = await supabase
        .from("assignment")
        .select("*")
        .eq("date", formattedDate)
        .in("player_id", playerIds);
      console.log("expectedWorkoutsData: ", expectedWorkoutsData);

      if (workoutError) {
        console.error("Error fetching workout completion data:", workoutError.message);
        return;
      }

      // Calculate the completed workout percentage
      const totalWorkoutsExpected = expectedWorkoutsData.length; // Assuming each player has one workout assigned per day
      const totalWorkoutsCompleted = completedWorkoutsData.length;
      const completedPercentage = (totalWorkoutsCompleted / totalWorkoutsExpected) * 100;

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

        // Store workout names in assignedWorkoutNames state
        setAssignedWorkoutNames(workoutNames);
      }
    } catch (error) {
      console.error("Error fetching assigned workouts:", error.message);
    }
  };

  const getWellnessAverageChartData = async (date, playerIds) => {
    try {
      const { data: wellnessData, error: wellnessError } = await supabase
        .from("checkin")
        .select("*")
        .in("player_id", playerIds)
        .eq("date", date.toISOString().split("T")[0]);

      console.log("wellness data: ", wellnessData);

      if (wellnessError) {
        console.error("Error fetching wellness data:", wellnessError.message);
        return;
      }

      // Group wellness data by wellness_id and calculate average value
      const groupedWellnessData = {};
      wellnessData.forEach((item) => {
        if (!groupedWellnessData[item.wellness_id]) {
          groupedWellnessData[item.wellness_id] = {
            sum: item.value,
            count: 1,
          };
        } else {
          groupedWellnessData[item.wellness_id].sum += item.value;
          groupedWellnessData[item.wellness_id].count++;
        }
      });

      // Fetch wellness names from the wellness table
      const { data: wellnessNames, error: namesError } = await supabase
        .from("wellness")
        .select("id, name");
      // .in("id", Object.keys(groupedWellnessData).map(Number));
      console.log("wellnessNames: ", wellnessNames);

      if (namesError) {
        console.error("Error fetching wellness names:", namesError.message);
        return;
      }

      // Calculate average value for each wellness_id
      const wellnessAverageData = Object.keys(groupedWellnessData).map((key) => ({
        wellness_id: parseInt(key),
        wellness_name: wellnessNames.find((name) => name.id === parseInt(key)).name,
        average_value: groupedWellnessData[key].sum / groupedWellnessData[key].count,
      }));

      // Log the wellness average data
      console.log("Wellness average data:", wellnessAverageData);

      // Set wellness average data state
      setWellnessAverageData(wellnessAverageData);
    } catch (error) {
      console.error("Error fetching wellness data:", error.message);
    }
  };

  const getFormattedDate = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    const fetchData = async () => {
      let playerIds;

      // set the Current Date
      setCurrentDate(getFormattedDate(today));

      try {
        const profileData = await fetchUserProfile();

        const { data: checkinCountData, error: checkinCountError } = await supabase
          .from("team")
          .select("*")
          .filter("id", "eq", profileData.team_id);
        console.log("checkin count data: ", checkinCountData);

        const checkinData = checkinCountData[0]; // Assuming checkinCountData contains the check-in data object

        let trueCount = 0;

        for (const key in checkinData) {
          if (checkinData.hasOwnProperty(key) && checkinData[key] === true) {
            trueCount++;
          }
        }

        console.log("Number of true check-in values:", trueCount);

        // grab the profiles of the players on my team
        const { data: profilesData, error: profilesError } = await supabase
          .from("profile")
          .select("id")
          .filter("player", "eq", true)
          .filter("team_id", "eq", profileData.team_id);
        console.log("profiles on my team: ", profilesData);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError.message);
          return;
        }

        // make an array of the playerIds
        if (profilesData && profilesData.length > 0) {
          playerIds = profilesData.map((profile) => profile.id);
          setPlayerIds(playerIds);
        }
        console.log(tomorrow);

        await getWellnessChartData(today, playerIds, trueCount);
        await getAssignedWorkouts(today, playerIds);
        await getWorkoutChartData(today, playerIds);
        await getCheckinCompletionData(today, playerIds, trueCount);
        await getWorkoutCompletionData(today, playerIds);
        await getWellnessAverageChartData(today, playerIds);
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
                count={
                  <Link to="/workoutlibrary" style={{ textDecoration: "none", color: "inherit" }}>
                    {assignedWorkoutNames.length > 0
                      ? assignedWorkoutNames.join(", ")
                      : "No assigned workout today"}
                  </Link>
                }
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Completed Workouts"
                count={`${
                  completedWorkoutData.length > 0 && !isNaN(completedWorkoutData[0].count)
                    ? completedWorkoutData[0].count + "%" // If data exists and is valid, display the count
                    : "0%" // If no data or invalid data, display 0%
                }`}
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
                color="success"
                icon="store"
                title="Completed Wellness"
                count={`${
                  wellnessCompletionData.length > 0 ? wellnessCompletionData[0].count + "%" : "0%"
                }`}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="info"
                  title="Workout Completion"
                  description="Percentage of players who completed their assigned workout."
                  date="Updated Today"
                  chart={{
                    labels: workoutData.map((item) => {
                      const date = new Date(item.dateCompleted);
                      return `${date.toLocaleString("en-US", {
                        month: "long",
                      })} ${date.getUTCDate()}`;
                    }),
                    datasets: {
                      label: "Percentage of Players Completed Workouts",
                      data: workoutData.map((item) => {
                        return item.count.toFixed(2);
                      }),
                    },
                    options: {
                      scales: {
                        y: {
                          beginAtZero: true,
                          suggestedMax: 100,
                        },
                      },
                    },
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} height="70%">
                <VerticalBarChart
                  icon={{ color: "info", component: "" }}
                  title="Average Wellness Over the Week"
                  description="Average check-in value across all players."
                  chart={{
                    labels: wellnessAverageData.map((item) => item.wellness_name),
                    datasets: [
                      {
                        label: "Average of check-in value",
                        data: wellnessAverageData.map((item) => item.average_value.toFixed(2)),
                        color: "primary", // You can adjust this if needed
                      },
                    ],
                  }}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        suggestedMax: 5, // Set the maximum value of the y-axis scale to 5
                      },
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
                  description="Percentage of players who completed a wellness checkin."
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
