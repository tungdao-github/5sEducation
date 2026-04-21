"use client";

import { useState } from 'react';
import { useNavigate } from '@/figma/compat/router';
import { useInstructor } from '../contexts/InstructorContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Upload, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '@/figma/compat/sonner';
import { InstructorCourse, CurriculumSection, CurriculumLesson } from '../contexts/InstructorContext';
import { categories } from '../data/courses';

export default function CourseCreator() {
  const navigate = useNavigate();
  const { createCourse } = useInstructor();
  const { isInstructor } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<InstructorCourse>>({
    title: '',
    description: '',
    category: categories[1],
    level: 'CÆ¡ báº£n',
    price: 0,
    originalPrice: 0,
    duration: '',
    lessons: 0,
    learningOutcomes: [''],
    requirements: [''],
    curriculum: [],
    status: 'draft'
  });

  const [currentSection, setCurrentSection] = useState<Partial<CurriculumSection> | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Partial<CurriculumLesson> | null>(null);

  if (!isInstructor) {
    navigate('/');
    return null;
  }

  const handleInputChange = (field: keyof InstructorCourse, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'learningOutcomes' | 'requirements', index: number, value: string) => {
    const newArray = [...(formData[field] || [''])];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'learningOutcomes' | 'requirements') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field: 'learningOutcomes' | 'requirements', index: number) => {
    const newArray = (formData[field] || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addSection = () => {
    if (currentSection && currentSection.title) {
      const newSection: CurriculumSection = {
        id: `section-${Date.now()}`,
        title: currentSection.title,
        duration: currentSection.duration || '0 phÃºt',
        lessons: currentSection.lessons || []
      };
      setFormData(prev => ({
        ...prev,
        curriculum: [...(prev.curriculum || []), newSection]
      }));
      setCurrentSection(null);
      toast.success('ÄÃ£ thÃªm chÆ°Æ¡ng');
    }
  };

  const addLesson = (sectionId: string) => {
    if (currentLesson && currentLesson.title) {
      const newLesson: CurriculumLesson = {
        id: `lesson-${Date.now()}`,
        title: currentLesson.title,
        duration: currentLesson.duration || '0 phÃºt',
        type: currentLesson.type || 'video',
        free: currentLesson.free || false
      };
      setFormData(prev => ({
        ...prev,
        curriculum: (prev.curriculum || []).map(section =>
          section.id === sectionId
            ? { ...section, lessons: [...section.lessons, newLesson] }
            : section
        )
      }));
      setCurrentLesson(null);
      toast.success('ÄÃ£ thÃªm bÃ i há»c');
    }
  };

  const removeSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      curriculum: (prev.curriculum || []).filter(s => s.id !== sectionId)
    }));
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    setFormData(prev => ({
      ...prev,
      curriculum: (prev.curriculum || []).map(section =>
        section.id === sectionId
          ? { ...section, lessons: section.lessons.filter(l => l.id !== lessonId) }
          : section
      )
    }));
  };

  const handleSubmit = async (saveAsDraft: boolean = true) => {
    setLoading(true);
    try {
      if (!formData.title || !formData.description) {
        toast.error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ tiÃªu Ä‘á» vÃ  mÃ´ táº£');
        return;
      }
      if (!formData.price || formData.price <= 0) {
        toast.error('Vui lÃ²ng nháº­p giÃ¡ khÃ³a há»c há»£p lá»‡');
        return;
      }
      const cleanedData = {
        ...formData,
        learningOutcomes: (formData.learningOutcomes || []).filter(item => item.trim() !== ''),
        requirements: (formData.requirements || []).filter(item => item.trim() !== ''),
        status: saveAsDraft ? 'draft' : 'pending'
      } as Omit<InstructorCourse, 'id' | 'numericId' | 'createdAt' | 'students' | 'rating' | 'revenue'>;

      const totalLessons = (cleanedData.curriculum || []).reduce(
        (sum, section) => sum + section.lessons.length, 0
      );
      cleanedData.lessons = totalLessons;

      const result = await createCourse(cleanedData);
      if (result.success) {
        toast.success(result.message);
        navigate('/instructor');
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/instructor')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay láº¡i Dashboard
          </Button>
          <h1 className="mb-2">Táº¡o khÃ³a há»c má»›i</h1>
          <p className="text-gray-600">Äiá»n thÃ´ng tin Ä‘á»ƒ táº¡o khÃ³a há»c cá»§a báº¡n</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>ThÃ´ng tin cÆ¡ báº£n</CardTitle>
              <CardDescription>ThÃ´ng tin chÃ­nh vá» khÃ³a há»c</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">TiÃªu Ä‘á» khÃ³a há»c *</Label>
                <Input
                  id="title"
                  placeholder="VD: Mastering Figma tá»« A-Z"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">MÃ´ táº£ khÃ³a há»c *</Label>
                <Textarea
                  id="description"
                  placeholder="MÃ´ táº£ chi tiáº¿t vá» ná»™i dung vÃ  lá»£i Ã­ch cá»§a khÃ³a há»c..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Danh má»¥c *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'Táº¥t cáº£').map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cáº¥p Ä‘á»™ *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange('level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CÆ¡ báº£n">CÆ¡ báº£n</SelectItem>
                      <SelectItem value="Trung cáº¥p">Trung cáº¥p</SelectItem>
                      <SelectItem value="NÃ¢ng cao">NÃ¢ng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">GiÃ¡ bÃ¡n (VNÄ) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="299000"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">GiÃ¡ gá»‘c (VNÄ)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="399000"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Thá»i lÆ°á»£ng</Label>
                  <Input
                    id="duration"
                    placeholder="VD: 8 giá»"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">URL Thumbnail</Label>
                <div className="flex gap-2">
                  <Input
                    id="thumbnail"
                    placeholder="https://..."
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  />
                  <Button variant="outline" type="button">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                {formData.thumbnail && (
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="mt-2 w-full h-40 object-cover rounded"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle>Má»¥c tiÃªu há»c táº­p</CardTitle>
              <CardDescription>Há»c viÃªn sáº½ há»c Ä‘Æ°á»£c gÃ¬ tá»« khÃ³a há»c nÃ y?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(formData.learningOutcomes || ['']).map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Má»¥c tiÃªu ${index + 1}`}
                    value={outcome}
                    onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                  />
                  {index > 0 && (
                    <Button type="button" variant="outline" size="icon"
                      onClick={() => removeArrayItem('learningOutcomes', index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm"
                onClick={() => addArrayItem('learningOutcomes')} className="gap-2">
                <Plus className="w-4 h-4" />ThÃªm má»¥c tiÃªu
              </Button>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>YÃªu cáº§u</CardTitle>
              <CardDescription>Há»c viÃªn cáº§n cÃ³ gÃ¬ trÆ°á»›c khi tham gia?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(formData.requirements || ['']).map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`YÃªu cáº§u ${index + 1}`}
                    value={req}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  />
                  {index > 0 && (
                    <Button type="button" variant="outline" size="icon"
                      onClick={() => removeArrayItem('requirements', index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm"
                onClick={() => addArrayItem('requirements')} className="gap-2">
                <Plus className="w-4 h-4" />ThÃªm yÃªu cáº§u
              </Button>
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>ChÆ°Æ¡ng trÃ¬nh há»c</CardTitle>
              <CardDescription>Cáº¥u trÃºc ná»™i dung khÃ³a há»c</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.curriculum || []).map((section) => (
                <div key={section.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div>
                        <h4 className="font-semibold">{section.title}</h4>
                        <p className="text-sm text-gray-600">
                          {section.lessons.length} bÃ i há»c â€¢ {section.duration}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => removeSection(section.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="ml-6 space-y-2">
                    {section.lessons.map((lesson) => (
                      <div key={lesson.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 text-sm">
                          <span>{lesson.type === 'video' ? 'ðŸ“¹' : lesson.type === 'document' ? 'ðŸ“„' : 'â“'}</span>
                          <span>{lesson.title}</span>
                          <span className="text-gray-500">â€¢ {lesson.duration}</span>
                          {lesson.free && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Miá»…n phÃ­</span>
                          )}
                        </div>
                        <Button type="button" variant="ghost" size="sm"
                          onClick={() => removeLesson(section.id, lesson.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="TiÃªu Ä‘á» bÃ i há»c"
                        value={currentLesson?.title || ''}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                      />
                      <Input
                        placeholder="Thá»i lÆ°á»£ng"
                        className="w-24"
                        value={currentLesson?.duration || ''}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, duration: e.target.value })}
                      />
                      <Button type="button" size="sm" onClick={() => addLesson(section.id)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
                <h4 className="font-medium">ThÃªm chÆ°Æ¡ng má»›i</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="TiÃªu Ä‘á» chÆ°Æ¡ng"
                    value={currentSection?.title || ''}
                    onChange={(e) => setCurrentSection({ ...currentSection, title: e.target.value })}
                  />
                  <Input
                    placeholder="Thá»i lÆ°á»£ng"
                    className="w-32"
                    value={currentSection?.duration || ''}
                    onChange={(e) => setCurrentSection({ ...currentSection, duration: e.target.value })}
                  />
                  <Button type="button" onClick={addSection}>
                    <Plus className="w-4 h-4 mr-2" />ThÃªm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t">
            <Button variant="outline" onClick={() => navigate('/instructor')} disabled={loading}>
              Há»§y
            </Button>
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
              LÆ°u nhÃ¡p
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={loading}>
              {loading ? 'Äang xá»­ lÃ½...' : 'Gá»­i Ä‘á»ƒ phÃª duyá»‡t'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
