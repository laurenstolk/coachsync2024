import { supabase } from "./supabaseClient";

export async function fetchTeamInfo() {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user.id;

    // Fetch the user's profile to get their team_id
    const { data: userData, error: profileError } = await supabase
      .from("profile")
      .select("team_id")
      .eq("id", userId)
      .single();

    // Extract team_id from user's profile
    const userTeamId = userData.team_id;

    // Fetch team data based on the user's team_id
    const { data: teamData, error: teamError } = await supabase
      .from("team")
      .select("*")
      .eq("id", userTeamId)
      .single();

    // Check if logo_picture is null and set it to GenericLogo
    if (!teamData.logo_picture) {
      teamData.logo_picture = "GenericLogo";
    }

    return teamData;
  } catch (error) {
    alert(error.message);
  }
}
