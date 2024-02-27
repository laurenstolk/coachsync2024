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
import { supabase } from "../../supabaseClient";
import AssignmentCompleted from "./components/AssignmentCompleted";
import AssignmentNotCompleted from "./components/AssignmentNotCompleted";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [exerciseData, setExerciseData] = useState([]);
  const [wellnessData, setWellnessData] = useState([]);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // Set the current date dynamically
        const today = new Date();
        const options = { year: "numeric", month: "short", day: "numeric" };
        const formattedDate = today.toLocaleDateString(undefined, options);
        setCurrentDate(formattedDate);

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
                count="Run 1 mile"
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
                count="60%"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than yesterday",
                }}
              />
              <MDProgress value={60} color="info" variant="gradient" label={false} />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Completed Workouts"
                count="90%"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
              <MDProgress value={90} color="success" variant="gradient" label={false} />
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

export default Dashboard;
