import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle, Video, Users, DollarSign, Award, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function BecomeInstructor() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInstructor, applyAsInstructor, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    expertise: [''],
    website: '',
    linkedin: '',
    github: '',
    twitter: ''
  });

  const handleExpertiseChange = (index: number, value: string) => {
    const newExpertise = [...formData.expertise];
    newExpertise[index] = value;
    setFormData({ ...formData, expertise: newExpertise });
  };

  const addExpertise = () => {
    setFormData({ ...formData, expertise: [...formData.expertise, ''] });
  };

  const removeExpertise = (index: number) => {
    const newExpertise = formData.expertise.filter((_, i) => i !== index);
    setFormData({ ...formData, expertise: newExpertise });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.bio || formData.bio.length < 50) {
        toast.error('Vui lòng viết giới thiệu ít nhất 50 ký tự');
        return;
      }

      const validExpertise = formData.expertise.filter(e => e.trim() !== '');
      if (validExpertise.length === 0) {
        toast.error('Vui lòng thêm ít nhất một lĩnh vực chuyên môn');
        return;
      }

      const result = await applyAsInstructor({
        bio: formData.bio,
        expertise: validExpertise,
        socialLinks: {
          website: formData.website || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
          twitter: formData.twitter || undefined
        }
      });

      if (result.success) {
        toast.success(result.message);
        navigate('/account');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="mb-4">Trở thành Giảng viên</h1>
          <p className="text-gray-600 mb-8">
            Vui lòng đăng nhập để đăng ký trở thành giảng viên
          </p>
          <Button onClick={() => openAuthModal('login')} size="lg">
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  if (isInstructor) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="mb-4">Bạn đã là Giảng viên!</h1>
          <p className="text-gray-600 mb-8">
            Bạn có thể bắt đầu tạo và quản lý khóa học của mình
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/instructor')} size="lg">
              Đi tới Dashboard
            </Button>
            <Button onClick={() => navigate('/instructor/create-course')} variant="outline" size="lg">
              Tạo khóa học mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.instructorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="mb-4">Đơn đăng ký đang được xem xét</h1>
          <p className="text-gray-600 mb-8">
            Chúng tôi đang xem xét đơn đăng ký giảng viên của bạn. Quá trình này thường mất 24-48 giờ.
            Chúng tôi sẽ thông báo cho bạn qua email khi có kết quả.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Quay về Trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="mb-2">Trở thành Giảng viên</h1>
          <p className="text-gray-600">Chia sẻ kiến thức của bạn với hàng nghìn học viên</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Tạo khóa học</h3>
              <p className="text-sm text-gray-600">Dễ dàng tạo và quản lý khóa học</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Tiếp cận học viên</h3>
              <p className="text-sm text-gray-600">Kết nối với hàng nghìn học viên</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Thu nhập ổn định</h3>
              <p className="text-sm text-gray-600">Kiếm tiền từ kiến thức của bạn</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">Xây dựng thương hiệu</h3>
              <p className="text-sm text-gray-600">Trở thành chuyên gia trong lĩnh vực</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn đăng ký Giảng viên</CardTitle>
            <CardDescription>
              Vui lòng điền đầy đủ thông tin để chúng tôi xem xét đơn đăng ký của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div>
                <Label htmlFor="bio">Giới thiệu về bạn *</Label>
                <Textarea
                  id="bio"
                  placeholder="Hãy cho chúng tôi biết về kinh nghiệm, thành tựu và lý do bạn muốn trở thành giảng viên..."
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/50 ký tự tối thiểu
                </p>
              </div>

              {/* Expertise */}
              <div>
                <Label>Lĩnh vực chuyên môn *</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Thêm các lĩnh vực bạn có chuyên môn để giảng dạy
                </p>
                <div className="space-y-3">
                  {formData.expertise.map((exp, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="VD: UX Design, Figma, User Research..."
                        value={exp}
                        onChange={(e) => handleExpertiseChange(index, e.target.value)}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeExpertise(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExpertise}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm chuyên môn
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <Label>Liên kết mạng xã hội</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Giúp học viên tìm hiểu thêm về bạn (không bắt buộc)
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="website" className="text-sm">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://your-website.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/your-profile"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="github" className="text-sm">GitHub</Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/your-username"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="text-sm">Twitter/X</Label>
                    <Input
                      id="twitter"
                      type="url"
                      placeholder="https://twitter.com/your-handle"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Điều khoản Giảng viên</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Bạn cam kết cung cấp nội dung chất lượng cao và đúng pháp luật</li>
                  <li>• Khóa học phải tuân thủ các tiêu chuẩn nội dung của EduCourse</li>
                  <li>• Bạn giữ quyền sở hữu trí tuệ của nội dung</li>
                  <li>• EduCourse thu hoa hồng 30% trên doanh số khóa học</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Gửi đơn đăng ký'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}