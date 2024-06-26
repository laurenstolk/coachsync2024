import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import logo from "assets/images/logo-ct.png";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/grass2.jpg";
import { FormControl, InputLabel, Select } from "@mui/material";
import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

import MenuItem from "@mui/material/MenuItem";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TeamInfoUpdate() {
  const [selectedSport, setSelectedSport] = useState(""); // new state for selected sport
  const [teamLogo, setTeamLogo] = React.useState(null);
  const [sports, setSports] = useState([]);
  const [profile, setProfile] = useState(null);
  const [formValid, setFormValid] = useState(false);
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  const onLogoDrop = useCallback((acceptedFiles) => {
    // Do something with the uploaded file (e.g., store it in state)
    setTeamLogo(acceptedFiles[0]);
  }, []);

  const deleteTeamLogo = () => {
    // Clear the team logo from state
    setTeamLogo(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onLogoDrop });

  useEffect(() => {
    const fetchData = async () => {
      const userdata = await fetchUserProfile();

      setProfile(userdata);
    };
    fetchData();
  }, []);

  async function getSports() {
    try {
      let { data, error } = await supabase.from("sport").select("*");

      if (error) throw error;

      if (data != null) {
        setSports(data);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getSports();
  }, []);

  const handleSportChange = (event) => {
    setSelectedSport(event.target.value);
  };

  const handleInputChange = () => {
    const name = document.getElementById("team-name").value;

    const isValid = name !== "";
    setFormValid(isValid);
  };

  const handleSubmit = async () => {
    const teamName = document.getElementById("team-name").value;
    const teamNameWithoutSpaces = teamName.replace(/\s/g, "");

    let logoPicture = `${teamName}_logo_${selectedSport}`; // Default logo picture value

    // Check if teamLogo is null and assign GenericLogo if it is
    if (!teamLogo) {
      logoPicture = "GenericLogo";
    }

    const teamData = {
      name: teamName,
      sport_id: selectedSport, // use the selectedSport state variable
      logo_picture: logoPicture, // Assign the logo_picture value
      signup_code: `${teamNameWithoutSpaces}${randomNumber}`, // Construct signup code
    };

    try {
      if (teamLogo) {
        const { data, error } = await supabase.storage
          .from("images/team_logos")
          .upload(`${teamName}_logo_${selectedSport}`, teamLogo, {
            cacheControl: "3600", // optional
          });

        if (error) {
          console.error("Error uploading logo:", error);
          // Handle the error here
          throw error;
        }
      }

      // Use supabase client's api.post method to add data
      const { data, error } = await supabase.from("team").upsert([teamData]).select();

      if (error) {
        console.error("Error adding team:", error);
        // Handle the error here
      } else {
        // Extract the ID of the newly created team
        const teamId = data[0].id;

        // Update the profile table with the team ID
        const profileUpdate = await supabase
          .from("profile")
          .update({ team_id: teamId })
          .eq("id", profile.id); // Assuming you have user_id in profile data

        if (profileUpdate.error) {
          console.error("Error updating profile:", profileUpdate.error);
          // Handle the error here
          return;
        }
        toast.success(
          "Here's your team code! Save this, since your players will need it to join your team:" +
            "      " +
            teamData.signup_code,
          {
            autoClose: false,
          }
        );
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle the error here
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
            Team Info
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Tell us more about your team
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              {/* <MDTypography display="block" variant="button" color="text" my={1}>
                What type of coach are you? (Head, Assistant, etc...)
              </MDTypography> */}
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  id="team-name"
                  label="Team Name"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
                />
              </MDBox>
            </MDBox>
            <MDBox mb={2}>
              <FormControl fullWidth>
                <InputLabel>Select Sport</InputLabel>
                <Select
                  id="team-sport"
                  label="Sport"
                  variant="outlined"
                  value={selectedSport}
                  onChange={handleSportChange}
                  sx={{ width: "100%", minHeight: "46px" }}
                >
                  {sports.map((sport, index) => (
                    <MenuItem key={index} value={sport.id}>
                      {sport.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={2} {...getRootProps()} style={{ cursor: "pointer" }}>
              <input {...getInputProps()} />
              <MDTypography display="block" variant="button" color="text" my={1}>
                Upload Team Logo
              </MDTypography>
              {isDragActive ? (
                <MDTypography display="block" variant="caption" color="info" mt={1}>
                  Drop the files here...
                </MDTypography>
              ) : (
                <MDButton>
                  <MDTypography display="block" variant="caption" color="info" mt={1}>
                    Drag and drop a team logo here, or click to select one.
                  </MDTypography>
                </MDButton>
              )}
            </MDBox>
            {teamLogo && (
              <MDBox display="flex" flexDirection="column" alignItems="center">
                <div
                  style={{
                    width: "200px", // Adjust the size of the circular image
                    height: "200px", // Make sure this is the same as the width
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #fff", // Optional: border color
                  }}
                >
                  <img
                    src={URL.createObjectURL(teamLogo)}
                    alt="Team Logo"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <MDButton onClick={deleteTeamLogo} variant="text" color="error">
                  Delete
                </MDButton>
              </MDBox>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/wellness-setup"
                variant="gradient"
                color={formValid ? "info" : "default"}
                fullWidth
                onClick={handleSubmit}
                disabled={!formValid}
              >
                Next
              </MDButton>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/assistantornew"
                color="white"
                fullWidth
              >
                Go Back
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default TeamInfoUpdate;
