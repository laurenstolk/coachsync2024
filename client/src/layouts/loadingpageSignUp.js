import React, { useEffect, useState } from 'react';
import { supabase } from "../supabaseClient";
import logo from './../assets/images/logo-ct-dark.png'; // Import your logo image

const LoadingPageSignUp = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await supabase.auth.getUser();
        const userId = user.data.user.id;
    
        if (user) {
          const { data, error } = await supabase.from("profile").select("*").eq("id", userId).single();

          if (error) {
            throw error;
          }

          if (data && data.first_name) {
            // User has a first name, redirect to homepage
            window.location.href = '/';
          } else {
            // User doesn't have a first name, redirect to authentication page
            window.location.href = '/authentication/coachorplayer/';
          }
        } else {
          // User is not authenticated, handle as needed
          // For example, redirect to login page
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        // Handle error, redirect to an error page or show an error message
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

    // Define CSS animation within the component
    const styles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  return (
    
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      {/* Apply CSS animation to rotate the logo */}
      <img 
        src={logo} 
        alt="Logo" 
        style={{ 
          width: '100px', // Adjust the width as needed
          height: '100px', // Adjust the height as needed
          animation: 'spin 2s linear infinite',
          // Apply the inline style for animation definition
          animationName: 'spin',
        }} 
      />
      {/* Include the style tag to add the animation definition */}
      <style>{styles}</style>

      {/* <Routes>
        {hasFirstName ? (
          <Route path="*" element={<Navigate to="/dashboard" />} />
        ) : (
          <Route path="*" element={<Navigate to="/authentication/coachorplayer" />} />
        )}
      </Routes> */}
      
    </div>
    
  );
};

export default LoadingPageSignUp;
