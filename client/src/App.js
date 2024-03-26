import { ToastContainer } from "react-toastify";

import { useState, useEffect, useMemo } from "react";

// react-router components

import { Routes, useLocation, useNavigate, Route, Navigate } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav } from "context";

import LoadingPage from "layouts/loadingpage.js";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

import { supabase } from "./supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { fetchUserProfile } from "./fetchUserProfile";
import Cover from "layouts/authentication/reset-password/cover";
import RedirectToLandingPage from "./RedirectToLandingPage";

const WelcomeBox = () => (
  <div
    style={{
      background: "#3498db", // Blue background color
      padding: "25px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      color: "#fff", // Text color
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <h2 style={{ marginBottom: "10px" }}>Welcome to CoachSync</h2>
    <img
      src="/static/media/logo-ct.39c110530c00e2b0debf.png"
      alt="CoachSync Logo"
      style={{ maxWidth: "50px", marginBottom: "10px" }}
    />
  </div>
);

const sendResetPasswordEmail = async (email) => {
  try {
    const { error } = await supabase.auth.api.resetPasswordForEmail(email, {
      redirectTo: "/authentication/reset-password",
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    // Handle error (optional)
    console.error("Error sending reset password email:", error.message);
  }
};

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Introduce a loading state
  const location = useLocation();
  const navigate = useNavigate();

  const hasFirstName = profile && profile.first_name !== null;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const redirectTo = queryParams.get("redirect_to");

    if (token && redirectTo) {
      navigate(`/authentication/reset-password?token=${token}&redirect_to=${redirectTo}`);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // WHERE THE USER IS NULL ERROR ON SIGN IN IS HAPPENING - i need
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          const userdata = await fetchUserProfile();
          if (userdata) {
            setProfile(userdata);
            setLoading(false); // Set loading to false after fetching profile data
          } else {
            setLoading(false); // No user data available
          }
        } catch (error) {
          console.error("Error fetching user profile:", error.message);
          // Handle error, e.g., set loading to false or show an error message
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false); // No session, so set loading to false
    }
  }, [session]);
  

  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setMiniSidenav(dispatch, !miniSidenav);
  // setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
    document.body.style.margin = 0;
    document.body.style.padding = 0;
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      {miniSidenav ? (
        <Icon sx={{ fontSize: "2rem" }}>menu</Icon>
      ) : (
        <Icon sx={{ fontSize: "2rem" }}>menu_open</Icon>
      )}
      {/* <MenuIcon fontSize="small" color="inherit" /> */}

      {/* <Icon fontSize="small" color="inherit">
        settings
      </Icon> */}
    </MDBox>
  );

  if (loading) {
    // Render loading UI
    return <LoadingPage />;
  } else if (
    !session &&
    location.pathname !== "/authentication/reset-password" &&
    location.pathname !== "/"
  ) {
    return (
      <div>
        <div
          style={{
            position: "absolute",
            width: "100%",
            minHeight: "100vh",
            background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/static/media/bg-sign-in-basic.f327db1d0e4b00ba3c81.jpeg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <WelcomeBox />
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <Auth
              supabaseClient={supabase}
              appearance={{
                style: {
                  button: {
                    background: "#3498db",
                    color: "#fff",
                    borderRadius: "4px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: "pointer",
                    border: "none",
                    marginTop: "20px",
                  },
                  anchor: {
                    color: "#3498db",
                    textDecoration: "none",
                    cursor: "pointer",
                    marginTop: "20px",
                  },
                },
                theme: ThemeSupa,
                variables: {
                  default: {
                    space: {
                      spaceSmall: "4px",
                    },
                  },
                },
              }}
              providers={["google"]}
              redirectTo="https://coachsync.pro/authentication/reset-password"
              theme="default"
              onResetPassword={sendResetPasswordEmail}
            />
          </div>
        </div>
      </div>
    );
  } else {
    // STOP UNDO
    return direction === "rtl" ? (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
          <CssBaseline />
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="CoachSync"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            {/* <Route path="/" element={<RedirectToLandingPage />} /> */}
            <Route path="/authentication/reset-password" element={<Cover />} />
            {getRoutes(routes)}
            {hasFirstName ? (
            <Route path="*" element={<Navigate to="/" />} />
            ) : (
              <Route path="*" element={<Navigate to="/loadingpageSignUp" />} />
            )}          
          </Routes>
          <ToastContainer />
        </ThemeProvider>
      </CacheProvider>
    ) : (
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="CoachSync"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {/* <Route path="/" element={<RedirectToLandingPage />} /> */}
          <Route path="/authentication/reset-password" element={<Cover />} />
          {getRoutes(routes)}
          {hasFirstName ? (
            <Route path="*" element={<Navigate to="/" />} />
          ) : (
            <Route path="*" element={<Navigate to="/loadingpageSignUp" />} />
          )}
        </Routes>
      </ThemeProvider>
    );
  }
}
