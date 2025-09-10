import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Moon, Sun, Bell, AlertTriangle } from "lucide-react";

export const SystemSettings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoBackup: true,
    lowStockAlerts: true,
    soundEffects: true,
  });

  const { toast } = useToast();

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    
    if (setting === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
    }

    toast({
      title: "تم تحديث الإعداد",
      description: `تم ${value ? 'تفعيل' : 'إلغاء'} ${getSettingName(setting)}`,
    });
  };

  const getSettingName = (setting: string) => {
    const names: Record<string, string> = {
      darkMode: "الوضع المظلم",
      notifications: "الإشعارات",
      autoBackup: "النسخ الاحتياطي التلقائي",
      lowStockAlerts: "تنبيهات المخزون المنخفض",
      soundEffects: "الأصوات",
    };
    return names[setting] || setting;
  };

  const exportData = () => {
    toast({
      title: "جاري تصدير البيانات",
      description: "سيتم تحميل ملف البيانات قريباً",
    });
    // In a real app, this would export data to CSV/Excel
  };

  const clearCache = () => {
    localStorage.clear();
    toast({
      title: "تم مسح التخزين المؤقت",
      description: "تم مسح جميع البيانات المؤقتة",
    });
  };

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات المظهر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label htmlFor="darkMode">الوضع المظلم</Label>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="soundEffects">الأصوات والتنبيهات</Label>
            </div>
            <Switch
              id="soundEffects"
              checked={settings.soundEffects}
              onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="notifications">تفعيل الإشعارات</Label>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <Label htmlFor="lowStockAlerts">تنبيهات المخزون المنخفض</Label>
            </div>
            <Switch
              id="lowStockAlerts"
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => handleSettingChange('lowStockAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>إدارة البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>النسخ الاحتياطي التلقائي</Label>
              <p className="text-sm text-muted-foreground">
                إنشاء نسخة احتياطية من البيانات يومياً
              </p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <Button onClick={exportData} variant="outline" className="w-full">
              تصدير البيانات
            </Button>
            <Button onClick={clearCache} variant="outline" className="w-full">
              مسح التخزين المؤقت
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>معلومات النظام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">إصدار النظام:</span>
            <Badge variant="secondary">v1.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">آخر تحديث:</span>
            <span>{new Date().toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">قاعدة البيانات:</span>
            <Badge variant="secondary" className="text-success">متصلة</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">حالة النظام:</span>
            <Badge variant="secondary" className="text-success">يعمل بشكل طبيعي</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};