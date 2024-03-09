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
      console.log("user info: ", user);
    }
  }, [user]); // Add user as a dependency

  useEffect(() => {
    getGroups();
  }, []);

  async function getWellnessCheckins(teamCheckinFrequency) {
    console.log("Team Checkin Frequency:", teamCheckinFrequency);

    const today = new Date();
    const currentDayOfWeek = (today.getDay() + 6) % 7; // Get the current day of the week (0: Sunday, 1: Monday, ...)

    const checkinDays = teamCheckinFrequency.split("").map(Number);
    console.log("checkin dates split", checkinDays)
    const checkinDates = [];
    checkinDays.forEach(day => {
      console.log("day of week", day)
        // Convert the day of the week number to the $W format
        const dayOfWeek = (day -1); // Adjust the day of the week to match JavaScript's numbering
        console.log("day of the week:", dayOfWeek)
        const formattedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday (0) to 7
        const date = new Date(today); // Create a new Date object based on today's date
        date.setDate(date.getDate() + (formattedDay + 6 - currentDayOfWeek) % 7); // Set the date to the next check-in day
        checkinDates.push(date);
      });
    console.log("Check-in Dates:", checkinDates);
    return checkinDates;
}
  // async function getWellnessCheckins(teamCheckinFrequency, selectedDate) {
  //   const checkinDays = teamCheckinFrequency.split(",").map(Number);
  //   const selectedDayOfWeek = selectedDate.getDay(); // Get the day of the week (0: Sunday, 1: Monday, ...)

  //   const wellnessCheckinDates = checkinDays.map(day => {
  //       const daysToAdd = (day - selectedDayOfWeek + 7) % 7; // Calculate the number of days until the next check-in day
  //       const date = new Date(selectedDate); // Create a new Date object based on the selected date
  //       date.setDate(date.getDate() + daysToAdd); // Set the date to the next check-in day
  //       return date;
  //   });

  //   console.log("Wellness Check-in Dates:", wellnessCheckinDates);
  //   return wellnessCheckinDates;
  // }

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
  
      // const wellnessCheckins = wellnessCheckinDates.map(date => ({
      //   date: new Date(date), // Use the Date object directly
      //   workout_name: "Wellness Assigned", // Indicate wellness check-in
      //   player_ids: "All Players" // Indicate all players
      // }));
      // console.log("Wellness Check-ins:", wellnessCheckins);
  
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
      const wellnessCheckins = wellnessCheckinDates.map(date => ({
        id: 0,
        workout_id: 0, // Assign a default value for workout_id
        date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`, // Format date as 'YYYY-MM-DD'
        notes: "test", // Assign a default value for notes
        player_id: null, // Assign a default value for player_id
        workout_name: "Wellness Assigned", // Indicate wellness check-in
        player_ids: "All Players" // Indicate all players
      }));
  
      // Concatenate wellness check-ins with assignments
      const allAssignments = [...assignmentsWithWorkouts, ...wellnessCheckins];
  
      // Sort all assignments by date (closest to farthest)
      allAssignments.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      // Set the fetched assignments data to state
      setAssignments(allAssignments);
      console.log("break it", allAssignments)

    } catch (error) {
      console.error("Error fetching assignments:", error.message);
    }
  }
      // Sort assignments by date (closest to farthest)
     // assignmentsWithWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));


      // Set the fetched assignments data to state
  //     setAssignments(assignmentsWithWorkouts);    } catch (error) {
  //     console.error("Error fetching assignments:", error.message);
  //   }
  // }
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
                                style={{
                                    position: "absolute",
                                    top: -7,
                                    right: 40,
                                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                                    color: "rgba(0, 0, 0, 0.6)",
                                }}
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
                                      <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}>
                                          {/* Display assigned wellness check-in if the selected date is a wellness check-in date */}
                                          {assignments.some((assignment) => {
                                              const assignmentDate = new Date(assignment.date);
                                              const selectedDateObject = new Date(selectedDate);

                                              return (
                                                  assignment.workout_name === "Wellness Assigned" &&
                                                  assignmentDate.getFullYear() === selectedDateObject.getFullYear() &&
                                                  assignmentDate.getMonth() === selectedDateObject.getMonth() &&
                                                  assignmentDate.getDate() === (selectedDateObject.getDate() -1)

                                              );
                                          }) && (
                                              <div>
                                                  {console.log("Selected WD:", selectedDate)}
                                                  {/* <p>Date: {selectedDate.todate()}</p> */}
                                                  <p>Wellness Assigned</p>
                                                  <p>Assigned to: All Players</p>
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
                                                  if (assignment.workout_name !== "Wellness Assigned") {
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
                                                  }
                                                  return null; // Skip wellness check-ins as they were already displayed above
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
                                                  <p>No Workout Assigned</p>
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
