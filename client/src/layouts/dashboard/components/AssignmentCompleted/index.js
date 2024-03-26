import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { supabase } from "../../../../supabaseClient";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import Transaction from "../../../billing/components/Transaction";

async function getPlayersThatCompleted(playerIds) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: completedAssignmentData, error: completedAssignmentError } = await supabase
      .from("assignment")
      .select("*")
      .eq("completed", true)
      .in("player_id", playerIds)
      .eq("date", today.toISOString().split("T")[0]);

    return completedAssignmentData;
  } catch (completedAssignmentError) {
    alert(completedAssignmentError.message);
    return [];
  }
}

async function getWorkoutName(workoutId) {
  try {
    const { data: workoutData, error: workoutError } = await supabase
      .from("workout")
      .select("workout_name")
      .eq("id", workoutId)
      .single();

    return workoutData.workout_name;
  } catch (workoutError) {
    alert(workoutError.message);
    return "";
  }
}

function AssignmentCompleted() {
  const [players, setPlayers] = useState([]);
  const [assignmentsToday, setAssignmentsToday] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let playerIds;
      const profileData = await fetchUserProfile();

      const { data: profilesData, error: profilesError } = await supabase
        .from("profile")
        .select("*")
        .filter("team_id", "eq", profileData.team_id);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError.message);
        return;
      }

      // make an array of the playerIds
      if (profilesData && profilesData.length > 0) {
        playerIds = profilesData.map((profile) => profile.id);
      }

      const playersThatCompleted = await getPlayersThatCompleted(playerIds);

      const mergedPlayerandAssignment = await Promise.all(
        playersThatCompleted.map(async (player) => {
          const info = profilesData.find((profile) => profile.id === player.player_id);
          const workoutName = await getWorkoutName(player.workout_id);

          return {
            ...info,
            ...player,
            workoutName,
          };
        })
      );

      setPlayers(mergedPlayerandAssignment);
    };
    fetchData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Players - Have Completed Today&apos;s Workout
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {!assignmentsToday ? (
          <MDTypography variant="body2" sx={{ fontStyle: "italic" }}>
            No workout(s) assigned
          </MDTypography>
        ) : players.length === 0 ? (
          <MDTypography variant="body2" sx={{ fontStyle: "italic" }}>
            No workout(s) completed
          </MDTypography>
        ) : (
          players.map((player) => (
            <Transaction
              key={player.id} // Assign a unique key using the player's id
              color="success"
              icon="check_circle_outline"
              name={`${player.first_name} ${player.last_name}`}
              description={`completed the ${player.workoutName} workout`}
              value="Completed"
            />
          ))
        )}
      </MDBox>
    </Card>
  );
}

export default AssignmentCompleted;
