import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import logo from "assets/images/logo-ct.png";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/grass2.jpg";
import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

function CoachInfoUpdate() {
  const [profilePic, setProfilePic] = useState(null);
  const [profile, setProfile] = useState(null);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [birthDateError, setBirthDateError] = useState(false);
  const [coachRoleError, setCoachRoleError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userdata = await fetchUserProfile();
      setProfile(userdata);
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    switch (id) {
      case "first-name":
        setFirstNameError(!/^[A-Za-z]+$/.test(value.trim()));
        break;
      case "last-name":
        setLastNameError(!/^[A-Za-z]+$/.test(value.trim()));
        break;
      case "phone-number":
        setPhoneNumberError(!/^\d{10,13}$/.test(value.trim()));
        break;
      case "birth-date":
        const inputDate = new Date(value.trim());
        setBirthDateError(inputDate > new Date());
        break;
      case "coach-role":
        setCoachRoleError(value.trim().length === 0 || value.trim().length >= 50);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async () => {
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const phoneNumber = document.getElementById("phone-number").value.trim();
    const birthDate = document.getElementById("birth-date").value.trim();
    const coachRole = document.getElementById("coach-role").value.trim();

    setFirstNameError(!/^[A-Za-z]+$/.test(firstName));
    setLastNameError(!/^[A-Za-z]+$/.test(lastName));
    setPhoneNumberError(!/^\d{10,13}$/.test(phoneNumber));
    const inputDate = new Date(birthDate);
    setBirthDateError(inputDate > new Date());
    setCoachRoleError(coachRole.length === 0 || coachRole.length >= 50);

    if (!firstName || !lastName || !phoneNumber || !birthDate || !coachRole) {
      return;
    }

    // Proceed with form submission

    // Redirect to the next page if form submission succeeds
  };

  const onDrop = useCallback((acceptedFiles) => {
    setProfilePic(acceptedFiles[0]);
  }, []);

  const deleteProfilePic = () => {
    setProfilePic(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="success" mx={2} mt={-3} p={3} mb={1} textAlign="center">
          <img src={logo} alt="CoachSync Logo" style={{ maxWidth: "20%", marginTop: "5px" }} />
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>Coach Info</MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>Lets personalize your Coach Profile</MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDBox mb={2}>
                <MDInput type="text" id="first-name" label="First Name" variant="outlined" fullWidth required onChange={handleInputChange} error={firstNameError} helperText={firstNameError && "Please enter a valid first name"} />
              </MDBox>
              <MDBox mb={2}>
                <MDInput type="text" id="last-name" label="Last Name" variant="outlined" fullWidth required onChange={handleInputChange} error={lastNameError} helperText={lastNameError && "Please enter a valid last name"} />
              </MDBox>
              <MDBox mb={3}>
                <MDInput type="tel" id="phone-number" label="Phone Number" variant="outlined" fullWidth required onChange={handleInputChange} error={phoneNumberError} helperText={phoneNumberError && "Please enter a valid phone number (no symbols or spaces)"} />
              </MDBox>
              <MDBox mb={3}>
                <MDTypography display="block" variant="button" color="text" my={1}>Birthdate</MDTypography>
                <MDInput type="date" id="birth-date" variant="outlined" fullWidth required onChange={handleInputChange} error={birthDateError} helperText={birthDateError && "Please select a valid birth date"} />
              </MDBox>
              <MDTypography display="block" variant="button" color="text" my={1}>What type of coach are you? (Head, Assistant, etc...)</MDTypography>
              <MDBox mb={5}>
                <MDInput type="text" id="coach-role" label="Coach Role" variant="outlined" fullWidth required onChange={handleInputChange} error={coachRoleError} helperText={coachRoleError && "Please enter a valid coach role"} />
              </MDBox>
            </MDBox>
            <MDBox mb={2} {...getRootProps()} style={{ cursor: "pointer" }}>
              <input {...getInputProps()} />
              <MDTypography display="block" variant="button" color="text" my={1}>Upload Profile Pic</MDTypography>
              {isDragActive ? <MDTypography display="block" variant="caption" color="info" mt={1}>Drop the files here...</MDTypography> :
                <MDButton><MDTypography display="block" variant="caption" color="info" mt={1}>Drag and drop a profile picture here, or click to select one.</MDTypography></MDButton>}
            </MDBox>
            {!profilePic && <MDTypography display="block" variant="caption" color="error" my={1}>You must submit a profile photo to continue.</MDTypography>}
            {profilePic && (
              <MDBox display="flex" flexDirection="column" alignItems="center">
                <div style={{ width: "200px", height: "200px", borderRadius: "50%", overflow: "hidden", border: "2px solid #fff" }}>
                  <img src={URL.createObjectURL(profilePic)} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <MDButton onClick={deleteProfilePic} variant="text" color="error">Delete</MDButton>
              </MDBox>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/teaminfo"
                variant="gradient"
                color="info"
                fullWidth
                onClick={handleSubmit}
                disabled={firstNameError || lastNameError || phoneNumberError || birthDateError || coachRoleError || !profilePic}
              >
                Next
              </MDButton>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton component={Link} to="/authentication/coachorplayer" color="white" fullWidth>Go Back</MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default CoachInfoUpdate;