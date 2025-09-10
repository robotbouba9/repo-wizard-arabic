import { useState } from "react";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { SaleDetails } from "@/components/sales/SaleDetails";
import { SalesStats } from "@/components/sales/SalesStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, BarChart3 } from "lucide-react";

const Sales = () => {
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-card p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">إدارة المبيعات</h1>
        
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              تاريخ المبيعات
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              الإحصائيات
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesHistory onSelectSale={setSelectedSaleId} />
              </div>
              <div className="lg:col-span-1">
                {selectedSaleId && <SaleDetails saleId={selectedSaleId} />}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <SalesStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Sales;