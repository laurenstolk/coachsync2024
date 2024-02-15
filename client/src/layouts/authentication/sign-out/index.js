// SignOutButton.js

import React, { useState } from "react";
import { supabase } from "../../../supabaseClient";

const SignOutButton = () => {
  const [isConfirmationOpen, setConfirmationOpen] = useState(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Redirect to the specific page after signing out
    window.location.href = "/";
  };

  const handleCancel = () => {
    // Navigate back to the previous page
    window.history.back();
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
    >
      {isConfirmationOpen ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            background: "#fff",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            zIndex: 999,
            borderRadius: "8px",
            width: "300px",
          }}
        >
          <p style={{ marginBottom: "20px", fontSize: "16px" }}>
            Are you sure you want to sign out?
          </p>
          <button
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              backgroundColor: "#d9534f",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              handleSignOut();
            }}
          >
            Yes, Sign Out
          </button>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#5bc0de",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#5bc0de",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => setConfirmationOpen(true)}
        >
          Sign Out
        </button>
      )}
    </div>
  );
};

export default SignOutButton;
