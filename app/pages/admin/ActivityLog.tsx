import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Search, Download } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  admin: string;
  action: string;
  category: "course" | "user" | "order" | "system" | "settings";
  details: string;
  timestamp: string;
  ipAddress: string;
}

const mockLogs: ActivityLog[] = [
  {
    id: "1",
    admin: "Admin User",
    action: "Tạo khóa học mới",
    category: "course",
    details: "UX/UI Design từ cơ bản đến nâng cao",
    timestamp: "2026-04-05T09:30:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "2",
    admin: "Admin User",
    action: "Cập nhật trạng thái đơn hàng",
    category: "order",
    details: "Đơn hàng ORD001 - Hoàn thành",
    timestamp: "2026-04-05T09:15:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "3",
    admin: "Admin User",
    action: "Xóa người dùng",
    category: "user",
    details: "user@example.com",
    timestamp: "2026-04-05T08:45:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "4",
    admin: "Admin User",
    action: "Cập nhật cấu hình hệ thống",
    category: "settings",
    details: "Thay đổi logo và thông tin liên hệ",
    timestamp: "2026-04-04T16:20:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "5",
    admin: "Admin User",
    action: "Xóa cache",
    category: "system",
    details: "Xóa toàn bộ cache hệ thống",
    timestamp: "2026-04-04T15:00:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "6",
    admin: "Admin User",
    action: "Tạo mã giảm giá",
    category: "settings",
    details: "WELCOME2026 - Giảm 20%",
    timestamp: "2026-04-04T14:30:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "7",
    admin: "Admin User",
    action: "Cập nhật khóa học",
    category: "course",
    details: "React & Next.js - Thay đổi giá",
    timestamp: "2026-04-04T11:15:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "8",
    admin: "Admin User",
    action: "Thêm danh mục",
    category: "course",
    details: "Blockchain Development",
    timestamp: "2026-04-03T10:00:00",
    ipAddress: "192.168.1.100",
  },
];

const categoryColors = {
  course: "default",
  user: "secondary",
  order: "default",
  system: "outline",
  settings: "secondary",
} as const;

const categoryLabels = {
  course: "Khóa học",
  user: "Người dùng",
  order: "Đơn hàng",
  system: "Hệ thống",
  settings: "Cài đặt",
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleExport = () => {
    toast.success("Đang xuất nhật ký hoạt động...");
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || log.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Nhật ký hoạt động
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi hoạt động của quản trị viên
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                logs.filter((log) => {
                  const today = new Date().toDateString();
                  const logDate = new Date(log.timestamp).toDateString();
                  return today === logDate;
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tuần này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                logs.filter((log) => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(log.timestamp) > weekAgo;
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Admin hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map((log) => log.admin)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="course">Khóa học</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="order">Đơn hàng</SelectItem>
                <SelectItem value="system">Hệ thống</SelectItem>
                <SelectItem value="settings">Cài đặt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Quản trị viên</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Chi tiết</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.timestamp).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="font-medium">{log.admin}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Badge variant={categoryColors[log.category]}>
                      {categoryLabels[log.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-600">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {log.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
