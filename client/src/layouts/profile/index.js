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
import Card from "@mui/material/Card";
import DataTable from "examples/Tables/DataTable";
import Button from "@mui/material/Button"; // Import Button component
import { AppBar, Tabs, Tab, Icon } from "@mui/material"; // Import Material-UI components

import breakpoints from "assets/theme/base/breakpoints";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Overview page components
import Header from "layouts/profile/components/Header";

import { supabase } from "../../supabaseClient";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "../../fetchUserProfile";
import { getProfilePicURL } from "../../getProfilePicUrl";
import { getTeamLogoURL } from "../../getTeamLogoUrl";
import { fetchTeamInfo } from "../../fetchTeamInfo";
import { Link } from "react-router-dom";

import coachesTableData from "layouts/tables/data/coachesTableData";

function Overview() {
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const { columns, rows } = coachesTableData();

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
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTeamInfo();
      const url = await getTeamLogoURL(data?.logo_picture);

      setTeamData(data);
      setLogoUrl(url);
    };
    fetchData();
  }, []);

  const [wellnessOptions, setWellnessOptions] = useState([]);

  useEffect(() => {
    // Fetch wellness options from Supabase
    async function fetchWellnessOptions() {
      try {
        const { data, error } = await supabase.from("wellness").select("name");
        if (error) {
          throw error;
        }
        if (data != null) {
          setWellnessOptions(data.map((wellness) => wellness.name));
        }
      } catch (error) {
        alert(error.message);
      }
    }

    fetchWellnessOptions();
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

  useEffect(() => {
    async function fetchTeamWellnessOptions() {
      try {
        // Fetch team wellness options from Supabase
        const { data, error } = await supabase
          .from("team")
          .select("water_checkin, sleep_checkin, stress_checkin, soreness_checkin, energy_checkin")
          .eq("id", profile.team_id); // Assuming you have a field named "team_id" to identify the team
  
        if (error) {
          throw error;
        }
  
        if (data && data.length > 0) {
          const wellnessData = data[0];
          // Set the selected wellness options based on the fetched data
          setSelectedWellnessOptions({
            water: wellnessData.water_checkin,
            sleep: wellnessData.sleep_checkin,
            stress: wellnessData.stress_checkin,
            soreness: wellnessData.soreness_checkin,
            energy: wellnessData.energy_checkin,
          });
        }
      } catch (error) {
        console.error("Error fetching team wellness options:", error);
      }
    }
  
    if (profile && profile.team_id) {
      fetchTeamWellnessOptions();
    }
  }, [profile]);
  

  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Profile" />
      <Header></Header>
      <MDBox mb={2} />
      <MDBox mt={1} mb={3} mx={5}>
        <Grid container spacing={4}>
          {/* Left half for ProfileInfoCard */}
          <Grid item xs={12} md={6} mt={-15}>
            {profile && (
              <Card
                sx={{
                  position: "relative",
                  mt: 0,
                  mx: 3,
                  py: 2,
                  px: 2,
                }}
              >
                <Grid container alignItems="center" spacing={2} mb={8}>
                  <Grid item>
                    <MDAvatar src={imageUrl} alt="profile-image" size="xxl" shadow="sm" />
                  </Grid>
                  <Grid item>
                    <MDBox height="100%" lineHeight={1}>
                      <MDTypography variant="h5" fontWeight="medium">
                        {profile ? profile.first_name : ""} {profile ? profile.last_name : ""}
                      </MDTypography>
                      <MDTypography variant="button" color="text" fontWeight="regular">
                        {profile ? (profile.player ? profile.position : profile.coach_role) : ""}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>

                <MDTypography variant="h5" fontWeight="light" mb={5}>
                  <strong>Full Name: </strong>
                  {profile ? profile.first_name : ""} {profile ? profile.last_name : ""}
                </MDTypography>
                <MDTypography variant="h5" fontWeight="light" mb={5}>
                  <strong>Email: </strong>
                  {profile ? profile.email : ""}
                </MDTypography>
                <MDTypography variant="h5" fontWeight="light" mb={5}>
                  <strong>Phone Number: </strong> {profile ? profile.phone_number : ""}
                </MDTypography>
                <MDTypography variant="h5" fontWeight="light">
                  <strong>Birthdate: </strong> {profile ? profile.birth_date : ""}
                </MDTypography>

                <Grid container justifyContent="center" mt={4}>
                  <Grid item xs={12} md={6} lg={4}>
                    <AppBar position="static">
                      <Tabs
                        orientation={tabsOrientation}
                        value={tabValue}
                        onChange={handleSetTabValue}
                        sx={{ width: "100%" }} // Adjust the width as needed
                      >
                        <Tab
                          label="Edit Profile"
                          component={Link}
                          to={
                            profile && profile.player
                              ? {
                                  pathname: "/authentication/playeredit",
                                  state: { profile: profile },
                                }
                              : {
                                  pathname: "/authentication/coachedit",
                                  state: { profile: profile },
                                }
                          }
                          icon={
                            <Icon fontSize="small" sx={{ mt: -0.25 }}>
                              settings
                            </Icon>
                          }
                        />
                      </Tabs>
                    </AppBar>
                  </Grid>
                </Grid>
              </Card>
            )}
          </Grid>
          {/* Right half for MDAvatar and Typography */}
          <Grid item xs={12} md={6} mt={window.innerWidth <= 768 ? 0 : -15}>
            <Card
              sx={{
                position: "relative",
                mt: 0,
                mx: 3,
                py: 2,
                px: 2,
              }}
            >
              <Grid
                container
                spacing={4}
                mb={3}
                direction="column"
                alignItems="center"
                justify="center"
              >
                <Grid item>
                  <MDAvatar
                    src={logoUrl}
                    alt="logo-image"
                    style={{ width: "250px", height: "250px" }}
                    shadow="sm"
                  />
                </Grid>
                <Grid item>
                  <Grid container direction="column" alignItems="center" justify="center">
                    <Grid item>
                      <MDTypography variant="h5" fontWeight="medium">
                        {teamData ? teamData.name : ""}
                      </MDTypography>
                    </Grid>
                    <Grid item>
                      <MDTypography variant="button" color="text" fontWeight="regular">
                        {teamData ? sportName : ""}
                      </MDTypography>
                    </Grid>
                  </Grid>
                </Grid>
                {!profile || !profile.player ? (
                  <>
                    <Grid item>
                      <MDTypography variant="button" color="text" fontWeight="regular">
                        <strong>Team Code:</strong> {teamData ? teamData.signup_code : null}
                      </MDTypography>
                    </Grid>
                    <Grid item>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <MDBox border={1} borderColor="lightgrey" p={2} borderRadius={4}>
                            <MDTypography variant="h6" gutterBottom>
                              Check-ins
                            </MDTypography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <MDTypography variant="button" color="text" fontWeight="regular">
                                  <strong>Frequency:</strong>{" "}
                                  {teamData
                                    ? mapCheckinFrequencyToDays(teamData.checkin_frequency)
                                    : ""}
                                </MDTypography>
                              </Grid>
                              <Grid item xs={12}>
                                <MDTypography variant="button" color="text" fontWeight="regular">
                                  <strong>Options:</strong>{" "}
                                  {/* {teamData.water_checkin} */}
                                </MDTypography>
                              </Grid>
                              <Grid item>
                                <Button
                                  variant="outlined"
                                  component={Link}
                                  to="/authentication/wellness-setup-edit"
                                  sx={{
                                    borderColor: "#1A73E8", // Set border color to blue on hover
                                    backgroundColor: "#1A73E8", // Set background color to blue on hover
                                    color: "white", // Set font color to white on hover
                                    "&:hover": {
                                      borderColor: "#1A73E8", // Set border color to blue on hover
                                      backgroundColor: "#1A73E8", // Set background color to blue on hover
                                      color: "white", // Set font color to white on hover
                                    },
                                  }}
                                >
                                  Edit Wellness Check-ins
                                </Button>
                              </Grid>
                            </Grid>
                          </MDBox>
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Grid item xs={12} md={6} mt={6} mb={3}>
        <Card>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={2}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              Coaches
            </MDTypography>
          </MDBox>
          <MDBox pt={3}>
            <DataTable
              table={{ columns, rows }}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          </MDBox>
        </Card>
      </Grid>
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
