import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MDButton from "components/MDButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MDBox from "components/MDBox";
import { supabase } from "../../../supabaseClient";
import { date } from "yup";
import { fetchUserProfile } from "../../../fetchUserProfile";

export default function ViewAssignedWorkouts() {
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getGroups();
  }, []);
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

      // Create a map to store profile data by profile id for easy lookup
      const profileMap = {};
      profileData.forEach((profile) => {
        profileMap[profile.id] = profile;
      });
      console.log("Profile Map:", profileMap);

      // Fetch data from the assignment table
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignment")
        .select("*")
        .in(
          "player_id",
          profileData.map((profile) => profile.id)
        ); // Filter assignments by player IDs belonging to the user's team
      if (assignmentError) throw assignmentError;
      console.log("player info: ", assignmentData);

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

      // Join assignment data with workout data based on workout_id
      const assignmentsWithWorkouts = assignmentsWithGroupedPlayers.map((assignment) => ({
        ...assignment,
        date: new Date(assignment.date).toISOString().split("T")[0], // Standardize date format
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
      // Log each standardized date for debugging
      assignmentsWithWorkouts.forEach((assignment) => {
        console.log("Standardized date from database:", assignment.date);
      });

      // Sort assignments by date (closest to farthest)
      assignmentsWithWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Update the state with the joined data
      setAssignments(assignmentsWithWorkouts);
    } catch (error) {
      console.error("Error fetching assignments:", error.message);
    }
  }
  return {
    columns: [
      { Header: "Workout Name", accessor: "workout_name", width: "20%", align: "left" },
      { Header: "Assigned Date", accessor: "date", width: "20%", align: "left" },
      { Header: "Assigned to", accessor: "player_ids", width: "25%", align: "left", wrap: true },
      { Header: "Notes", accessor: "notes", width: "25%", align: "left" },
      { Header: "Id", accessor: "id", width: "10%", align: "left" },
    ],
    rows: assignments.map((assignment, index) => ({
      workout_name: (
        <MDBox display="flex" py={1}>
          {assignment.workout_name}
        </MDBox>
      ),
      date: (
        <MDBox display="flex" py={1}>
          {assignment.date}
        </MDBox>
      ),
      player_ids: (
        <MDBox display="flex" py={1}>
          {assignment.player_ids}
        </MDBox>
      ),
      notes: (
        <MDBox display="flex" py={1}>
          {assignment.notes}
        </MDBox>
      ),
      id: (
        <MDBox display="flex" py={1}>
          {assignment.id}
        </MDBox>
      ),
      view: (
        <Link to={`/savedworkouts/${index}`}>
          <MDButton variant="text" color="primary">
            <span style={{ display: "flex", alignItems: "center" }}>
              <ArrowForwardIcon fontSize="medium" />
              <span style={{ marginLeft: "5px" }}>View</span>
            </span>
          </MDButton>
        </Link>
      ),
    })),
  };
}
