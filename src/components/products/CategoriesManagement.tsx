import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Palette } from "lucide-react";

export const CategoriesManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366f1"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('categories')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الفئة بنجاح",
        description: "تم حفظ الفئة في قاعدة البيانات",
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة الفئة",
        description: error.message || "حدث خطأ أثناء حفظ الفئة",
        variant: "destructive",
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الفئة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الفئة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الفئة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف الفئة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#6366f1" });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color
    });
    setShowForm(true);
  };

  const colorOptions = [
    "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", 
    "#ef4444", "#ec4899", "#84cc16", "#f97316", "#6b7280"
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>
              {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الفئة</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم الفئة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>اللون</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-primary' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف الفئة (اختياري)"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                  {editingCategory ? "تحديث" : "إضافة"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>الفئات المتاحة</CardTitle>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة فئة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فئات بعد
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-semibold">{category.name}</h3>
                      </div>
                      
                      {category.description && (
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(category)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 ml-1" />
                          تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};