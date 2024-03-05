import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import MDBox from "../../components/MDBox";
import Grid from "@mui/material/Grid";
import Footer from "../../examples/Footer";
import AddWellness from "./components/AddWellness";

function Billing() {
  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Add Wellness" />
      <MDBox mt={8}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <AddWellness />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
// removed: absolute isMini from Dashboard Navbar previously: <DashboardNavbar pageTitle="Add Wellness" absolute isMini />

export default Billing;
