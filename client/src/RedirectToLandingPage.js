import React from "react";

export default function RedirectToLandingPage() {
  // Redirect to the landing page when the component is mounted
  React.useEffect(() => {
    console.log("Redirecting to landing page...");
    window.location.href = "/landingpage";
  }, []);

  // Return null to render nothing
  return null;
}
