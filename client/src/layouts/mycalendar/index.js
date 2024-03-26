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
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Link } from "react-router-dom";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ViewCalendar() {
  const [assignments, setAssignments] = useState([]);
  const [wellness, setWellness] = useState([]);
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
      console.log("user info: ", user);
    }
  }, [user]); // Add user as a dependency

  useEffect(() => {
    getGroups();
  }, []);

  //wellness checkin stuff for the past 6 weeks and future 12 weeks

  async function getWellnessCheckins(teamCheckinFrequency) {
    console.log("Team Checkin Frequency:", teamCheckinFrequency);

    const today = new Date();
    const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Adjusting Sunday to be day 7

    const checkinDays = teamCheckinFrequency.split("").map(Number);
    console.log("checkin dates split", checkinDays);
    const checkinDates = [];

    // Get check-in dates for the past 6 weeks (including last week)
    for (let i = -6; i <= -1; i++) {
      const pastDate = new Date(today); // Create a new Date object based on today's date
      pastDate.setDate(pastDate.getDate() + 7 * i); // Move to the past week
      const pastDayOfWeek = pastDate.getDay() === 0 ? 7 : pastDate.getDay(); // Adjusting Sunday to be day 7

      checkinDays.forEach((day) => {
        const daysToSubtract = pastDayOfWeek - day;
        const date = new Date(pastDate); // Create a new Date object based on the past date
        date.setDate(date.getDate() - daysToSubtract); // Set the date to the previous check-in day
        checkinDates.push(date);
      });
    }

    // Get check-in dates for the current week
    checkinDays.forEach((day) => {
      const formattedDay = day;
      const daysToAdd =
        formattedDay >= currentDayOfWeek
          ? formattedDay - currentDayOfWeek
          : formattedDay + (7 - currentDayOfWeek);
      const date = new Date(today); // Create a new Date object based on today's date
      date.setDate(date.getDate() + daysToAdd); // Set the date to the next check-in day
      checkinDates.push(date);
    });

    // Get check-in dates for the next 12 weeks
    for (let i = 1; i <= 12; i++) {
      checkinDays.forEach((day) => {
        const daysToAdd = day - currentDayOfWeek + 7 * i;
        const date = new Date(today); // Create a new Date object based on today's date
        date.setDate(date.getDate() + daysToAdd); // Set the date to the next check-in day
        checkinDates.push(date);
      });
    }

    console.log("Check-in Dates:", checkinDates);
    return checkinDates;
  }

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

      // Fetch data from the team table
      const { data: teamData, error: teamError } = await supabase
        .from("team")
        .select("id, checkin_frequency")
        .eq("id", user.team_id);
      if (teamError) throw teamError;

      console.log("Team Data:", teamData); // Add this line to check teamData

      const team = teamData[0];
      const wellnessCheckinDates = await getWellnessCheckins(team.checkin_frequency);
      console.log("Wellness Check-in Dates:", wellnessCheckinDates);

      // Create a map to store team data by team id for easy lookup
      const teamMap = {};
      teamData.forEach((team) => {
        teamMap[team.id] = team;
      });
      console.log("team data:", teamMap);

      // Fetch data from the assignment table
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignment")
        .select("*")
        .in(
          "player_id",
          profileData.map((profile) => profile.id)
        ); // Filter assignments by player IDs belonging to the user's team

      if (assignmentError) throw assignmentError;
      // Filter assignments by player IDs belonging to the current user
      const assignmentsForCurrentUser = assignmentData.filter(
        (assignment) => assignment.player_id === user.id
      );
      // Group assignments by date, notes, and workout_id
      const groupedAssignments = {};
      assignmentsForCurrentUser.forEach((assignment) => {
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

      const wellnessCheckins = wellnessCheckinDates.map((date) => ({
        id: 0,
        workout_id: 0, // Assign a default value for workout_id
        date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
          .getDate()
          .toString()
          .padStart(2, "0")}`, // Format date as 'YYYY-MM-DD'
        notes: "test", // Assign a default value for notes
        player_id: null, // Assign a default value for player_id
        workout_name: "Wellness Assigned", // Indicate wellness check-in
        player_ids: "All Players", // Indicate all players
      }));

      // Sort assignments by date (closest to farthest)
      assignmentsWithWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Set the fetched assignments data to state
      setAssignments(assignmentsWithWorkouts);
      setWellness(wellnessCheckins);
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
                {/* <MDButton
                  variant="outlined"
                  component={Link}
                  to="/addassignment"
                  style={{
                    position: "absolute",
                    top: -7,
                    right: 40,
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    color: "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  Add Assignment
                </MDButton> */}
              </MDBox>
              <MDBox pt={3} pl={2} pr={2} pb={2}>
                {" "}
                {/* Adjust padding as needed */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <DateCalendar
                        wellness={wellness}
                        onChange={handleDateChange}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                    {selectedDate && (
                      <div>
                        {/* Display assigned wellness check-in if the selected date is a wellness check-in date */}
                        {wellness.some((assignment) => {
                          const assignmentDate = new Date(assignment.date);
                          const selectedDateObject = new Date(selectedDate);

                          return (
                            assignment.workout_name === "Wellness Assigned" &&
                            assignmentDate.getFullYear() === selectedDateObject.getFullYear() &&
                            assignmentDate.getMonth() === selectedDateObject.getMonth() &&
                            assignmentDate.getDate() === selectedDateObject.getDate()
                          );
                        }) && (
                          <div
                            style={{
                              padding: "10px",
                              border: "1px solid #ccc",
                              borderRadius: "5px",
                              marginBottom: "2px",
                            }}
                          >
                            <h4>Wellness Assigned</h4>
                          </div>
                        )}

                        {/* Display other assignment details for the selected date */}
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
                            // Check if this assignment is not a wellness check-in

                            // Check if there are multiple assignments with the same date but different notes
                            const differentNotes = array.filter(
                              (item) =>
                                item.date === assignment.date && item.notes !== assignment.notes
                            );

                            // If there are assignments with different notes, display a new row for each one
                            if (differentNotes.length > 0) {
                              return (
                                <div
                                  style={{
                                    padding: "10px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    marginBottom: "2px",
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
                              <div
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                  borderRadius: "5px",
                                  marginBottom: "2px",
                                }}
                                key={assignment.id}
                              >
                                <h4>Workout Assigned</h4>
                                {/* <p style={{ textIndent: "25px"}}>Date: {assignment.date}</p> */}
                                <p style={{ textIndent: "25px" }}>
                                  Workout Name: {assignment.workout_name}
                                </p>
                                <p style={{ textIndent: "25px" }}>Notes: {assignment.notes}</p>
                                <p style={{ textIndent: "25px" }}>
                                  Assigned to: {assignment.player_ids}
                                </p>
                              </div>
                            );
                          })}
                        {/* If no assignments or wellness assignments are found, display a message */}
                        {/* {assignments.filter((assignment) && wellness.filter((well)) => {
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
                                          .length === 0 && (
                                              <div>
                                                  <p>No Workout Assigned</p>
                                              </div>
                                          )}  */}
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
