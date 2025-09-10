import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";

export const SalesStats = () => {
  // Get sales statistics
  const { data: stats } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Yesterday's stats
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString();

      // This month stats
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const thisMonthISO = thisMonth.toISOString();

      // Last month stats
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthISO = lastMonth.toISOString();

      const [todayResult, yesterdayResult, thisMonthResult, lastMonthResult] = await Promise.all([
        supabase
          .from('sales')
          .select('final_amount')
          .gte('sale_date', todayISO),
        
        supabase
          .from('sales')
          .select('final_amount')
          .gte('sale_date', yesterdayISO)
          .lt('sale_date', todayISO),
        
        supabase
          .from('sales')
          .select('final_amount')
          .gte('sale_date', thisMonthISO),
        
        supabase
          .from('sales')
          .select('final_amount')
          .gte('sale_date', lastMonthISO)
          .lt('sale_date', thisMonthISO)
      ]);

      const todayTotal = todayResult.data?.reduce((sum, sale) => sum + Number(sale.final_amount), 0) || 0;
      const yesterdayTotal = yesterdayResult.data?.reduce((sum, sale) => sum + Number(sale.final_amount), 0) || 0;
      const thisMonthTotal = thisMonthResult.data?.reduce((sum, sale) => sum + Number(sale.final_amount), 0) || 0;
      const lastMonthTotal = lastMonthResult.data?.reduce((sum, sale) => sum + Number(sale.final_amount), 0) || 0;

      const todayCount = todayResult.data?.length || 0;
      const yesterdayCount = yesterdayResult.data?.length || 0;
      const thisMonthCount = thisMonthResult.data?.length || 0;
      const lastMonthCount = lastMonthResult.data?.length || 0;

      return {
        today: { total: todayTotal, count: todayCount },
        yesterday: { total: yesterdayTotal, count: yesterdayCount },
        thisMonth: { total: thisMonthTotal, count: thisMonthCount },
        lastMonth: { total: lastMonthTotal, count: lastMonthCount }
      };
    }
  });

  // Get top selling products
  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select('product_name, quantity, total_price')
        .order('quantity', { ascending: false });
      
      if (error) throw error;

      // Group by product name and sum quantities
      const productStats = data.reduce((acc, item) => {
        const name = item.product_name;
        if (!acc[name]) {
          acc[name] = { name, totalQuantity: 0, totalRevenue: 0 };
        }
        acc[name].totalQuantity += item.quantity;
        acc[name].totalRevenue += Number(item.total_price);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(productStats)
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);
    }
  });

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const dailyChange = stats ? calculatePercentageChange(stats.today.total, stats.yesterday.total) : 0;
  const monthlyChange = stats ? calculatePercentageChange(stats.thisMonth.total, stats.lastMonth.total) : 0;
  const dailyCountChange = stats ? calculatePercentageChange(stats.today.count, stats.yesterday.count) : 0;
  const monthlyCountChange = stats ? calculatePercentageChange(stats.thisMonth.count, stats.lastMonth.count) : 0;

  const StatCard = ({ title, value, change, isPositiveGood = true, icon: Icon, subtitle }: any) => {
    const isPositive = change > 0;
    const changeColor = isPositive 
      ? (isPositiveGood ? "text-success" : "text-destructive")
      : (isPositiveGood ? "text-destructive" : "text-success");
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="text-right">
              <Icon className="h-6 w-6 text-muted-foreground mb-2" />
              <div className={`flex items-center gap-1 ${changeColor}`}>
                <TrendIcon className="h-3 w-3" />
                <span className="text-sm font-medium">
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="مبيعات اليوم"
          value={stats ? `${stats.today.total.toFixed(2)} ريال` : "0 ريال"}
          change={dailyChange}
          icon={DollarSign}
          subtitle={`${stats?.today.count || 0} فاتورة`}
        />
        
        <StatCard
          title="مبيعات الشهر"
          value={stats ? `${stats.thisMonth.total.toFixed(2)} ريال` : "0 ريال"}
          change={monthlyChange}
          icon={TrendingUp}
          subtitle={`${stats?.thisMonth.count || 0} فاتورة`}
        />

        <StatCard
          title="عدد فواتير اليوم"
          value={stats?.today.count?.toString() || "0"}
          change={dailyCountChange}
          icon={Package}
          subtitle="مقارنة بالأمس"
        />

        <StatCard
          title="عدد فواتير الشهر"
          value={stats?.thisMonth.count?.toString() || "0"}
          change={monthlyCountChange}
          icon={Package}
          subtitle="مقارنة بالشهر الماضي"
        />
      </div>

      {/* Top Products */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
        </CardHeader>
        <CardContent>
          {!topProducts || topProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات مبيعات بعد
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product: any, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        تم بيع {product.totalQuantity} قطعة
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      {product.totalRevenue.toFixed(2)} ريال
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>مقارنة المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>اليوم</span>
              <span className="font-bold">{stats?.today.total.toFixed(2) || "0"} ريال</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>أمس</span>
              <span className="font-bold">{stats?.yesterday.total.toFixed(2) || "0"} ريال</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>هذا الشهر</span>
              <span className="font-bold">{stats?.thisMonth.total.toFixed(2) || "0"} ريال</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>الشهر الماضي</span>
              <span className="font-bold">{stats?.lastMonth.total.toFixed(2) || "0"} ريال</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>عدد الفواتير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>اليوم</span>
              <span className="font-bold">{stats?.today.count || 0} فاتورة</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>أمس</span>
              <span className="font-bold">{stats?.yesterday.count || 0} فاتورة</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>هذا الشهر</span>
              <span className="font-bold">{stats?.thisMonth.count || 0} فاتورة</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span>الشهر الماضي</span>
              <span className="font-bold">{stats?.lastMonth.count || 0} فاتورة</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};