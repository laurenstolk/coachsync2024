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
import PlayerDashboard from "layouts/playerdashboard";
import Tables from "layouts/tables";
import ExerciseLibrary from "layouts/exerciselibrary";
import AddExercise from "layouts/addexercise";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import SignOut from "layouts/authentication/sign-out";
import CoachOrPlayer from "layouts/authentication/coachorplayer";
import AssistantorNew from "layouts/authentication/assistantornew";
import CoachInfo from "layouts/authentication/coachinfo";
import CoachEdit from "layouts/authentication/coachedit";
import PlayerEdit from "layouts/authentication/playeredit";
import PlayerInfo from "layouts/authentication/playerinfo";
import TeamInfo from "layouts/authentication/teaminfo";
import PlayerTeam from "layouts/authentication/playerteam";
import ExistingTeam from "layouts/authentication/existingteam";
import Cover from "layouts/authentication/reset-password/cover";
import WellnessSetup from "layouts/authentication/wellness-setup";
import WellnessSetupEdit from "layouts/authentication/wellness-setup-edit";
import WorkoutLibrary from "layouts/workoutlibrary";
import AddGroup from "layouts/addgroup";
import LoadingPageSignUp from "layouts/loadingpageSignUp";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";

// @mui icons
import Icon from "@mui/material/Icon";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import Addnewteam from "./layouts/addteam";
import AddWorkout from "./layouts/addworkout";
import Addnewwellness from "./layouts/addwellness";
import AddAssignment from "layouts/addassignment/index";

import Groups2Icon from "@mui/icons-material/Groups2"; //grouptable icon
import CompleteWorkout from "./layouts/completeworkout";
import EditGroup from "./layouts/editgroup";
import ViewAssignment from "./layouts/viewassignment";
import ViewCalendar from "./layouts/viewcalendar";
import MyCalendar from "./layouts/mycalendar";

