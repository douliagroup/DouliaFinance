'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DoulyCFO from '@/components/DoulyCFO';
import { cn } from '@/lib/utils';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={cn(
          "flex-1 p-6 relative transition-all duration-300",
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <DoulyCFO />
    </div>
  );
}
