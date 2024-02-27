import React from "react";
import logo from "./../assets/images/logo-ct-dark.png"; // Import your logo image

const LoadingPageSignUp = () => {
  // Define CSS animation within the component
  const styles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {/* Apply CSS animation to rotate the logo */}
      <img
        src={logo}
        alt="Logo"
        style={{
          width: "100px", // Adjust the width as needed
          height: "100px", // Adjust the height as needed
          animation: "spin 2s linear infinite",
          // Apply the inline style for animation definition
          animationName: "spin",
        }}
      />
      {/* Include the style tag to add the animation definition */}
      <style>{styles}</style>
    </div>
  );
};

export default LoadingPageSignUp;
