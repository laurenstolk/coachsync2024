import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { supabase } from "../../../../supabaseClient";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import Transaction from "../../../billing/components/Transaction";

async function getPlayersThatHaveNotCompleted(playerIds) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: completedAssignmentData, error: completedAssignmentError } = await supabase
      .from("assignment")
      .select("*")
      .eq("completed", false)
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
    console.log("here: ", workoutData);

    return workoutData.workout_name;
  } catch (workoutError) {
    alert(workoutError.message);
    return "";
  }
}

function AssignmentNotCompleted() {
  const [players, setPlayers] = useState([]);

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

      const playersThatDidntComplete = await getPlayersThatHaveNotCompleted(playerIds);

      const mergedPlayerandAssignment = await Promise.all(
        playersThatDidntComplete.map(async (player) => {
          const info = profilesData.find((profile) => profile.id === player.player_id);
          const workoutName = await getWorkoutName(player.workout_id);

          return {
            ...info,
            ...player,
            workoutName,
          };
        })
      );

      console.log("merged ya: ", mergedPlayerandAssignment);

      setPlayers(mergedPlayerandAssignment);
    };
    fetchData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Players - Have NOT Completed Today&apos;s Workout
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {players.map((player) => (
          <Transaction
            key={player.id}
            color="secondary" // Use grey color for not completed
            icon={player.completed ? "check_circle_outline" : "cancel"} // Change icon based on completion status
            name={`${player.first_name} ${player.last_name}`}
            description={
              player.completed
                ? `completed the workout on ${player.date}`
                : `hasn't completed the ${player.workoutName} workout yet`
            }
            value={player.completed ? "Completed" : "Not Completed"} // Change value text based on completion status
          />
        ))}
      </MDBox>
    </Card>
  );
}

export default AssignmentNotCompleted;
