import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface CourseVariant {
  id: string;
  name: string;
  price: number;
  duration: string;
}

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    instructor: "",
    description: "",
    shortDescription: "",
    price: "",
    comparePrice: "",
    thumbnail: "",
    status: "draft",
    featured: false,
    // SEO
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    // Content
    curriculum: "",
    requirements: "",
    whatYouLearn: "",
  });

  const [variants, setVariants] = useState<CourseVariant[]>([
    { id: "1", name: "Gói cơ bản", price: 1500000, duration: "3 tháng" },
    { id: "2", name: "Gói nâng cao", price: 2500000, duration: "6 tháng" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      isEditing
        ? "Cập nhật khóa học thành công!"
        : "Tạo khóa học mới thành công!"
    );
    navigate("/courses");
  };

  const addVariant = () => {
    const newVariant: CourseVariant = {
      id: String(Date.now()),
      name: "Gói mới",
      price: 0,
      duration: "",
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof CourseVariant, value: any) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/courses")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {isEditing ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline">
            Lưu nháp
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Cập nhật" : "Xuất bản"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="variants">Biến thể</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khóa học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Tên khóa học *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="VD: UX/UI Design từ cơ bản đến nâng cao"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="ux-ui-design-co-ban-den-nang-cao"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ux-ui">UX/UI Design</SelectItem>
                        <SelectItem value="web">Lập trình Web</SelectItem>
                        <SelectItem value="mobile">Mobile Development</SelectItem>
                        <SelectItem value="data">Data Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instructor">Giảng viên</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData({ ...formData, instructor: e.target.value })
                      }
                      placeholder="Tên giảng viên"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="Mô tả ngắn gọn về khóa học..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả chi tiết</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả chi tiết về khóa học..."
                    rows={5}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Giá khóa học (₫) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="2500000"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="comparePrice">Giá so sánh (₫)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      value={formData.comparePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          comparePrice: e.target.value,
                        })
                      }
                      placeholder="3500000"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="thumbnail">URL ảnh thumbnail</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Khóa học nổi bật</Label>
                    <p className="text-sm text-gray-500">
                      Hiển thị khóa học ở vị trí nổi bật
                    </p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung khóa học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="whatYouLearn">Bạn sẽ học được gì</Label>
                <Textarea
                  id="whatYouLearn"
                  value={formData.whatYouLearn}
                  onChange={(e) =>
                    setFormData({ ...formData, whatYouLearn: e.target.value })
                  }
                  placeholder="Liệt kê những gì học viên sẽ học được..."
                  rows={5}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="curriculum">Chương trình học</Label>
                <Textarea
                  id="curriculum"
                  value={formData.curriculum}
                  onChange={(e) =>
                    setFormData({ ...formData, curriculum: e.target.value })
                  }
                  placeholder="Nội dung chi tiết các bài học..."
                  rows={8}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="requirements">Yêu cầu</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  placeholder="Những yêu cầu cần có trước khi học..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Biến thể khóa học</CardTitle>
              <Button type="button" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm biến thể
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Gói khóa học</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="grid gap-2">
                      <Label>Tên gói</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(variant.id, "name", e.target.value)
                        }
                        placeholder="VD: Gói cơ bản"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Giá (₫)</Label>
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        placeholder="1500000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Thời hạn</Label>
                      <Input
                        value={variant.duration}
                        onChange={(e) =>
                          updateVariant(variant.id, "duration", e.target.value)
                        }
                        placeholder="VD: 3 tháng"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="Tiêu đề tối ưu cho SEO..."
                />
                <p className="text-sm text-gray-500">
                  {formData.metaTitle.length}/60 ký tự
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  placeholder="Mô tả tối ưu cho SEO..."
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  {formData.metaDescription.length}/160 ký tự
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                  placeholder="ux design, ui design, học ux/ui..."
                />
                <p className="text-sm text-gray-500">
                  Phân tách các từ khóa bằng dấu phẩy
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
