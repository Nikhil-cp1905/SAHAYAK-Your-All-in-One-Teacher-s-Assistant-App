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
  Image,
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
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    group: 'Content Creation',
    items: [
      {
        label: 'Worksheet Generator',
        href: '/worksheet-generator',
        icon: FileText,
      },
      {
        label: 'Story Generator',
        href: '/story-generator',
        icon: BookOpen,
      },
      {
        label: 'Lesson Plan',
        href: '/lesson-plan',
        icon: ClipboardList,
      },
      {
        label: 'Experiment Instructions',
        href: '/experiment-instructions',
        icon: FlaskConical,
      },
      {
        label: 'Visual Aid',
        href: '/visual-aid',
        icon: Image,
      },
    ],
  },
  {
    group: 'Student Tools',
    items: [
      {
        label: 'Q&A Assistant',
        href: '/qa-assistant',
        icon: MessageCircle,
      },
      {
        label: 'Concept Explainer',
        href: '/concept-explainer',
        icon: Lightbulb,
      },
      {
        label: 'Auto-Grader',
        href: '/auto-grader',
        icon: Calculator,
      },
      {
        label: 'Translation',
        href: '/translation',
        icon: Globe,
      },
    ],
  },
  {
    group: 'Accessibility',
    items: [
      {
        label: 'Inclusive Worksheet',
        href: '/inclusive-worksheet',
        icon: Accessibility,
      },
      {
        label: 'Bilingual Worksheet',
        href: '/bilingual-worksheet',
        icon: Languages,
      },
      {
        label: 'Voice Script',
        href: '/voice-script',
        icon: AudioLines,
      },
    ],
  },
  {
    group: 'Management',
    items: [
      {
        label: 'Student Profiles',
        href: '/student-profiles',
        icon: Users,
      },
      {
        label: 'Email Composer',
        href: '/email-composer',
        icon: Mail,
      },
    ],
  },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) =>
        item.group ? (
          <div key={index} className="grid gap-1 px-2">
            <h2 className="mb-1 mt-2 px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              {item.group}
            </h2>
            {item.items.map((subItem) => (
              <Link key={subItem.href} href={subItem.href}>
                <span
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    pathname === subItem.href ? 'bg-accent' : 'transparent'
                  )}
                >
                  <subItem.icon className="mr-2 h-4 w-4" />
                  <span>{subItem.label}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                pathname === item.href ? 'bg-accent' : 'transparent'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
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
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
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
                  <div className="flex h-[60px] items-center border-b px-6">
                    <Link className="flex items-center gap-2 font-semibold" href="/">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <span className="font-headline text-xl">EduSpark</span>
                    </Link>
                  </div>
                  <div className="flex-1 overflow-auto py-2">
                    <SidebarNav />
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center">
            <Link className="flex items-center gap-2 font-semibold sm:hidden" href="/">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">EduSpark</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">EduSpark</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
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
