import React, { useEffect, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { supabase } from "../../supabaseClient";
import { fetchUserProfile } from "../../fetchUserProfile";


// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button"; // Import Button component

function ViewCalendar() {
  const [assignments, setAssignments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserProfile();
      setUser(data);
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (user) {
      getGroups(); // Call getProfiles when user changes
      console.log("user info: ", user)
    }
  }, [user]); // Add user as a dependency

  useEffect(() => {
    getGroups();
  }, []);

  async function getGroups() {
    try {
      if (!user) {
        return; // Exit early if user is null
      }
      // Fetch data from the profile table
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("team_id", user.team_id)
        .eq("player", true)
        .not("first_name", "is", null) // Filter out entries where first_name is null
        .not("last_name", "is", null);
      if (profileError) throw profileError;
      console.log("Profile Data:", profileData);
      
      // Fetch data from the assignment table
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignment")
        .select("*")
        .in("player_id", profileData.map(profile => profile.id)); // Filter assignments by player IDs belonging to the user's team
      if (assignmentError) throw assignmentError;

      // Group assignments by date, notes, and workout_id
      const groupedAssignments = {};
      assignmentData.forEach((assignment) => {
        const key = `${assignment.date}-${assignment.notes}-${assignment.workout_id}`;
        if (!groupedAssignments[key]) {
          groupedAssignments[key] = { ...assignment, player_ids: [assignment.player_id] };
        } else {
          groupedAssignments[key].player_ids.push(assignment.player_id);
        }
      });

      // Convert grouped assignments back to an array
      const assignmentsWithGroupedPlayers = Object.values(groupedAssignments);

      // Fetch data from the workout table
      const { data: workoutData, error: workoutError } = await supabase.from("workout").select("*");
      if (workoutError) throw workoutError;

      // Create a map to store workout data by workout id for easy lookup
      const workoutMap = {};
      workoutData.forEach((workout) => {
        workoutMap[workout.id] = workout;
      });

      

      // Create a map to store profile data by profile id for easy lookup
      const profileMap = {};
      profileData.forEach((profile) => {
        profileMap[profile.id] = profile;
      });
      console.log("Profile Map:", profileMap);

      // Join assignment data with workout data based on workout_id
      const assignmentsWithWorkouts = assignmentsWithGroupedPlayers.map((assignment) => ({
        ...assignment,
        workout_name: workoutMap[assignment.workout_id]?.workout_name || "Unknown Workout", // Use a default value if workout is not found
        player_ids: assignment.player_ids
          .map((player_id) => {
            const profile = profileMap[player_id];
            if (profile) {
              return `${profile.first_name} ${profile.last_name}`;
            } else {
              return "Unknown Player";
            }
          })
          .join(", "),
      }));

      // Sort assignments by date (closest to farthest)
      assignmentsWithWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Set the fetched assignments data to state
      setAssignments(assignmentsWithWorkouts);
    } catch (error) {
      console.error("Error fetching assignments:", error.message);
    }
  }
  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    console.log("Selected Date:", newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Team Calendar" />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Team Calendar
                </MDTypography>
                <MDButton
                  variant="outlined"
                  component={Link}
                  to="/addassignment"
                  color="white"
                  style={{ position: "absolute", top: -7, right: 40 }}
                >
                  Add Assignment
                </MDButton>
              </MDBox>
              <MDBox pt={3} pl={2} pr={2} pb={2}>
                {" "}
                {/* Adjust padding as needed */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <DateCalendar
                        assignments={assignments}
                        onChange={handleDateChange}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                    {selectedDate && (
                      <div
                        style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}
                      >
                        {/* Display assignment details for the selected date */}
                        {/* Filter assignments for the selected date */}
                        {assignments
                          .filter((assignment) => {
                            // Convert assignment date to a Date object for comparison
                            const assignmentDate = new Date(assignment.date);
                            assignmentDate.setDate(assignmentDate.getDate() + 1);

                            // Convert selectedDate to a Date object for comparison
                            const selectedDateObject = new Date(selectedDate);

                            return (
                              assignmentDate.getFullYear() === selectedDateObject.getFullYear() &&
                              assignmentDate.getMonth() === selectedDateObject.getMonth() &&
                              assignmentDate.getDate() === selectedDateObject.getDate()
                            );
                          })
                          .map((assignment, index, array) => {
                            // Check if there are multiple assignments with the same date but different notes
                            const differentNotes = array.filter(
                              (item) =>
                                item.date === assignment.date && item.notes !== assignment.notes
                            );
                            console.log("diff notes:", differentNotes);

                            // If there are assignments with different notes, display a new row for each one
                            if (differentNotes.length > 0) {
                              return (
                                <div
                                  style={{
                                    padding: "20px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                  }}
                                  key={assignment.id}
                                >
                                  <p>Date: {assignment.date}</p>
                                  <p>Workout Name: {assignment.workout_name}</p>
                                  <p>Notes: {assignment.notes}</p>
                                  <p>Assigned to: {assignment.player_ids}</p>
                                </div>
                              );
                            }

                            // Otherwise, display the assignment details
                            return (
                              <div key={assignment.id}>
                                <p>Date: {assignment.date}</p>
                                <p>Workout Name: {assignment.workout_name}</p>
                                <p>Notes: {assignment.notes}</p>
                                <p>Assigned to: {assignment.player_ids}</p>
                              </div>
                            );
                          })}
                        {/* If no assignments are found, display a message */}
                        {assignments.filter((assignment) => {
                          // Convert assignment date to a Date object for comparison
                          const assignmentDate = new Date(assignment.date);
                          assignmentDate.setDate(assignmentDate.getDate() + 1);

                          // Convert selectedDate to a Date object for comparison
                          const selectedDateObject = new Date(selectedDate);

                          return (
                            assignmentDate.getFullYear() === selectedDateObject.getFullYear() &&
                            assignmentDate.getMonth() === selectedDateObject.getMonth() &&
                            assignmentDate.getDate() === selectedDateObject.getDate()
                          );
                        }).length === 0 && (
                          <div>
                            <p>No Assignments</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </LocalizationProvider>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ViewCalendar;
