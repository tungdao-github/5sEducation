import {
  ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, BookOpen, ShoppingCart, Award, Eye } from 'lucide-react';
import { mockOrders } from '../../data/orders';
import { courses } from '../../data/courses';

const monthlyRevenue = [
  { month: 'T10/25', revenue: 8500, orders: 28, users: 45 },
  { month: 'T11/25', revenue: 11200, orders: 37, users: 62 },
  { month: 'T12/25', revenue: 9800, orders: 32, users: 54 },
  { month: 'T1/26', revenue: 14300, orders: 47, users: 78 },
  { month: 'T2/26', revenue: 16900, orders: 56, users: 91 },
  { month: 'T3/26', revenue: 21500, orders: 72, users: 118 },
  { month: 'T4/26', revenue: 19200, orders: 64, users: 103 },
];

const categoryRevenue = [
  { name: 'Thiết kế UX/UI', value: 45600, courses: 4 },
  { name: 'Nghiên cứu UX', value: 18900, courses: 1 },
  { name: 'Viết nội dung', value: 12300, courses: 1 },
  { name: 'Quản lý UX', value: 9800, courses: 1 },
  { name: 'Phân tích UX', value: 7400, courses: 1 },
];

const orderStatus = [
  { name: 'Hoàn thành', value: 68, color: '#10B981' },
  { name: 'Đang xử lý', value: 22, color: '#3B82F6' },
  { name: 'Chờ xử lý', value: 7, color: '#F59E0B' },
  { name: 'Đã hủy', value: 3, color: '#EF4444' },
];

const topCourses = courses.slice(0, 5).map(c => ({
  name: c.title.substring(0, 30) + '...',
  students: c.students,
  revenue: c.students * c.price * 0.1,
})).sort((a, b) => b.students - a.students);

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`size-12 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

export default function OverviewTab() {
  const totalRevenue = mockOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const totalStudents = new Set(mockOrders.map(o => o.userId)).size;

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng doanh thu" value={`${(totalRevenue / 1000).toFixed(0)}K₫`} change={18.5} icon={<DollarSign className="size-6 text-green-600" />} color="bg-green-50" />
        <StatCard title="Đơn hàng tháng này" value="72" change={12.3} icon={<ShoppingCart className="size-6 text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Học viên mới" value="118" change={28.7} icon={<Users className="size-6 text-purple-600" />} color="bg-purple-50" />
        <StatCard title="Khóa học hoạt động" value={`${courses.length}`} change={0} icon={<BookOpen className="size-6 text-orange-600" />} color="bg-orange-50" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900">Doanh thu & Đơn hàng theo tháng</h3>
            <p className="text-sm text-gray-500 mt-0.5">7 tháng gần nhất</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="size-3 bg-blue-500 rounded-full inline-block" />Doanh thu (K₫)</span>
            <span className="flex items-center gap-1"><span className="size-3 bg-green-500 rounded-full inline-block" />Đơn hàng</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip formatter={(v: number, name: string) => [name === 'revenue' ? `${v.toLocaleString()}K₫` : v, name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']} />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#colorRevenue)" name="revenue" />
            <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', strokeWidth: 2 }} name="orders" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Category Revenue */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-5">Doanh thu theo danh mục</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} width={80} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()}K₫`, 'Doanh thu']} />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                {categoryRevenue.map((entry, i) => <Cell key={`cat-cell-${entry.name}`} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-5">Trạng thái đơn hàng</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={orderStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {orderStatus.map((entry) => <Cell key={`status-cell-${entry.name}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {orderStatus.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses & User Growth */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top Courses */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Award className="size-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Top khóa học bán chạy</h3>
          </div>
          <div className="space-y-3">
            {topCourses.map((course, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                  <p className="text-xs text-gray-500">{course.students.toLocaleString()} học viên</p>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  {Math.floor(course.revenue / 1000)}K₫
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Eye className="size-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Tăng trưởng người dùng</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} name="Người dùng mới" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tỷ lệ hoàn thành TB', value: '76%', sub: '+3% so với tháng trước' },
          { label: 'Điểm đánh giá TB', value: '4.78★', sub: 'Dựa trên 1,284 đánh giá' },
          { label: 'Tỷ lệ chuyển đổi', value: '3.2%', sub: 'Từ xem sang mua' },
          { label: 'Giá trị đơn hàng TB', value: '298K₫', sub: '+12K₫ so với tháng trước' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs font-medium text-gray-700 mb-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}