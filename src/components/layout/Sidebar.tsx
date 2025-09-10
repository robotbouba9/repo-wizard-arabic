import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Package, 
  Receipt, 
  Settings as SettingsIcon,
  ChevronRight,
  Smartphone
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "الرئيسية", href: "/", icon: Home },
  { name: "المنتجات", href: "/products", icon: Package },
  { name: "المبيعات", href: "/sales", icon: Receipt },
  { name: "الإعدادات", href: "/settings", icon: SettingsIcon },
];

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 z-50 flex flex-col bg-sidebar border-l border-sidebar-border transition-all duration-300 shadow-medium",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">متجر الهواتف</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 hover:bg-sidebar-accent"
        >
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            !isOpen && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft",
                  !isOpen && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isOpen && <span className="truncate">{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            نظام إدارة نقاط البيع v1.0
          </p>
        </div>
      )}
    </div>
  );
};