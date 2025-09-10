import { StoreSettings } from "@/components/settings/StoreSettings";
import { SystemSettings } from "@/components/settings/SystemSettings";
import { PrinterSettings } from "@/components/settings/PrinterSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Settings as SettingsIcon, Printer } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-card p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">الإعدادات</h1>
        
        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="store" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              إعدادات المتجر
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              إعدادات النظام
            </TabsTrigger>
            <TabsTrigger value="printer" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              إعدادات الطابعة
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="store">
            <StoreSettings />
          </TabsContent>
          
          <TabsContent value="system">
            <SystemSettings />
          </TabsContent>
          
          <TabsContent value="printer">
            <PrinterSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;