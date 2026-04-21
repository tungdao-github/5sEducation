import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, User as UserType } from '../../contexts/AuthContext';

export default function InstructorsTab() {
  const { getPendingInstructors, approveInstructor, rejectInstructor } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState<string | null>(null);

  const pendingInstructors = getPendingInstructors();

  const handleApprove = async (userId: string) => {
    setLoading(userId);
    try {
      const result = await approveInstructor(userId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi phê duyệt');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setLoading(userId);
    try {
      const result = await rejectInstructor(userId);
      if (result.success) {
        toast.error(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi từ chối');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { variant: 'secondary' as const, icon: <Clock className="w-3 h-3" />, label: 'Chờ duyệt' },
      approved: { variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" />, label: 'Đã duyệt' },
      rejected: { variant: 'destructive' as const, icon: <XCircle className="w-3 h-3" />, label: 'Từ chối' }
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const filteredApplications = filterStatus === 'pending' ? pendingInstructors : [];

  const stats = {
    total: pendingInstructors.length,
    pending: pendingInstructors.length,
    approved: 0,
    rejected: 0
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng đơn</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Chờ duyệt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Đã duyệt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Từ chối</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Đơn đăng ký Giảng viên</CardTitle>
              <CardDescription>Xem xét và phê duyệt giảng viên mới ({stats.pending} đơn chờ duyệt)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">Không có đơn nào</h3>
              <p className="text-gray-500">Chưa có đơn đăng ký chờ duyệt</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{app.name}</h3>
                          {getStatusBadge(app.instructorStatus || 'pending')}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.joinDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(app.id)}
                        disabled={loading === app.id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(app.id)}
                        disabled={loading === app.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {loading === app.id ? 'Đang xử lý...' : 'Phê duyệt'}
                      </Button>
                    </div>
                  </div>

                  {/* Bio */}
                  {app.bio && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Giới thiệu</h4>
                      <p className="text-sm text-gray-600">{app.bio}</p>
                    </div>
                  )}

                  {/* Expertise */}
                  {app.expertise && app.expertise.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Chuyên môn</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {app.socialLinks && Object.keys(app.socialLinks).length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Liên kết</h4>
                      <div className="flex flex-wrap gap-3">
                        {app.socialLinks.website && (
                          <a
                            href={app.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Website
                          </a>
                        )}
                        {app.socialLinks.linkedin && (
                          <a
                            href={app.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                        {app.socialLinks.github && (
                          <a
                            href={app.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            GitHub
                          </a>
                        )}
                        {app.socialLinks.twitter && (
                          <a
                            href={app.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
