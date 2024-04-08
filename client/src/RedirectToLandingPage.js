import React from "react";

export default function RedirectToLandingPage() {
  // Redirect to the landing page when the component is mounted
  React.useEffect(() => {
    window.location.href = "/landingpage";
  }, []);

  // Return null to render nothing
  return null;
}
