import React, { useState, useEffect } from "react";

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
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsIcon from "@mui/icons-material/Sports";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import logo from "assets/images/logo-ct.png";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/grass2.jpg";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

function AssistantorNew() {
  const [selectedRole, setSelectedRole] = useState("");
  const [profile, setProfile] = useState(null);
  const [selectionMade, setSelectionMade] = useState(false); // Track if selection is made
  const redirectTo =
    selectedRole === "new" ? "/authentication/teaminfo" : "/authentication/existingteam";

  useEffect(() => {
    const fetchData = async () => {
      const userdata = await fetchUserProfile();

      setProfile(userdata);
    };
    fetchData();
  }, []);

  const handleRoleChange = (event, newRole) => {
    setSelectedRole(newRole);
    setSelectionMade(true); // Set selection made to true when a role is selected
  };

  const handleSubmit = async () => {
    // Check if profile and profile.id are available
    if (selectedRole) {
      // Rest of your handleSubmit logic
      if (profile && profile.id) {
        const roleData = {
          new: selectedRole === "new" ? true : false,
        };
      } else {
        console.error("Profile or profile ID is missing.");
        // Handle the case where profile or profile ID is missing
      }
    } else {
      // Notify the user to make a selection
      toast.error("Please select either New or Existing Team");
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
          <MDTypography variant="h4" fontWeight="light" color="white" mt={1}>
            Add a <strong style={{ fontWeight: "bold" }}>New Team</strong> or join an{" "}
            <strong style={{ fontWeight: "bold" }}>Existing Team</strong>?
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <ToggleButtonGroup
                value={selectedRole}
                exclusive
                onChange={handleRoleChange}
                aria-label="Create New or Join Existing Team"
                fullWidth
              >
                <ToggleButton value="new">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <strong>Create New Team</strong>
                    {/* <SportsBaseballIcon sx={{ width: "80%", minHeight: "30px" }} /> */}
                  </div>
                </ToggleButton>
                <ToggleButton value="join">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <strong>Join Existing Team</strong>
                    {/* <SportsIcon sx={{ width: "100%", minHeight: "30px" }} /> */}
                  </div>
                </ToggleButton>
              </ToggleButtonGroup>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to={redirectTo}
                variant="gradient"
                color={selectionMade ? "info" : "default"} // Change color based on selectionMade
                fullWidth
                onClick={handleSubmit}
                disabled={!selectionMade}
              >
                Next
              </MDButton>
            </MDBox>
            {/* <MDBox mt={4} mb={1}>
              <MDButton component={Link} to="/" color="white" fullWidth>
                Go Back
              </MDButton>
            </MDBox> */}
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default AssistantorNew;
