// @mui material components
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

import {
  // FormControl,
  // FormControlLabel,
  // InputLabel,
  // Select,
  Slider,
  // Typography,
} from "@mui/material";
// import DatePicker from "react-datepicker";
//
// import "react-datepicker/dist/react-datepicker.css";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "../../../../fetchUserProfile";
import { fetchTeamInfo } from "../../../../fetchTeamInfo";
import { DatePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

function AddWellness() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [startDate, setStartDate] = useState(dayjs());
  const [checkinFrequency, setCheckinFrequency] = useState("");
  const [wellnessData, setWellnessData] = useState({

    water: { id: 1, value: 3 , notes: null}, 
    sleep: { id: 2, value: 3 , notes: null},
    stress: { id: 3, value: 3 , notes: null},
    soreness: { id: 4, value: 3 , notes: null},
    energy: { id: 5, value: 3 , notes: null},
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
    const currentDayOfWeek = startDate.day();
    return checkinFrequency.includes((currentDayOfWeek + 1).toString());
  };

  const getNextCheckInDay = () => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayOfWeek = daysOfWeek.indexOf(dayjs(startDate).format("dddd"));

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

  const handleSliderChange = (type, value) => {
    setWellnessData((prevData) => ({
      ...prevData,
      [type]: { id: prevData[type].id, value: value, notes: prevData[type].notes },
    }));
  };

  const handleNotesChange = (type, event) => {
    const notes = event.target.value;
    setWellnessData((prevData) => ({
      ...prevData,
      [type]: { id: prevData[type].id, value: prevData[type].value, notes: notes },
    }));
  };

  const handleSubmit = async () => {
    if (!isWellnessRequired()) {
      return;
    }

    console.log("startDate", startDate);
    const selectedDate = dayjs(startDate).format("YYYY-MM-DD");

    console.log("selectedDate", selectedDate);

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
      notes: wellnessData[type].notes,
    }));

    try {
      const { data, error } = await supabase.from("checkin").insert(dataToSubmit).select();

      if (error) {
        console.error("Error adding wellness:", error);
      } else {
        console.log("Wellness added successfully!");

        toast.success("Wellness added successfully!", {
          autoClose: 2000,
          onClose: () => {
            navigate("/playerdashboard");
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
          Complete Check-in
        </MDTypography>
        <DatePicker
          label="Select Date"
          slotProps={{
            textField: {
              helperText: "MM/DD/YYYY",
            },
          }}
          onChange={(date) => setStartDate(date)}
          value={dayjs(startDate)}
        />
        {/*<DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />*/}
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
                <TextField
                  label="Add Optional Note"
                  variant="outlined"
                  fullWidth
                  value={wellnessData.water.notes}
                  onChange={(event) => handleNotesChange("water", event)}
                  style={{ marginTop: "8px" }}
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
                <TextField
                  label="Add Optional Note"
                  variant="outlined"
                  fullWidth
                  value={wellnessData.sleep.notes}
                  onChange={(event) => handleNotesChange("sleep", event)}
                  style={{ marginTop: "8px" }}
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
                <TextField
                  label="Add Optional Note"
                  variant="outlined"
                  fullWidth
                  value={wellnessData.energy.notes}
                  onChange={(event) => handleNotesChange("energy", event)}
                  style={{ marginTop: "8px" }}
                />
              </MDBox>
            </MDBox>
          )}
          <divider />
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
                <TextField
                  label="Add Optional Note"
                  variant="outlined"
                  fullWidth
                  value={wellnessData.stress.notes}
                  onChange={(event) => handleNotesChange("stress", event)}
                  style={{ marginTop: "8px" }}
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
                <TextField
                  label="Add Optional Note"
                  variant="outlined"
                  fullWidth
                  value={wellnessData.soreness.notes}
                  onChange={(event) => handleNotesChange("soreness", event)}
                  style={{ marginTop: "8px" }}
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
