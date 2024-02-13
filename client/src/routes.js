/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import ExerciseLibrary from "layouts/exerciselibrary";
import GroupTable from "layouts/grouptable";
import AddExercise from "layouts/addexercise";
import Billing from "layouts/billing";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import SignOut from "layouts/authentication/sign-out";
import CoachOrPlayer from "layouts/authentication/coachorplayer";
import CoachInfo from "layouts/authentication/coachinfo";
import TeamInfo from "layouts/authentication/teaminfo";
import WellnessSetup from "layouts/authentication/wellness-setup";
import Summary from "layouts/authentication/summary";
import WorkoutLibrary from "layouts/workoutlibrary";
import ViewWorkout from "layouts/viewworkout";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";

// @mui icons
import Icon from "@mui/material/Icon";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import AssignmentIcon from "@mui/icons-material/Assignment";

import Addnewteam from "./layouts/addteam";
import AddWorkout from "./layouts/addworkout";
import Addnewwellness from "./layouts/addwellness";
import AddAssignment from "layouts/addassignment/index";

import Groups2Icon from "@mui/icons-material/Groups2"; //grouptable icon
import CompleteWorkout from "./layouts/completeworkout";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Players",
    key: "tables",
    icon: <PeopleIcon fontSize="small">table_view</PeopleIcon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Exercise Library",
    key: "exerciselibrary",
    icon: <ListAltIcon fontSize="small">book</ListAltIcon>,
    route: "/exerciselibrary",
    component: <ExerciseLibrary />,
  },
  {
    type: "collapse",
    name: "Team Groups",
    key: "grouptable",
    icon: <Groups2Icon fontSize="small">book</Groups2Icon>,
    route: "/grouptable",
    component: <GroupTable />,
  },

  {
    type: "collapse",
    name: "Add Exercise",
    key: "addexercise",
    icon: <FitnessCenterIcon fontSize="small">accessibility</FitnessCenterIcon>,
    route: "/addexercise",
    component: <AddExercise />,
  },
  {
    type: "collapse",
    name: "Saved Workouts",
    key: "workoutlibrary",
    icon: <CollectionsBookmarkIcon fontSize="small">book</CollectionsBookmarkIcon>,
    route: "/workoutlibrary",
    component: <WorkoutLibrary />,
  },
  {
    type: "collapse",
    name: "Create Workout",
    key: "addworkout",
    icon: <DirectionsRunIcon fontSize="small">accessibility</DirectionsRunIcon>,
    route: "/addworkout",
    component: <AddWorkout />,
  },
  {
    type: "collapse",
    name: "Add New Team",
    key: "addteam",
    icon: <Icon fontSize="small">accessibility</Icon>,
    route: "/addteam",
    component: <Addnewteam />,
  },
  {
    type: "collapse",
    name: "Wellness Checkin",
    key: "addwellness",
    icon: <PsychologyAltIcon fontSize="small">Wellness</PsychologyAltIcon>,
    route: "/addwellness",
    component: <Addnewwellness />,
  },
  {
    type: "collapse",
    name: "View Workout",
    key: "viewworkout",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/viewworkout",
    component: <ViewWorkout />,
  },
  {
    type: "collapse",
    name: "Assign Workout",
    key: "addassignment",
    icon: <AssignmentIcon fontSize="small">add_assignment</AssignmentIcon>,
    route: "/addassignment",
    component: <AddAssignment />,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Complete Workout",
    key: "completeworkout",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/completeworkout",
    component: <CompleteWorkout />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Out",
    key: "sign-out",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/authentication/sign-out",
    component: <SignOut />,
  },
  {
    type: "collapse",
    name: "Coach or Player",
    key: "coachorplayer",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/authentication/coachorplayer",
    component: <CoachOrPlayer />,
  },
  {
    type: "collapse",
    name: "Coach Info",
    key: "coachinfo",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/coachinfo",
    component: <CoachInfo />,
  },
  {
    type: "collapse",
    name: "Team Info",
    key: "teaminfo",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/teaminfo",
    component: <TeamInfo />,
  },
  {
    type: "collapse",
    name: "Wellness Setup",
    key: "wellness-setup",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/wellness-setup",
    component: <WellnessSetup />,
  },
  {
    type: "collapse",
    name: "Summary",
    key: "summary",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/summary",
    component: <Summary />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
