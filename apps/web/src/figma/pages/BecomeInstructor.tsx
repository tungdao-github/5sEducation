"use client";

import { useState } from 'react';
import { useNavigate } from '@/figma/compat/router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle, Video, Users, DollarSign, Award, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from '@/figma/compat/sonner';

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
        toast.error('Vui lÃ²ng viáº¿t giá»›i thiá»‡u Ã­t nháº¥t 50 kÃ½ tá»±');
        return;
      }

      const validExpertise = formData.expertise.filter(e => e.trim() !== '');
      if (validExpertise.length === 0) {
        toast.error('Vui lÃ²ng thÃªm Ã­t nháº¥t má»™t lÄ©nh vá»±c chuyÃªn mÃ´n');
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
      toast.error('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i!');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="mb-4">Trá»Ÿ thÃ nh Giáº£ng viÃªn</h1>
          <p className="text-gray-600 mb-8">
            Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ Ä‘Äƒng kÃ½ trá»Ÿ thÃ nh giáº£ng viÃªn
          </p>
          <Button onClick={() => openAuthModal('login')} size="lg">
            ÄÄƒng nháº­p
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
          <h1 className="mb-4">Báº¡n Ä‘Ã£ lÃ  Giáº£ng viÃªn!</h1>
          <p className="text-gray-600 mb-8">
            Báº¡n cÃ³ thá»ƒ báº¯t Ä‘áº§u táº¡o vÃ  quáº£n lÃ½ khÃ³a há»c cá»§a mÃ¬nh
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/instructor')} size="lg">
              Äi tá»›i Dashboard
            </Button>
            <Button onClick={() => navigate('/instructor/create-course')} variant="outline" size="lg">
              Táº¡o khÃ³a há»c má»›i
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
          <h1 className="mb-4">ÄÆ¡n Ä‘Äƒng kÃ½ Ä‘ang Ä‘Æ°á»£c xem xÃ©t</h1>
          <p className="text-gray-600 mb-8">
            ChÃºng tÃ´i Ä‘ang xem xÃ©t Ä‘Æ¡n Ä‘Äƒng kÃ½ giáº£ng viÃªn cá»§a báº¡n. QuÃ¡ trÃ¬nh nÃ y thÆ°á»ng máº¥t 24-48 giá».
            ChÃºng tÃ´i sáº½ thÃ´ng bÃ¡o cho báº¡n qua email khi cÃ³ káº¿t quáº£.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Quay vá» Trang chá»§
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
            Quay láº¡i
          </Button>
          <h1 className="mb-2">Trá»Ÿ thÃ nh Giáº£ng viÃªn</h1>
          <p className="text-gray-600">Chia sáº» kiáº¿n thá»©c cá»§a báº¡n vá»›i hÃ ng nghÃ¬n há»c viÃªn</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Táº¡o khÃ³a há»c</h3>
              <p className="text-sm text-gray-600">Dá»… dÃ ng táº¡o vÃ  quáº£n lÃ½ khÃ³a há»c</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Tiáº¿p cáº­n há»c viÃªn</h3>
              <p className="text-sm text-gray-600">Káº¿t ná»‘i vá»›i hÃ ng nghÃ¬n há»c viÃªn</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Thu nháº­p á»•n Ä‘á»‹nh</h3>
              <p className="text-sm text-gray-600">Kiáº¿m tiá»n tá»« kiáº¿n thá»©c cá»§a báº¡n</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">XÃ¢y dá»±ng thÆ°Æ¡ng hiá»‡u</h3>
              <p className="text-sm text-gray-600">Trá»Ÿ thÃ nh chuyÃªn gia trong lÄ©nh vá»±c</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>ÄÆ¡n Ä‘Äƒng kÃ½ Giáº£ng viÃªn</CardTitle>
            <CardDescription>
              Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin Ä‘á»ƒ chÃºng tÃ´i xem xÃ©t Ä‘Æ¡n Ä‘Äƒng kÃ½ cá»§a báº¡n
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div>
                <Label htmlFor="bio">Giá»›i thiá»‡u vá» báº¡n *</Label>
                <Textarea
                  id="bio"
                  placeholder="HÃ£y cho chÃºng tÃ´i biáº¿t vá» kinh nghiá»‡m, thÃ nh tá»±u vÃ  lÃ½ do báº¡n muá»‘n trá»Ÿ thÃ nh giáº£ng viÃªn..."
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/50 kÃ½ tá»± tá»‘i thiá»ƒu
                </p>
              </div>

              {/* Expertise */}
              <div>
                <Label>LÄ©nh vá»±c chuyÃªn mÃ´n *</Label>
                <p className="text-sm text-gray-500 mb-3">
                  ThÃªm cÃ¡c lÄ©nh vá»±c báº¡n cÃ³ chuyÃªn mÃ´n Ä‘á»ƒ giáº£ng dáº¡y
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
                    ThÃªm chuyÃªn mÃ´n
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <Label>LiÃªn káº¿t máº¡ng xÃ£ há»™i</Label>
                <p className="text-sm text-gray-500 mb-3">
                  GiÃºp há»c viÃªn tÃ¬m hiá»ƒu thÃªm vá» báº¡n (khÃ´ng báº¯t buá»™c)
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
                <h4 className="font-semibold text-blue-900 mb-2">Äiá»u khoáº£n Giáº£ng viÃªn</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>â€¢ Báº¡n cam káº¿t cung cáº¥p ná»™i dung cháº¥t lÆ°á»£ng cao vÃ  Ä‘Ãºng phÃ¡p luáº­t</li>
                  <li>â€¢ KhÃ³a há»c pháº£i tuÃ¢n thá»§ cÃ¡c tiÃªu chuáº©n ná»™i dung cá»§a EduCourse</li>
                  <li>â€¢ Báº¡n giá»¯ quyá»n sá»Ÿ há»¯u trÃ­ tuá»‡ cá»§a ná»™i dung</li>
                  <li>â€¢ EduCourse thu hoa há»“ng 30% trÃªn doanh sá»‘ khÃ³a há»c</li>
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
                  Há»§y
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Äang xá»­ lÃ½...' : 'Gá»­i Ä‘Æ¡n Ä‘Äƒng kÃ½'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}