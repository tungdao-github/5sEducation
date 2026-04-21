"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Grid3x3,
  Image as ImageIcon,
  Layout,
  Plus,
  Save,
  Settings,
  Trash2,
  Type,
} from "lucide-react";
import { toast } from "@/figma/compat/sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type BlockType = "hero" | "features" | "stats" | "text" | "image";

type FeatureItem = { title: string; description: string };
type StatItem = { label: string; value: string };
type HeroContent = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  backgroundImage?: string;
  backgroundColor?: string;
};
type FeaturesContent = {
  title: string;
  items: FeatureItem[];
};
type StatsContent = {
  items: StatItem[];
};
type TextContent = {
  title: string;
  content: string;
};
type ImageContent = {
  url: string;
  alt: string;
};

type BlockContent =
  | HeroContent
  | FeaturesContent
  | StatsContent
  | TextContent
  | ImageContent;

type Block = {
  id: string;
  type: BlockType;
  order: number;
  content: BlockContent;
};

const STORAGE_KEY = "admin-page-builder-blocks";

const BLOCK_TYPES: {
  type: BlockType;
  name: string;
  icon: typeof Layout;
  defaultContent: BlockContent;
}[] = [
  {
    type: "hero",
    name: "Hero Banner",
    icon: Layout,
    defaultContent: {
      title: "Kham pha khoa hoc UX/UI Design hang dau",
      subtitle: "Noi dung moi, bo cuc moi, huong den chuyen doi va trai nghiem hoc tap ro rang hon.",
      buttonText: "Tim khoa hoc",
      backgroundImage: "",
      backgroundColor: "#2563eb",
    },
  },
  {
    type: "stats",
    name: "Thong ke",
    icon: Grid3x3,
    defaultContent: {
      items: [
        { label: "Khoa hoc", value: "500+" },
        { label: "Hoc vien", value: "50K+" },
        { label: "Giang vien", value: "100+" },
        { label: "Danh gia", value: "4.8" },
      ],
    },
  },
  {
    type: "features",
    name: "Tinh nang",
    icon: Grid3x3,
    defaultContent: {
      title: "Tai sao chon chung toi",
      items: [
        { title: "Noi dung thuc chien", description: "Bai hoc duoc xay dung tu tinh huong thuc te va ap dung ngay vao cong viec." },
        { title: "Hoc linh hoat", description: "Truy cap khoa hoc tren moi thiet bi va hoc theo tien do rieng cua ban." },
        { title: "Ho tro lien tuc", description: "Theo doi tien do, tai nguyen va huong dan de giup ban di den cuoi lo trinh." },
      ],
    },
  },
  {
    type: "text",
    name: "Van ban",
    icon: Type,
    defaultContent: {
      title: "Tieu de noi dung",
      content: "Day la doan van ban mo ta ma ban co the chinh sua de xay dung landing page theo chien luoc cua rieng minh.",
    },
  },
  {
    type: "image",
    name: "Hinh anh",
    icon: ImageIcon,
    defaultContent: {
      url: "",
      alt: "Hinh anh minh hoa",
    },
  },
];

const DEFAULT_BLOCKS: Block[] = BLOCK_TYPES.slice(0, 2).map((item, index) => ({
  id: `block-${index + 1}`,
  type: item.type,
  order: index,
  content: JSON.parse(JSON.stringify(item.defaultContent)) as BlockContent,
}));

