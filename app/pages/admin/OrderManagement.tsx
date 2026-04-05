import { useState } from "react";
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
import { Search, Download, Upload, Eye } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

interface Order {
  id: string;
  customerName: string;
  email: string;
  course: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  paymentMethod: string;
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    course: "UX/UI Design từ cơ bản đến nâng cao",
    amount: 2500000,
    status: "completed",
    paymentMethod: "VNPay",
    createdAt: "2026-04-01T10:30:00",
  },
  {
    id: "ORD002",
    customerName: "Trần Thị B",
    email: "tranthib@email.com",
    course: "React & Next.js - Xây dựng ứng dụng web hiện đại",
    amount: 1990000,
    status: "processing",
    paymentMethod: "Momo",
    createdAt: "2026-04-02T14:20:00",
  },
  {
    id: "ORD003",
    customerName: "Lê Văn C",
    email: "levanc@email.com",
    course: "Flutter - Phát triển ứng dụng di động",
    amount: 2200000,
    status: "pending",
    paymentMethod: "Chuyển khoản",
    createdAt: "2026-04-03T09:15:00",
  },
  {
    id: "ORD004",
    customerName: "Phạm Thị D",
    email: "phamthid@email.com",
    course: "Machine Learning cơ bản với Python",
    amount: 2800000,
    status: "completed",
    paymentMethod: "VNPay",
    createdAt: "2026-04-04T16:45:00",
  },
];

const statusColors = {
  pending: "secondary",
  processing: "default",
  completed: "default",
  cancelled: "destructive",
} as const;

const statusLabels = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast.success("Cập nhật trạng thái đơn hàng thành công!");
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleExport = () => {
    toast.success("Đang xuất dữ liệu đơn hàng ra file Excel...");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {order.course}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.amount.toLocaleString("vi-VN")} ₫
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {order.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value as Order["status"])
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge variant={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <Badge variant={statusColors[selectedOrder.status]}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách hàng</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Khóa học</p>
                  <p className="font-medium">{selectedOrder.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số tiền</p>
                  <p className="font-medium text-lg text-blue-600">
                    {selectedOrder.amount.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
