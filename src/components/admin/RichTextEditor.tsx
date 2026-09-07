import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { TableKit } from "@tiptap/extension-table";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  Minus,
  HelpCircle,
  ListTree,
  Package,
  FolderTree,
  Undo2,
  Redo2,
  Pilcrow,
  Unlink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/media";
import { readingMinutes, wordCount } from "@/lib/article";
import { ArticleImage, FaqBlock, TocPlaceholder } from "./article-extensions";
import { cn } from "@/lib/utils";

const INTERNAL_PAGES = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Collections", path: "/collections" },
  { label: "Services", path: "/services" },
  { label: "Blog", path: "/blog" },
  { label: "Bulk orders", path: "/bulk-orders" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
  { label: "Gallery", path: "/gallery" },
];

type DialogKind = "image" | "link" | "internal" | "product" | "category" | "youtube" | "faq" | null;

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const lastEmitted = useRef<string>(value ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ controls: true, nocookie: true, width: 800, height: 450 }),
      TableKit.configure({ table: { resizable: true } }),
      ArticleImage.configure({ inline: false, allowBase64: false }),
      FaqBlock,
      TocPlaceholder,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "article-editor-content focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmitted.current = html;
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Load content that arrives after mount (existing post fetched from the DB).
  useEffect(() => {
    if (!editor) return;
    const incoming = value ?? "";
    if (incoming === lastEmitted.current) return;
    lastEmitted.current = incoming;
    editor.commands.setContent(incoming, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) {
    return <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">Loading editor…</div>;
  }

  const words = wordCount(value || "");

  return (
    <div className="rounded-lg border border-border bg-card">
      <Toolbar editor={editor} onOpen={setDialog} />
      <EditorContent editor={editor} className="article-editor px-4 py-5 md:px-6" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>
          {words} words · about {readingMinutes(value || "")} min read
        </span>
        <span>Headings get anchor links and feed the table of contents automatically.</span>
      </div>

      <ImageDialog
        open={dialog === "image"}
        onClose={() => setDialog(null)}
        editor={editor}
      />
      <LinkDialog open={dialog === "link"} onClose={() => setDialog(null)} editor={editor} />
      <InternalLinkDialog open={dialog === "internal"} onClose={() => setDialog(null)} editor={editor} />
      <RecordLinkDialog
        open={dialog === "product"}
        kind="product"
        onClose={() => setDialog(null)}
        editor={editor}
      />
      <RecordLinkDialog
        open={dialog === "category"}
        kind="category"
        onClose={() => setDialog(null)}
        editor={editor}
      />
      <YoutubeDialog open={dialog === "youtube"} onClose={() => setDialog(null)} editor={editor} />
      <FaqDialog open={dialog === "faq"} onClose={() => setDialog(null)} editor={editor} />
    </div>
  );
}

/* --------------------------------- toolbar -------------------------------- */

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={Boolean(active)}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onOpen }: { editor: Editor; onOpen: (k: DialogKind) => void }) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-lg border-b border-border bg-card/95 p-2 backdrop-blur">
      <ToolButton title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
        <Pilcrow className="h-4 w-4" />
      </ToolButton>
      {([1, 2, 3] as const).map((level) => (
        <ToolButton
          key={level}
          title={`Heading ${level}`}
          active={editor.isActive("heading", { level })}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          H{level}
        </ToolButton>
      ))}
      <Divider />
      <ToolButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </ToolButton>
      <Divider />
      <ToolButton title="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolButton>
      <Divider />
      <ToolButton title="Link" active={editor.isActive("link")} onClick={() => onOpen("link")}>
        <Link2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Internal page link" onClick={() => onOpen("internal")}>
        <ListTree className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Product link" onClick={() => onOpen("product")}>
        <Package className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Category link" onClick={() => onOpen("category")}>
        <FolderTree className="h-4 w-4" />
      </ToolButton>
      <Divider />
      <ToolButton title="Image" onClick={() => onOpen("image")}>
        <ImageIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="YouTube video" onClick={() => onOpen("youtube")}>
        <YoutubeIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <TableIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="FAQ block" onClick={() => onOpen("faq")}>
        <HelpCircle className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Table of contents"
        onClick={() => editor.chain().focus().insertContent({ type: "tocPlaceholder" }).run()}
      >
        TOC
      </ToolButton>
      <Divider />
      <ToolButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolButton>
      {editor.isActive("table") ? (
        <>
          <Divider />
          <ToolButton title="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>
            +Row
          </ToolButton>
          <ToolButton title="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            +Col
          </ToolButton>
          <ToolButton title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
            −Row
          </ToolButton>
          <ToolButton title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            −Col
          </ToolButton>
          <ToolButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
            Delete table
          </ToolButton>
        </>
      ) : null}
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}

/* --------------------------------- dialogs -------------------------------- */

