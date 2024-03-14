/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { supabase } from "../../../supabaseClient";
import { fetchUserProfile } from "../../../fetchUserProfile";

export default function ExercisesTableData() {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sportName, setSportName] = useState("");

  async function getExercises() {
    try {
      const profileData = await fetchUserProfile();

      let { data: teamData, error } = await supabase
        .from("team")
        .select("*")
        .eq("id", profileData.team_id)
        .single();

      let { data: sportData, erorr } = await supabase
          .from("sport")
          .select("*")
          .eq("id", teamData.sport_id)
          .single();

      setSportName(sportData.name);

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
    setSelectedCategory(category);
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
  ];

  const rows = filteredExercises.map((exercise, index) => ({
    name: (
      <MDBox display="flex" py={1}>
        {exercise.name}
      </MDBox>
    ),
    category: (
        <MDBox display="flex" py={1}>
          {exercise.category === "Training" ? sportName : exercise.category}
        </MDBox>
    ),
    description: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {exercise.description}
      </MDTypography>
    ),
  }));

  return { columns, rows, handleCategoryFilter, categories, selectedCategory };
}
