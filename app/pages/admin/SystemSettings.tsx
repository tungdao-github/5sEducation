import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Save, Upload, Trash } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "../../components/ui/switch";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // General
    siteName: "EduCourse",
    siteDescription: "Nền tảng học trực tuyến hàng đầu Việt Nam",
    logo: "",
    favicon: "",
    // Contact
    email: "contact@educourse.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    // Footer
    footerText: "© 2026 EduCourse. All rights reserved.",
    facebookUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    // Payment
    vnpayEnabled: true,
    momoEnabled: true,
    bankTransferEnabled: true,
    // Email
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    // System
    maintenanceMode: false,
    registrationEnabled: true,
  });

  const handleSave = (section: string) => {
    toast.success(`Lưu cấu hình ${section} thành công!`);
  };

  const handleClearCache = () => {
    toast.success("Đã xóa cache hệ thống!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Cấu hình hệ thống
          </h1>
          <p className="text-gray-600 mt-1">Quản lý cấu hình chung của website</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ</TabsTrigger>
          <TabsTrigger value="footer">Footer & Social</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>Cấu hình thông tin cơ bản của website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Tên website</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="siteDescription">Mô tả website</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    setSettings({ ...settings, siteDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    value={settings.logo}
                    onChange={(e) =>
                      setSettings({ ...settings, logo: e.target.value })
                    }
                    placeholder="URL logo"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="favicon">Favicon</Label>
                <div className="flex gap-2">
                  <Input
                    id="favicon"
                    value={settings.favicon}
                    onChange={(e) =>
                      setSettings({ ...settings, favicon: e.target.value })
                    }
                    placeholder="URL favicon"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => handleSave("chung")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
              <CardDescription>Cấu hình thông tin liên hệ hiển thị trên website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button onClick={() => handleSave("liên hệ")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer & Mạng xã hội</CardTitle>
              <CardDescription>Cấu hình footer và liên kết mạng xã hội</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="footerText">Văn bản footer</Label>
                <Input
                  id="footerText"
                  value={settings.footerText}
                  onChange={(e) =>
                    setSettings({ ...settings, footerText: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  value={settings.facebookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, facebookUrl: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="twitterUrl">Twitter URL</Label>
                <Input
                  id="twitterUrl"
                  value={settings.twitterUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, twitterUrl: e.target.value })
                  }
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={settings.linkedinUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  value={settings.instagramUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramUrl: e.target.value })
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
              <Button onClick={() => handleSave("footer")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cổng thanh toán</CardTitle>
              <CardDescription>Cấu hình các phương thức thanh toán</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>VNPay</Label>
                  <p className="text-sm text-gray-500">
                    Kích hoạt thanh toán qua VNPay
                  </p>
                </div>
                <Switch
                  checked={settings.vnpayEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, vnpayEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Momo</Label>
                  <p className="text-sm text-gray-500">
                    Kích hoạt thanh toán qua Momo
                  </p>
                </div>
                <Switch
                  checked={settings.momoEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, momoEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chuyển khoản ngân hàng</Label>
                  <p className="text-sm text-gray-500">
                    Kích hoạt thanh toán qua chuyển khoản
                  </p>
                </div>
                <Switch
                  checked={settings.bankTransferEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, bankTransferEnabled: checked })
                  }
                />
              </div>
              <Button onClick={() => handleSave("thanh toán")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Email</CardTitle>
              <CardDescription>Cấu hình SMTP để gửi email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpHost: e.target.value })
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  value={settings.smtpPort}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpPort: e.target.value })
                  }
                  placeholder="587"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtpUser">SMTP User</Label>
                <Input
                  id="smtpUser"
                  value={settings.smtpUser}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpUser: e.target.value })
                  }
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <Button onClick={() => handleSave("email")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt hệ thống</CardTitle>
              <CardDescription>Cấu hình nâng cao của hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chế độ bảo trì</Label>
                  <p className="text-sm text-gray-500">
                    Tạm đóng website để bảo trì
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cho phép đăng ký</Label>
                  <p className="text-sm text-gray-500">
                    Cho phép người dùng mới đăng ký tài khoản
                  </p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, registrationEnabled: checked })
                  }
                />
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={handleClearCache}>
                  <Trash className="w-4 h-4 mr-2" />
                  Xóa cache hệ thống
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Xóa cache khi cập nhật giao diện hoặc cấu hình
                </p>
              </div>
              <Button onClick={() => handleSave("hệ thống")}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
