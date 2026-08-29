import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Field } from "@/lib/admin/resources";
import { uploadMedia } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/media";
import { supabase } from "@/integrations/supabase/client";

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `field-${field.name}`;

  return (
    <div className={field.type === "boolean" ? "flex items-center justify-between gap-4 py-1" : "space-y-1.5"}>
      <Label htmlFor={id}>
        {field.label} {field.required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Control field={field} id={id} value={value} onChange={onChange} />
      {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
    </div>
  );
}

function Control({
  field,
  id,
  value,
  onChange,
}: {
  field: Field;
  id: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case "boolean":
      return (
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} />
      );
    case "number":
      return (
        <Input
          id={id}
          type="number"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );
    case "date":
      return (
        <Input
          id={id}
          type="date"
          value={typeof value === "string" ? value.slice(0, 10) : ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case "textarea":
      return (
        <Textarea
          id={id}
          rows={4}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "richtext":
      return (
        <Textarea
          id={id}
          rows={12}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "tags":
      return (
        <Textarea
          id={id}
          rows={4}
          value={Array.isArray(value) ? value.join("\n") : value == null ? "" : String(value)}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((v) => v.trim())
                .filter(Boolean),
            )
          }
        />
      );
    case "select":
      return (
        <Select
          value={value ? String(value) : "__none"}
          onValueChange={(v) => onChange(v === "__none" ? null : v)}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Not set</SelectItem>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "reference":
      return <ReferenceSelect field={field} id={id} value={value} onChange={onChange} />;
    case "image":
      return <ImageInput id={id} value={value} onChange={onChange} folder={field.name} />;
    default:
      return (
        <Input
          id={id}
          value={value == null ? "" : String(value)}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function ReferenceSelect({
  field,
  id,
  value,
  onChange,
}: {
  field: Field;
  id: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const table = field.refTable ?? "categories";
  const { data: options } = useQuery({
    queryKey: ["admin-ref", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Select
      value={value ? String(value) : "__none"}
      onValueChange={(v) => onChange(v === "__none" ? null : v)}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none">Not set</SelectItem>
        {(options ?? []).map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ImageInput({
  id,
  value,
  onChange,
  folder,
}: {
  id: string;
  value: unknown;
  onChange: (value: unknown) => void;
  folder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const src = mediaUrl(typeof value === "string" ? value : null);

  async function onFile(file: File) {
    setBusy(true);
    try {
      const path = await uploadMedia(file, folder);
      onChange(path);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {src ? (
          <img src={src} alt="" className="h-16 w-24 rounded border border-border object-cover" />
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed border-border text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4" /> {busy ? "Uploading..." : "Upload"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="mr-1.5 h-4 w-4" /> Remove
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <Input
        id={id}
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="Storage path or full image URL"
      />
    </div>
  );
}
