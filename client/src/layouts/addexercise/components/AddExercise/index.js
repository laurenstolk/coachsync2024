// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import React, { useState } from "react";

// Add supabase connection
import { supabase } from "../../../../supabaseClient";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function AddExercise() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(""); // new state for selected category

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSubmit = async () => {
    const exerciseData = {
      name: document.getElementById("exercise-name").value,
      category: selectedCategory, // use the selectedCategory state variable
      description: document.getElementById("exercise-description").value,
    };

    try {
      // Use supabase client's api.post method to add data
      const { data, error } = await supabase.from("exercise").upsert([exerciseData]).select();

      if (error) {
        console.error("Error adding exercise:", error);
        // Handle the error here
      } else {
        console.log("Exercise added successfully!");
        // Optionally, you can redirect or show a success message here
        toast.success("Exercise added successfully!", {
          autoClose: 2000,
          onClose: () => {
            navigate("/exerciselibrary");
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle the error here
    }
  };

  return (
    <Card id="delete-account">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h4" fontWeight="medium">
          Add Exercise
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <TextField
            id="exercise-name"
            label="Exercise Name"
            variant="outlined"
            sx={{ width: "30%" }}
          />
        </MDBox>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <MDBox mb={0}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                id="exercise-category"
                label="Category"
                variant="outlined"
                value={selectedCategory}
                onChange={handleCategoryChange}
                IconComponent={() => (
                  <span style={{ fontSize: 24, marginLeft: -5 }}>
                    <ArrowDropDownIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
                  </span>
                )}
                sx={{ width: "30%", minHeight: "46px" }}
              >
                <MenuItem value="14">Training</MenuItem>
                <MenuItem value="8">Arms</MenuItem>
                <MenuItem value="9">Legs</MenuItem>
                <MenuItem value="10">Core</MenuItem>
                <MenuItem value="11">Back</MenuItem>
                <MenuItem value="12">Chest</MenuItem>
                <MenuItem value="13">Endurance</MenuItem>
              </Select>
            </FormControl>
          </MDBox>
        </MDBox>
      </MDBox>
      <MDBox pt={1} pb={2} px={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          <TextField
            id="exercise-description"
            label="Description"
            variant="outlined"
            sx={{ width: "50%" }}
          />
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

export default AddExercise;
