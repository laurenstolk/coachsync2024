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

import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDProgress from "components/MDProgress";
import MDButton from "components/MDButton";
import LogoAsana from "assets/images/small-logos/logo-asana.svg";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

import { fetchUserProfile } from "../../../fetchUserProfile";

// Add supabase connection
import { supabase } from "../../../supabaseClient";

export default function data() {
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [teamSignupCode, setTeamSignupCode] = useState(null);

  // const [imageUrl, setImageUrl] = useState(null);

  // async function getProfilePicURL(file_path) {
  //   const { data, error } = await supabase.storage.from("images/profile_pics").createSignedUrl(`${file_path}`, 60);
  //   console.log("Profile picture URL:", data.signedUrl);
  //   return data.signedUrl;
  // }

  // const Project = ({ image, name }) => (
  //   <MDBox display="flex" alignItems="center" lineHeight={1}>
  //     <MDAvatar src={image} name={name} size="sm" variant="rounded" />
  //     <MDTypography display="block" variant="button" fontWeight="medium" ml={1} lineHeight={1}>
  //     </MDTypography>
  //   </MDBox>
  // );

  useEffect(() => {
    const fetchData = async () => {
      const userProfile = await fetchUserProfile();
      console.log(userProfile);
      setUser(userProfile);

      // const profilesWithURLs = await Promise.all(profiles.map(async (profile) => {
      //   const url = await getProfilePicURL(profile.profile_picture);
      //   console.log("url stuff: ", url)
      //   console.log("Profile with URL:", { ...profile, imageUrl: url });
      //   return { ...profile, imageUrl: url };
      // }));
      // // console.log(profilesWithURLs)
      // setProfiles(profilesWithURLs);
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

    //   const { data, error } = await supabase.from("profile").select("*");
    //   if (error) throw error;
    //   if (data != null) {
    //     setProfiles(data);
    //   }
    // } catch (error) {
    //   alert(error.message);
    // }
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
        { message: `You currently have no players assigned your team. Send your players this code to add them: ${teamSignupCode || 'Loading...'}` }
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
      { Header: "Edit", accessor: "edit", width: "10%", align: "left" },
      { Header: "Delete", accessor: "delete", width: "10%", align: "center" },
    ],

    rows: profiles.map((profile, index) => ({
      // image: profile.profile_picture ? (
      //   <Project image={profile.imageUrl} name={`${profile.first_name} ${profile.last_name}`} />
      // ) : null,
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
          {profile.email_address}
        </MDTypography>
      ),
      edit: (
        <MDBox>
          <MDButton variant="text" color="dark">
            <Icon>edit</Icon>&nbsp;edit
          </MDButton>
        </MDBox>
      ),
      delete: (
        <MDBox mr={1}>
          <MDButton variant="text" color="error">
            <Icon>delete</Icon>&nbsp;delete
          </MDButton>
        </MDBox>
      ),
    })),
  };
}
