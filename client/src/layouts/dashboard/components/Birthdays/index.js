import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import CakeIcon from "@mui/icons-material/Cake";
import Confetti from "react-confetti"; // Import Confetti
import { supabase } from "../../../../supabaseClient";
import { fetchUserProfile } from "../../../../fetchUserProfile";

function BirthdaysThisWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [playerIds, setPlayerIds] = useState([]);
  const [birthdaysThisWeek, setBirthdaysThisWeek] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false); // State to control Confetti visibility

  useEffect(() => {
    const fetchData = async () => {
      let playerIds;
      const profileData = await fetchUserProfile();

      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

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

      playerIds = profilesData.map((profile) => profile.id);
      setPlayerIds(playerIds);

      const birthdaysThisWeek = playerIds
        .map((playerId) => {
          const profile = profilesMap[playerId];
          const birthDate = new Date(profile.birth_date);
          birthDate.setFullYear(today.getFullYear());
          return {
            playerId,
            playerName: `${profile.first_name} ${profile.last_name}`,
            birthday: birthDate,
          };
        })
        .filter((birthday) => birthday.birthday >= startOfWeek && birthday.birthday <= endOfWeek);

      setBirthdaysThisWeek(birthdaysThisWeek);

      // Show Confetti if there are birthdays and hide after 7 seconds
      if (birthdaysThisWeek.length > 0) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 8000); // 7 seconds in milliseconds
      } else {
        setShowConfetti(false); // Hide Confetti if there are no birthdays
      }
    };
    fetchData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Birthdays This Week
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {showConfetti && <Confetti width={450} height={200} />} {/* Render Confetti if there are birthdays */}
        {birthdaysThisWeek.length === 0 ? ( // Check if there are no birthdays
          <MDTypography variant="body2" sx={{ fontStyle: "italic" }}>
            No birthdays this week
          </MDTypography>
        ) : (
          birthdaysThisWeek.map((birthday, index) => (
            <React.Fragment key={birthday.playerId}>
              <MDTypography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                <CakeIcon sx={{ marginRight: "0.5rem" }} />
                <span>{birthday.playerName}</span>
                <br />
                <span style={{ fontSize: "0.8rem", marginLeft: "2.5rem" }}>
                  {birthday.birthday.toLocaleString("en-US", { weekday: "long" })},{" "}
                  {birthday.birthday.toLocaleString("en-US", { month: "long", day: "numeric" })}
                </span>
              </MDTypography>
              {index !== birthdaysThisWeek.length - 1 && <br />}{" "}
              {/* Add a space if not the last player */}
            </React.Fragment>
          ))
        )}
      </MDBox>
    </Card>
  );
}

export default BirthdaysThisWeek;
