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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

// Add supabase connection
import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

export default function data() {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);

  async function getExercises() {
    try {
      const profileData = await fetchUserProfile();

      let { data: teamData, error } = await supabase
        .from("team")
        .select("*")
        .eq("id", profileData.team_id)
        .single();

      let { data: trainingExercisesData, error: trainingExercisesError } = await supabase
        .from("exercise")
        .select("*")
        .eq("category", "14")
        .eq("sport", teamData.sport_id);
      if (trainingExercisesError) throw error;

      let { data: otherExercisesData, error: otherExercisesError } = await supabase
        .from("exercise")
        .select("*")
        .not("category", "eq", "14");

      // Assuming trainingExercisesData and otherExercisesData are arrays
      let exerciseData = [...trainingExercisesData, ...otherExercisesData];

      const { data: categoryData, error: categoryError } = await supabase
        .from("category")
        .select("*");

      if (otherExercisesError || categoryError || trainingExercisesError) {
        throw otherExercisesError || categoryError || trainingExercisesError;
      }

      if (exerciseData && categoryData) {
        const categoryNames = categoryData.map((category) => category.category_name);
        setCategories(categoryNames);

        // Map category data to an object for easy lookup
        const categoryMap = {};
        categoryData.forEach((category) => {
          categoryMap[category.category_id] = category.category_name;
        });

        // Map exercise data and replace category foreign keys with category names
        const exercisesWithCategories = exerciseData.map((exercise) => ({
          ...exercise,
          category: categoryMap[exercise.category],
        }));

        setExercises(exercisesWithCategories);
        setFilteredExercises(exercisesWithCategories);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    getExercises();
  }, []);

  // Function to handle category filter
  const handleCategoryFilter = (category) => {
    if (category === "All") {
      setFilteredExercises(exercises); // Show all exercises
    } else {
      const filtered = exercises.filter((exercise) => exercise.category === category);
      setFilteredExercises(filtered);
    }
  };

  const columns = [
    { Header: "name", accessor: "name", width: "20%", align: "left" },
    { Header: "category", accessor: "category", width: "20%", align: "left" },
    { Header: "description", accessor: "description", width: "40%", align: "left" },
    { Header: "Edit", accessor: "edit", width: "10%", align: "left" },
    { Header: "Delete", accessor: "delete", width: "10%", align: "center" },
  ];

  const rows = filteredExercises.map((exercise, index) => ({
    name: (
      <MDBox display="flex" py={1}>
        {exercise.name}
      </MDBox>
    ),
    category: (
      <MDBox display="flex" py={1}>
        {exercise.category}
      </MDBox>
    ),
    description: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {exercise.description}
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
  }));

  // const filterButton = (
  //   <MDBox mb={2}>
  //     <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
  //       <MDButton sx={{minHeight: "10px"}}  color="info" onClick={() => handleCategoryFilter("All")}>
  //         Show All
  //       </MDButton>
  //     </div>
  //     <div style={{ display: 'flex', justifyContent: 'center' }}>
  //       {categories.map((category, index) => (
  //           <MDButton
  //             key={index}
  //             variant="outlined"
  //             color="white"
  //             sx={{width: "10%", minHeight: "15px"}}
  //             onClick={() => handleCategoryFilter(category)}
  //           >
  //             {category}
  //           </MDButton>
  //       ))}
  //     </div>
  //   </MDBox>
  // );
  const filterButton = (
    <MDBox mb={2}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {categories.map((category, index) => (
          <MDButton
            key={index}
            variant="outlined"
            color="light"
            sx={{ width: "10%", minHeight: "15px", marginRight: 2 }}
            onClick={() => handleCategoryFilter(category)}
          >
            {category}
          </MDButton>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <MDButton
            sx={{ minHeight: "15px", marginLeft: 4 }}
            variant="outlined"
            color="light"
            onClick={() => handleCategoryFilter("All")}
          >
            Show All
          </MDButton>
        </div>
      </div>
    </MDBox>
  );

  return { columns, rows, handleCategoryFilter, filterButton };
}
