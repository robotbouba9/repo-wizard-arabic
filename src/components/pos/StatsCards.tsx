import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Receipt, AlertTriangle } from "lucide-react";

export const StatsCards = () => {
  // Today's sales
  const { data: todaySales } = useQuery({
    queryKey: ['stats', 'today-sales'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('sales')
        .select('final_amount')
        .gte('sale_date', today);
      
      if (error) throw error;
      return data.reduce((sum, sale) => sum + Number(sale.final_amount), 0);
    }
  });

  // Total products
  const { data: totalProducts } = useQuery({
    queryKey: ['stats', 'products'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Low stock products
  const { data: lowStockProducts } = useQuery({
    queryKey: ['stats', 'low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock_level')
        .eq('is_active', true);
      
      if (error) throw error;
      return data.filter(product => 
        product.stock_quantity <= product.min_stock_level
      );
    }
  });

  // This month sales
  const { data: monthSales } = useQuery({
    queryKey: ['stats', 'month-sales'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .gte('sale_date', startOfMonth.toISOString());
      
      if (error) throw error;
      return count || 0;
    }
  });

  const stats = [
    {
      title: "مبيعات اليوم",
      value: todaySales ? `${todaySales.toFixed(2)} ريال` : "0 ريال",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "إجمالي المنتجات",
      value: totalProducts?.toString() || "0",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "مبيعات الشهر",
      value: monthSales?.toString() || "0",
      icon: Receipt,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "مخزون منخفض",
      value: lowStockProducts?.length?.toString() || "0",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      badge: lowStockProducts && lowStockProducts.length > 0 ? lowStockProducts.length : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg relative`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
                {stat.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {stat.badge}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "مخزون منخفض" && lowStockProducts && lowStockProducts.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">منتجات تحتاج تجديد:</p>
                  <div className="flex flex-wrap gap-1">
                    {lowStockProducts.slice(0, 2).map((product) => (
                      <Badge key={product.id} variant="outline" className="text-xs">
                        {product.name.length > 15 
                          ? product.name.substring(0, 15) + '...' 
                          : product.name
                        } ({product.stock_quantity})
                      </Badge>
                    ))}
                    {lowStockProducts.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{lowStockProducts.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};