import { useState } from "react";
import { QuickSale } from "@/components/pos/QuickSale";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { StatsCards } from "@/components/pos/StatsCards";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-card p-6 space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          نظام نقاط البيع للهواتف
        </h1>
        <p className="text-muted-foreground text-lg">
          أسرع وأسهل طريقة لإدارة مبيعات متجرك
        </p>
      </div>

      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickSale />
        <SalesHistory />
      </div>
    </div>
  );
};

export default Dashboard;