const routes = [
  //COACH
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    coach: true,
  },
  //PLAYER
  {
    type: "collapse",
    name: "Player Dashboard",
    key: "playerdashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/playerdashboard",
    component: <PlayerDashboard />,
    player: true,
  },
  //BOTH
  {
    type: "collapse",
    name: "Team",
    key: "tables",
    icon: <PeopleIcon fontSize="small">table_view</PeopleIcon>,
    route: "/tables",
    component: <Tables />,
  },
  //COACH
  {
    type: "collapse",
    name: "Team Calendar",
    key: "viewcalendar",
    icon: <CalendarMonthIcon fontSize="small">add_assignment</CalendarMonthIcon>,
    route: "/viewcalendar",
    component: <ViewCalendar />,
    coach: true,
  },
  //PLAYER
  {
    type: "collapse",
    name: "My Calendar",
    key: "mycalendar",
    icon: <CalendarMonthIcon fontSize="small">add_assignment</CalendarMonthIcon>,
    route: "/mycalendar",
    component: <MyCalendar />,
    player: true,
  },
  //PLAYER
  {
    type: "collapse",
    name: "Complete Check-in",
    key: "addwellness",
    icon: <PsychologyAltIcon fontSize="small">Wellness</PsychologyAltIcon>,
    route: "/completecheckin",
    component: <Addnewwellness />,
    player: true,
  },
  //COACH
  {
    type: "divider",
    coach: true,
  },
  //COACH
  {
    type: "title",
    name: "Exercise",
    title: "Exercise",
    coach: true,
  },
  //COACH
  {
    type: "collapse",
    name: "Exercise Library",
    key: "exerciselibrary",
    icon: <ListAltIcon fontSize="small">book</ListAltIcon>,
    route: "/exerciselibrary",
    component: <ExerciseLibrary />,
    coach: true,
  },

  //COACH
  {
    type: "collapse",
    name: "Add Exercise",
    key: "addexercise",
    icon: <FitnessCenterIcon fontSize="small">accessibility</FitnessCenterIcon>,
    route: "/addexercise",
    component: <AddExercise />,
    coach: true,
  },
  //COACH
  {
    type: "divider",
    coach: true,
  },
  //COACH
  {
    type: "title",
    name: "Workout",
    title: "Workout",
    coach: true,
  },
  //COACH
  {
    type: "collapse",
    name: "Workout Library",
    key: "workoutlibrary",
    icon: <CollectionsBookmarkIcon fontSize="small">book</CollectionsBookmarkIcon>,
    route: "/workoutlibrary",
    component: <WorkoutLibrary />,
    coach: true,
  },
  //COACH
  {
    type: "collapse",
    name: "Add Workout",
    key: "addworkout",
    icon: <DirectionsRunIcon fontSize="small">accessibility</DirectionsRunIcon>,
    route: "/addworkout",
    component: <AddWorkout />,
    coach: true,
  },
  //PLAYER
  {
    type: "collapse",
    name: "Complete Workout",
    key: "completeworkout",
    icon: <FitnessCenterIcon fontSize="small">workout</FitnessCenterIcon>,
    route: "/completeworkout",
    component: <CompleteWorkout />,
    player: true,
  },
  //COACH
  {
    type: "collapse",
    name: "Assign Workout",
    key: "addassignment",
    icon: <AssignmentIcon fontSize="small">add_assignment</AssignmentIcon>,
    route: "/addassignment",
    component: <AddAssignment />,
    coach: true,
  },
  //COACH
  {
    key: "addassignment",
    icon: <AssignmentIcon fontSize="small">add_assignment</AssignmentIcon>,
    route: "/addassignment/:workoutId?",
    component: <AddAssignment />,
  },
  //COACH
  {
    type: "collapse",
    name: "View Assigned Workouts",
    key: "viewassignment",
    icon: <AssignmentIcon fontSize="small">add_assignment</AssignmentIcon>,
    route: "/viewassignment",
    component: <ViewAssignment />,
    coach: true,
  },

  //COACH
  {
    type: "divider",
    coach: true,
  },

  {
    // type: "collapse",
    // name: "Create Group",
    key: "addgroup",
    icon: <Groups2Icon fontSize="small">book</Groups2Icon>,
    route: "/addgroup",
    component: <AddGroup />,
  },
  {
    // type: "collapse",
    // name: "Edit Group",
    key: "editgroup",
    icon: <Groups2Icon fontSize="small">book</Groups2Icon>,
    route: "/editgroup/:id?",
    component: <EditGroup />,
  },

  // {
  //   type: "collapse",
  //   name: "View Workout",
  //   key: "viewworkout",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/viewworkout",
  //   component: <ViewWorkout />,
  // },

  //BOTH
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  //BOTH
  {
    type: "collapse",
    name: "Sign Out",
    key: "sign-out",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/authentication/sign-out",
    component: <SignOut />,
  },
  // {
  //   type: "collapse",
  //   name: "Billing",
  //   key: "billing",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/billing",
  //   component: <Billing />,
  // },
  // {
  //   type: "collapse",
  //   name: "Notifications",
  //   key: "notifications",
  //   icon: <Icon fontSize="small">notifications</Icon>,
  //   route: "/notifications",
  //   component: <Notifications />,
  // },

  {
    // type: "collapse",
    // name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },

  {
    // type: "collapse",
    // name: "Coach or Player",
    key: "coachorplayer",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/authentication/coachorplayer",
    component: <CoachOrPlayer />,
  },
  {
    // type: "collapse",
    // name: "Coach or Player",
    key: "assistantornew",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/authentication/assistantornew",
    component: <AssistantorNew />,
  },
  {
    // type: "collapse",
    // name: "Coach Info",
    key: "coachinfo",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/coachinfo",
    component: <CoachInfo />,
  },
  {
    // type: "collapse",
    // name: "Coach Edit",
    key: "coachedit",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/coachedit",
    component: <CoachEdit />,
  },
  {
    // type: "collapse",
    // name: "Player Edit",
    key: "playeredit",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/playeredit",
    component: <PlayerEdit />,
  },
  {
    // type: "collapse",
    // name: "Player Info",
    key: "playerinfo",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/playerinfo",
    component: <PlayerInfo />,
  },
  {
    // type: "collapse",
    // name: "Team Info",
    key: "teaminfo",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/teaminfo",
    component: <TeamInfo />,
  },
  {
    // type: "collapse",
    // name: "Player Team",
    key: "playerteam",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/playerteam",
    component: <PlayerTeam />,
  },
  {
    // type: "collapse",
    // name: "Player Team",
    key: "existingteam",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/existingteam",
    component: <ExistingTeam />,
  },
  {
    // type: "collapse",
    // name: "Wellness Setup",
    key: "wellness-setup",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/wellness-setup",
    component: <WellnessSetup />,
  },
  {
    // type: "collapse",
    // name: "Wellness Setup",
    key: "wellness-setup-edit",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/wellness-setup-edit",
    component: <WellnessSetupEdit />,
  },
  {
    // type: "collapse",
    // name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small"></Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  {
    key: "loadingpageSignUp",
    route: "/loadingpageSignUp",
    component: <LoadingPageSignUp />,
  },
  {
    key: "reset-password",
    route: "/authentication/reset-password",
    component: <Cover />,
  },
];

export default routes;
