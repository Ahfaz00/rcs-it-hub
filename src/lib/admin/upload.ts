import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 10 * 1024 * 1024;

/** Uploads a file into the private `media` bucket and returns its storage path. */
export async function uploadMedia(file: File, folder = "uploads"): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error("File is larger than 10MB.");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "");
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function deleteMedia(path: string) {
  const { error } = await supabase.storage.from("media").remove([path]);
  if (error) throw new Error(error.message);
}
