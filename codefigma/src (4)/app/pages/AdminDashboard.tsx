import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router';
import {
  BookOpen, Package, Users, Search, Plus, Edit, Trash2,
  ChevronDown, ChevronUp, DollarSign, TrendingUp, ShoppingCart,
  Eye, Calendar, Mail, Phone, Shield, Tag, FileText,
  BarChart2, Settings, Activity, Download, Upload, RefreshCw, Video
} from 'lucide-react';
import { courses } from '../data/courses';
import { mockOrders, statusConfig } from '../data/orders';
import { toast } from 'sonner';
import OverviewTab from '../components/admin/OverviewTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import CouponsTab from '../components/admin/CouponsTab';
import BlogTab from '../components/admin/BlogTab';
import ActivityLogsTab from '../components/admin/ActivityLogsTab';
import SEOTab from '../components/admin/SEOTab';
import SystemConfigTab from '../components/admin/SystemConfigTab';
import InstructorsTab from '../components/admin/InstructorsTab';

type Tab = 'overview' | 'courses' | 'orders' | 'users' | 'instructors' | 'categories' | 'coupons' | 'blog' | 'logs' | 'seo' | 'config';

const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'overview', label: 'Tổng quan', icon: <BarChart2 className="size-4" /> },
  { id: 'courses', label: 'Khóa học', icon: <BookOpen className="size-4" />, badge: courses.length },
  { id: 'orders', label: 'Đơn hàng', icon: <Package className="size-4" />, badge: mockOrders.length },
  { id: 'users', label: 'Người dùng', icon: <Users className="size-4" /> },
  { id: 'instructors', label: 'Giảng viên', icon: <Video className="size-4" /> },
  { id: 'categories', label: 'Danh mục', icon: <Tag className="size-4" /> },
  { id: 'coupons', label: 'Mã giảm giá', icon: <Tag className="size-4" /> },
  { id: 'blog', label: 'Blog', icon: <FileText className="size-4" /> },
  { id: 'logs', label: 'Nhật ký', icon: <Activity className="size-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="size-4" /> },
  { id: 'config', label: 'Cấu hình', icon: <Settings className="size-4" /> },
];

