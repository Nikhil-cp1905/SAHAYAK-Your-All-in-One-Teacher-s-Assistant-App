'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Accessibility,
  AudioLines,
  BookOpen,
  Calculator,
  ClipboardList,
  FileText,
  FlaskConical,
  Globe,
  Home,
  Image as ImageIcon,
  Languages,
  LayoutDashboard,
  Lightbulb,
  Mail,
  MessageCircle,
  PanelLeft,
  Sparkles,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '../ui/scroll-area';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    color: 'text-blue-600',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-purple-600',
  },
  {
    group: 'Content Creation',
    items: [
      {
        label: 'Worksheet Generator',
        href: '/worksheet-generator',
        icon: FileText,
        color: 'text-green-600',
      },
      {
        label: 'Story Generator',
        href: '/story-generator',
        icon: BookOpen,
        color: 'text-pink-600',
      },
      {
        label: 'Lesson Plan',
        href: '/lesson-plan',
        icon: ClipboardList,
        color: 'text-yellow-600',
      },
      {
        label: 'Science Experiments',
        href: '/experiment-instructions',
        icon: FlaskConical,
        color: 'text-red-600',
      },
      {
        label: 'Picture Creator',
        href: '/visual-aid',
        icon: ImageIcon,
        color: 'text-amber-600',
      },
    ],
  },
  {
    group: 'Student Tools',
    items: [
      {
        label: 'Q&A Buddy',
        href: '/qa-assistant',
        icon: MessageCircle,
        color: 'text-indigo-600',
      },
      {
        label: 'Concept Explainer',
        href: '/concept-explainer',
        icon: Lightbulb,
        color: 'text-cyan-600',
      },
      {
        label: 'Auto-Grader',
        href: '/auto-grader',
        icon: Calculator,
        color: 'text-emerald-600',
      },
      {
        label: 'Language Translator',
        href: '/translation',
        icon: Globe,
        color: 'text-teal-600',
      },
    ],
  },
  {
    group: 'Special Help',
    items: [
      {
        label: 'Inclusive Worksheets',
        href: '/inclusive-worksheet',
        icon: Accessibility,
        color: 'text-orange-600',
      },
      {
        label: 'Bilingual Worksheets',
        href: '/bilingual-worksheet',
        icon: Languages,
        color: 'text-lime-600',
      },
      {
        label: 'Voice Maker',
        href: '/voice-script',
        icon: AudioLines,
        color: 'text-fuchsia-600',
      },
    ],
  },
  {
    group: 'Class Management',
    items: [
      {
        label: 'Student Profiles',
        href: '/student-profiles',
        icon: Users,
        color: 'text-rose-600',
      },
      {
        label: 'Email Helper',
        href: '/email-composer',
        icon: Mail,
        color: 'text-violet-600',
      },
    ],
  },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-1 px-2 py-4">
      {navItems.map((item, index) =>
        item.group ? (
          <div key={index} className="grid gap-1">
            <h2 className="mb-1 mt-4 px-3 text-sm font-semibold tracking-wider uppercase text-gray-500">
              {item.group}
            </h2>
            {item.items.map((subItem) => (
              <Link key={subItem.href} href={subItem.href}>
                <span
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-gray-100',
                    pathname === subItem.href ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100' : 'transparent'
                  )}
                >
                  <subItem.icon className={cn("mr-3 h-5 w-5", subItem.color)} />
                  <span className="text-gray-800">{subItem.label}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                'group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-gray-100',
                pathname === item.href ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100' : 'transparent'
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", item.color)} />
              <span className="text-gray-800">{item.label}</span>
            </span>
          </Link>
        )
      )}
    </nav>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-blue-50 to-purple-50">
        <header className="sticky top-0 flex h-20 items-center gap-4 border-b bg-white/95 backdrop-blur px-4 md:px-6 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <ScrollArea className="flex-grow">
                <div className="flex h-full max-h-screen flex-col gap-2">
                  <div className="flex h-[80px] items-center border-b px-6 bg-gradient-to-r from-blue-500 to-purple-500">
                    <Link className="flex items-center gap-2 font-semibold" href="/">
                      <div className="p-2 rounded-full bg-white/20">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-white font-headline">SAHAYAK</span>
                    </Link>
                  </div>
                  <div className="flex-1 overflow-auto py-4 bg-white">
                    <SidebarNav />
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center">
            <Link className="flex items-center justify-center gap-2 font-semibold sm:hidden" href="/">
              <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-headline">
                SAHAYAK
              </span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="hidden border-r bg-white lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[80px] items-center border-b px-6 bg-gradient-to-r from-blue-500 to-purple-500">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              <div className="p-2 rounded-full bg-white/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-headline">SAHAYAK</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">{children}</main>
      </div>
    </div>
  );
}