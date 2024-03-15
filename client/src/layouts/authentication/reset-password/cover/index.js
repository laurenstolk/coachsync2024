import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/bg-reset-cover.jpeg";
import { useState } from 'react';
import { supabase } from "../../../../supabaseClient";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";

function Cover() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');

  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      if (newPassword.length < 6) {
        setResetFeedback('Password must be at least 6 characters long.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setResetFeedback('Passwords do not match. Please re-enter.');
        return;
      }

      const user = supabase.auth.updateUser();
      if (!user) {
        setResetFeedback('User not authenticated.');
        return;
      }
  
      const { error } = await supabase.auth.updateUser({
        email: user.email,
        password: newPassword
      });
  
      if (error) {
        console.error('Error resetting password:', error.message);
        if (error.message === 'New password should be different from the old password.') {
          setResetFeedback('New password should be different from the old password.');
        } else {
          setResetFeedback('Failed to reset password. Please try again.');
        }
      } else {
        setResetFeedback('Password reset successfully.');
        toast.success("Redirecting to home page...", {
          autoClose: 2000,
          onClose: () => {
            navigate("/dashboard");
          },
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error.message);
      setResetFeedback('An error occurred. Please try again later.');
    }
  };
   

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
            Reset Password
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <form onSubmit={handleResetPassword}> {/* Wrap form around inputs */}
            <MDBox mb={4}>
              <MDInput
                type="password"
                label="New Password"
                variant="standard"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <MDInput
                type="password"
                label="Confirm Password"
                variant="standard"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </MDBox>
            {resetFeedback && (
              <MDTypography variant="body2" color={resetFeedback.includes('error') ? 'error' : 'success'} mb={2}>
                {resetFeedback}
              </MDTypography>
            )}
            <MDBox mt={6} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                Reset
              </MDButton>
            </MDBox>
          </form>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
