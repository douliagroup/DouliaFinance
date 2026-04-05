import type {Metadata} from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import LayoutWrapper from '@/components/LayoutWrapper';
import Script from 'next/script';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'DOULIA FINANCE',
  description: 'Plateforme de gestion financière intelligente propulsée par l\'IA pour DOULIA.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className={cn("font-sans dark", inter.variable)}>
      <head>
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className="bg-background text-foreground antialiased overflow-x-hidden bg-animate">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
