// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

import { FormControl, FormControlLabel, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";
import Checkbox from "@mui/material/Checkbox";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const daysOfWeekMap = [
  { id: 1, name: "Sunday" },
  { id: 2, name: "Monday" },
  { id: 3, name: "Tuesday" },
  { id: 4, name: "Wednesday" },
  { id: 5, name: "Thursday" },
  { id: 6, name: "Friday" },
  { id: 7, name: "Saturday" },
];

function AddTeam() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState(""); // new state for selected sport
  const [selectedDays, setSelectedDays] = useState([]); // new state for selected days
  const [sports, setSports] = useState([]);

  async function getSports() {
    try {
      let { data, error } = await supabase.from("sport").select("*");

      if (error) throw error;

      if (data != null) {
        setSports(data);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  useEffect(() => {
    getSports();
  }, []);

  const handleSportChange = (event) => {
    setSelectedSport(event.target.value);
  };

  const handleDayChange = (day) => {
    setSelectedDays((prevSelectedDays) => {
      const newSelectedDays = prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day];

      return newSelectedDays;
    });
  };

  const handleSubmit = async () => {
    const teamData = {
      name: document.getElementById("team-name").value,
      sport_id: selectedSport, // use the selectedSport state variable
      checkin_frequency: selectedDays.sort((a, b) => a - b).join(""),
    };

    try {
      // Use supabase client's api.post method to add data
      const { data, error } = await supabase.from("team").upsert([teamData]).select();

      if (error) {
        console.error("Error adding team:", error);
        // Handle the error here
      } else {

        toast.success("Team added successfully!", {
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
    <Card id="team-registration">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h4" fontWeight="medium">
          Team Registration
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <TextField id="team-name" label="Team Name" variant="outlined" sx={{ width: "30%" }} />
        </MDBox>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <MDBox mb={2}>
            <FormControl fullWidth>
              <InputLabel>Sport</InputLabel>
              <Select
                id="team-sport"
                label="Sport"
                variant="outlined"
                value={selectedSport}
                onChange={handleSportChange}
                sx={{ width: "30%", minHeight: "46px" }}
              >
                {sports.map((sport, index) => (
                  <MenuItem key={index} value={sport.id}>
                    {sport.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox pt={1} pb={2} px={2}>
        <InputLabel>Days of the Week</InputLabel>

        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <MDBox mb={2}>
            <FormControl>
              <MDBox display="flex" flexDirection="row">
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
              </MDBox>
            </FormControl>
          </MDBox>
        </MDBox>
      </MDBox>
      <MDBox px={2} pb={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          <MDTypography variant="caption" color="white" fontWeight="bold" textTransform="uppercase">
            Submit
          </MDTypography>
        </Button>
      </MDBox>
    </Card>
  );
}

export default AddTeam;
