import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DataTable from "examples/Tables/DataTable";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import ExercisesTableData from "layouts/tables/data/exercisesTableData.js";
import { Select, MenuItem } from "@mui/material";

function Tables() {
  const { columns, rows, handleCategoryFilter, categories, selectedCategory } =
    ExercisesTableData();

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Exercise Library" />

      <Box mb={3}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            backgroundImage: "linear-gradient(to right, #1976d2, #6ab7ff)",
            color: "white",
          }}
        >
          <Box
            p={2}
            sx={{
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="#fff">
              All Exercises
            </Typography>
            <Box>
              <Button
                variant="outlined"
                component={Link}
                to="/addexercise"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  color: "rgba(0, 0, 0, 0.6)",
                }}
              >
                Add Exercise
              </Button>
            </Box>
          </Box>
          <Box
            mb={2}
            sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", pl: 2 }}
          >
            <Typography variant="subtitle2" fontWeight="bold" color="#fff" sx={{ mr: 1 }}>
              Filter:
            </Typography>
            <Select
              value={selectedCategory}
              onChange={(event) => handleCategoryFilter(event.target.value)}
              variant="outlined"
              color="light"
              sx={{ minWidth: 120, color: "white" }}
              IconComponent={() => (
                <span style={{ fontSize: 24, marginLeft: -5 }}>
                  <ArrowDropDownIcon style={{ color: "white" }} />
                </span>
              )}
              renderValue={(value) => <span style={{ color: "white" }}>{value}</span>}
            >
              <MenuItem value="All" sx={{ color: "white" }}>
                Show All
              </MenuItem>
              {categories.map((category, index) => (
                <MenuItem key={index} value={category} sx={{ color: "white" }}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Card>
      </Box>

      <Grid container spacing={6} sx={{ marginBottom: 5 }}>
        <Grid item xs={12}>
          <DataTable
            table={{ columns, rows }}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        </Grid>
      </Grid>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
