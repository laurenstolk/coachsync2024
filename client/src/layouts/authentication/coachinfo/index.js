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

function CoachInfoUpdate() {
  const [profilePic, setProfilePic] = useState("");
  const [profile, setProfile] = useState(null);

  const [formValid, setFormValid] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the uploaded file (e.g., store it in state)
    setProfilePic(acceptedFiles[0]);
    console.log("Profile picture uploaded:", acceptedFiles[0].name);
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

  const handleInputChange = () => {
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const phoneNumber = document.getElementById("phone-number").value;
    const birthDate = document.getElementById("birth-date").value;
    const coachRole = document.getElementById("coach-role").value;

    const isValid =
      firstName !== "" &&
      lastName !== "" &&
      phoneNumber !== "" &&
      birthDate !== "" &&
      coachRole !== "";
    setFormValid(isValid);
    console.log(firstName, lastName, phoneNumber, birthDate, coachRole);
  };

  const handleSubmit = async () => {
    // Check if profile and profile.id are available
    if (profile && profile.id) {
      const firstName = document.getElementById("first-name").value;
      const lastName = document.getElementById("last-name").value;
      const coachRoleData = {
        coach_role: document.getElementById("coach-role").value,
        first_name: firstName,
        last_name: lastName,
        profile_picture: `${firstName}_${lastName}`, // Construct the profile picture string
        phone_number: document.getElementById("phone-number").value,
        birth_date: document.getElementById("birth-date").value,
      };
      console.log(coachRoleData);

      try {
        if (profilePic) {
          const { data, error } = await supabase.storage
            .from("images")
            .upload(`${firstName}_${lastName}`, profilePic, {
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
          .update([coachRoleData])
          .eq("id", profile.id);

        if (error) {
          console.error("Error updating coach role:", error);
          // Handle the error here
        } else {
          console.log("Coach Role updated successfully!");
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
            Coach Info
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Lets personalize your Coach Profile
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
                />
              </MDBox>
              <MDTypography display="block" variant="button" color="text" my={1}>
                What type of coach are you? (Head, Assistant, etc...)
              </MDTypography>
              <MDBox mb={5}>
                <MDInput
                  type="text"
                  id="coach-role"
                  label="Coach Role"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleInputChange}
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
                to="/authentication/teaminfo"
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

export default CoachInfoUpdate;