function ImageDialog({ open, onClose, editor }: { open: boolean; onClose: () => void; editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [align, setAlign] = useState("center");
  const [width, setWidth] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setSrc("");
      setAlt("");
      setCaption("");
      setAlign("center");
      setWidth("");
    }
  }, [open]);

  async function upload(file: File) {
    setBusy(true);
    try {
      const path = await uploadMedia(file, "blog");
      setSrc(path);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function insert() {
    const url = mediaUrl(src.trim());
    if (!url) {
      toast.error("Upload an image or paste an image URL.");
      return;
    }
    if (!alt.trim()) {
      toast.error("Alt text is required for every article image.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: url,
          alt: alt.trim(),
          align,
          caption: caption.trim() || null,
          width: width.trim() || null,
        },
      })
      .run();
    onClose();
  }

  const preview = mediaUrl(src);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="" className="h-16 w-24 rounded border border-border object-cover" />
            ) : (
              <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed border-border text-xs text-muted-foreground">
                No image
              </div>
            )}
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Uploading…" : "Upload image"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="img-src">Image URL or storage path</Label>
            <Input id="img-src" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://… or blog/…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="img-alt">
              Alt text <span className="text-destructive">*</span>
            </Label>
            <Input id="img-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="img-cap">Caption</Label>
            <Input id="img-cap" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Alignment</Label>
              <Select value={align} onValueChange={setAlign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="full">Full width</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="img-w">Width (px)</Label>
              <Input id="img-w" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 640" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={insert}>Insert image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function applyLink(editor: Editor, href: string, text: string) {
  const chain = editor.chain().focus();
  if (editor.state.selection.empty) {
    chain
      .insertContent({
        type: "text",
        text: text || href,
        marks: [{ type: "link", attrs: { href } }],
      })
      .run();
  } else {
    chain.extendMarkRange("link").setLink({ href }).run();
  }
}

function LinkDialog({ open, onClose, editor }: { open: boolean; onClose: () => void; editor: Editor }) {
  const [href, setHref] = useState("");
  const [text, setText] = useState("");
  useEffect(() => {
    if (open) {
      setHref(editor.getAttributes("link")["href"] ?? "");
      setText("");
    }
  }, [open, editor]);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Insert link</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lnk">URL</Label>
            <Input id="lnk" value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://example.com" />
          </div>
          {editor.state.selection.empty ? (
            <div className="space-y-1.5">
              <Label htmlFor="lnk-t">Link text</Label>
              <Input id="lnk-t" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!href.trim()) return;
              applyLink(editor, href.trim(), text.trim());
              onClose();
            }}
          >
            Add link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InternalLinkDialog({ open, onClose, editor }: { open: boolean; onClose: () => void; editor: Editor }) {
  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link to a page on this site</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTERNAL_PAGES.map((p) => (
            <Button
              key={p.path}
              variant="outline"
              className="justify-start"
              onClick={() => {
                applyLink(editor, p.path, p.label);
                onClose();
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecordLinkDialog({
  open,
  onClose,
  editor,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  editor: Editor;
  kind: "product" | "category";
}) {
  const [term, setTerm] = useState("");
  const table = kind === "product" ? "products" : "categories";
  const { data } = useQuery({
    queryKey: ["article-link", table, term],
    enabled: open,
    queryFn: async () => {
      let q = supabase.from(table).select("id, name, slug").order("name").limit(20);
      if (term.trim()) q = q.ilike("name", `%${term.trim()}%`);
      const { data: rows, error } = await q;
      if (error) throw error;
      return rows ?? [];
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link to a {kind}</DialogTitle>
        </DialogHeader>
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={`Search ${kind}s…`} />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {(data ?? []).map((r) => (
            <button
              key={r.id}
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                const path = kind === "product" ? `/products/${r.slug}` : `/products?category=${r.slug}`;
                applyLink(editor, path, r.name);
                onClose();
              }}
            >
              {r.name}
            </button>
          ))}
          {data && data.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Nothing found.</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function YoutubeDialog({ open, onClose, editor }: { open: boolean; onClose: () => void; editor: Editor }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (open) setUrl("");
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Embed a video</DialogTitle>
        </DialogHeader>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!url.trim()) return;
              editor.commands.setYoutubeVideo({ src: url.trim(), width: 800, height: 450 });
              onClose();
            }}
          >
            Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FaqDialog({ open, onClose, editor }: { open: boolean; onClose: () => void; editor: Editor }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  useEffect(() => {
    if (open) {
      setQuestion("");
      setAnswer("");
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an FAQ</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="faq-q">Question</Label>
            <Input id="faq-q" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="faq-a">Answer</Label>
            <Textarea id="faq-a" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!question.trim() || !answer.trim()) {
                toast.error("Question and answer are both required.");
                return;
              }
              editor
                .chain()
                .focus()
                .insertContent({ type: "faqBlock", attrs: { question: question.trim(), answer: answer.trim() } })
                .run();
              onClose();
            }}
          >
            Insert FAQ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
