import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SalesHistoryProps {
  onSelectSale?: (saleId: string) => void;
  limit?: number;
}

export const SalesHistory = ({ onSelectSale, limit = 10 }: SalesHistoryProps) => {
  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            آخر المبيعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          آخر المبيعات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!sales || sales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مبيعات بعد
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{sale.sale_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(sale.sale_date), 'dd MMM yyyy HH:mm', { locale: ar })}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {Number(sale.final_amount).toFixed(2)} ريال
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {sale.sale_items?.length || 0} منتج
                    {sale.customer_name && (
                      <span className="mr-2">• {sale.customer_name}</span>
                    )}
                  </div>
                  
                  {onSelectSale && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectSale(sale.id)}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      عرض
                    </Button>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {sale.sale_items?.slice(0, 3).map((item) => (
                    <Badge key={item.id} variant="secondary" className="text-xs">
                      {item.product_name} ({item.quantity})
                    </Badge>
                  ))}
                  {sale.sale_items && sale.sale_items.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{sale.sale_items.length - 3} المزيد
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};