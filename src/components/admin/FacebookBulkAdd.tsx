import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/admin/log";
import { cleanFacebookUrl } from "@/lib/facebook";
import { getFacebookMetadata } from "@/lib/facebook-metadata.functions";

export function FacebookBulkAdd() {
  const queryClient = useQueryClient();
  const fetchMetadata = useServerFn(getFacebookMetadata);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  function refresh() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "facebook_videos"] }),
      queryClient.invalidateQueries({ queryKey: ["social-videos"] }),
    ]);
  }

  async function addAll() {
    const links = Array.from(
      new Set(
        text
          .split(/[\s,]+/)
          .map((v) => cleanFacebookUrl(v))
          .filter((v): v is string => Boolean(v)),
      ),
    );
    if (!links.length) {
      toast.error("Paste one or more Facebook video or reel links.");
      return;
    }
    setBusy(true);
    try {
      const [{ data: existing, error: e1 }, { data: lastRow, error: e2 }] = await Promise.all([
        supabase.from("facebook_videos").select("facebook_url").in("facebook_url", links),
        supabase.from("facebook_videos").select("sort_order").order("sort_order", { ascending: false }).limit(1),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const have = new Set((existing ?? []).map((r) => r.facebook_url));
      const newLinks = links.filter((u) => !have.has(u));
      if (!newLinks.length) {
        toast.info("All these links are already in the video list.");
        setText("");
        return;
      }
      const next = Number(lastRow?.[0]?.sort_order ?? -1) + 1;
      const metadata = await fetchMetadata({ data: { urls: newLinks } });
      const rows = metadata.map((m, i) => ({
        title: m.title,
        caption: m.caption,
        thumbnail_url: m.thumbnail,
        facebook_url: m.url,
        is_active: true,
        sort_order: next + i,
      }));
      const { data, error } = await supabase.from("facebook_videos").insert(rows).select("id");
      if (error) throw error;
      const added = data?.length ?? 0;
      void logActivity({ action: "imported", entity_type: "facebook_videos", entity_label: `${added} video link(s)` });
      toast.success(`${added} video${added === 1 ? "" : "s"} added.`);
      setText("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String((err as { message?: unknown })?.message ?? "Could not add the links."));
    } finally {
      setBusy(false);
    }
  }

  async function refreshTitles() {
    setBusy(true);
    try {
      const { data: videos, error } = await supabase
        .from("facebook_videos")
        .select("id,facebook_url,caption,thumbnail_url");
      if (error) throw error;
      if (!videos?.length) {
        toast.info("No Facebook videos to update.");
        return;
      }
      const metadata = await fetchMetadata({ data: { urls: videos.map((v) => v.facebook_url) } });
      let updated = 0;
      for (const [i, m] of metadata.entries()) {
        const video = videos[i];
        if (!video || m.title === "Facebook video") continue;
        const { error: ue } = await supabase
          .from("facebook_videos")
          .update({ title: m.title, caption: m.caption || video.caption, thumbnail_url: m.thumbnail || video.thumbnail_url })
          .eq("id", video.id);
        if (ue) throw ue;
        updated += 1;
      }
      await refresh();
      toast.success(`${updated} video title${updated === 1 ? "" : "s"} refreshed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh titles.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Add multiple Facebook videos at once</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Paste Facebook video or reel links, one per line. Titles, captions and cover images are fetched
        automatically and can be edited afterwards.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        aria-label="Facebook links"
        placeholder={"https://www.facebook.com/reel/123456789/\nhttps://www.facebook.com/watch/?v=123456789"}
        className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={refreshTitles} disabled={busy}>
          <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh all titles
        </Button>
        <Button onClick={addAll} disabled={busy}>
          <Plus className="mr-1.5 h-4 w-4" /> {busy ? "Working..." : "Add links"}
        </Button>
      </div>
    </div>
  );
}
