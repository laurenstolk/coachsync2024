// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';

// export default function IndeterminateCheckbox() {
//     const [checked, setChecked] = React.useState([false, false, false, false, false]);

//     const handleChange0 = (event) => {
//         setChecked([checked[0], checked[1], event.target.checked, event.target.checked, event.target.checked]);
//     };

//     const handleChange1 = (event) => {
//         setChecked([event.target.checked, event.target.checked, checked[2], checked[3], checked[4]]);
//     };

//     const handleChange2 = (event) => {
//       setChecked([checked[0], event.target.checked, checked[2], checked[3], checked[4]]);
//     };

//     const handleChange3 = (event) => {
//       setChecked([checked[0], checked[1], event.target.checked, checked[3], checked[4]]);
//     };

//     const handleChange4 = (event) => {
//       const newChecked = [...checked];
//       newChecked[2] = event.target.checked;
//       setChecked(newChecked);
//     };

//     const handleChange5 = (event) => {
//       const newChecked = [...checked];
//       newChecked[3] = event.target.checked;
//       setChecked(newChecked);
//     };

//     const handleChange6 = (event) => {
//       const newChecked = [...checked];
//       newChecked[4] = event.target.checked;
//       setChecked(newChecked);
//     };

//     const children = (
//       <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
//         <FormControlLabel
//           label="Lauren Stolk"
//           control={<Checkbox checked={checked[0]} onChange={handleChange2} />}
//         />
//         <FormControlLabel
//           label="Jordan Bateman"
//           control={<Checkbox checked={checked[1]} onChange={handleChange3} />}
//         />
//       </Box>
//     );

//     const defenseChildren = (
//       <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
//         <FormControlLabel
//           label="Seth Egbert"
//           control={<Checkbox checked={checked[2]} onChange={handleChange4} />}
//         />
//         <FormControlLabel
//           label="Tyler Harris"
//           control={<Checkbox checked={checked[3]} onChange={handleChange5} />}
//         />
//         <FormControlLabel
//           label="Braedon Kimball"
//           control={<Checkbox checked={checked[4]} onChange={handleChange6} />}
//         />
//       </Box>
//     );

//     return (
//       <div>
//         <FormControlLabel
//           label="Offense"
//           control={
//             <Checkbox
//               checked={checked[0] && checked[1]}
//               indeterminate={checked[0] !== checked[1]}
//               onChange={handleChange1}
//             />
//           }
//         />
//         {children}
//         <FormControlLabel
//           label="Defense"
//           control={
//             <Checkbox
//               checked={checked[2] && checked[3] && checked[4]}
//               onChange={handleChange0}
//             />
//           }
//         />
//         {defenseChildren}
//       </div>
//     );
// }

import * as React from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function IndeterminateCheckbox() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: teamGroups, error } = await supabase.from("team_group").select("*");
        if (error) throw error;

        const { data: teamMemberships, error: membershipsError } = await supabase
          .from("team_group_membership")
          .select("*");
        if (membershipsError) throw membershipsError;

        const { data: profiles, error: profilesError } = await supabase.from("profile").select("*");
        if (profilesError) throw profilesError;

        const formattedGroups = teamGroups.map((teamGroup) => {
          const groupMemberships = teamMemberships.filter(
            (membership) => membership.team_group_id === teamGroup.id
          );
          const members = groupMemberships.map((membership) =>
            profiles.find((profile) => profile.id === membership.player_user_id)
          );
          return { ...teamGroup, members };
        });

        setGroups(formattedGroups);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    }

    fetchData();
  }, []);

  // const handleGroupChange = (event, groupIndex) => {
  //   const newGroups = [...groups];
  //   newGroups[groupIndex].members = newGroups[groupIndex].members.map(member => ({
  //     ...member,
  //     checked: event.target.checked
  //   }));
  //   setGroups(newGroups);
  const handleGroupChange = (event, groupIndex) => {
    const newGroups = [...groups];
    const newCheckedState = event.target.checked;
    newGroups[groupIndex].members = newGroups[groupIndex].members.map((member) => ({
      ...member,
      checked: newCheckedState,
    }));
    setGroups(newGroups);
  };

  const handleMemberChange = (event, groupIndex, memberIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].members[memberIndex].checked = event.target.checked;
    setGroups(newGroups);
  };

  return (
    <div>
      {groups.map((group, groupIndex) => (
        <div key={group.id}>
          <FormControlLabel
            label={group.name}
            control={
              <Checkbox
                checked={group.members.every((member) => member.checked)}
                indeterminate={
                  !group.members.every((member) => member.checked) &&
                  group.members.some((member) => member.checked)
                }
                onChange={(event) => handleGroupChange(event, groupIndex)}
              />
            }
          />
          <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
            {group.members.map((member, memberIndex) => (
              <FormControlLabel
                key={member.id}
                label={`${member.first_name} ${member.last_name}`}
                control={
                  <Checkbox
                    checked={member.checked}
                    onChange={(event) => handleMemberChange(event, groupIndex, memberIndex)}
                  />
                }
              />
            ))}
          </Box>
        </div>
      ))}
    </div>
  );
}
