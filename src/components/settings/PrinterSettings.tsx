import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Printer, Wifi, Usb, TestTube } from "lucide-react";

export const PrinterSettings = () => {
  const [printerSettings, setPrinterSettings] = useState({
    printerType: "thermal",
    connectionType: "usb",
    ipAddress: "192.168.1.100",
    port: "9100",
    paperWidth: "80",
    autoCut: true,
    printDuplicate: false,
    buzzer: true,
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const { toast } = useToast();

  const handleSettingChange = (setting: string, value: any) => {
    setPrinterSettings(prev => ({ ...prev, [setting]: value }));
  };

  const testPrinter = () => {
    setConnectionStatus('testing');
    
    // Simulate printer test
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      if (isSuccess) {
        setConnectionStatus('connected');
        toast({
          title: "تم اختبار الطابعة بنجاح",
          description: "الطابعة متصلة وتعمل بشكل طبيعي",
        });
        // In a real app, this would send a test print
        printTestReceipt();
      } else {
        setConnectionStatus('disconnected');
        toast({
          title: "فشل في الاتصال بالطابعة",
          description: "تأكد من إعدادات الاتصال وحاول مرة أخرى",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const printTestReceipt = () => {
    const testReceipt = `
=================================
        اختبار الطابعة
=================================
متجر الهواتف
العنوان: شارع الملك فهد، الرياض
الهاتف: 0112345678

التاريخ: ${new Date().toLocaleDateString('ar-SA')}
الوقت: ${new Date().toLocaleTimeString('ar-SA')}

=================================
         فاتورة اختبار
=================================
منتج تجريبي         1 × 100.00 ريال
                        ----------
الإجمالي:                100.00 ريال
الضريبة (15%):           15.00 ريال
                        ----------
المجموع:                 115.00 ريال

طريقة الدفع: نقدي

=================================
    شكراً لتسوقكم معنا
=================================
    `;
    
    console.log("Test Receipt:", testReceipt);
    // In a real app, this would be sent to the thermal printer
  };

  const saveSettings = () => {
    toast({
      title: "تم حفظ إعدادات الطابعة",
      description: "تم تحديث جميع إعدادات الطابعة بنجاح",
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Settings */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              إعدادات الاتصال
            </CardTitle>
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
              className={connectionStatus === 'connected' ? 'bg-success text-success-foreground' : ''}
            >
              {connectionStatus === 'connected' && 'متصلة'}
              {connectionStatus === 'disconnected' && 'غير متصلة'}
              {connectionStatus === 'testing' && 'جاري الاختبار...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="printerType">نوع الطابعة</Label>
              <Select 
                value={printerSettings.printerType} 
                onValueChange={(value) => handleSettingChange('printerType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">طابعة حرارية</SelectItem>
                  <SelectItem value="inkjet">طابعة نفث الحبر</SelectItem>
                  <SelectItem value="laser">طابعة ليزر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connectionType">نوع الاتصال</Label>
              <Select 
                value={printerSettings.connectionType} 
                onValueChange={(value) => handleSettingChange('connectionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usb">
                    <div className="flex items-center gap-2">
                      <Usb className="h-4 w-4" />
                      USB
                    </div>
                  </SelectItem>
                  <SelectItem value="network">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      شبكة (IP)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {printerSettings.connectionType === 'network' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ipAddress">عنوان IP</Label>
                <Input
                  id="ipAddress"
                  value={printerSettings.ipAddress}
                  onChange={(e) => handleSettingChange('ipAddress', e.target.value)}
                  placeholder="192.168.1.100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">المنفذ</Label>
                <Input
                  id="port"
                  value={printerSettings.port}
                  onChange={(e) => handleSettingChange('port', e.target.value)}
                  placeholder="9100"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={testPrinter} 
              disabled={connectionStatus === 'testing'}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {connectionStatus === 'testing' ? 'جاري الاختبار...' : 'اختبار الطابعة'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Settings */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>إعدادات الطباعة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paperWidth">عرض الورق (مم)</Label>
            <Select 
              value={printerSettings.paperWidth} 
              onValueChange={(value) => handleSettingChange('paperWidth', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="58">58 مم</SelectItem>
                <SelectItem value="80">80 مم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>القطع التلقائي للورق</Label>
                <p className="text-sm text-muted-foreground">
                  قطع الورق تلقائياً بعد كل فاتورة
                </p>
              </div>
              <Switch
                checked={printerSettings.autoCut}
                onCheckedChange={(checked) => handleSettingChange('autoCut', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>طباعة نسخة مكررة</Label>
                <p className="text-sm text-muted-foreground">
                  طباعة نسختين من كل فاتورة
                </p>
              </div>
              <Switch
                checked={printerSettings.printDuplicate}
                onCheckedChange={(checked) => handleSettingChange('printDuplicate', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>صوت التنبيه</Label>
                <p className="text-sm text-muted-foreground">
                  تشغيل صوت تنبيه عند اكتمال الطباعة
                </p>
              </div>
              <Switch
                checked={printerSettings.buzzer}
                onCheckedChange={(checked) => handleSettingChange('buzzer', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printer Information */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>معلومات الطابعة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">الطابعة الحالية:</span>
            <span>طابعة حرارية 80 مم</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">حالة الاتصال:</span>
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
              className={connectionStatus === 'connected' ? 'bg-success text-success-foreground' : ''}
            >
              {connectionStatus === 'connected' ? 'متصلة' : 'غير متصلة'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">آخر طباعة:</span>
            <span>منذ 5 دقائق</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">عدد الفواتير المطبوعة اليوم:</span>
            <span>24 فاتورة</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="bg-gradient-primary">
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
};