import { supabase } from "./supabaseClient";

export async function fetchUserProfile() {
  try {
    const user = await supabase.auth.getUser();
    if (!user) {
      return null;
    }
    const userId = user.data.user.id;

    const { data, error } = await supabase.from("profile").select("*").eq("id", userId).single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}
