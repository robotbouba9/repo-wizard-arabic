import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Receipt, Printer } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SaleDetailsProps {
  saleId: string;
}

export const SaleDetails = ({ saleId }: SaleDetailsProps) => {
  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale-details', saleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *
          )
        `)
        .eq('id', saleId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!saleId
  });

  const printReceipt = () => {
    if (!sale) return;
    
    const receiptContent = `
متجر الهواتف
================
رقم الفاتورة: ${sale.sale_number}
التاريخ: ${format(new Date(sale.sale_date), 'dd/MM/yyyy HH:mm', { locale: ar })}
${sale.customer_name ? `العميل: ${sale.customer_name}` : ''}
${sale.customer_phone ? `الهاتف: ${sale.customer_phone}` : ''}

================
${sale.sale_items?.map(item => `
${item.product_name}
${item.quantity} × ${Number(item.unit_price).toFixed(2)} = ${Number(item.total_price).toFixed(2)} ريال
`).join('')}

================
الإجمالي: ${Number(sale.total_amount).toFixed(2)} ريال
الضريبة (15%): ${Number(sale.tax_amount).toFixed(2)} ريال
${sale.discount_amount > 0 ? `الخصم: ${Number(sale.discount_amount).toFixed(2)} ريال\n` : ''}
المجموع: ${Number(sale.final_amount).toFixed(2)} ريال

طريقة الدفع: ${sale.payment_method === 'cash' ? 'نقدي' : sale.payment_method}

شكراً لتسوقكم معنا
    `;
    
    console.log(receiptContent);
    // In a real app, this would print to thermal printer
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

  if (!sale) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            لم يتم العثور على الفاتورة
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            تفاصيل الفاتورة
          </CardTitle>
          <Button size="sm" onClick={printReceipt}>
            <Printer className="h-4 w-4 ml-1" />
            طباعة
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sale Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">رقم الفاتورة:</span>
            <Badge variant="outline">{sale.sale_number}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">التاريخ:</span>
            <span>{format(new Date(sale.sale_date), 'dd MMM yyyy HH:mm', { locale: ar })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">طريقة الدفع:</span>
            <span>{sale.payment_method === 'cash' ? 'نقدي' : sale.payment_method}</span>
          </div>
        </div>

        {/* Customer Info */}
        {(sale.customer_name || sale.customer_phone) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">بيانات العميل</h4>
              {sale.customer_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الاسم:</span>
                  <span>{sale.customer_name}</span>
                </div>
              )}
              {sale.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الهاتف:</span>
                  <span>{sale.customer_phone}</span>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Items */}
        <div className="space-y-3">
          <h4 className="font-medium">المنتجات</h4>
          {sale.sale_items?.map((item) => (
            <div key={item.id} className="flex justify-between items-start p-2 bg-muted/50 rounded">
              <div className="flex-1">
                <div className="font-medium text-sm">{item.product_name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.quantity} × {Number(item.unit_price).toFixed(2)} ريال
                </div>
              </div>
              <div className="font-medium">
                {Number(item.total_price).toFixed(2)} ريال
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>الإجمالي:</span>
            <span>{Number(sale.total_amount).toFixed(2)} ريال</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>الضريبة (15%):</span>
            <span>{Number(sale.tax_amount).toFixed(2)} ريال</span>
          </div>
          {sale.discount_amount > 0 && (
            <div className="flex justify-between text-success">
              <span>الخصم:</span>
              <span>-{Number(sale.discount_amount).toFixed(2)} ريال</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>المجموع النهائي:</span>
            <span>{Number(sale.final_amount).toFixed(2)} ريال</span>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">ملاحظات</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                {sale.notes}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};