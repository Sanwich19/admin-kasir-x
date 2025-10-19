import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Clock, 
  FileText, 
  Settings 
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier'] },
  { title: "POS Kasir", url: "/pos", icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { title: "Inventory", url: "/inventory", icon: Package, roles: ['admin', 'manager'] },
  { title: "Karyawan", url: "/karyawan", icon: Users, roles: ['admin', 'manager'] },
  { title: "Shift Kerja", url: "/shift", icon: Clock, roles: ['admin', 'manager'] },
  { title: "Laporan", url: "/laporan", icon: FileText, roles: ['admin', 'manager'] },
  { title: "Pengaturan", url: "/pengaturan", icon: Settings, roles: ['admin', 'manager', 'cashier'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { role, loading } = useUserRole();

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    !role || item.roles.includes(role)
  );

  if (loading) {
    return (
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarContent>
          <div className="p-4 border-b border-sidebar-border">
            <h2 className={`font-bold text-xl text-sidebar-foreground ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? "AK" : "Admin Kasir"}
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Memuat menu...</p>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <h2 className={`font-bold text-xl text-sidebar-foreground ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? "AK" : "Admin Kasir"}
          </h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive ? "sidebar-active" : ""
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
