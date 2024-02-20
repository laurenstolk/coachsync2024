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

import { useState, useEffect } from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";
import { supabase } from "../../../../supabaseClient";
import { getProfilePicURL } from "../../../../getProfilePicUrl";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import { getTeamLogoURL } from "../../../../getTeamLogoUrl";
import { fetchTeamInfo } from "../../../../fetchTeamInfo";

function Header({ children }) {
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);

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
      console.log("team: ", data);
    };
    fetchData();
  }, []);

  const [sportName, setSportName] = useState('');

  useEffect(() => {
    async function fetchSportName() {
      if (teamData && teamData.sport_id) {
        try {
          const { data, error } = await supabase
            .from('sport')
            .select('name')
            .eq('id', teamData.sport_id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setSportName(data.name);
          }
        } catch (error) {
          console.error('Error fetching sport name:', error.message);
        }
      }
    }

    fetchSportName();
  }, [teamData]); // Fetch sport name whenever teamData changes

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
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <MDAvatar src={imageUrl} alt="profile-image" size="xxl" shadow="sm" />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {profile ? profile.first_name : ""} {profile ? profile.last_name : ""}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {profile ? profile.coach_role : ""}
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item>
            <MDAvatar src={logoUrl} alt="logo-image" size="xxl" shadow="sm" />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {teamData ? teamData.name : ""}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {teamData ? sportName : ""}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
};

export default Header;





// setting bar on if we need it

            {/* <AppBar position="static">
              <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleSetTabValue}>
                <Tab
                  label="App"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      home
                    </Icon>
                  }
                />
                <Tab
                  label="Message"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      email
                    </Icon>
                  }
                />
                <Tab
                  label="Settings"
                  icon={
                    <Icon fontSize="small" sx={{ mt: -0.25 }}>
                      settings
                    </Icon>
                  }
                />
              </Tabs>
            </AppBar> */}
          {/* </Grid> */}