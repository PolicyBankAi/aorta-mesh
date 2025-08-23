import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/ChatGPT Image Aug 17, 2025, 02_01_48 PM_1755457579205.png";
export default function Header() {
    const { user } = useAuth();
    return (<div className="relative z-10 flex-shrink-0 flex h-32 bg-black border-b border-cyan-400 shadow" data-testid="header">
      <div className="flex-1 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="h-28 w-28 rounded-lg overflow-hidden border-2 border-cyan-400">
            <img src={logoImage} alt="AORTA Mesh Logo" className="w-full h-full object-cover filter hue-rotate-90 saturate-200 brightness-125 contrast-110" data-testid="logo-image"/>
          </div>
          <h1 className="text-5xl font-bold text-cyan-400">AORTA Mesh™</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-cyan-300 hover:text-cyan-400 hover:bg-gray-800 border border-cyan-400/30" data-testid="button-notifications">
            <Bell className="h-4 w-4"/>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-800 border border-cyan-400 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-cyan-400"/>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
