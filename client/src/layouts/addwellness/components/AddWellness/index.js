// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

import {
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Slider,
  Typography,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";
import Checkbox from "@mui/material/Checkbox";

import slider from "@mui/material/Slider";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import { fetchTeamInfo } from "../../../../fetchTeamInfo";

function AddWellness() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [checkinFrequency, setCheckinFrequency] = useState("");
  const [completedWellnessData, setCompletedWellnessData] = useState(null);
  const [wellnessData, setWellnessData] = useState({
    water: { id: 1, value: 3 }, //make sure to update to percent
    sleep: { id: 2, value: 3 },
    stress: { id: 3, value: 3 },
    soreness: { id: 4, value: 3 },
    energy: { id: 5, value: 3 },
  });

  const [teamData, setTeamData] = useState({
    water: true,
    sleep: true,
    stress: true,
    soreness: true,
    energy: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);

        const teamInfo = await fetchTeamInfo();
        const currentTeamId = teamInfo.id;

        const { data: teamData, error: teamError } = await supabase
          .from("team")
          .select("*")
          .eq("id", currentTeamId)
          .single();

        setTeamData({
          water: teamData.water_checkin,
          sleep: teamData.sleep_checkin,
          stress: teamData.stress_checkin,
          soreness: teamData.soreness_checkin,
          energy: teamData.energy_checkin,
        });

        setCheckinFrequency(teamData.checkin_frequency);
      } catch (error) {
        console.error("Error:", error);
        // Handle the error here
      }
    };

    fetchData();
  }, []);

  const isWellnessRequired = () => {
    const currentDayOfWeek = startDate.getDay();
    return checkinFrequency.includes((currentDayOfWeek + 1).toString());
  };

  const getNextCheckInDay = () => {
    const currentDayOfWeek = startDate.getDay();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Extract individual digits from the checkin_frequency
    const frequencyDigits = checkinFrequency.split("").map(Number);

    // Find the next available check-in day
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayOfWeek + i) % 7;
      if (frequencyDigits.includes(nextDayIndex + 1)) {
        return daysOfWeek[nextDayIndex];
      }
    }

    return "No scheduled check-in days found";
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await fetchUserProfile();

  //     setProfile(data);
  //   };
  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   const fetchCompletedWellness = async () => {
  //     const selectedDate = startDate.toISOString();
  //     const { data, error } = await supabase
  //       .from("checkin")
  //       .select()
  //       .eq("player_id", profile.id)
  //       .eq("date", selectedDate);

  //     if (error) {
  //       console.error("Error fetching completed wellness data:", error);
  //       // Handle the error here
  //     } else {
  //       // Set the completed wellness data in state
  //       setCompletedWellnessData(data);
  //     }
  //   };

  //   fetchCompletedWellness();
  // }, [profile.id, startDate]);

  const handleSliderChange = (type, value) => {
    setWellnessData((prevData) => ({
      ...prevData,
      [type]: { id: prevData[type].id, value: value },
    }));
  };

  const handleSubmit = async () => {
    const selectedDate = startDate.toISOString();

    const { data: existingEntries, error: existingEntriesError } = await supabase
      .from("checkin")
      .select()
      .eq("player_id", profile.id)
      .eq("date", selectedDate);

    if (existingEntriesError) {
      console.error("Error checking for existing entries:", existingEntriesError);
      // Handle the error here
      return;
    }

    if (existingEntries.length > 0) {
      // Display a pop-up or alert informing the user about the existing entry
      toast.error("You already submitted wellness for this date. Please choose a new date.", {
        style: {
          color: "red",
        },
      });
      return;
    }

    const dataToSubmit = Object.keys(wellnessData).map((type) => ({
      player_id: profile.id, //update to get current user id
      wellness_id: wellnessData[type].id,
      date: selectedDate, //get date that is selected...limiting to current date? allowing users to go back and select a date missed?
      created_at: new Date().toISOString(),
      value: wellnessData[type].value,
    }));

    console.log("dataToSubmit:", dataToSubmit);

    try {
      // Use supabase client's api.post method to add data
      const { data, error } = await supabase.from("checkin").insert(dataToSubmit).select();

      if (error) {
        console.error("Error adding wellness:", error);
        // Handle the error here
      } else {
        console.log("Wellness added successfully!");

        toast.success("Wellness added successfully!", {
          autoClose: 2000,
          onClose: () => {
            navigate("/dashboard");
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle the error here
    }
  };

  return (
    <Card id="add-wellness" style={{ width: "auto" }}>
      <MDBox pt={3} px={2} display="flex" justifyContent="space-between">
        <MDTypography variant="h4" fontWeight="medium">
          Check In
        </MDTypography>
        <MDTypography variant="body2" fontWeight="textSecondary" id="dateSelected">
          Select Date:
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        </MDTypography>
      </MDBox>

      {isWellnessRequired() ? (
        <>
          {teamData.water && (
            <MDBox pt={1} pb={2} px={2}>
              <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                <Tooltip
                  title="Based on your goal, enter the percentage of water you consumed today."
                  placement="top-start"
                >
                  Water
                  <IconButton color="primary" size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Slider
                  valueLabelDisplay="off"
                  step={1}
                  marks={[
                    { value: 1, label: "0%" },
                    { value: 2, label: "25%" },
                    { value: 3, label: "50%" },
                    { value: 4, label: "75%" },
                    { value: 5, label: "100%" },
                  ]}
                  min={1}
                  max={5}
                  value={wellnessData.water.value}
                  onChange={(event, value) => handleSliderChange("water", value)}
                  style={{ marginRight: "16px" }} // Adjust the margin as needed
                />
              </MDBox>
            </MDBox>
          )}
          {teamData.sleep && (
            <MDBox pt={1} pb={2} px={2}>
              <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                <Tooltip
                  title="Amount of sleep, in hours, from the previous night."
                  placement="top-start"
                >
                  Sleep
                  <IconButton color="primary" size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Slider
                  valueLabelDisplay="off"
                  step={1}
                  marks={[
                    { value: 1, label: 5 },
                    { value: 2, label: 6 },
                    { value: 3, label: 7 },
                    { value: 4, label: 8 },
                    { value: 5, label: "9+" },
                  ]}
                  min={1}
                  max={5}
                  value={wellnessData.sleep.value}
                  onChange={(event, value) => handleSliderChange("sleep", value)}
                />
              </MDBox>
            </MDBox>
          )}
          {teamData.stress && (
            <MDBox pt={1} pb={2} px={2}>
              <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                <Tooltip title="1=Not Stressed. 5=Extremely Stressed." placement="top-start">
                  Stress
                  <IconButton color="primary" size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Slider
                  valueLabelDisplay="off"
                  step={1}
                  marks={[
                    { value: 1, label: 1 },
                    { value: 2, label: 2 },
                    { value: 3, label: 3 },
                    { value: 4, label: 4 },
                    { value: 5, label: 5 },
                  ]}
                  min={1}
                  max={5}
                  value={wellnessData.stress.value}
                  onChange={(event, value) => handleSliderChange("stress", value)}
                />
              </MDBox>
            </MDBox>
          )}
          {teamData.soreness && (
            <MDBox pt={1} pb={2} px={2}>
              <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                <Tooltip title="1=Not Sore. 5=Extremely Sore." placement="top-start">
                  Soreness
                  <IconButton color="primary" size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Slider
                  valueLabelDisplay="off"
                  step={1}
                  marks={[
                    { value: 1, label: 1 },
                    { value: 2, label: 2 },
                    { value: 3, label: 3 },
                    { value: 4, label: 4 },
                    { value: 5, label: 5 },
                  ]}
                  min={1}
                  max={5}
                  value={wellnessData.soreness.value}
                  onChange={(event, value) => handleSliderChange("soreness", value)}
                />
              </MDBox>
            </MDBox>
          )}
          {teamData.energy && (
            <MDBox pt={1} pb={2} px={2}>
              <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                <Tooltip title="1=Low energy. 5=High energy." placement="top-start">
                  Energy
                  <IconButton color="primary" size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Slider
                  valueLabelDisplay="off"
                  step={1}
                  marks={[
                    { value: 1, label: 1 },
                    { value: 2, label: 2 },
                    { value: 3, label: 3 },
                    { value: 4, label: 4 },
                    { value: 5, label: 5 },
                  ]}
                  min={1}
                  max={5}
                  value={wellnessData.energy.value}
                  onChange={(event, value) => handleSliderChange("energy", value)}
                />
              </MDBox>
            </MDBox>
          )}
          <MDBox px={2} pb={2}>
            {/* {isWellnessRequired() ? ( */}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              <MDTypography
                variant="caption"
                color="white"
                fontWeight="bold"
                textTransform="uppercase"
              >
                Submit
              </MDTypography>
            </Button>
          </MDBox>
        </>
      ) : (
        <MDBox px={2} pb={2}>
          <MDTypography variant="body1" color="textSecondary">
            <br></br>
            Check-in not required today. Next check-in available on {getNextCheckInDay()}.
          </MDTypography>
        </MDBox>
      )}
    </Card>
  );
}

export default AddWellness;
