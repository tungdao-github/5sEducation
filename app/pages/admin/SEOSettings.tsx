import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";

export default function SEOSettings() {
  const [globalSEO, setGlobalSEO] = useState({
    metaTitle: "EduCourse - Nền tảng học trực tuyến hàng đầu",
    metaDescription: "Khám phá hơn 500+ khóa học chất lượng cao về UX/UI Design, Lập trình, Data Science và nhiều hơn nữa",
    metaKeywords: "khóa học online, học trực tuyến, ux/ui design, lập trình web, data science",
    ogImage: "",
    twitterCard: "summary_large_image",
  });

  const [sitemap, setSitemap] = useState({
    autoGenerate: true,
    lastGenerated: "2026-04-05T10:30:00",
    urls: 1247,
  });

  const [robots, setRobots] = useState({
    content: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://educourse.com/sitemap.xml`,
  });

  const [seoScore, setSeoScore] = useState({
    overall: 85,
    title: 90,
    description: 85,
    keywords: 80,
    images: 75,
    speed: 88,
  });

  const handleSave = (section: string) => {
    toast.success(`Lưu cấu hình SEO ${section} thành công!`);
  };

  const handleGenerateSitemap = () => {
    setSitemap({
      ...sitemap,
      lastGenerated: new Date().toISOString(),
    });
    toast.success("Tạo sitemap thành công!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Cấu hình SEO</h1>
          <p className="text-gray-600 mt-1">
            Tối ưu hóa website cho công cụ tìm kiếm
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Điểm SEO tổng thể
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(seoScore.overall)}`}>
              {seoScore.overall}/100
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {seoScore.overall >= 80
                ? "Tốt"
                : seoScore.overall >= 60
                ? "Trung bình"
                : "Cần cải thiện"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sitemap URLs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sitemap.urls}</div>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật lần cuối:{" "}
              {new Date(sitemap.lastGenerated).toLocaleDateString("vi-VN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Robots.txt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Đang hoạt động</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Đã cấu hình</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">SEO toàn cục</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          <TabsTrigger value="score">Điểm SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags toàn cục</CardTitle>
              <CardDescription>
                Cấu hình meta tags mặc định cho toàn bộ website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={globalSEO.metaTitle}
                  onChange={(e) =>
                    setGlobalSEO({ ...globalSEO, metaTitle: e.target.value })
                  }
                />
                <p className="text-sm text-gray-500">
                  {globalSEO.metaTitle.length}/60 ký tự
                  {globalSEO.metaTitle.length > 60 && (
                    <span className="text-red-600 ml-2">
                      (Quá dài, nên giữ dưới 60 ký tự)
                    </span>
                  )}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={globalSEO.metaDescription}
                  onChange={(e) =>
                    setGlobalSEO({
                      ...globalSEO,
                      metaDescription: e.target.value,
                    })
                  }
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  {globalSEO.metaDescription.length}/160 ký tự
                  {globalSEO.metaDescription.length > 160 && (
                    <span className="text-red-600 ml-2">
                      (Quá dài, nên giữ dưới 160 ký tự)
                    </span>
                  )}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Textarea
                  id="metaKeywords"
                  value={globalSEO.metaKeywords}
                  onChange={(e) =>
                    setGlobalSEO({ ...globalSEO, metaKeywords: e.target.value })
                  }
                  rows={2}
                />
                <p className="text-sm text-gray-500">
                  Phân tách các từ khóa bằng dấu phẩy
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ogImage">Open Graph Image</Label>
                <Input
                  id="ogImage"
                  value={globalSEO.ogImage}
                  onChange={(e) =>
                    setGlobalSEO({ ...globalSEO, ogImage: e.target.value })
                  }
                  placeholder="https://educourse.com/og-image.jpg"
                />
                <p className="text-sm text-gray-500">
                  Kích thước khuyến nghị: 1200x630px
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="twitterCard">Twitter Card Type</Label>
                <select
                  id="twitterCard"
                  value={globalSEO.twitterCard}
                  onChange={(e) =>
                    setGlobalSEO({ ...globalSEO, twitterCard: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>

              <Button onClick={() => handleSave("toàn cục")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Sitemap</CardTitle>
              <CardDescription>
                Quản lý sitemap.xml cho công cụ tìm kiếm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Sitemap.xml</h3>
                    <p className="text-sm text-gray-600">
                      Bao gồm {sitemap.urls} URLs
                    </p>
                  </div>
                  <Badge>Tự động</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL:</span>
                    <a
                      href="/sitemap.xml"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://educourse.com/sitemap.xml
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cập nhật lần cuối:</span>
                    <span>
                      {new Date(sitemap.lastGenerated).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerateSitemap}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tạo lại Sitemap
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Bao gồm các trang:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Trang chủ và trang tĩnh
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Tất cả khóa học
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Danh mục khóa học
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Bài viết blog
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Robots.txt</CardTitle>
              <CardDescription>
                Hướng dẫn công cụ tìm kiếm cách crawl website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="robotsContent">Nội dung Robots.txt</Label>
                <Textarea
                  id="robotsContent"
                  value={robots.content}
                  onChange={(e) =>
                    setRobots({ ...robots, content: e.target.value })
                  }
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Lưu ý
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• User-agent: * áp dụng cho tất cả bot</li>
                  <li>• Allow: / cho phép crawl toàn bộ website</li>
                  <li>• Disallow: /admin/ chặn crawl trang admin</li>
                  <li>• Nên thêm link Sitemap ở cuối file</li>
                </ul>
              </div>

              <Button onClick={() => handleSave("robots.txt")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="score" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Điểm SEO chi tiết</CardTitle>
              <CardDescription>
                Phân tích và đánh giá SEO của website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(seoScore).map(([key, value]) => {
                if (key === "overall") return null;
                const labels: Record<string, string> = {
                  title: "Tiêu đề trang",
                  description: "Mô tả",
                  keywords: "Từ khóa",
                  images: "Hình ảnh (Alt text)",
                  speed: "Tốc độ tải trang",
                };
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{labels[key]}</span>
                      <span className={`font-bold ${getScoreColor(value)}`}>
                        {value}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          value >= 80
                            ? "bg-green-600"
                            : value >= 60
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Khuyến nghị cải thiện:</h4>
                <ul className="space-y-2">
                  {seoScore.images < 80 && (
                    <li className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span>
                        Thêm thuộc tính alt cho tất cả hình ảnh để cải thiện SEO
                      </span>
                    </li>
                  )}
                  {seoScore.keywords < 80 && (
                    <li className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span>
                        Sử dụng từ khóa một cách tự nhiên hơn trong nội dung
                      </span>
                    </li>
                  )}
                  {seoScore.speed < 80 && (
                    <li className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span>Tối ưu hình ảnh và giảm kích thước file</span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
