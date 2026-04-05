'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calculator, 
  Users, 
  FileText, 
  Briefcase, 
  FolderKanban, 
  Wallet,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import Image from 'next/image';

const navItems = [
  { name: 'Tableau de Bord', href: '/', icon: LayoutDashboard },
  { name: 'Simulateur ROI', href: '/roi', icon: Calculator },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Facturation', href: '/billing', icon: FileText },
  { name: 'Services', href: '/services', icon: Briefcase },
  { name: 'Projets', href: '/projects', icon: FolderKanban },
  { name: 'Budget', href: '/budget', icon: Wallet },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        "h-screen fixed left-0 top-0 bg-[#0B0F1A]/80 backdrop-blur-xl border-r border-[#32CD32]/10 flex flex-col z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "p-6 flex flex-col gap-4 relative",
        isCollapsed ? "items-center" : "items-start"
      )}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-[#32CD32] rounded-full flex items-center justify-center text-black shadow-lg glow-neon hover:scale-110 transition-transform"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={cn(
          "relative glow-neon rounded-xl overflow-hidden border border-[#32CD32]/30 bg-white/5 transition-all duration-300",
          isCollapsed ? "w-10 h-10" : "w-20 h-20"
        )}>
          <Image 
            src="https://i.postimg.cc/Y0nJdHW3/DOULIA_LOGO.jpg" 
            alt="DOULIA Logo" 
            fill 
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tighter text-white whitespace-nowrap">
            DOULIA <span className="text-[#32CD32]">FINANCE</span>
          </h1>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : ""}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-[#32CD32]/10 text-[#32CD32] border border-[#32CD32]/20 glow-neon" 
                  : "text-steel hover:bg-white/5 hover:text-white",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn(
                "w-4.5 h-4.5 transition-colors z-10",
                isActive ? "text-[#32CD32]" : "text-steel group-hover:text-white"
              )} />
              {!isCollapsed && (
                <span className="font-medium text-sm z-10 whitespace-nowrap">{item.name}</span>
              )}
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-[#32CD32] rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#32CD32]/10">
        <div className={cn(
          "glass-card rounded-xl border border-[#32CD32]/20 ai-border-anim transition-all duration-300",
          isCollapsed ? "p-2 flex justify-center" : "p-3"
        )}>
          {!isCollapsed ? (
            <>
              <p className="text-[10px] text-steel mb-0.5">Propulsé par</p>
              <p className="text-xs font-bold text-[#32CD32] flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Douly CFO AI
              </p>
            </>
          ) : (
            <Zap className="w-4 h-4 text-[#32CD32] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
