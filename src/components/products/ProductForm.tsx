import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  onSuccess?: () => void;
}

export const ProductForm = ({ onSuccess }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock_quantity: "",
    min_stock_level: "5",
    barcode: "",
    category_id: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
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

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('products')
        .insert([{
          ...data,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          stock_quantity: parseInt(data.stock_quantity) || 0,
          min_stock_level: parseInt(data.min_stock_level) || 5,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة المنتج بنجاح",
        description: "تم حفظ المنتج في قاعدة البيانات",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFormData({
        name: "",
        description: "",
        price: "",
        cost: "",
        stock_quantity: "",
        min_stock_level: "5",
        barcode: "",
        category_id: "",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة المنتج",
        description: error.message || "حدث خطأ أثناء حفظ المنتج",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنتج *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="أدخل اسم المنتج"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">الفئة</Label>
          <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">سعر البيع *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">سعر التكلفة</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => handleInputChange('cost', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">الكمية في المخزون</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStock">الحد الأدنى للمخزون</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.min_stock_level}
            onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
            placeholder="5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">الباركود</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => handleInputChange('barcode', e.target.value)}
            placeholder="امسح أو أدخل الباركود"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="وصف المنتج (اختياري)"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={createProductMutation.isPending} className="flex-1">
          {createProductMutation.isPending ? "جاري الحفظ..." : "حفظ المنتج"}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess} className="flex-1">
          إلغاء
        </Button>
      </div>
    </form>
  );
};