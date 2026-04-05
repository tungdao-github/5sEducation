import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Plus, Edit, Trash2, Search, Download, Upload } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  price: number;
  students: number;
  status: "published" | "draft" | "archived";
  createdAt: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "UX/UI Design từ cơ bản đến nâng cao",
    category: "UX/UI Design",
    instructor: "Nguyễn Văn A",
    price: 2500000,
    students: 1234,
    status: "published",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "React & Next.js - Xây dựng ứng dụng web hiện đại",
    category: "Lập trình Web",
    instructor: "Trần Thị B",
    price: 1990000,
    students: 856,
    status: "published",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Flutter - Phát triển ứng dụng di động đa nền tảng",
    category: "Mobile Development",
    instructor: "Lê Văn C",
    price: 2200000,
    students: 445,
    status: "published",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    title: "Machine Learning cơ bản với Python",
    category: "Data Science",
    instructor: "Phạm Thị D",
    price: 2800000,
    students: 267,
    status: "draft",
    createdAt: "2024-02-15",
  },
];

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleDelete = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
    toast.success("Xóa khóa học thành công!");
  };

  const handleExport = () => {
    toast.success("Đang xuất dữ liệu ra file Excel...");
  };

  const handleImport = () => {
    toast.success("Tính năng import sẽ được triển khai!");
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || course.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý khóa học</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả khóa học trên hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link to="/courses/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm khóa học
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khóa học..."
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
                <SelectItem value="UX/UI Design">UX/UI Design</SelectItem>
                <SelectItem value="Lập trình Web">Lập trình Web</SelectItem>
                <SelectItem value="Mobile Development">Mobile Dev</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giảng viên</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium max-w-xs">
                    {course.title}
                  </TableCell>
                  <TableCell className="text-gray-600">{course.category}</TableCell>
                  <TableCell className="text-gray-600">{course.instructor}</TableCell>
                  <TableCell>
                    {course.price.toLocaleString("vi-VN")} ₫
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.students}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.status === "published"
                          ? "default"
                          : course.status === "draft"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {course.status === "published"
                        ? "Đã xuất bản"
                        : course.status === "draft"
                        ? "Bản nháp"
                        : "Lưu trữ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/courses/edit/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
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
