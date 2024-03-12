import React, { useEffect, useState } from "react";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// @mui icons
import Icon from "@mui/material/Icon";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/grass2.jpg";
import { FormControl, FormControlLabel } from "@mui/material";

import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Tooltip from "@mui/material/Tooltip";

const daysOfWeekMap = [
  { id: 1, name: "Sunday" },
  { id: 2, name: "Monday" },
  { id: 3, name: "Tuesday" },
  { id: 4, name: "Wednesday" },
  { id: 5, name: "Thursday" },
  { id: 6, name: "Friday" },
  { id: 7, name: "Saturday" },
];

function WellnessSetup() {
  const navigate = useNavigate();
  const [wellnessOptions, setWellnessOptions] = useState([]);
  const [selectedDays, setSelectedDays] = useState(daysOfWeekMap.map((day) => day.id));
  const [selectedWellnessOptions, setSelectedWellnessOptions] = useState(wellnessOptions);
  const [profile, setProfile] = useState(null);

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
          setSelectedWellnessOptions(data.map((wellness) => wellness.name));
        }
      } catch (error) {
        alert(error.message);
      }
    }

    fetchWellnessOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userdata = await fetchUserProfile();

      setProfile(userdata);
    };
    fetchData();
  }, []);

  const handleDayChange = (day) => {
    setSelectedDays((prevSelectedDays) => {
      const newSelectedDays = prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day];

      console.log("selecteddays: ", newSelectedDays);

      return newSelectedDays;
    });
  };

  const handleWellnessOptionChange = (option) => {
    setSelectedWellnessOptions((prevSelected) => {
      if (prevSelected.includes(option)) {
        return prevSelected.filter((item) => item !== option);
      } else {
        return [...prevSelected, option];
      }
    });
    console.log("Selected wellness options:", selectedWellnessOptions);
  };

  const waterCheckinValue = selectedWellnessOptions.includes("Water");
  const sleepCheckinValue = selectedWellnessOptions.includes("Sleep");
  const stressCheckinValue = selectedWellnessOptions.includes("Soreness");
  const sorenessCheckinValue = selectedWellnessOptions.includes("Energy");
  const energyCheckinValue = selectedWellnessOptions.includes("Stress");

  const handleSubmit = async () => {
    console.log("Selected wellness options:", selectedWellnessOptions);
    const teamWellnessData = {
      checkin_frequency: selectedDays.sort((a, b) => a - b).join(""),
      water_checkin: waterCheckinValue,
      sleep_checkin: sleepCheckinValue,
      stress_checkin: stressCheckinValue,
      soreness_checkin: sorenessCheckinValue,
      energy_checkin: energyCheckinValue,
    };

    console.log(teamWellnessData);

    try {
      // Fetch profile data to get user's team ID
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("team_id")
        .eq("id", profile.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profileData) {
        const profileTeamID = profileData.team_id;

        // Use the team ID fetched from the profile to update team wellness data
        const { data: updateData, error: updateError } = await supabase
          .from("team")
          .update(teamWellnessData)
          .eq("id", profileTeamID);

        if (updateError) {
          throw updateError;
        }

        console.log("Team added successfully!");

        toast.success("Perfect! Headed to your profile...", {
          autoClose: 2000,
          onClose: () => {
            navigate("/profile");
          },
        });
      } else {
        console.error("Profile not found or team ID not available.");
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle the error here
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
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Wellness Check-ins
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            CoachSync allows you to regularly check in on the wellness of your players
          </MDTypography>
        </MDBox>
        <MDBox pt={2} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDTypography display="block" variant="button" color="text" my={1}>
              Select the wellness check-in activities that you want to assign your team.{" "}
              <Tooltip
                title={
                  <React.Fragment>
                    <Typography variant="body2" style={{ fontSize: "11px" }}>
                      <b>Water:</b> Players can input an approximate percentage representing how
                      much of their water goal for the day they hit. Their water goal will be
                      something they decide outside of the application.
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "11px" }}>
                      <b>Sleep:</b> Players can input how many hours of sleep they got the night
                      before.
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "11px" }}>
                      <b>Soreness:</b> Players can rate their current soreness on a scale of 1-5, 1
                      being No Soreness and 5 being Extremely Sore.
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "11px" }}>
                      <b>Energy:</b> Players can rate their current overall energy level on a scale
                      of 1-5, 1 being low energy and 5 being high.
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "11px" }}>
                      <b>Stress:</b> Players can rate their current stress on a scale of 1-5, 1
                      being No Stress and 5 being Extremely Stressed.
                    </Typography>
                  </React.Fragment>
                }
                arrow
                PopperProps={{ style: { maxWidth: "400px" } }} // Set the maximum width of the tooltip box
              >
                <Icon>info</Icon>
              </Tooltip>
            </MDTypography>
            <MDBox pt={1} pb={2} px={2}>
              <FormControl>
                <MDBox display="flex" flexDirection="column">
                  {wellnessOptions.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={selectedWellnessOptions.includes(option)}
                          onChange={() => handleWellnessOptionChange(option)}
                          name={option}
                        />
                      }
                      label={option}
                    />
                  ))}
                </MDBox>
              </FormControl>
            </MDBox>
            <MDBox pt={1} pb={2} px={2}>
              <MDTypography display="block" variant="button" color="text" my={1}>
                How often you want to check-in?{" "}
                <Tooltip
                  title={
                    <React.Fragment>
                      <Typography variant="body2" style={{ fontSize: "11px" }}>
                        Here you can select days of the week. Players will only report their
                        wellness metrics on the application on these days of the week.
                      </Typography>
                    </React.Fragment>
                  }
                  arrow
                  PopperProps={{ style: { maxWidth: "400px" } }}
                >
                  <Icon>info</Icon>
                </Tooltip>
              </MDTypography>

              <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                <MDBox mb={2}>
                  <FormControl>
                    {/* Remove the surrounding MDBox with flexDirection="row" */}
                    {daysOfWeekMap.map((day, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={selectedDays.includes(day.id)}
                            onChange={() => handleDayChange(day.id)}
                            name={day.name}
                          />
                        }
                        label={day.name}
                      />
                    ))}
                  </FormControl>
                </MDBox>
              </MDBox>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                component={Link}
                variant="gradient"
                color="success"
                fullWidth
                onClick={handleSubmit}
              >
                Submit
              </MDButton>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton component={Link} to="/authentication/teaminfo" color="white" fullWidth>
                Go Back
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default WellnessSetup;
