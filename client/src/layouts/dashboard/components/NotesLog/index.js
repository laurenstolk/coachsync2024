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
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Billing page components
import Invoice from "layouts/billing/components/Invoice";
import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import { supabase } from "../../../../supabaseClient";

function NotesLog() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [playerIds, setPlayerIds] = useState([]);
  const [assignments, setAssignnments] = useState([]);
  const [playerProfiles, setPlayerProfiles] = useState({});
  const [notesLog, setNotesLog] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [checkInsWithNotes, setCheckInsWithNotes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let playerIds;
        let assignmentIds;

        const profileData = await fetchUserProfile();

        // grab the profiles of the players on my team
        const { data: profilesData, error: profilesError } = await supabase
          .from("profile")
          .select("*")
          .filter("player", "eq", true)
          .filter("team_id", "eq", profileData.team_id);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError.message);
          return;
        }

        const profilesMap = {};
        profilesData.forEach((profile) => {
          profilesMap[profile.id] = profile;
        });
        setPlayerProfiles(profilesMap);

        // set player IDs and fetch concerning check-ins
        playerIds = profilesData.map((profile) => profile.id);
        setPlayerIds(playerIds);

        const { data: wellnessCheckinData, error: wellnessError } = await supabase
          .from("checkin")
          .select("*")
          .in("player_id", playerIds)
          .eq("date", today.toISOString().split("T")[0])
          .not("notes", "is", null);

        const nonConcerningCheckins = wellnessCheckinData.filter((checkin) => {
          return (
            (checkin.wellness_id === 1 && ![1, 2].includes(checkin.value)) || // Water is not 1 or 2
            (checkin.wellness_id === 2 && ![1, 2].includes(checkin.value)) || // Sleep is not 1 or 2
            (checkin.wellness_id === 4 && ![4, 5].includes(checkin.value)) || // Soreness is not 4 or 5
            (checkin.wellness_id === 5 && ![1, 2].includes(checkin.value)) || // Energy is not 1 or 2
            (checkin.wellness_id === 3 && ![4, 5].includes(checkin.value)) // Stress is not 4 or 5
          );
        });
        setCheckInsWithNotes(nonConcerningCheckins);

        const { data: assignmentData, error: assignmentError } = await supabase
          .from("assignment")
          .select("*")
          .eq("date", today.toISOString().split("T")[0])
          .eq("completed", true)
          .in("player_id", playerIds);
        setAssignnments(assignmentData);

        assignmentIds = assignmentData.map((workout) => workout.id);

        const { data: exerciseCompletionData, error: exerciseCompletionError } = await supabase
          .from("exercise_completion")
          .select("*")
          .in("assignment_id", assignmentIds)
          .not("player_notes", "is", null);

        const { data: exerciseData, error: exerciseError } = await supabase
          .from("exercise")
          .select("*");
        setExercises(exerciseData);

        // Combine both arrays
        const combinedData = [...nonConcerningCheckins, ...exerciseCompletionData];

        setNotesLog(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h6" fontWeight="medium">
          Player Notes Log
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {notesLog.length === 0 ? (
          <MDTypography variant="body2" sx={{ fontStyle: "italic" }}>
            No player notes logged
          </MDTypography>
        ) : (
          <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
            {notesLog.map((note, index) => {
              let playerName = "Unknown Player";
              let activityName = "";

              if ("wellness_id" in note) {
                playerName = playerProfiles[note.player_id]?.first_name || "Unknown Player";
                switch (note.wellness_id) {
                  case 1:
                    activityName = "Water Check-in";
                    break;
                  case 2:
                    activityName = "Sleep Check-in";
                    break;
                  case 3:
                    activityName = "Stress Check-in";
                    break;
                  case 4:
                    activityName = "Soreness Check-in";
                    break;
                  case 5:
                    activityName = "Energy Check-in";
                    break;
                  default:
                    activityName = "Wellness Check-in";
                }
              } else {
                playerName =
                  playerProfiles[
                    assignments.find((assignment) => assignment.id === note.assignment_id)
                      ?.player_id
                  ]?.first_name || "Unknown Player";
                activityName = note.customized_exercise_id
                  ? exercises.find((exercise) => exercise.id === note.customized_exercise_id)?.name
                  : assignments.find((assignment) => assignment.id === note.assignment_id)
                      ?.workout_id || "Unknown Exercise";
              }

              const noteDate = new Date(
                (note.date_completed || note.created_at) + " UTC"
              ).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric" });

              return (
                <Invoice
                  key={index}
                  date={`${playerName} - ${activityName}`}
                  price={noteDate}
                  id={note.notes || note.player_notes}
                />
              );
            })}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default NotesLog;
