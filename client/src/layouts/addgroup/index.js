import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import MDBox from "../../components/MDBox";
import Grid from "@mui/material/Grid";
import Footer from "../../examples/Footer";
import AddGroup from "./data/index";

function AddingGroup() {
    return (
        <DashboardLayout>
            <DashboardNavbar pageTitle="Create Group" absolute isMini />
            <MDBox mt={8}>
                <MDBox mb={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <AddGroup />
                        </Grid>
                    </Grid>
                </MDBox>
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default AddingGroup;