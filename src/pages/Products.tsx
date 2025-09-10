import { useState } from "react";
import { ProductsList } from "@/components/products/ProductsList";
import { ProductForm } from "@/components/products/ProductForm";
import { CategoriesManagement } from "@/components/products/CategoriesManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Layers } from "lucide-react";

const Products = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-card p-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">إدارة المنتجات</h1>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-primary shadow-soft"
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج جديد
          </Button>
        </div>
        
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              الفئات
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            {showAddForm ? (
              <Card className="mb-6 shadow-soft">
                <CardHeader>
                  <CardTitle>إضافة منتج جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductForm onSuccess={() => setShowAddForm(false)} />
                </CardContent>
              </Card>
            ) : null}
            <ProductsList />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoriesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Products;