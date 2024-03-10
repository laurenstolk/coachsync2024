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
        .eq("player", false)
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

  return {
    columns: [
      // { Header: "image", accessor: "image", width: "30%", align: "left" },
      { Header: "Name", accessor: "name", width: "25%", align: "left" },
      { Header: "Role", accessor: "role", width: "25%", align: "left" },
      { Header: "Phone Number", accessor: "phone", width: "25%", align: "left" },
      { Header: "Email Address", accessor: "email", width: "25%", align: "left" },
    ],

    rows: profiles.map((profile, index) => ({
      name: (
        <MDBox display="flex" py={1}>
          {profile.first_name} {profile.last_name}
        </MDBox>
      ),
      role: (
        <MDBox display="flex" py={1}>
          {profile.coach_role} {/* Display the name of the current exercise */}
        </MDBox>
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
