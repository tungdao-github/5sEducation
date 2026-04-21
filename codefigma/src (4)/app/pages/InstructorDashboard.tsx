import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInstructor } from '../contexts/InstructorContext';
import { Navigate, Link } from 'react-router';
import {
  BookOpen, Users, DollarSign, Star, TrendingUp, TrendingDown,
  Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export default function InstructorDashboard() {
  const { isInstructor, user } = useAuth();
  const { stats, courses } = useInstructor();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      published: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      draft: { variant: 'outline', icon: <FileText className="w-3 h-3" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> }
    };

    const statusLabels: Record<string, string> = {
      published: 'Đã xuất bản',
      pending: 'Chờ duyệt',
      draft: 'Nháp',
      rejected: 'Từ chối'
    };

    const config = variants[status] || variants.draft;

    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {statusLabels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Bảng điều khiển Giảng viên</h1>
          <p className="text-gray-600">
            Xin chào, <span className="font-semibold">{user?.name}</span>! Quản lý khóa học và theo dõi hiệu suất của bạn.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng khóa học</CardTitle>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.publishedCourses} đã xuất bản • {stats.draftCourses} nháp
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng học viên</CardTitle>
              <Users className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
              <div className="text-sm text-gray-500 mt-1">
                Trung bình {stats.publishedCourses > 0 ? Math.round(stats.totalStudents / stats.publishedCourses) : 0} học viên/khóa
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Doanh thu</CardTitle>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className="flex items-center gap-1 text-sm mt-1">
                {stats.revenueGrowth >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">+{stats.revenueGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">{stats.revenueGrowth.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-gray-500">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Đánh giá TB</CardTitle>
              <Star className="w-5 h-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="courses">Khóa học của tôi</TabsTrigger>
              <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            </TabsList>

            <Link to="/instructor/create-course">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo khóa học mới
              </Button>
            </Link>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Pending Reviews Alert */}
            {stats.pendingCourses > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900">
                        Bạn có {stats.pendingCourses} khóa học đang chờ phê duyệt
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Chúng tôi sẽ xem xét và phản hồi trong vòng 3-5 ngày làm việc.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Khóa học gần đây</CardTitle>
                <CardDescription>Các khóa học bạn đang làm việc</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">Chưa có khóa học nào</h3>
                    <p className="text-gray-500 mb-4">Bắt đầu tạo khóa học đầu tiên của bạn</p>
                    <Link to="/instructor/create-course">
                      <Button>Tạo khóa học mới</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{course.title}</h4>
                              {getStatusBadge(course.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{course.lessons} bài học</span>
                              <span>•</span>
                              <span>{course.students} học viên</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {course.rating > 0 ? course.rating.toFixed(1) : 'Chưa có'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link to={`/instructor/courses/${course.id}`}>
                          <Button variant="outline" size="sm">
                            Quản lý
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Gợi ý cải thiện</CardTitle>
                <CardDescription>Tối ưu hóa khóa học của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Thêm video giới thiệu</h4>
                      <p className="text-sm text-blue-700">
                        Khóa học có video giới thiệu thu hút nhiều học viên hơn 3 lần
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Cập nhật nội dung định kỳ</h4>
                      <p className="text-sm text-green-700">
                        Khóa học được cập nhật thường xuyên có tỷ lệ đánh giá cao hơn
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Tương tác với học viên</h4>
                      <p className="text-sm text-purple-700">
                        Trả lời câu hỏi và phản hồi giúp tăng sự hài lòng của học viên
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Tất cả khóa học</CardTitle>
                <CardDescription>Quản lý toàn bộ khóa học của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                {/* This will be expanded with full course management features */}
                <p className="text-gray-500 text-center py-8">
                  Chức năng quản lý chi tiết đang được phát triển...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết doanh thu</CardTitle>
                <CardDescription>Theo dõi thu nhập của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Tháng này</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(stats.thisMonthRevenue)}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Tháng trước</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.lastMonthRevenue)}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Tổng cộng</div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(stats.totalRevenue)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-center py-4">
                    Biểu đồ doanh thu chi tiết đang được phát triển...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}