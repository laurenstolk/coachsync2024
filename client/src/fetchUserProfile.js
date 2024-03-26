import { supabase } from "./supabaseClient";
import { getProfilePicURL } from "./getProfilePicUrl";

export async function fetchUserProfile() {
  try {
    const user = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return null;
    }
    const userId = user.data.user.id;

    const { data, error } = await supabase.from("profile").select("*").eq("id", userId).single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return null
  }
}
