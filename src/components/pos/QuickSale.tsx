import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, Receipt } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const QuickSale = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products for quick add
  const { data: products } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories(name, color)')
        .eq('is_active', true);
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,barcode.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.limit(6);
      if (error) throw error;
      return data;
    }
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      // Generate sale number
      const { data: saleNumber } = await supabase.rpc('generate_sale_number');
      
      // Calculate totals
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = totalAmount * 0.15; // 15% tax
      const finalAmount = totalAmount + taxAmount;

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_number: saleNumber,
          total_amount: totalAmount,
          tax_amount: taxAmount,
          final_amount: finalAmount,
          payment_method: 'cash',
          sale_date: new Date().toISOString()
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update stock quantities - subtract sold quantity from current stock
      for (const item of cart) {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();
          
        if (currentProduct) {
          await supabase
            .from('products')
            .update({ 
              stock_quantity: currentProduct.stock_quantity - item.quantity
            })
            .eq('id', item.id);
        }
      }

      return sale;
    },
    onSuccess: (sale) => {
      toast({
        title: "تم إتمام البيع بنجاح",
        description: `رقم الفاتورة: ${sale.sale_number}`,
      });
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Print receipt
      printReceipt(sale);
    },
    onError: () => {
      toast({
        title: "خطأ في إتمام البيع",
        description: "حدث خطأ أثناء معالجة البيع",
        variant: "destructive",
      });
    }
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = total * 0.15;
  const finalTotal = total + tax;

  const printReceipt = (sale: any) => {
    // Simple receipt printing - in a real app, this would integrate with a thermal printer
    const receiptContent = `
      متجر الهواتف
      ================
      رقم الفاتورة: ${sale.sale_number}
      التاريخ: ${new Date(sale.sale_date).toLocaleDateString('ar-SA')}
      
      ${cart.map(item => `
        ${item.name}
        ${item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)} ريال
      `).join('')}
      
      ================
      الإجمالي: ${total.toFixed(2)} ريال
      الضريبة: ${tax.toFixed(2)} ريال
      المجموع: ${finalTotal.toFixed(2)} ريال
      
      شكراً لتسوقكم معنا
    `;
    
    console.log(receiptContent); // In a real app, send to thermal printer
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          بيع سريع
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Products */}
        <Input
          placeholder="ابحث عن منتج أو امسح الباركود..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        {/* Products Grid */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {products.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto p-2 text-right flex-col items-start"
                onClick={() => addToCart(product)}
                disabled={product.stock_quantity <= 0}
              >
                <div className="text-sm font-medium truncate w-full">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  {product.price} ريال
                </div>
                <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"} className="text-xs">
                  المخزون: {product.stock_quantity}
                </Badge>
              </Button>
            ))}
          </div>
        )}

        {/* Cart Items */}
        <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
          <h4 className="font-medium mb-3">السلة ({cart.length} منتج)</h4>
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">السلة فارغة</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-muted/50 rounded p-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.price} ريال × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, 0)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>الإجمالي:</span>
              <span>{total.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>الضريبة (15%):</span>
              <span>{tax.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>المجموع:</span>
              <span>{finalTotal.toFixed(2)} ريال</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearCart}
            disabled={cart.length === 0}
            className="flex-1"
          >
            مسح السلة
          </Button>
          <Button
            onClick={() => createSaleMutation.mutate({})}
            disabled={cart.length === 0 || createSaleMutation.isPending}
            className="flex-1 bg-gradient-success"
          >
            <Receipt className="ml-2 h-4 w-4" />
            {createSaleMutation.isPending ? "جاري المعالجة..." : "إتمام البيع"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};