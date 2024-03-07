import React, { useState, useEffect } from 'react';
import { fetchUserProfile } from "../../fetchUserProfile";
import { supabase } from "../../supabaseClient";

function CoachesTable({ currentUserTeamId }) {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('team_id', currentUserTeamId)
          .eq('player', false); // Only select coaches

        if (error) {
          throw error;
        }

        setCoaches(profiles);
      } catch (error) {
        console.error('Error fetching coaches:', error.message);
      }
    };

    fetchCoaches();
  }, [currentUserTeamId]);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Phone</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {coaches.map(coach => (
          <tr key={coach.id}>
            <td>{coach.first_name} {coach.last_name}</td>
            <td>{coach.coach_role}</td>
            <td>{coach.phone_number}</td>
            <td>{coach.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CoachesTable;