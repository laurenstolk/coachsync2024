import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TimelineItem from "examples/Timeline/TimelineItem";
import { supabase } from "../../../../supabaseClient";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import Transaction from "../../../billing/components/Transaction";

async function getPlayersThatHaveNotCompleted() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: completedAssignmentData, error: completedAssignmentError } = await supabase
      .from("assignment")
      .select("player_id, date")
      .eq("completed", false)
      .eq("date", today.toISOString().split("T")[0]);

    return completedAssignmentData;
  } catch (completedAssignmentError) {
    alert(completedAssignmentError.message);
    return [];
  }
}

function AssignmentNotCompleted() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const profileData = await fetchUserProfile();

      const playersThatCompleted = await getPlayersThatHaveNotCompleted();

      const { data: profilesData, error: profilesError } = await supabase
        .from("profile")
        .select("*");

      const mergedPlayerandAssignment = playersThatCompleted.map((player) => {
        const info = profilesData.find((profile) => profile.id === player.player_id);

        return {
          ...info,
          ...player,
        };
      });

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
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: "success" }}>arrow_upward</Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              24%
            </MDTypography>{" "}
            this month
          </MDTypography>
        </MDBox>
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
                : "hasn't completed the workout yet"
            }
            value={player.completed ? "Completed" : "Not Completed"} // Change value text based on completion status
          />
        ))}
      </MDBox>
    </Card>
  );
}

export default AssignmentNotCompleted;
