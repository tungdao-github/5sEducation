import { useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, Info, Trash2, Edit, Plus, LogIn, LogOut, Settings } from 'lucide-react';

type LogType = 'info' | 'success' | 'warning' | 'error';

interface ActivityLog {
  id: string;
  admin: string;
  action: string;
  resource: string;
  detail: string;
  type: LogType;
  ip: string;
  timestamp: string;
}

const mockLogs: ActivityLog[] = [
  { id: 'l1', admin: 'Admin EduCourse', action: 'Đăng nhập', resource: 'Auth', detail: 'Đăng nhập thành công vào hệ thống', type: 'success', ip: '192.168.1.1', timestamp: '2026-04-06T09:00:00' },
  { id: 'l2', admin: 'Admin EduCourse', action: 'Thêm khóa học', resource: 'Course', detail: 'Thêm khóa học "Figma nâng cao"', type: 'info', ip: '192.168.1.1', timestamp: '2026-04-06T09:15:32' },
  { id: 'l3', admin: 'Admin EduCourse', action: 'Cập nhật đơn hàng', resource: 'Order', detail: 'Cập nhật trạng thái ORD-2026-003 → Hoàn thành', type: 'success', ip: '192.168.1.1', timestamp: '2026-04-06T09:30:11' },
  { id: 'l4', admin: 'Admin EduCourse', action: 'Xóa bình luận', resource: 'Comment', detail: 'Xóa bình luận spam từ user#442', type: 'warning', ip: '192.168.1.1', timestamp: '2026-04-06T10:05:44' },
  { id: 'l5', admin: 'Admin EduCourse', action: 'Tạo mã giảm giá', resource: 'Coupon', detail: 'Tạo mã FLASH10 - Giảm 10K, hết hạn 30/04', type: 'info', ip: '192.168.1.1', timestamp: '2026-04-06T10:22:18' },
  { id: 'l6', admin: 'Admin EduCourse', action: 'Cấu hình SEO', resource: 'SEO', detail: 'Cập nhật meta description trang chủ', type: 'info', ip: '192.168.1.1', timestamp: '2026-04-06T11:00:05' },
  { id: 'l7', admin: 'Admin EduCourse', action: 'Xóa người dùng', resource: 'User', detail: 'Xóa tài khoản user#spammer@test.com', type: 'error', ip: '192.168.1.1', timestamp: '2026-04-05T16:45:22' },
  { id: 'l8', admin: 'Admin EduCourse', action: 'Đăng bài blog', resource: 'Blog', detail: 'Đăng bài "10 xu hướng UX 2026"', type: 'success', ip: '192.168.1.2', timestamp: '2026-04-05T14:30:00' },
  { id: 'l9', admin: 'Admin EduCourse', action: 'Xóa cache', resource: 'System', detail: 'Xóa cache toàn bộ hệ thống', type: 'warning', ip: '192.168.1.1', timestamp: '2026-04-05T11:12:33' },
  { id: 'l10', admin: 'Admin EduCourse', action: 'Đổi mật khẩu', resource: 'Auth', detail: 'Đổi mật khẩu tài khoản admin', type: 'success', ip: '192.168.1.3', timestamp: '2026-04-04T09:00:00' },
  { id: 'l11', admin: 'Admin EduCourse', action: 'Export dữ liệu', resource: 'Report', detail: 'Xuất báo cáo doanh thu tháng 3/2026', type: 'info', ip: '192.168.1.1', timestamp: '2026-04-04T08:30:00' },
  { id: 'l12', admin: 'Admin EduCourse', action: 'Cập nhật giá', resource: 'Course', detail: 'Cập nhật giá khóa học "Gestalt" từ 299K → 289K', type: 'info', ip: '192.168.1.1', timestamp: '2026-04-03T15:20:00' },
];

const logTypeConfig: Record<LogType, { icon: React.ReactNode; color: string; bg: string }> = {
  success: { icon: <CheckCircle className="size-4" />, color: 'text-green-600', bg: 'bg-green-50' },
  info: { icon: <Info className="size-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  warning: { icon: <AlertCircle className="size-4" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  error: { icon: <Trash2 className="size-4" />, color: 'text-red-600', bg: 'bg-red-50' },
};

const actionIcons: Record<string, React.ReactNode> = {
  'Đăng nhập': <LogIn className="size-3.5" />,
  'Đăng xuất': <LogOut className="size-3.5" />,
  'Thêm khóa học': <Plus className="size-3.5" />,
  'Cập nhật': <Edit className="size-3.5" />,
  'Xóa': <Trash2 className="size-3.5" />,
  'Cấu hình': <Settings className="size-3.5" />,
};

export default function ActivityLogsTab() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<LogType | 'all'>('all');
  const [filterResource, setFilterResource] = useState('all');

  const resources = ['all', ...Array.from(new Set(mockLogs.map(l => l.resource)))];

  const filtered = mockLogs.filter(log => {
    const matchSearch = !search || log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.admin.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || log.type === filterType;
    const matchResource = filterResource === 'all' || log.resource === filterResource;
    return matchSearch && matchType && matchResource;
  });

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { type: 'success' as LogType, label: 'Thành công', count: mockLogs.filter(l => l.type === 'success').length },
          { type: 'info' as LogType, label: 'Thông tin', count: mockLogs.filter(l => l.type === 'info').length },
          { type: 'warning' as LogType, label: 'Cảnh báo', count: mockLogs.filter(l => l.type === 'warning').length },
          { type: 'error' as LogType, label: 'Nghiêm trọng', count: mockLogs.filter(l => l.type === 'error').length },
        ].map(stat => (
          <div key={stat.type} className={`${logTypeConfig[stat.type].bg} rounded-lg p-3 text-center cursor-pointer border-2 ${filterType === stat.type ? 'border-current' : 'border-transparent'}`}
            onClick={() => setFilterType(filterType === stat.type ? 'all' : stat.type)}>
            <div className={`text-xl font-bold ${logTypeConfig[stat.type].color}`}>{stat.count}</div>
            <div className="text-xs text-gray-600 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm log..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-gray-400" />
          <select value={filterResource} onChange={e => setFilterResource(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {resources.map(r => <option key={r} value={r}>{r === 'all' ? 'Tất cả module' : r}</option>)}
          </select>
        </div>
      </div>

      {/* Logs */}
      <div className="space-y-2">
        {filtered.map(log => {
          const cfg = logTypeConfig[log.type];
          return (
            <div key={log.id} className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition">
              <div className={`size-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{log.action}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color}`}>{log.resource}</span>
                </div>
                <p className="text-sm text-gray-600">{log.detail}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{log.admin}</span>
                  <span>IP: {log.ip}</span>
                  <span>{formatTime(log.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="size-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Không tìm thấy log nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
