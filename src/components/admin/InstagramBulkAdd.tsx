import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/admin/log";
import { cleanInstagramUrl } from "@/lib/instagram";
import { getInstagramMetadata } from "@/lib/instagram-metadata.functions";

export function InstagramBulkAdd() {
  const queryClient = useQueryClient();
  const fetchMetadata = useServerFn(getInstagramMetadata);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function metadataFor(urls: string[]) {
    return fetchMetadata({ data: { urls } });
  }

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
      const metadata = await metadataFor(newLinks);
      const rows = metadata.map((item, index) => ({
        title: item.title,
        caption: item.caption,
        instagram_url: item.url,
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

  async function refreshTitles() {
    setBusy(true);
    try {
      const { data: videos, error } = await supabase
        .from("instagram_videos")
        .select("id,instagram_url,title,caption")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      if (!videos?.length) {
        toast.info("No Instagram videos to update.");
        return;
      }

      const metadata = await metadataFor(videos.map((video) => video.instagram_url));
      let updated = 0;
      for (const [index, item] of metadata.entries()) {
        const video = videos[index];
        if (!video || item.title.startsWith("Instagram reel ")) continue;
        const { error: updateError } = await supabase
          .from("instagram_videos")
          .update({ title: item.title, caption: item.caption || video.caption })
          .eq("id", video.id);
        if (updateError) throw updateError;
        updated += 1;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "instagram_videos"] }),
        queryClient.invalidateQueries({ queryKey: ["social-videos"] }),
      ]);
      toast.success(`${updated} video title${updated === 1 ? "" : "s"} refreshed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh titles.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Add multiple reels at once</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Paste as many Instagram reel or post links as you like, one per line. Titles and captions are
        fetched automatically and can be edited afterwards.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        aria-label="Instagram links"
        placeholder={"https://www.instagram.com/reel/XXXXXXXXXXX/\nhttps://www.instagram.com/p/YYYYYYYYYYY/"}
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
