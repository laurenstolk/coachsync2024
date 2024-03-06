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

// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";

// Overview page components
import Header from "layouts/profile/components/Header";
import PlatformSettings from "layouts/profile/components/PlatformSettings";

// Data
import profilesListData from "layouts/profile/data/profilesListData";

// Images
import homeDecor1 from "assets/images/home-decor-1.jpg";
import homeDecor2 from "assets/images/home-decor-2.jpg";
import homeDecor3 from "assets/images/home-decor-3.jpg";
import homeDecor4 from "assets/images/home-decor-4.jpeg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";
import { supabase } from "../../supabaseClient";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "../../fetchUserProfile";
import { getProfilePicURL } from "../../getProfilePicUrl";
import { getTeamLogoURL } from "../../getTeamLogoUrl";
import { fetchTeamInfo } from "../../fetchTeamInfo";

function Overview() {
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);

  const mapCheckinFrequencyToDays = (checkinFrequency) => {
    const daysMap = {
      1: "Sunday",
      2: "Monday",
      3: "Tuesday",
      4: "Wednesday",
      5: "Thursday",
      6: "Friday",
      7: "Saturday",
    };
  
    // Convert the string to an array of numbers
    const daysArray = checkinFrequency.split("").map(Number);
  
    // Map each number to its corresponding day name
    const days = daysArray.map((day) => daysMap[day]);
  
    // Join the days with a comma and return the result
    return days.join(", ");
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserProfile();
      const url = await getProfilePicURL(data?.profile_picture);

      setProfile(data);
      setImageUrl(url);
      console.log("profile: ", data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTeamInfo();
      const url = await getTeamLogoURL(data?.logo_picture);

      setTeamData(data);
      setLogoUrl(url);
      console.log("team: ", data);
    };
    fetchData();
  }, []);

  const [sportName, setSportName] = useState("");

  useEffect(() => {
    async function fetchSportName() {
      if (teamData && teamData.sport_id) {
        try {
          const { data, error } = await supabase
            .from("sport")
            .select("name")
            .eq("id", teamData.sport_id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setSportName(data.name);
          }
        } catch (error) {
          console.error("Error fetching sport name:", error.message);
        }
      }
    }

    fetchSportName();
  }, [teamData]); // Fetch sport name whenever teamData changes
  
  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Profile" />
      <MDBox mb={2} />
      <Header>
      <MDBox mt={1} mb={3} mx={5}>
        <Grid container spacing={4}>
          {/* Left half for ProfileInfoCard */}
          
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            {profile && (
              <ProfileInfoCard
                info={{
                  fullName: profile.first_name + " " + profile.last_name,
                  mobile: profile.phone_number,
                  email: profile.email,
                  birthdate: profile.birth_date,
                }}
                social={[]}
                action={{ route: "", tooltip: "Edit Profile" }}
                shadow={false}
              />
            )}
          </Grid>

          {/* Divider */}
          <Divider sx={{ my: 2 }} />

          {/* Right half for MDAvatar and Typography */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={4} direction="column" alignItems="center" justify="center">
              <Grid item>
                <MDAvatar src={logoUrl} alt="logo-image" style={{ width: '250px', height: '250px' }} shadow="sm" />
              </Grid>
              {/* Add other grid items for your team data here */}
              <Grid item direction="column" alignItems="center" justify="center">
                <MDTypography variant="h5" fontWeight="medium">
                  {teamData ? teamData.name : ""}
                </MDTypography>
                <MDTypography variant="button" color="text" fontWeight="regular">
                  {teamData ? sportName : ""}
                </MDTypography>
              </Grid>
              <br></br>
              <MDTypography variant="button" color="text" fontWeight="regular">
                Check-in Frequency: {teamData ? mapCheckinFrequencyToDays(teamData.checkin_frequency) : ""}
              </MDTypography>
              Team Code: {teamData ? teamData.signup_code : null}

              {/* ADD TABLE HERE */}


              
            </Grid>
          </Grid>
        </Grid>
      </MDBox>

      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;

// project section in case we want it in the future

{
  /* <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Projects
          </MDTypography>
          <MDBox mb={1}>
            <MDTypography variant="button" color="text">
              Architects design houses
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox p={2}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor1}
                label="project #2"
                title="modern"
                description="As Uber works through a huge amount of internal management turmoil."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team1, name: "Elena Morison" },
                  { image: team2, name: "Ryan Milly" },
                  { image: team3, name: "Nick Daniel" },
                  { image: team4, name: "Peterson" },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor2}
                label="project #1"
                title="scandinavian"
                description="Music is something that everyone has their own specific opinion about."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team3, name: "Nick Daniel" },
                  { image: team4, name: "Peterson" },
                  { image: team1, name: "Elena Morison" },
                  { image: team2, name: "Ryan Milly" },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor3}
                label="project #3"
                title="minimalist"
                description="Different people have different taste, and various types of music."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team4, name: "Peterson" },
                  { image: team3, name: "Nick Daniel" },
                  { image: team2, name: "Ryan Milly" },
                  { image: team1, name: "Elena Morison" },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor4}
                label="project #4"
                title="gothic"
                description="Why would anyone pick blue over pink? Pink is obviously a better color."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team4, name: "Peterson" },
                  { image: team3, name: "Nick Daniel" },
                  { image: team2, name: "Ryan Milly" },
                  { image: team1, name: "Elena Morison" },
                ]}
              />
            </Grid>
          </Grid>
        </MDBox> */
}
