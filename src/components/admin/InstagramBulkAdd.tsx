import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/admin/log";
import { cleanInstagramUrl, instagramShortcode } from "@/lib/instagram";

export function InstagramBulkAdd() {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function addAll() {
    const links = Array.from(
      new Set(
        text
          .split(/[\s,]+/)
          .map((v) => cleanInstagramUrl(v))
          .filter((v): v is string => Boolean(v)),
      ),
    );

    if (!links.length) {
      toast.error("Paste one or more Instagram reel or post links.");
      return;
    }

    setBusy(true);
    try {
      const [{ data: existing, error: existingError }, { data: lastRow, error: orderError }] = await Promise.all([
        supabase.from("instagram_videos").select("instagram_url").in("instagram_url", links),
        supabase.from("instagram_videos").select("sort_order").order("sort_order", { ascending: false }).limit(1),
      ]);
      if (existingError) throw existingError;
      if (orderError) throw orderError;

      const existingLinks = new Set((existing ?? []).map((row) => row.instagram_url));
      const newLinks = links.filter((url) => !existingLinks.has(url));
      if (!newLinks.length) {
        toast.info("All these links are already in the video list.");
        setText("");
        return;
      }

      const nextSortOrder = Number(lastRow?.[0]?.sort_order ?? -1) + 1;
      const rows = newLinks.map((url, index) => ({
        title: `Instagram reel ${instagramShortcode(url) ?? index + 1}`,
        instagram_url: url,
        is_active: true,
        sort_order: nextSortOrder + index,
      }));

      const { data, error } = await supabase
        .from("instagram_videos")
        .insert(rows)
        .select("id");
      if (error) throw error;

      const added = data?.length ?? 0;
      void logActivity({
        action: "imported",
        entity_type: "instagram_videos",
        entity_label: `${added} reel link(s)`,
      });
      toast.success(
        added ? `${added} reel${added > 1 ? "s" : ""} added.` : "All these links were already added.",
      );
      setText("");
      queryClient.invalidateQueries({ queryKey: ["admin", "instagram_videos"] });
      queryClient.invalidateQueries({ queryKey: ["social-videos"] });
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not add the links.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Add multiple reels at once</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Paste as many Instagram reel or post links as you like, one per line. Titles and captions can be
        edited afterwards.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        aria-label="Instagram links"
        placeholder={"https://www.instagram.com/reel/XXXXXXXXXXX/\nhttps://www.instagram.com/p/YYYYYYYYYYY/"}
        className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={addAll} disabled={busy}>
          <Plus className="mr-1.5 h-4 w-4" /> {busy ? "Adding..." : "Add links"}
        </Button>
      </div>
    </div>
  );
}
