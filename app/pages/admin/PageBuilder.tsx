import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  GripVertical,
  Eye,
  Save,
  Plus,
  Settings,
  Trash2,
  Image as ImageIcon,
  Type,
  Layout,
  Grid3x3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

interface Block {
  id: string;
  type: "hero" | "features" | "stats" | "courses" | "text" | "image";
  order: number;
  content: any;
}

const BLOCK_TYPES = [
  {
    type: "hero",
    name: "Hero Banner",
    icon: Layout,
    defaultContent: {
      title: "Khám phá khóa học UX/UI Design hàng đầu",
      subtitle: "Nâng cao kỹ năng của bạn với các khóa học được thiết kế bởi các chuyên gia hàng đầu",
      buttonText: "Tìm khóa học",
      backgroundImage: "",
      backgroundColor: "#2563eb",
    },
  },
  {
    type: "stats",
    name: "Thống kê",
    icon: Grid3x3,
    defaultContent: {
      items: [
        { label: "Khóa học", value: "500+" },
        { label: "Học viên", value: "50K+" },
        { label: "Giảng viên", value: "100+" },
        { label: "Đánh giá", value: "4.8★" },
      ],
    },
  },
  {
    type: "features",
    name: "Tính năng",
    icon: Grid3x3,
    defaultContent: {
      title: "Tại sao chọn chúng tôi",
      items: [
        { title: "Chất lượng cao", description: "Khóa học được thiết kế bởi chuyên gia" },
        { title: "Linh hoạt", description: "Học mọi lúc mọi nơi" },
        { title: "Hỗ trợ 24/7", description: "Đội ngũ hỗ trợ nhiệt tình" },
      ],
    },
  },
  {
    type: "text",
    name: "Văn bản",
    icon: Type,
    defaultContent: {
      title: "Tiêu đề",
      content: "Nội dung văn bản...",
    },
  },
  {
    type: "image",
    name: "Hình ảnh",
    icon: ImageIcon,
    defaultContent: {
      url: "",
      alt: "Mô tả hình ảnh",
    },
  },
];

interface DraggableBlockProps {
  block: Block;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (block: Block) => void;
  onDelete: (id: string) => void;
}

