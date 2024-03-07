import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// @mui icons
import Icon from "@mui/material/Icon";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import logo from "assets/images/logo-ct.png";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/grass2.jpg";
import { FormControl, InputLabel, Select } from "@mui/material";
import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

import MenuItem from "@mui/material/MenuItem";

function PlayerTeamUpdate() {
  const [sports, setSports] = useState([]);
  const [teamid, setTeamID] = useState([]);
  const [profile, setProfile] = useState(null);
  const [formValid, setFormValid] = useState(false);
  const [signupcode, setSignupCode] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userdata = await fetchUserProfile();

      setProfile(userdata);
    };
    fetchData();
  }, []);

  const handleInputChange = () => {
    const signupcode = document.getElementById("signup-code").value;

    const isValid = signupcode !== "";
    setFormValid(isValid);
  };

  const handleSubmit = async () => {
    const signupcode = document.getElementById("signup-code").value;
  
    // Check if the signup code is not empty
    const isValid = signupcode.trim() !== "";
    setFormValid(isValid);
  
    if (isValid) {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from('team')
          .select('name, sport_id')
          .eq('signup_code', signupcode)
          .single();
  
        if (teamError) {
          // Handle case where no team is found with the provided signup code
          document.getElementById("team-sport").innerText = "No team found. Please search again."
        }
  
        if (teamData) {
          const { name, sport_id } = teamData;
  
          // Fetch sport name based on sport_id
          const { data: sportData, error: sportError } = await supabase
            .from('sport')
            .select('name')
            .eq('id', sport_id)
            .single();
  
          if (sportError) {
            console.error('Error fetching sport data:', sportError.message);
            return;
          }
  
          if (sportData) {
            const { name: sportName } = sportData;
  
            // Update UI elements with the retrieved team information
            document.getElementById("team-name").innerText = name;
            document.getElementById("team-sport").innerText = sportName;
  
            // Perform further actions with the retrieved team data
          } else {
            console.log('No sport found with the provided sport ID.');
            // Handle case where no sport is found with the provided sport ID
          }
        } else {
          console.log('No team found with the provided signup code.');
          // Handle case where no team is found with the provided signup code
          document.getElementById("team-name").innerText = "";
          document.getElementById("team-sport").innerText = "No team found with this code";
        }
      } catch (error) {
        console.error('Error querying data:', error.message);
      }
    }
  };  

  const handleNext = async () => {
  const signupcode = document.getElementById("signup-code").value;

  // Check if the signup code is not empty
  const isValid = signupcode.trim() !== "";
  setFormValid(isValid);

  if (isValid) {
    try {
      // Fetch the team data based on the signup code
      const { data: teamData, error: teamError } = await supabase
        .from("team")
        .select("id")
        .eq("signup_code", signupcode)
        .single();

      if (teamError) {
        console.error("Error fetching team data:", teamError);
        // Handle the error here
        return;
      }

      if (teamData) {
        const { id: teamId } = teamData;

        // Update the user's profile with the team ID
        const { error: updateError } = await supabase
          .from("profile")
          .update({ team_id: teamId })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Error updating player team info:", updateError);
          // Handle the error here
        } else {
          console.log("Player Team updated successfully!");
        }
      } else {
        console.error("No team found with the provided signup code.");
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle the error here
    }
  } else {
    console.error("Profile or profile ID is missing.");
    // Handle the case where profile or profile ID is missing
  }
};

  
  
  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <img src={logo} alt="CoachSync Logo" style={{ maxWidth: "20%", marginTop: "5px" }} />
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Your Team
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Lets find your team
          </MDTypography>
        </MDBox>
        <MDBox pt={1} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDTypography display="block" variant="button" color="text" my={1} pb={1}>
              Your coach should&apos;ve provided you with a sign up code. Please enter it here.            
            </MDTypography>
            <MDBox mb={2}>
              {/* <MDTypography display="block" variant="button" color="text" my={1}>
                What type of coach are you? (Head, Assistant, etc...)
              </MDTypography> */}
              <MDBox display="flex" alignItems="center" mb={2}>
                <MDInput
                  type="text"
                  id="signup-code"
                  label="Signup Code"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
                />
                <MDButton
                  component={Link}
                  variant="gradient"
                  color={formValid ? "info" : "default"}
                  onClick={handleSubmit}
                  disabled={!formValid}
                >
                  Enter
                </MDButton>
              </MDBox>
            </MDBox>
            <MDBox display="flex" flexDirection="column" alignItems="center" mb={2} p={2}>
              <h2 id="team-name"></h2>
              <p id="team-sport"></p>
            </MDBox>


            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to="/profile"
                variant="gradient"
                color={formValid ? "info" : "default"} // Change color based on selectionMade
                fullWidth
                onClick={handleNext}
                disabled={!formValid}
              >
                Next
              </MDButton>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton component={Link} to="/authentication/playerinfo" color="white" fullWidth>
                Go Back
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default PlayerTeamUpdate;
