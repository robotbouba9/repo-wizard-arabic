import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2, Package } from "lucide-react";

export const ProductsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,barcode.ilike.%${searchQuery}%`);
      }
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

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
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                size="sm"
              >
                الكل
              </Button>
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                  style={{ backgroundColor: selectedCategory === category.id ? category.color : undefined }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products?.map((product) => (
          <Card key={product.id} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Product Image Placeholder */}
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                {product.categories && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ backgroundColor: product.categories.color + '20', color: product.categories.color }}
                  >
                    {product.categories.name}
                  </Badge>
                )}

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {Number(product.price).toFixed(2)} ريال
                  </div>
                  <Badge 
                    variant={product.stock_quantity > product.min_stock_level ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    مخزون: {product.stock_quantity}
                  </Badge>
                </div>

                {/* Barcode */}
                {product.barcode && (
                  <div className="text-xs text-muted-foreground font-mono">
                    {product.barcode}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-3 w-3 ml-1" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3 ml-1" />
                    حذف
                  </Button>
                </div>

                {/* Stock Status */}
                {product.stock_quantity <= product.min_stock_level && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-2">
                    <p className="text-xs text-warning text-center">
                      المخزون منخفض - يحتاج تجديد
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            لا توجد منتجات تطابق البحث
          </CardContent>
        </Card>
      )}
    </div>
  );
};