function exportCSV(data: object[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify((row as any)[h] ?? '')).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Đã xuất ${filename}`);
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAdmin) return <Navigate to="/" replace />;

  const totalRevenue = mockOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);

  const handleExportOrders = () => {
    const data = mockOrders.map(o => ({
      'Mã đơn': o.id, 'Khách hàng': o.fullName, 'Email': o.email,
      'Tổng tiền': o.total, 'Trạng thái': statusConfig[o.status].label,
      'Thanh toán': o.paymentMethod, 'Ngày tạo': new Date(o.createdAt).toLocaleDateString('vi-VN'),
    }));
    exportCSV(data, 'don-hang.csv');
  };

  const handleExportCourses = () => {
    const data = courses.map(c => ({
      'Tên khóa học': c.title, 'Giảng viên': c.instructor,
      'Giá': c.price, 'Học viên': c.students, 'Đánh giá': c.rating,
      'Danh mục': c.category, 'Cấp độ': c.level,
    }));
    exportCSV(data, 'khoa-hoc.csv');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white/80 hover:text-white">
                <Shield className="size-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-indigo-200 text-sm">Chào mừng, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:grid grid-cols-4 gap-3">
                {[
                  { label: 'Doanh thu', value: `${(totalRevenue / 1000).toFixed(0)}K₫`, icon: <DollarSign className="size-4" /> },
                  { label: 'Đơn hàng', value: mockOrders.length, icon: <ShoppingCart className="size-4" /> },
                  { label: 'Học viên', value: new Set(mockOrders.map(o => o.userId)).size, icon: <Users className="size-4" /> },
                  { label: 'Khóa học', value: courses.length, icon: <BookOpen className="size-4" /> },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 whitespace-nowrap">
                    <div className="text-white/70">{stat.icon}</div>
                    <div>
                      <div className="font-bold text-sm">{stat.value}</div>
                      <div className="text-white/60 text-xs">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/" className="text-white/80 hover:text-white text-sm underline underline-offset-2 hidden sm:block">← Về trang chủ</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Navigation */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col w-56 flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Quản lý</p>
              <nav className="space-y-0.5">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tab.icon}
                      {tab.label}
                    </div>
                    {tab.badge !== undefined && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Tab Header with Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{tabs.find(t => t.id === activeTab)?.label}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {activeTab === 'overview' && 'Tổng quan hoạt động kinh doanh'}
                  {activeTab === 'courses' && `${courses.length} khóa học đang hoạt động`}
                  {activeTab === 'orders' && `${mockOrders.length} đơn hàng | ${mockOrders.filter(o => o.status === 'processing').length} đang xử lý`}
                  {activeTab === 'users' && 'Quản lý tài khoản người dùng và phân quyền'}
                  {activeTab === 'instructors' && 'Xem xét và phê duyệt giảng viên mới'}
                  {activeTab === 'categories' && 'CRUD danh mục khóa học'}
                  {activeTab === 'coupons' && 'Tạo và quản lý mã giảm giá'}
                  {activeTab === 'blog' && 'Quản lý bài viết và tin tức'}
                  {activeTab === 'logs' && 'Lịch sử hoạt động quản trị viên'}
                  {activeTab === 'seo' && 'Cài đặt SEO nâng cao cho từng trang'}
                  {activeTab === 'config' && 'Cấu hình chung hệ thống'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'orders' && (
                  <>
                    <button onClick={handleExportOrders} className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                      <Download className="size-4" />Export CSV
                    </button>
                    <button onClick={() => toast.info('Tính năng Import đang phát triển')} className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                      <Upload className="size-4" />Import
                    </button>
                  </>
                )}
                {activeTab === 'courses' && (
                  <button onClick={handleExportCourses} className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                    <Download className="size-4" />Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'courses' && <CoursesTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
            {activeTab === 'orders' && <OrdersTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
            {activeTab === 'users' && <UsersTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
            {activeTab === 'instructors' && <InstructorsTab />}
            {activeTab === 'categories' && <CategoriesTab />}
            {activeTab === 'coupons' && <CouponsTab />}
            {activeTab === 'blog' && <BlogTab />}
            {activeTab === 'logs' && <ActivityLogsTab />}
            {activeTab === 'seo' && <SEOTab />}
            {activeTab === 'config' && <SystemConfigTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────
function CoursesTab({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm khóa học, giảng viên, danh mục..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button onClick={() => { setShowAdd(true); toast.info('Mở form thêm khóa học mới'); }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition whitespace-nowrap text-sm font-medium">
          <Plus className="size-4" /> Thêm khóa học
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Tổng khóa học', value: courses.length, color: 'blue' },
          { label: 'Học viên', value: courses.reduce((s, c) => s + c.students, 0).toLocaleString(), color: 'green' },
          { label: 'Đánh giá TB', value: (courses.reduce((s, c) => s + c.rating, 0) / courses.length).toFixed(1) + '★', color: 'yellow' },
          { label: 'Giá TB', value: Math.round(courses.reduce((s, c) => s + c.price, 0) / courses.length) + 'K₫', color: 'purple' },
        ].map(s => (
          <div key={s.label} className={`bg-${s.color}-50 rounded-lg p-3 text-center`}>
            <p className={`font-bold text-${s.color}-700`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {filteredCourses.map(course => (
          <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition">
            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}>
              <img src={course.image} alt={course.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{course.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  <span>{course.instructor}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{course.category}</span>
                  <span>{course.students.toLocaleString()} học viên</span>
                  <span className="text-yellow-600">{course.rating}★</span>
                  <span className="text-blue-600 font-semibold">{course.price.toLocaleString('vi-VN')}K₫</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link to={`/course/${course.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" onClick={e => e.stopPropagation()}>
                  <Eye className="size-4" />
                </Link>
                <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition" onClick={e => e.stopPropagation()}>
                  <Edit className="size-4" />
                </button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" onClick={e => { e.stopPropagation(); toast.error('Chức năng xóa yêu cầu xác nhận'); }}>
                  <Trash2 className="size-4" />
                </button>
                {expandedCourse === course.id ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
              </div>
            </div>
            {expandedCourse === course.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="grid md:grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500 mb-1">Mô tả</p><p className="text-sm text-gray-700">{course.description}</p></div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Thông tin</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>⏱ {course.duration} · {course.lessons} bài học</p>
                      <p>📊 {course.level}</p>
                      <p>💰 {course.price.toLocaleString()}K₫ (Gốc: {course.originalPrice.toLocaleString()}K₫)</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Giáo trình ({course.curriculum.length} chương)</p>
                    <div className="space-y-1">
                      {course.curriculum.slice(0, 3).map((ch, i) => (
                        <p key={i} className="text-xs text-gray-600">• {ch.title} ({ch.lessons} bài)</p>
                      ))}
                      {course.curriculum.length > 3 && <p className="text-xs text-blue-600">+{course.curriculum.length - 3} chương nữa</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = mockOrders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm đơn hàng (mã, tên, email)..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {Object.entries(statusConfig).map(([key, val]) => (
          <div key={key} className={`rounded-lg p-3 text-center cursor-pointer border-2 transition ${filterStatus === key ? 'border-blue-400' : 'border-transparent'} ${val.color}`}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}>
            <p className="font-bold">{mockOrders.filter(o => o.status === key).length}</p>
            <p className="text-xs mt-0.5">{val.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="font-mono font-bold text-gray-900 text-sm">{order.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[order.status].color}`}>
                    {statusConfig[order.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="size-3" />{order.email}</span>
                  <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  <span className="font-semibold text-blue-600">{order.total.toLocaleString('vi-VN')}K₫</span>
                  <span>{order.items.length} khóa học</span>
                </div>
              </div>
              {expandedOrder === order.id ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
            </div>

            {expandedOrder === order.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="space-y-2 mb-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                      <img src={item.image} alt={item.title} className="w-12 h-9 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.instructor}</p>
                      </div>
                      <p className="font-semibold text-blue-600 text-sm">{item.price.toLocaleString()}K₫</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>💳 {order.paymentMethod} {order.couponCode && `· Mã: ${order.couponCode}`}</p>
                    {order.discount > 0 && <p className="text-green-600">-{order.discount}K₫ giảm giá</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={order.status} onChange={() => toast.success('Cập nhật trạng thái thành công!')}>
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="size-12 mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  const mockUsers = [
    { id: 'u1', name: 'Nguyễn Văn An', email: 'user@test.com', role: 'user', level: 'Silver', points: 1250, joinDate: '2024-01-15', phone: '0901234567', coursesCount: 3, status: 'active' },
    { id: 'admin1', name: 'Admin EduCourse', email: 'admin@educourse.vn', role: 'admin', level: 'Platinum', points: 9999, joinDate: '2023-06-01', phone: '0909999999', coursesCount: 0, status: 'active' },
    { id: 'u2', name: 'Trần Thị Bình', email: 'tran.binh@gmail.com', role: 'user', level: 'Bronze', points: 450, joinDate: '2025-08-20', phone: '0912345678', coursesCount: 1, status: 'active' },
    { id: 'u3', name: 'Lê Văn Cường', email: 'le.cuong@yahoo.com', role: 'user', level: 'Gold', points: 2800, joinDate: '2024-03-10', phone: '0923456789', coursesCount: 5, status: 'active' },
    { id: 'u4', name: 'Phạm Thị Dung', email: 'pham.dung@gmail.com', role: 'user', level: 'Bronze', points: 120, joinDate: '2026-01-05', phone: '0934567890', coursesCount: 1, status: 'banned' },
    { id: 'u5', name: 'Hoàng Văn Em', email: 'hoang.em@gmail.com', role: 'user', level: 'Gold', points: 3100, joinDate: '2024-05-20', phone: '0945678901', coursesCount: 7, status: 'active' },
  ];

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  );

  const levelColors: Record<string, string> = {
    Platinum: 'bg-purple-100 text-purple-700',
    Gold: 'bg-yellow-100 text-yellow-700',
    Silver: 'bg-gray-100 text-gray-600',
    Bronze: 'bg-orange-100 text-orange-700',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm người dùng (tên, email, phone)..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <button onClick={() => toast.info('Tính năng thêm admin đang phát triển')}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap">
          <Plus className="size-4" /> Thêm admin
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="font-bold text-blue-700">{mockUsers.filter(u => u.role === 'user').length}</p>
          <p className="text-xs text-gray-500">Người dùng</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="font-bold text-purple-700">{mockUsers.filter(u => u.role === 'admin').length}</p>
          <p className="text-xs text-gray-500">Quản trị viên</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="font-bold text-red-700">{mockUsers.filter(u => u.status === 'banned').length}</p>
          <p className="text-xs text-gray-500">Đã khóa</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cấp độ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Điểm / KH</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tham gia</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      {user.status === 'banned' && <span className="text-xs text-red-500">Đã khóa</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs text-gray-700 flex items-center gap-1"><Mail className="size-3" />{user.email}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="size-3" />{user.phone}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${levelColors[user.level]}`}>{user.level}</span>
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <span className="font-medium text-gray-900">{user.points.toLocaleString()} đ</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-blue-600">{user.coursesCount} KH</span>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-500">{new Date(user.joinDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toast.info(`Chỉnh sửa: ${user.name}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"><Edit className="size-3.5" /></button>
                    {user.status === 'active' ? (
                      <button onClick={() => toast.success(`Đã khóa tài khoản ${user.email}`)} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition text-xs font-medium">Khóa</button>
                    ) : (
                      <button onClick={() => toast.success(`Đã mở khóa ${user.email}`)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition text-xs font-medium">Mở</button>
                    )}
                    <button onClick={() => toast.error('Đã xóa tài khoản')} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"><Trash2 className="size-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
