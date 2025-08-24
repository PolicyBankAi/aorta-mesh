import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/ChatGPT Image Aug 17, 2025, 02_01_48 PM_1755457579205.png";
import { toast } from "@/components/ui/use-toast";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Signed out", description: "You have been logged out securely." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Logout failed." });
    }
  };

  return (
    <div
      className="relative z-10 flex-shrink-0 flex h-20 bg-black border-b border-cyan-400 shadow"
      data-testid="header"
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center px-6 space-x-4">
        <div className="h-14 w-14 rounded-lg overflow-hidden border-2 border-cyan-400">
          <img
            src={logoImage}
            alt="AORTA Mesh Logo"
            className="w-full h-full object-cover filter hue-rotate-90 saturate-200 brightness-125 contrast-110"
            data-testid="logo-image"
          />
        </div>
        <h1 className="text-2xl font-bold text-cyan-400">AORTA Mesh™</h1>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center ml-auto pr-6 space-x-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="text-cyan-300 hover:text-cyan-400 hover:bg-gray-800 border border-cyan-400/30"
          data-testid="button-notifications"
          onClick={() =>
            toast({ title: "Notifications", description: "Opening QA alerts…" })
          }
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-800 border border-cyan-400 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-cyan-300 font-medium">{user?.name || "Unknown User"}</p>
            <p className="text-xs text-cyan-500 capitalize">{user?.role || "role not set"}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          className="text-cyan-300 hover:text-red-400 hover:bg-gray-800 border border-cyan-400/30"
          data-testid="button-logout"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
