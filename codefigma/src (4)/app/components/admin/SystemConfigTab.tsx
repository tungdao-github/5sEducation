import { useState } from 'react';
import { Save, RefreshCw, Globe, Mail, Phone, MapPin, BookOpen, CreditCard, Truck, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  footerAbout: string;
  footerCopyright: string;
  facebookUrl: string;
  youtubeUrl: string;
  primaryColor: string;
  enableVNPay: boolean;
  enableZaloPay: boolean;
  enableCard: boolean;
  maintenanceMode: boolean;
  maxCartItems: number;
  pointsPerVND: number;
  minPointsRedeem: number;
  freeShippingThreshold: number;
}

const defaultConfig: SystemConfig = {
  siteName: 'EduCourse',
  siteDescription: 'Nền tảng học UX/UI Design hàng đầu Việt Nam',
  logo: '',
  favicon: '',
  contactEmail: 'support@educourse.vn',
  contactPhone: '1800-1234',
  address: '123 Nguyễn Huệ, Q.1, TP.HCM',
  footerAbout: 'EduCourse là nền tảng học UX/UI Design hàng đầu Việt Nam, với hơn 500 khóa học chất lượng cao.',
  footerCopyright: '© 2026 EduCourse. All rights reserved.',
  facebookUrl: 'https://facebook.com/educourse',
  youtubeUrl: 'https://youtube.com/educourse',
  primaryColor: '#3B82F6',
  enableVNPay: true,
  enableZaloPay: true,
  enableCard: true,
  maintenanceMode: false,
  maxCartItems: 20,
  pointsPerVND: 10,
  minPointsRedeem: 1000,
  freeShippingThreshold: 0,
};

function ConfigSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="size-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function SystemConfigTab() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [clearing, setClearing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const set = (key: keyof SystemConfig, val: any) => setConfig(c => ({ ...c, [key]: val }));

  const handleSave = () => {
    toast.success('Cấu hình hệ thống đã được lưu!');
  };

  const handleClearCache = () => {
    setClearing(true);
    setTimeout(() => {
      setClearing(false);
      toast.success('Cache hệ thống đã được xóa thành công!');
    }, 1500);
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Cấu hình hệ thống</h3>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin website, thanh toán và các tính năng hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleClearCache} disabled={clearing}
            className="flex items-center gap-2 border border-orange-400 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition text-sm font-medium disabled:opacity-50">
            <RefreshCw className={`size-4 ${clearing ? 'animate-spin' : ''}`} />
            {clearing ? 'Đang xóa...' : 'Xóa Cache'}
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            <Save className="size-4" /> Lưu tất cả
          </button>
        </div>
      </div>

      {/* Maintenance Mode Warning */}
      {config.maintenanceMode && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-700">⚠️ Chế độ bảo trì đang bật</p>
            <p className="text-sm text-red-600">Người dùng sẽ thấy trang bảo trì khi truy cập website</p>
          </div>
          <button onClick={() => set('maintenanceMode', false)} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
            Tắt ngay
          </button>
        </div>
      )}

      {/* General Info */}
      <ConfigSection title="Thông tin chung" icon={<Globe className="size-5" />}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên website</label>
            <input value={config.siteName} onChange={e => set('siteName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Màu chủ đạo</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={config.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                className="size-9 rounded cursor-pointer border border-gray-200" />
              <input value={config.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
            <input value={config.siteDescription} onChange={e => set('siteDescription', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu Footer</label>
            <textarea value={config.footerAbout} onChange={e => set('footerAbout', e.target.value)}
              rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright</label>
            <input value={config.footerCopyright} onChange={e => set('footerCopyright', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </ConfigSection>

      {/* Contact */}
      <ConfigSection title="Thông tin liên hệ" icon={<Mail className="size-5" />}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email hỗ trợ</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input value={config.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input value={config.contactPhone} onChange={e => set('contactPhone', e.target.value)}
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input value={config.address} onChange={e => set('address', e.target.value)}
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input value={config.facebookUrl} onChange={e => set('facebookUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input value={config.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </ConfigSection>

      {/* Payment Gateways */}
      <ConfigSection title="Cổng thanh toán" icon={<CreditCard className="size-5" />}>
        <div className="space-y-4">
          {[
            { key: 'enableVNPay', label: 'VNPay', desc: 'Thanh toán qua ví VNPay và thẻ ngân hàng' },
            { key: 'enableZaloPay', label: 'ZaloPay', desc: 'Thanh toán qua ví ZaloPay' },
            { key: 'enableCard', label: 'Thẻ tín dụng/Ghi nợ', desc: 'Visa, Mastercard, JCB' },
          ].map(pg => (
            <div key={pg.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 text-sm">{pg.label}</p>
                <p className="text-xs text-gray-500">{pg.desc}</p>
              </div>
              <button
                onClick={() => set(pg.key as keyof SystemConfig, !config[pg.key as keyof SystemConfig])}
                className={`relative inline-flex size-6 w-12 cursor-pointer items-center rounded-full transition-colors ${config[pg.key as keyof SystemConfig] ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${config[pg.key as keyof SystemConfig] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </ConfigSection>

      {/* Points & Loyalty */}
      <ConfigSection title="Điểm thưởng & Khách hàng thân thiết" icon={<BookOpen className="size-5" />}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm / 1000₫</label>
            <input type="number" value={config.pointsPerVND} onChange={e => set('pointsPerVND', +e.target.value)}
              min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tối thiểu quy đổi</label>
            <input type="number" value={config.minPointsRedeem} onChange={e => set('minPointsRedeem', +e.target.value)}
              min={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SL tối đa trong giỏ</label>
            <input type="number" value={config.maxCartItems} onChange={e => set('maxCartItems', +e.target.value)}
              min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </ConfigSection>

      {/* Maintenance */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Chế độ bảo trì</h3>
            <p className="text-sm text-gray-500 mt-0.5">Khi bật, người dùng sẽ thấy trang thông báo bảo trì</p>
          </div>
          <button
            onClick={() => { set('maintenanceMode', !config.maintenanceMode); toast(config.maintenanceMode ? 'Đã tắt chế độ bảo trì' : 'Đã bật chế độ bảo trì', { icon: config.maintenanceMode ? '✅' : '⚠️' }); }}
            className={`relative inline-flex w-12 cursor-pointer items-center rounded-full transition-colors ${config.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${config.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
