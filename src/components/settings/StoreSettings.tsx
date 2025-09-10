import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Store } from "lucide-react";

export const StoreSettings = () => {
  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    store_phone: "",
    tax_rate: "",
    currency: "",
    receipt_footer: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*');
      if (error) throw error;
      
      // Convert array to object for easier handling
      const settingsObj = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      return settingsObj;
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.store_name || "",
        store_address: settings.store_address || "",
        store_phone: settings.store_phone || "",
        tax_rate: settings.tax_rate || "",
        currency: settings.currency || "",
        receipt_footer: settings.receipt_footer || "",
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const updates = Object.entries(data).map(([key, value]) => ({ key, value }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم تحديث إعدادات المتجر",
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: error.message || "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          إعدادات المتجر
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">اسم المتجر</Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) => handleInputChange('store_name', e.target.value)}
                placeholder="أدخل اسم المتجر"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_phone">رقم هاتف المتجر</Label>
              <Input
                id="store_phone"
                value={formData.store_phone}
                onChange={(e) => handleInputChange('store_phone', e.target.value)}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store_address">عنوان المتجر</Label>
            <Textarea
              id="store_address"
              value={formData.store_address}
              onChange={(e) => handleInputChange('store_address', e.target.value)}
              placeholder="أدخل عنوان المتجر"
              rows={3}
            />
          </div>

          {/* Financial Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">الإعدادات المالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">معدل الضريبة (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => handleInputChange('tax_rate', e.target.value)}
                  placeholder="15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  placeholder="ريال"
                />
              </div>
            </div>
          </div>

          {/* Receipt Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">إعدادات الفاتورة</h3>
            <div className="space-y-2">
              <Label htmlFor="receipt_footer">نص أسفل الفاتورة</Label>
              <Textarea
                id="receipt_footer"
                value={formData.receipt_footer}
                onChange={(e) => handleInputChange('receipt_footer', e.target.value)}
                placeholder="شكراً لتسوقكم معنا"
                rows={2}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              disabled={updateSettingsMutation.isPending}
              className="bg-gradient-primary"
            >
              {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};