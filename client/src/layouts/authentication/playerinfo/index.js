import React, { useCallback, useState, useEffect } from "react";
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
import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

function PlayerInfoUpdate() {
  const [profilePic, setProfilePic] = useState("");
  const [profile, setProfile] = useState(null);

  const [formValid, setFormValid] = useState(false);
  // Add error state variables for validation
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [birthDateError, setBirthDateError] = useState(false);
  const [positionError, setPositionError] = useState(false);
  const [jerseyNumberError, setJerseyNumberError] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the uploaded file (e.g., store it in state)
    setProfilePic(acceptedFiles[0]);
  }, []);

  const deleteProfilePic = () => {
    // Clear the profile picture from state
    setProfilePic(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    const fetchData = async () => {
      const userdata = await fetchUserProfile();

      setProfile(userdata);
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let isValid = true;

    switch (id) {
      case "first-name":
        isValid = /^[A-Za-z]+$/.test(value.trim());
        setFirstNameError(!isValid);
        break;
      case "last-name":
        isValid = /^[A-Za-z]+$/.test(value.trim());
        setLastNameError(!isValid);
        break;
      case "phone-number":
        isValid = /^\d{1,13}$/.test(value.trim());
        setPhoneNumberError(!isValid);
        break;
      case "birth-date":
        const inputDate = new Date(value.trim());
        isValid = inputDate <= new Date(); // Check if birth date is in the past or today
        setBirthDateError(!isValid);
        break;
      case "player-position":
        isValid = value.trim().length > 0;
        setPositionError(!isValid);
        break;
      case "jersey-number":
        isValid = true; // For now, let's assume any value is valid
        setJerseyNumberError(!isValid);
        break;
      default:
        break;
    }

    // Check if all required fields are valid
    const birthDateValue = document.getElementById("birth-date").value;
    const playerRoleValue = document.getElementById("player-position").value;
    const bothNotEmpty = birthDateValue.trim().length > 0 && playerRoleValue.trim().length > 0;
    const allFieldsValid =
      !firstNameError &&
      !lastNameError &&
      !phoneNumberError &&
      !birthDateError &&
      !positionError &&
      bothNotEmpty;
    setFormValid(allFieldsValid);
  };

  const handleSubmit = async () => {
    // Check if profile and profile.id are available
    const currentDate = new Date().toISOString();

    if (profile && profile.id) {
      const firstName = document.getElementById("first-name").value;
      const lastName = document.getElementById("last-name").value;

      let profilePicture = `${firstName}_${lastName}_${currentDate}`; // Default logo picture value

      // Check if teamLogo is null and assign GenericLogo if it is
      if (!profilePic) {
        profilePicture = "GenericUser";
      }

      const playerRoleData = {
        position: document.getElementById("player-position").value,
        jersey_number: document.getElementById("jersey-number").value,
        first_name: firstName,
        last_name: lastName,
        profile_picture: profilePicture, // Construct the profile picture string
        phone_number: document.getElementById("phone-number").value,
        birth_date: document.getElementById("birth-date").value,
      };

      try {
        if (profilePic) {
          const { data, error } = await supabase.storage
            .from("images/profile_pics")
            .upload(`${firstName}_${lastName}_${currentDate}`, profilePic, {
              cacheControl: "3600", // optional
            });

          if (error) {
            console.error("Error uploading profile picture:", error);
            // Handle the error here
            throw error;
          }
        }

        // Use supabase client's api.post method to add data
        const { data, error } = await supabase
          .from("profile")
          .update([playerRoleData])
          .eq("id", profile.id);

        if (error) {
          console.error("Error updating player role:", error);
          // Handle the error here
        } else {
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
            Player Info
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Lets personalize your Player Profile
          </MDTypography>
          {/* <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography> */}
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  id="first-name"
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
                  error={firstNameError}
                  helperText={firstNameError && "Please enter a valid first name"}
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  id="last-name"
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
                  error={lastNameError}
                  helperText={lastNameError && "Please enter a valid last name"}
                />
              </MDBox>
              <MDBox mb={3}>
                <MDInput
                  type="tel"
                  id="phone-number"
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
                  error={phoneNumberError}
                  helperText={phoneNumberError && "Please enter a valid phone number"}
                />
              </MDBox>
              <MDBox mb={3}>
                <MDTypography display="block" variant="button" color="text" my={1}>
                  Birthdate
                </MDTypography>
                <MDInput
                  type="date"
                  id="birth-date"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
                  error={birthDateError}
                  helperText={birthDateError && "Please enter a valid birthday"}
                />
              </MDBox>
              <MDTypography display="block" variant="button" color="text" my={1}>
                What is your position in your sport? (Quarterback, Goalie, 1st Doubles, etc...)
              </MDTypography>
              <MDBox mb={5}>
                <MDInput
                  type="text"
                  id="player-position"
                  label="Player Role"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
                  error={positionError}
                  helperText={positionError && "Please enter a valid position"}
                />
              </MDBox>
              <MDTypography display="block" variant="button" color="text" my={1}>
                If applicable, what is your jersey number?
              </MDTypography>
              <MDBox mb={5}>
                <MDInput
                  type="text"
                  id="jersey-number"
                  label="Jersey Number"
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChange}
                  error={jerseyNumberError}
                  helperText={jerseyNumberError && "Please enter a valid jersey number"}
                />
              </MDBox>
            </MDBox>
            <MDBox mb={2} {...getRootProps()} style={{ cursor: "pointer" }}>
              <input {...getInputProps()} />
              <MDTypography display="block" variant="button" color="text" my={1}>
                Upload Profile Pic
              </MDTypography>
              {isDragActive ? (
                <MDTypography display="block" variant="caption" color="info" mt={1}>
                  Drop the files here...
                </MDTypography>
              ) : (
                <MDButton>
                  <MDTypography display="block" variant="caption" color="info" mt={1}>
                    Drag and drop a profile picture here, or click to select one.
                  </MDTypography>
                </MDButton>
              )}
            </MDBox>
            {profilePic && (
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
                    src={URL.createObjectURL(profilePic)}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <MDButton onClick={deleteProfilePic} variant="text" color="error">
                  Delete
                </MDButton>
              </MDBox>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/playerteam"
                variant="gradient"
                color={formValid ? "info" : "default"} // Change color based on selectionMade
                fullWidth
                onClick={handleSubmit}
                disabled={!formValid}
              >
                Next
              </MDButton>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton component={Link} to="/authentication/coachorplayer" color="white" fullWidth>
                Go Back
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default PlayerInfoUpdate;
