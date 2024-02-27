import { supabase } from "./supabaseClient";

export async function getProfilePicURL(file_path) {
  const { data, error } = await supabase.storage.from("images/profile_pics").createSignedUrl(`${file_path}`, 60);

  return data.signedUrl;
}
