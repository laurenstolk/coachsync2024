import { supabase } from "./supabaseClient";

export async function getTeamLogoURL(file_path) {
  const { data, error } = await supabase.storage.from("images").createSignedUrl(`${file_path}`, 60);

  return data.signedUrl;
}
