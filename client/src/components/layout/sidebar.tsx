import {
  BarChart3,
  FileText,
  ClipboardList,
  Microscope,
  Link2,
  FolderOpen,
  Plug,
  User,
  Settings,
  Users,
  Shield,
  Archive,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link as RouterLink, useLocation } from "wouter";
import { UserRole } from "@/shared/rbac";

// Full navigation registry
const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, roles: Object.values(UserRole) },
  { name: "Case Passports", href: "/case-passports", icon: FileText, roles: Object.values(UserRole) },
  { name: "Chain-of-Custody", href: "/chain-of-custody", icon: Link2, roles: Object.values(UserRole) },

  // Role-specific
  { name: "Smart Forms", href: "/smart-forms", icon: ClipboardList, roles: [UserRole.OPO_COORDINATOR, UserRole.RECOVERY_COORDINATOR, UserRole.TRIAGE_COORDINATOR] },
  { name: "Queue Management", href: "/queue-management", icon: Users, roles: [UserRole.OPO_COORDINATOR, UserRole.TRIAGE_COORDINATOR] },
  { name: "QA Workbench", href: "/qa-workbench", icon: Microscope, roles: [UserRole.QUALITY_STAFF, UserRole.ADMIN] },
  { name: "Four-Eyes Approval", href: "/four-eyes-approval", icon: Shield, roles: [UserRole.QUALITY_STAFF, UserRole.ADMIN, UserRole.SURGEON] },
  { name: "Audit Binder", href: "/audit-binder", icon: FolderOpen, roles: [UserRole.QUALITY_STAFF, UserRole.ADMIN] },
  { name: "Bulk Operations", href: "/bulk-operations", icon: Archive, roles: [UserRole.LAB_STAFF, UserRole.ADMIN] },
  { name: "Connectors", href: "/connectors", icon: Plug, roles: [UserRole.ADMIN] },
  { name: "Admin Console", href: "/admin-console", icon: Settings, roles: [UserRole.ADMIN] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const role = user?.role as UserRole | undefined;

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col" data-testid="sidebar">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-black border-r border-cyan-400">
        <div className="flex items-center flex-shrink-0 px-4" data-testid="sidebar-brand">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-cyan-400">AORTA Mesh™</h1>
            <p className="text-xs text-cyan-300 mt-1">
              Adaptive Organ & Tissue
              <br />
              Record & Traceability
            </p>
          </div>
        </div>

        <nav className="mt-8 flex-1 px-2 space-y-1" data-testid="sidebar-nav">
          {navigation
            .filter((item) => role && item.roles.includes(role))
            .map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <RouterLink
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? "bg-cyan-600 text-black border border-cyan-400"
                      : "text-cyan-300 hover:bg-gray-900 hover:text-cyan-400 border border-transparent"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon
                    className={`${
                      isActive ? "text-black" : "text-cyan-400 group-hover:text-cyan-300"
                    } mr-3 flex-shrink-0 h-4 w-4`}
                  />
                  {item.name}
                </RouterLink>
              );
            })}
        </nav>

        <div className="flex-shrink-0 flex border-t border-cyan-400 p-4" data-testid="sidebar-user">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 border border-cyan-400 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-cyan-400" data-testid="text-user-name">
                {user?.name || "Demo User"}
              </p>
              <p className="text-xs text-cyan-300 capitalize" data-testid="text-user-role">
                {role || "unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
