import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, BookOpen } from "lucide-react";

// Mock data for charts
const revenueData = [
  { month: "T1", revenue: 45000000, orders: 120 },
  { month: "T2", revenue: 52000000, orders: 145 },
  { month: "T3", revenue: 48000000, orders: 132 },
  { month: "T4", revenue: 61000000, orders: 167 },
  { month: "T5", revenue: 55000000, orders: 153 },
  { month: "T6", revenue: 67000000, orders: 189 },
  { month: "T7", revenue: 72000000, orders: 201 },
  { month: "T8", revenue: 68000000, orders: 195 },
  { month: "T9", revenue: 75000000, orders: 218 },
  { month: "T10", revenue: 82000000, orders: 234 },
  { month: "T11", revenue: 88000000, orders: 251 },
  { month: "T12", revenue: 95000000, orders: 278 },
];

const categoryData = [
  { name: "UX/UI Design", value: 35, students: 12500 },
  { name: "Lập trình Web", value: 28, students: 9800 },
  { name: "Mobile Dev", value: 18, students: 6300 },
  { name: "Data Science", value: 12, students: 4200 },
  { name: "Digital Marketing", value: 7, students: 2450 },
];

const weeklyData = [
  { day: "T2", students: 145, revenue: 8500000 },
  { day: "T3", students: 167, revenue: 9200000 },
  { day: "T4", students: 152, revenue: 8800000 },
  { day: "T5", students: 189, revenue: 10500000 },
  { day: "T6", students: 201, revenue: 11200000 },
  { day: "T7", students: 178, revenue: 9800000 },
  { day: "CN", students: 134, revenue: 7500000 },
];

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a"];

const stats = [
  {
    title: "Tổng doanh thu",
    value: "95.000.000 ₫",
    change: "+12.5%",
    changeType: "increase",
    icon: DollarSign,
    color: "bg-blue-500",
  },
  {
    title: "Đơn hàng",
    value: "278",
    change: "+8.2%",
    changeType: "increase",
    icon: ShoppingCart,
    color: "bg-purple-500",
  },
  {
    title: "Học viên mới",
    value: "1,234",
    change: "+15.3%",
    changeType: "increase",
    icon: Users,
    color: "bg-pink-500",
  },
  {
    title: "Khóa học",
    value: "542",
    change: "+3.1%",
    changeType: "increase",
    icon: BookOpen,
    color: "bg-orange-500",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan và thống kê bán hàng</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-sm mt-1">
                {stat.changeType === "increase" ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span
                  className={
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="weekly">Tuần này</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo tháng</CardTitle>
                <CardDescription>
                  Biểu đồ doanh thu 12 tháng gần nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng theo tháng</CardTitle>
                <CardDescription>
                  Số lượng đơn hàng 12 tháng gần nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố danh mục</CardTitle>
                <CardDescription>Tỷ lệ học viên theo danh mục</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top danh mục</CardTitle>
                <CardDescription>Số học viên theo danh mục</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {category.students.toLocaleString("vi-VN")} học viên
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${category.value}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê tuần này</CardTitle>
              <CardDescription>
                Học viên mới và doanh thu theo ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="students"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Học viên"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Doanh thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
