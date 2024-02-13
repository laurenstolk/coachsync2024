import React, { useEffect, useState, useCallback } from "react";

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

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/grass2.jpg";
import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Cover() {
  const [selectedRole, setSelectedRole] = React.useState("player");
  const [userRole, setUserRole] = React.useState("");

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") {
        const storedUserRole = localStorage.getItem("userRole");
        setUserRole(storedUserRole || "");
      } else {
        console.error("localStorage is not available");
      }
    } catch (error) {
      console.error("Error while retrieving from localStorage:", error);
    }
  }, []);

  const handleRoleChange = (event, newRole) => {
    setSelectedRole(newRole);
  };

  const handleNextClick = () => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("userRole", selectedRole);
      } else {
        // Handle the case when localStorage is not available
        console.error("localStorage is not available");
      }
    } catch (error) {
      // Handle any potential errors while saving to localStorage
      console.error("Error while saving to localStorage:", error);
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
          <MDTypography variant="h4" fontWeight="light" color="white" mt={1}>
            Thank you! We updated your profile.
          </MDTypography>
          {/* <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography> */}
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}></MDBox>
            <MDBox mt={2} mb={1}>
              <MDButton
                component={Link}
                to="/dashboard"
                variant="gradient"
                color="success"
                fullWidth
                onClick={handleNextClick}
              >
                Next
              </MDButton>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                to="/authentication/wellness-setup"
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

export default Cover;