function cloneContent<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function PageBuilderTab() {
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [previewMode, setPreviewMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [draftContent, setDraftContent] = useState<BlockContent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Block[];
      if (Array.isArray(parsed) && parsed.length) {
        setBlocks(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  }, [blocks]);

  const orderedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  );

  const addBlock = (type: BlockType) => {
    const config = BLOCK_TYPES.find((item) => item.type === type);
    if (!config) return;
    const next: Block = {
      id: `block-${Date.now()}`,
      type,
      order: blocks.length,
      content: cloneContent(config.defaultContent),
    };
    setBlocks((current) => [...current, next]);
    toast.success("Da them block moi");
  };

  const removeBlock = (id: string) => {
    setBlocks((current) =>
      current
        .filter((block) => block.id !== id)
        .map((block, index) => ({ ...block, order: index }))
    );
    toast.success("Da xoa block");
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    setBlocks((current) => {
      const ordered = [...current].sort((a, b) => a.order - b.order);
      const index = ordered.findIndex((block) => block.id === id);
      if (index === -1) return current;
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= ordered.length) return current;
      const temp = ordered[index];
      ordered[index] = ordered[swapIndex];
      ordered[swapIndex] = temp;
      return ordered.map((block, order) => ({ ...block, order }));
    });
  };

  const openEditor = (block: Block) => {
    setEditingBlock(block);
    setDraftContent(cloneContent(block.content));
    setDialogOpen(true);
  };

  const saveBlock = () => {
    if (!editingBlock || !draftContent) return;
    setBlocks((current) =>
      current.map((block) =>
        block.id === editingBlock.id ? { ...block, content: cloneContent(draftContent) } : block
      )
    );
    setDialogOpen(false);
    setEditingBlock(null);
    setDraftContent(null);
    toast.success("Da cap nhat block");
  };

  const savePage = () => {
    toast.success("Da luu cau hinh page builder");
  };

  const renderPreview = (block: Block) => {
    switch (block.type) {
      case "hero": {
        const content = block.content as HeroContent;
        return (
          <section
            className="rounded-2xl px-6 py-10 text-white"
            style={{ background: content.backgroundColor || "#2563eb" }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Hero</p>
            <h3 className="mt-3 text-3xl font-semibold">{content.title}</h3>
            <p className="mt-3 max-w-2xl text-sm text-white/80">{content.subtitle}</p>
            <button type="button" className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              {content.buttonText || "Call to action"}
            </button>
          </section>
        );
      }
      case "stats": {
        const content = block.content as StatsContent;
        return (
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-4">
            {content.items.map((item, index) => (
              <div key={`${item.label}-${index}`} className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="text-2xl font-semibold text-slate-950">{item.value}</div>
                <div className="mt-1 text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </section>
        );
      }
      case "features": {
        const content = block.content as FeaturesContent;
        return (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-2xl font-semibold text-slate-950">{content.title}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {content.items.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      }
      case "text": {
        const content = block.content as TextContent;
        return (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-2xl font-semibold text-slate-950">{content.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{content.content}</p>
          </section>
        );
      }
      case "image": {
        const content = block.content as ImageContent;
        return (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
            {content.url ? (
              <img src={content.url} alt={content.alt} className="h-64 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
                Chua co anh. Cap nhat URL de xem preview.
              </div>
            )}
          </section>
        );
      }
      default:
        return null;
    }
  };

  const renderEditor = () => {
    if (!editingBlock || !draftContent) return null;

    if (editingBlock.type === "hero") {
      const content = draftContent as HeroContent;
      return (
        <div className="space-y-4">
          <Field label="Tieu de">
            <Input value={content.title} onChange={(event) => setDraftContent({ ...content, title: event.target.value })} />
          </Field>
          <Field label="Mo ta ngan">
            <Textarea rows={3} value={content.subtitle || ""} onChange={(event) => setDraftContent({ ...content, subtitle: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="CTA">
              <Input value={content.buttonText || ""} onChange={(event) => setDraftContent({ ...content, buttonText: event.target.value })} />
            </Field>
            <Field label="Mau nen">
              <Input value={content.backgroundColor || ""} onChange={(event) => setDraftContent({ ...content, backgroundColor: event.target.value })} />
            </Field>
          </div>
          <Field label="Background image URL">
            <Input value={content.backgroundImage || ""} onChange={(event) => setDraftContent({ ...content, backgroundImage: event.target.value })} />
          </Field>
        </div>
      );
    }

    if (editingBlock.type === "text") {
      const content = draftContent as TextContent;
      return (
        <div className="space-y-4">
          <Field label="Tieu de">
            <Input value={content.title} onChange={(event) => setDraftContent({ ...content, title: event.target.value })} />
          </Field>
          <Field label="Noi dung">
            <Textarea rows={6} value={content.content} onChange={(event) => setDraftContent({ ...content, content: event.target.value })} />
          </Field>
        </div>
      );
    }

    if (editingBlock.type === "image") {
      const content = draftContent as ImageContent;
      return (
        <div className="space-y-4">
          <Field label="URL anh">
            <Input value={content.url} onChange={(event) => setDraftContent({ ...content, url: event.target.value })} />
          </Field>
          <Field label="Alt text">
            <Input value={content.alt} onChange={(event) => setDraftContent({ ...content, alt: event.target.value })} />
          </Field>
        </div>
      );
    }

    if (editingBlock.type === "stats") {
      const content = draftContent as StatsContent;
      return (
        <div className="space-y-4">
          {content.items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
              <Input
                value={item.label}
                onChange={(event) => {
                  const items = [...content.items];
                  items[index] = { ...item, label: event.target.value };
                  setDraftContent({ ...content, items });
                }}
                placeholder="Nhan"
              />
              <Input
                value={item.value}
                onChange={(event) => {
                  const items = [...content.items];
                  items[index] = { ...item, value: event.target.value };
                  setDraftContent({ ...content, items });
                }}
                placeholder="Gia tri"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const items = content.items.filter((_, itemIndex) => itemIndex !== index);
                  setDraftContent({ ...content, items: items.length ? items : [{ label: "Chi so", value: "0" }] });
                }}
              >
                Xoa
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraftContent({ ...content, items: [...content.items, { label: "Chi so moi", value: "0" }] })}
          >
            <Plus className="mr-2 size-4" />Them chi so
          </Button>
        </div>
      );
    }

    const content = draftContent as FeaturesContent;
    return (
      <div className="space-y-4">
        <Field label="Tieu de section">
          <Input value={content.title} onChange={(event) => setDraftContent({ ...content, title: event.target.value })} />
        </Field>
        {content.items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-200 p-4">
            <div className="grid gap-3">
              <Input
                value={item.title}
                onChange={(event) => {
                  const items = [...content.items];
                  items[index] = { ...item, title: event.target.value };
                  setDraftContent({ ...content, items });
                }}
                placeholder="Ten tinh nang"
              />
              <Textarea
                rows={3}
                value={item.description}
                onChange={(event) => {
                  const items = [...content.items];
                  items[index] = { ...item, description: event.target.value };
                  setDraftContent({ ...content, items });
                }}
                placeholder="Mo ta tinh nang"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const items = content.items.filter((_, itemIndex) => itemIndex !== index);
                  setDraftContent({ ...content, items: items.length ? items : [{ title: "Tinh nang", description: "Mo ta" }] });
                }}
              >
                Xoa item
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => setDraftContent({ ...content, items: [...content.items, { title: "Tinh nang moi", description: "Mo ta tinh nang moi" }] })}
        >
          <Plus className="mr-2 size-4" />Them item
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Page Builder</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sap xep va chinh sua cac block de tao landing page theo bo cuc mong muon.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setPreviewMode((current) => !current)}>
            <Eye className="mr-2 size-4" />{previewMode ? "Tat preview" : "Preview"}
          </Button>
          <Button type="button" onClick={savePage}>
            <Save className="mr-2 size-4" />Luu bo cuc
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Them block</CardTitle>
            <CardDescription>Chon loai block can them vao trang.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {BLOCK_TYPES.map((blockType) => {
              const Icon = blockType.icon;
              return (
                <button
                  key={blockType.type}
                  type="button"
                  onClick={() => addBlock(blockType.type)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="rounded-xl bg-slate-100 p-2 text-slate-700"><Icon className="size-4" /></span>
                  <span className="font-medium text-slate-900">{blockType.name}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!previewMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Danh sach block</CardTitle>
                <CardDescription>Di chuyen thu tu, chinh sua hoac xoa tung block.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {orderedBlocks.map((block, index) => {
                  const config = BLOCK_TYPES.find((item) => item.type === block.type);
                  const Icon = config?.icon || Layout;
                  return (
                    <div key={block.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="rounded-xl bg-slate-100 p-2 text-slate-700"><Icon className="size-4" /></span>
                          <div>
                            <p className="font-medium text-slate-950">{config?.name || block.type}</p>
                            <p className="text-xs text-slate-500">Block thu {index + 1}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => moveBlock(block.id, "up")} disabled={index === 0}>
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => moveBlock(block.id, "down")} disabled={index === orderedBlocks.length - 1}>
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => openEditor(block)}>
                            <Settings className="mr-2 size-4" />Sua
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeBlock(block.id)}>
                            <Trash2 className="mr-2 size-4" />Xoa
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {orderedBlocks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    Chua co block nao. Hay them block dau tien.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{previewMode ? "Preview landing page" : "Live preview"}</CardTitle>
              <CardDescription>
                Xem nhanh bo cuc hien tai truoc khi dua vao he thong.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-slate-50">
              {orderedBlocks.map((block) => (
                <div key={`preview-${block.id}`}>{renderPreview(block)}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chinh sua block</DialogTitle>
            <DialogDescription>
              Cap nhat noi dung cho block dang chon.
            </DialogDescription>
          </DialogHeader>
          {renderEditor()}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Dong
            </Button>
            <Button type="button" onClick={saveBlock}>
              <Save className="mr-2 size-4" />Luu thay doi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
