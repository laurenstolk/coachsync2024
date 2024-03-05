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

    // rows: [
    //   {
    //     author: <Author image={team2} name="John Michael" email="john@creative-tim.com" />,
    //     function: <Job title="Manager" description="Organization" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         23/04/18
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team3} name="Alexa Liras" email="alexa@creative-tim.com" />,
    //     function: <Job title="Programator" description="Developer" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         11/01/19
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team4} name="Laurent Perrier" email="laurent@creative-tim.com" />,
    //     function: <Job title="Executive" description="Projects" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         19/09/17
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team3} name="Michael Levi" email="michael@creative-tim.com" />,
    //     function: <Job title="Programator" description="Developer" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         24/12/08
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team3} name="Richard Gran" email="richard@creative-tim.com" />,
    //     function: <Job title="Manager" description="Executive" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         04/10/21
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    //   {
    //     author: <Author image={team4} name="Miriam Eric" email="miriam@creative-tim.com" />,
    //     function: <Job title="Programator" description="Developer" />,
    //     status: (
    //       <MDBox ml={-1}>
    //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
    //       </MDBox>
    //     ),
    //     employed: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         14/09/20
    //       </MDTypography>
    //     ),
    //     action: (
    //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
    //         Edit
    //       </MDTypography>
    //     ),
    //   },
    // ],
  };
}
