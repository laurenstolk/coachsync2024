import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { supabase } from "../../../../supabaseClient";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import Transaction from "../../../billing/components/Transaction";

function WellnessFlags() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [playerIds, setPlayerIds] = useState([]);
  const [concerningCheckins, setConcerningCheckins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let playerIds;
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

      // make an object mapping player IDs to profiles
      const profilesMap = {};
      profilesData.forEach((profile) => {
        profilesMap[profile.id] = profile;
      });

      // set player IDs and fetch concerning check-ins
      playerIds = profilesData.map((profile) => profile.id);
      setPlayerIds(playerIds);

      const { data: wellnessCheckinData, error: wellnessError } = await supabase
        .from("checkin")
        .select("*")
        .in("player_id", playerIds)
        .eq("date", today.toISOString().split("T")[0]);

      // Filter concerning check-ins
      if (wellnessCheckinData && wellnessCheckinData.length > 0) {
        const concerningCheckins = wellnessCheckinData.filter((checkin) => {
          return (
            (checkin.wellness_id === 1 && (checkin.value === 1 || checkin.value === 2)) || // Water is 1 or 2
            (checkin.wellness_id === 2 && (checkin.value === 1 || checkin.value === 2)) || // Sleep is 1 or 2
            (checkin.wellness_id === 4 && (checkin.value === 4 || checkin.value === 5)) || // Soreness is 4 or 5
            (checkin.wellness_id === 5 && (checkin.value === 1 || checkin.value === 2)) || // Energy is 1 or 2
            (checkin.wellness_id === 3 && (checkin.value === 4 || checkin.value === 5)) // Stress is 4 or 5
          );
        });

        const concerningCheckinsWithProfiles = concerningCheckins.map((checkin) => {
          return {
            ...checkin,
            profile: profilesMap[checkin.player_id],
          };
        });

        setConcerningCheckins(concerningCheckinsWithProfiles);
      }
    };
    fetchData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Wellness Flags
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {concerningCheckins.length == 0 ? (
          <MDTypography variant="body2" sx={{ fontStyle: "italic" }}>
          No wellness reports flagged
        </MDTypography>
        ) :(
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>

        {concerningCheckins.map((checkin) => {
          let transactionValue = "";
          let transactionColor = "warning"; // Default color is yellow

          // Check if the criteria for extreme wellness check-ins are met, then set color to red
          if (
            (checkin.wellness_id === 1 && checkin.value === 1) ||
            (checkin.wellness_id === 2 && checkin.value === 1) ||
            (checkin.wellness_id === 3 && checkin.value === 5) ||
            (checkin.wellness_id === 4 && checkin.value === 5) ||
            (checkin.wellness_id === 5 && checkin.value === 1)
          ) {
            transactionColor = "error"; // Set color to red for extreme check-ins
          }

          switch (checkin.wellness_id) {
            case 1:
              transactionValue = "DEHYDRATED";
              break;
            case 2:
              transactionValue = "TIRED";
              break;
            case 3:
              transactionValue = "STRESSED";
              break;
            case 4:
              transactionValue = "SORE";
              break;
            case 5:
              transactionValue = "LOW ENERGY";
              break;
            default:
              transactionValue = "Unknown";
          }
          const notesDescription = checkin.notes ? `Notes: "${checkin.notes}"` : "Notes: N/A"; // Conditional check for null notes
          return (
            <Transaction
              key={checkin.id}
              color={transactionColor}
              icon="warning"
              name={`${checkin.profile.first_name} ${checkin.profile.last_name}`}
              description={notesDescription}
              value={`${transactionValue} (${checkin.value})`}
            />
          );
        })}
      </MDBox>
       )}
     </MDBox>
    </Card>
  );
}

export default WellnessFlags;
