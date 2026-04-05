import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usage: number;
  limit: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
}

const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME2026",
    type: "percentage",
    value: 20,
    minOrder: 1000000,
    maxDiscount: 500000,
    usage: 45,
    limit: 100,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active",
  },
  {
    id: "2",
    code: "SAVE500K",
    type: "fixed",
    value: 500000,
    minOrder: 2000000,
    usage: 23,
    limit: 50,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "active",
  },
  {
    id: "3",
    code: "NEWYEAR2026",
    type: "percentage",
    value: 30,
    minOrder: 1500000,
    maxDiscount: 1000000,
    usage: 100,
    limit: 100,
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    status: "expired",
  },
];

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    limit: 100,
    startDate: "",
    endDate: "",
  });

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount || 0,
        limit: coupon.limit,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        type: "percentage",
        value: 0,
        minOrder: 0,
        maxDiscount: 0,
        limit: 100,
        startDate: "",
        endDate: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingCoupon) {
      setCoupons(
        coupons.map((coupon) =>
          coupon.id === editingCoupon.id
            ? { ...coupon, ...formData }
            : coupon
        )
      );
      toast.success("Cập nhật mã giảm giá thành công!");
    } else {
      const newCoupon: Coupon = {
        id: String(coupons.length + 1),
        ...formData,
        usage: 0,
        status: "active",
      };
      setCoupons([...coupons, newCoupon]);
      toast.success("Tạo mã giảm giá mới thành công!");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCoupons(coupons.filter((coupon) => coupon.id !== id));
    toast.success("Xóa mã giảm giá thành công!");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã giảm giá!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Quản lý mã giảm giá
          </h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý mã giảm giá khóa học</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo mã giảm giá
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách mã giảm giá</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã code</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Đơn tối thiểu</TableHead>
                <TableHead>Đã dùng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-blue-600">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {coupon.type === "percentage" ? "Phần trăm" : "Cố định"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `${coupon.value.toLocaleString("vi-VN")} ₫`}
                    {coupon.maxDiscount && (
                      <div className="text-xs text-gray-500">
                        Tối đa: {coupon.maxDiscount.toLocaleString("vi-VN")} ₫
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.minOrder.toLocaleString("vi-VN")} ₫
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{coupon.usage}</span>
                      <span className="text-gray-500">/ {coupon.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{
                          width: `${(coupon.usage / coupon.limit) * 100}%`,
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{new Date(coupon.startDate).toLocaleDateString("vi-VN")}</div>
                    <div className="text-gray-500">
                      {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        coupon.status === "active"
                          ? "default"
                          : coupon.status === "expired"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {coupon.status === "active"
                        ? "Hoạt động"
                        : coupon.status === "expired"
                        ? "Hết hạn"
                        : "Tạm dừng"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(coupon)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? "Cập nhật thông tin mã giảm giá"
                : "Tạo mã giảm giá mới cho khóa học"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Mã code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="VD: WELCOME2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Loại giảm giá</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Cố định (₫)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Giá trị</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: Number(e.target.value) })
                  }
                  placeholder={formData.type === "percentage" ? "20" : "500000"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minOrder">Đơn tối thiểu (₫)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrder: Number(e.target.value) })
                  }
                  placeholder="1000000"
                />
              </div>
              {formData.type === "percentage" && (
                <div className="grid gap-2">
                  <Label htmlFor="maxDiscount">Giảm tối đa (₫)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscount: Number(e.target.value),
                      })
                    }
                    placeholder="500000"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="limit">Giới hạn sử dụng</Label>
              <Input
                id="limit"
                type="number"
                value={formData.limit}
                onChange={(e) =>
                  setFormData({ ...formData, limit: Number(e.target.value) })
                }
                placeholder="100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingCoupon ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
