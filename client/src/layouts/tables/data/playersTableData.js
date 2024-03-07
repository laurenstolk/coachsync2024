/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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

import { useEffect, useState } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { fetchUserProfile } from "../../../fetchUserProfile";

// Add supabase connection
import { supabase } from "../../../supabaseClient";

export default function data() {
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [teamSignupCode, setTeamSignupCode] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userProfile = await fetchUserProfile();
      console.log(userProfile);
      setUser(userProfile);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      getProfiles(); // Call getProfiles when user changes
    }
  }, [user]); // Add user as a dependency

  async function getProfiles() {
    try {
      if (!user) {
        return; // Exit early if user is null
      }

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("team_id", user.team_id)
        .eq("player", true)
        .order("first_name", { ascending: true });

      if (error) throw error;
      if (data != null) {
        setProfiles(data);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getProfiles();
  }, []);
  useEffect(() => {
    async function fetchTeamSignupCode() {
      try {
        if (!user) {
          return;
        }

        const { data: teamData, error } = await supabase
          .from("team")
          .select("signup_code")
          .eq("id", user.team_id)
          .single();

        if (error) throw error;
        if (teamData) {
          setTeamSignupCode(teamData.signup_code);
          console.log("Team Signup Code:", teamData.signup_code); // Log the signup code
        }
      } catch (error) {
        console.error("Error fetching team signup code:", error);
      }
    }

    fetchTeamSignupCode();
  }, [user]);
  // useEffect to log teamSignupCode
  useEffect(() => {
    console.log("Team Signup Code:", teamSignupCode); // Log the signup code
  }, [teamSignupCode]); // useEffect dependency

  // Check if there are no profiles
  if (profiles.length === 0) {
    // Return a single row with the message if there are no profiles
    return {
      columns: [
        { Header: "No assigned players", accessor: "message", width: "100%", align: "center" },
      ],
      rows: [
        {
          message: `You currently have no players assigned your team. Send your players this code to add them: ${
            teamSignupCode || "Loading..."
          }`,
        },
      ],
    };
  }

  return {
    columns: [
      // { Header: "image", accessor: "image", width: "30%", align: "left" },
      { Header: "First Name", accessor: "first", width: "20%", align: "left" },
      { Header: "Last Name", accessor: "last", width: "20%", align: "left" },
      { Header: "Position", accessor: "position", width: "40%", align: "left" },
      { Header: "Jersey Number", accessor: "jersey", width: "40%", align: "left" },
      { Header: "Phone Number", accessor: "phone", width: "40%", align: "left" },
      { Header: "Email Address", accessor: "email", width: "40%", align: "left" },
    ],

    rows: profiles.map((profile, index) => ({
      first: (
        <MDBox display="flex" py={1}>
          {profile.first_name} {/* Display the name of the current exercise */}
        </MDBox>
      ),
      last: (
        <MDBox display="flex" py={1}>
          {profile.last_name} {/* Display the name of the current exercise */}
        </MDBox>
      ),
      position: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {profile.position}
        </MDTypography>
      ),
      jersey: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {profile.jersey_number}
        </MDTypography>
      ),
      phone: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {profile.phone_number}
        </MDTypography>
      ),
      email: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {profile.email}
        </MDTypography>
      ),
    })),
  };
}
