import { supabase } from "@/integrations/supabase/client";

/** Best-effort activity log write. Never blocks or breaks the admin action. */
export async function logActivity(input: {
  action: string;
  entity_type?: string;
  entity_id?: string;
  entity_label?: string;
  details?: string;
}) {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("activity_logs").insert({
      action: input.action,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
      entity_label: input.entity_label ?? null,
      details: input.details ?? null,
      user_id: data.user?.id ?? null,
      user_email: data.user?.email ?? null,
    });
  } catch {
    /* logging must never break the admin flow */
  }
}