function DraggableBlock({ block, index, moveBlock, onEdit, onDelete }: DraggableBlockProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "block",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "block",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveBlock(item.index, index);
        item.index = index;
      }
    },
  });

  const getBlockIcon = (type: string) => {
    const blockType = BLOCK_TYPES.find((bt) => bt.type === type);
    return blockType ? blockType.icon : Layout;
  };

  const BlockIcon = getBlockIcon(block.type);

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-move transition-opacity ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-gray-400" />
          <BlockIcon className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium">
              {BLOCK_TYPES.find((bt) => bt.type === block.type)?.name}
            </p>
            <p className="text-sm text-gray-500">
              {block.type === "hero" && block.content.title}
              {block.type === "stats" && `${block.content.items.length} mục`}
              {block.type === "features" && block.content.title}
              {block.type === "text" && block.content.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(block)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PageBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "1",
      type: "hero",
      order: 0,
      content: {
        title: "Khám phá khóa học UX/UI Design hàng đầu",
        subtitle: "Nâng cao kỹ năng của bạn với các khóa học được thiết kế bởi các chuyên gia hàng đầu trong ngành",
        buttonText: "Tìm khóa học",
        backgroundColor: "#2563eb",
      },
    },
    {
      id: "2",
      type: "stats",
      order: 1,
      content: {
        items: [
          { label: "Khóa học", value: "500+" },
          { label: "Học viên", value: "50K+" },
          { label: "Giảng viên", value: "100+" },
          { label: "Đánh giá", value: "4.8★" },
        ],
      },
    },
  ]);

  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    const dragBlock = blocks[dragIndex];
    const newBlocks = [...blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, dragBlock);
    setBlocks(newBlocks.map((block, idx) => ({ ...block, order: idx })));
  };

  const handleAddBlock = (type: string) => {
    const blockType = BLOCK_TYPES.find((bt) => bt.type === type);
    if (!blockType) return;

    const newBlock: Block = {
      id: String(Date.now()),
      type: type as any,
      order: blocks.length,
      content: blockType.defaultContent,
    };
    setBlocks([...blocks, newBlock]);
    toast.success("Đã thêm khối mới!");
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
    setDialogOpen(true);
  };

  const handleSaveBlock = (updatedContent: any) => {
    if (editingBlock) {
      setBlocks(
        blocks.map((block) =>
          block.id === editingBlock.id
            ? { ...block, content: updatedContent }
            : block
        )
      );
      toast.success("Cập nhật khối thành công!");
    }
    setDialogOpen(false);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    toast.success("Xóa khối thành công!");
  };

  const handleSavePage = () => {
    toast.success("Lưu trang thành công!");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Page Builder</h1>
            <p className="text-gray-600 mt-1">
              Kéo thả và chỉnh sửa giao diện trang chủ
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Chế độ chỉnh sửa" : "Xem trước"}
            </Button>
            <Button onClick={handleSavePage}>
              <Save className="w-4 h-4 mr-2" />
              Lưu trang
            </Button>
          </div>
        </div>

        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Block Library */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Thư viện khối</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {BLOCK_TYPES.map((blockType) => (
                  <Button
                    key={blockType.type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAddBlock(blockType.type)}
                  >
                    <blockType.icon className="w-4 h-4 mr-2" />
                    {blockType.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Page Builder */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg">Bố cục trang</CardTitle>
              </CardHeader>
              <CardContent>
                {blocks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có khối nào. Thêm khối từ thư viện bên trái.</p>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      moveBlock={moveBlock}
                      onEdit={handleEditBlock}
                      onDelete={handleDeleteBlock}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <PreviewPage blocks={blocks} />
        )}

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa khối</DialogTitle>
              <DialogDescription>
                Cập nhật nội dung của khối giao diện
              </DialogDescription>
            </DialogHeader>
            {editingBlock && (
              <EditBlockForm
                block={editingBlock}
                onSave={handleSaveBlock}
                onCancel={() => setDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}

function EditBlockForm({
  block,
  onSave,
  onCancel,
}: {
  block: Block;
  onSave: (content: any) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(block.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {block.type === "hero" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subtitle">Phụ đề</Label>
            <Textarea
              id="subtitle"
              value={content.subtitle}
              onChange={(e) =>
                setContent({ ...content, subtitle: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="buttonText">Văn bản nút</Label>
            <Input
              id="buttonText"
              value={content.buttonText}
              onChange={(e) =>
                setContent({ ...content, buttonText: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="backgroundColor">Màu nền</Label>
            <Input
              id="backgroundColor"
              type="color"
              value={content.backgroundColor}
              onChange={(e) =>
                setContent({ ...content, backgroundColor: e.target.value })
              }
            />
          </div>
        </>
      )}

      {block.type === "stats" && (
        <div className="space-y-4">
          <Label>Các mục thống kê</Label>
          {content.items.map((item: any, index: number) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nhãn"
                value={item.label}
                onChange={(e) => {
                  const newItems = [...content.items];
                  newItems[index].label = e.target.value;
                  setContent({ ...content, items: newItems });
                }}
              />
              <Input
                placeholder="Giá trị"
                value={item.value}
                onChange={(e) => {
                  const newItems = [...content.items];
                  newItems[index].value = e.target.value;
                  setContent({ ...content, items: newItems });
                }}
              />
            </div>
          ))}
        </div>
      )}

      {block.type === "features" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="featureTitle">Tiêu đề</Label>
            <Input
              id="featureTitle"
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-4">
            <Label>Các tính năng</Label>
            {content.items.map((item: any, index: number) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                <Input
                  placeholder="Tiêu đề"
                  value={item.title}
                  onChange={(e) => {
                    const newItems = [...content.items];
                    newItems[index].title = e.target.value;
                    setContent({ ...content, items: newItems });
                  }}
                />
                <Textarea
                  placeholder="Mô tả"
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...content.items];
                    newItems[index].description = e.target.value;
                    setContent({ ...content, items: newItems });
                  }}
                  rows={2}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {block.type === "text" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="textTitle">Tiêu đề</Label>
            <Input
              id="textTitle"
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="textContent">Nội dung</Label>
            <Textarea
              id="textContent"
              value={content.content}
              onChange={(e) =>
                setContent({ ...content, content: e.target.value })
              }
              rows={5}
            />
          </div>
        </>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">Lưu thay đổi</Button>
      </DialogFooter>
    </form>
  );
}

function PreviewPage({ blocks }: { blocks: Block[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem trước giao diện</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-gray-50">
          {blocks.map((block) => (
            <div key={block.id}>
              {block.type === "hero" && (
                <div
                  className="py-20 px-6 text-center text-white"
                  style={{ backgroundColor: block.content.backgroundColor }}
                >
                  <h1 className="text-4xl font-bold mb-4">
                    {block.content.title}
                  </h1>
                  <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                    {block.content.subtitle}
                  </p>
                  <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium">
                    {block.content.buttonText}
                  </button>
                </div>
              )}

              {block.type === "stats" && (
                <div className="py-12 bg-white">
                  <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {block.content.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {item.value}
                          </div>
                          <div className="text-gray-600">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {block.type === "features" && (
                <div className="py-16 bg-gray-50">
                  <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                      {block.content.title}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                      {block.content.items.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white p-6 rounded-lg">
                          <h3 className="text-xl font-semibold mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {block.type === "text" && (
                <div className="py-12 bg-white">
                  <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-4">
                      {block.content.title}
                    </h2>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {block.content.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
