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
import MultipleLineChart from "examples/Charts/LineCharts/MultipleLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import Button from "@mui/material/Button"; // Import Button component


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { fetchUserProfile } from "../../fetchUserProfile";
import PsychologyAlt from "@mui/icons-material/PsychologyAlt";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { Line } from "react-chartjs-2"

export default function PlayerDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [wellnessData, setWellnessData] = useState([]); //for chart will remove once new chart is in
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [checkinCompleted, setCheckinCompleted] = useState(false);
  const [checkinFrequency, setCheckinFrequency] = useState("");
  const [nextCheckinDay, setNextCheckinDay] = useState("");
  const [assignedWorkout, setAssignedWorkout] = useState(null);
  //const [assignedWorkouts, setAssignedWorkouts] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [user, setUser] = useState(null);
  const [playerIds, setPlayerIds] = useState([]);
  const [nextWorkoutDay, setNextWorkoutDay] = useState(null);

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
      fetchAssignedWorkouts();
    }

    const fetchNextWorkoutDay = async () => {
      try {
        const nextWorkoutDayResult = await getNextWorkoutDay();
        setNextWorkoutDay(nextWorkoutDayResult);
      } catch (error) {
        console.error("Error fetching next workout day:", error.message);
      }
    };
  
    fetchNextWorkoutDay();
  

    const fetchCheckinCompletion = async () => {
      try {
        if (!user || !user.id) return; // Add null check here

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
        if (!user || !user.team_id) return; // Add null check here

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
  }, []); // removed this (user, today, checkinFrequency) from the array -- may have been constantly refreshing everything 

  // Determine if check-in is required for today
  const isCheckinRequired = () => {
    const currentDayOfWeek = today.getDay();
    const frequencyDigits = checkinFrequency.split("").map(Number);
    return frequencyDigits.includes(currentDayOfWeek + 1);
  };

  const checkinRequired = isCheckinRequired();

  //function to display next workout day
  const getNextWorkoutDay = async () => {
    try {
      // Fetch data from the assignment table to get future assigned workout dates
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignment")
        .select("date")
        .eq("player_id", user.id)
        .gte("date", today.toISOString().split("T")[0]); // Get assignments with dates greater than or equal to today
  
      if (assignmentError) {
        throw assignmentError;
      }
  
      if (assignmentData.length === 0) {
        return "None Assigned";
      }
  
      // Filter out past dates
      const futureAssignments = assignmentData.filter(item => new Date(item.date) >= today);
  
      if (futureAssignments.length === 0) {
        return "None Assigned";
      }
  
      // Sort future assignments by date in ascending order
      const sortedAssignments = futureAssignments.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      // Get the date of the next assigned workout directly from sortedAssignments array
      const nextWorkoutDate = sortedAssignments[0].date;
  
      return nextWorkoutDate;
    } catch (error) {
      console.error("Error fetching next workout day:", error.message);
      return "Error fetching next workout day";
    }
  };

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

  async function fetchAssignedWorkouts() {
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
        setAssignedWorkout([]);
      }


    } catch (error) {
      console.error("Error fetching assigned workout:", error.message);
    }
  }

  // Calculate the font size based on the number of assigned workouts
  let fontSize;
  if (assignedWorkout !== null) {
    if (Array.isArray(assignedWorkout)) {
      const numAssignedWorkouts = assignedWorkout.length;
      if (numAssignedWorkouts === 1 || numAssignedWorkouts === 0) {
        fontSize = 25;
      } else if (numAssignedWorkouts === 2) {
        fontSize = 20;
      } else {
        fontSize = 15; // Adjusted font size for multiple workouts
      }
    } else {
      fontSize = 25; // Default font size if assignedWorkout is not an array
    }
  } else {
    fontSize = 25; // Default font size if assignedWorkout is null or undefined
  };

  //working on the line chart
  const currentDay = new Date(); // Get today's date
  const labels = []; // Initialize an array to hold the labels

  // Loop through the past 7 days and generate labels
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDay); // Create a new date object for each day
    date.setDate(today.getDate() - i); // Subtract i days from today's date
    labels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" })); // Format the date and push it to the labels array
  };

  //checkin chart 

  const [checkinData, setCheckinData] = useState(null); // State variable for storing checkin data

  // useEffect(() => {
  //   // Fetch checkin data
  //   const fetchCheckinData = async () => {
  //     try {
  //       const { data: checkinData, error: checkinError } = await supabase
  //         .from("checkin")
  //         .select("date, wellness_id, value")
  //         .eq("player_id", user.id)
  //         .gte("date", new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()) // Fetch data for the past 7 days
  //         .order("date");

  //       if (checkinError) {
  //         throw checkinError;
  //       }

  //       setCheckinData(checkinData);
  //     } catch (error) {
  //       console.error("Error fetching checkin data:", error.message);
  //     }
  //   };

  //   if (user && user.id) {
  //     fetchCheckinData();
  //   }
  // }, []);

  // console.log("This is the checkin data ",checkinData)
  // //end checkin chart

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Function to fetch data from the checkin table
    const fetchChartData = async () => {
      try {
        // Fetch the past week of data for wellness_id 1
        const { data: wellness1Data, error: wellness1Error } = await supabase
          .from("checkin")
          .select("date, value")
          .eq("wellness_id", 1)
          .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Get data for the past week
          .order("date");

        const { data: wellness2Data, error: wellness2Error } = await supabase
          .from("checkin")
          .select("date, value")
          .eq("wellness_id", 2)
          .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Get data for the past week
          .order("date");  

        const { data: wellness3Data, error: wellness3Error } = await supabase
          .from("checkin")
          .select("date, value")
          .eq("wellness_id", 3)
          .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Get data for the past week
          .order("date");   
        
        const { data: wellness4Data, error: wellness4Error } = await supabase
          .from("checkin")
          .select("date, value")
          .eq("wellness_id", 4)
          .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Get data for the past week
          .order("date");   

        const { data: wellness5Data, error: wellness5Error } = await supabase
          .from("checkin")
          .select("date, value")
          .eq("wellness_id", 5)
          .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Get data for the past week
          .order("date");     

        if (wellness1Error || wellness2Error || wellness3Error || wellness4Error || wellness5Error) {
          throw wellness1Error || wellness2Error || wellness3Error || wellness4Error || wellness5Error;
        }

        // Format the fetched data for the chart
          const formattedData = {
            labels: [],
            datasets: [
              {
                label: "Wellness Data 1 - Water",
                data: [],
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
              },
              {
                label: "Wellness Data 2 - Sleep",
                data: [],
                fill: false,
                borderColor: "rgb(255, 99, 132)",
                tension: 0.1,
              },
              {
                label: "Wellness Data 3 - Stress",
                data: [],
                fill: false,
                borderColor: "rgb(54, 162, 235)",
                tension: 0.1,
              },
              {
                label: "Wellness Data 4 - Soreness",
                data: [],
                fill: false,
                borderColor: "rgb(255, 205, 86)",
                tension: 0.1,
              },
              {
                label: "Wellness Data 5 - Energy",
                data: [],
                fill: false,
                borderColor: "rgb(153, 102, 255)",
                tension: 0.1,
              },
            ],
          };

        // Generate labels for the last 7 days
        const currentDate = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(currentDate.getDate() - i);
          formattedData.labels.push(date.toISOString().split("T")[0]); // Add date to labels array
        }

        // Populate the data array
        for (let i = 0; i < 7; i++) {
          const currentDate = formattedData.labels[i];
          const wellness1Entry = wellness1Data.find((entry) => entry.date === currentDate);
          const wellness2Entry = wellness2Data.find((entry) => entry.date === currentDate);
          const wellness3Entry = wellness3Data.find((entry) => entry.date === currentDate);
          const wellness4Entry = wellness4Data.find((entry) => entry.date === currentDate);
          const wellness5Entry = wellness5Data.find((entry) => entry.date === currentDate);
          formattedData.datasets[0].data.push(wellness1Entry ? wellness1Entry.value : null);
          formattedData.datasets[1].data.push(wellness2Entry ? wellness2Entry.value : null);
          formattedData.datasets[2].data.push(wellness3Entry ? wellness3Entry.value : null);
          formattedData.datasets[3].data.push(wellness4Entry ? wellness4Entry.value : null);
          formattedData.datasets[4].data.push(wellness5Entry ? wellness5Entry.value : null);
        }

        // Set the formatted data to the state
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching checkin data:", error.message);
      }
    };

    fetchChartData(); // Call the function to fetch checkin data
  }, []);

  //binary data for multiplelinechart
  // const checkinBinaryData = [];
  // if (checkinData !== null) {
  //   for (let i = 6; i >= 0; i--) {
  //     const date = new Date(today);
  //     date.setDate(today.getDate() - i);
  //     const checkinEntry = checkinData.find(entry => {
  //       const entryDate = new Date(entry.date);
  //       return entryDate.toDateString() === date.toDateString();
  //     });
  //     checkinBinaryData.push(checkinEntry ? 1 : 0);
  //   }
  // }

  // console.log("binary data", checkinBinaryData)

  //end binary data

  //test new chart
  // const chartData = {
  //   labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  //   datasets: [
  //     {
  //       label: "Sample Data 1",
  //       data: [12, 19, 3, 5, 2, 3, 15], // Sample data values for the first line
  //       fill: false,
  //       borderColor: "rgb(75, 192, 192)",
  //       tension: 0.1,
  //     },
  //     {
  //       label: "Sample Data 2", // Label for the second line
  //       data: [5, 12, 7, 10, 4, 8, 11], // Sample data values for the second line
  //       fill: false,
  //       borderColor: "rgb(255, 99, 132)", // Different color for the second line
  //       tension: 0.1,
  //     },
  //   ],
  // };

  // end test chart 

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
                  icon={<AssignmentTurnedInIcon>Workout</AssignmentTurnedInIcon>}
                  title="Assigned Workouts"
                  count={
                    assignedWorkout && assignedWorkout.length > 0 ? (
                      assignedWorkout.map((workout, index) => (
                          <div key={index} style={{ display: "inline-block" }}>
                            <span style={{ fontSize: `${fontSize}px` }}>{workout}</span>
                            {index !== assignedWorkout.length - 1 && (
                              <span style={{ fontSize: `${fontSize}px` }}>, </span>
                            )}
                          </div>
                        ))
                      ) : ( "No assigned workout."
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
                  (assignedWorkout !== null && assignedWorkout.length > 0 && workoutCompleted) ? (
                    "Your workout is complete."
                  ) : (
                    assignedWorkout !== null && assignedWorkout.length > 0 ? (
                      <Button
                        style={{ border: "2px solid", color: "inherit" }}
                        component={Link}
                        to="/completeworkout"
                      >
                        No. Complete Workout?
                      </Button>
                    ) : (
                        "No assigned workout."
                    )
                  )
                }
                percentage={{
                  amount: "",
                  label: nextWorkoutDay ? `Next Workout: ${nextWorkoutDay}` : "Fetching next workout day..."
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
              {/* <MultipleLineChart
                color="success"
                title="Check-in Results"
                description="Days from the past week that you completed your check in."
                date="Updated Today"
                chart={{
                  labels: labels,
                  datasets: {
                    label: "Completed Daily Wellness?",
                    data: checkinBinaryData,//checkinData ? checkinData.map(entry => entry.value) : [],
                  }
                }}
              /> */}
            </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={4.5} mb={9}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                {chartData && <Line data={chartData} />} {/* Render the line chart when data is available */}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
