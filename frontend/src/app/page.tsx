'use client';

import * as React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  BookOpen,
  ClipboardList,
  FlaskConical,
  MessageCircle,
  Lightbulb,
  Accessibility,
  Languages,
  Calculator,
  AudioLines,
  Image as ImageIcon,
  Globe,
  Users,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    title: 'Dashboard',
    description: 'View student analytics and performance.',
    icon: LayoutDashboard,
    href: '/dashboard',
    pro: false,
  },
  {
    title: 'Worksheet Generator',
    description: 'Create worksheets with varied question types.',
    icon: FileText,
    href: '/worksheet-generator',
    pro: false,
  },
  {
    title: 'Story Generator',
    description: 'Generate engaging stories with multimedia.',
    icon: BookOpen,
    href: '/story-generator',
    pro: true,
  },
  {
    title: 'Lesson Plan Generator',
    description: 'Draft comprehensive lesson plans.',
    icon: ClipboardList,
    href: '/lesson-plan',
    pro: false,
  },
  {
    title: 'Experiment Instructions',
    description: 'Create safe science experiment instructions.',
    icon: FlaskConical,
    href: '/experiment-instructions',
    pro: false,
  },
  {
    title: 'Q&A Assistant',
    description: 'Chat with an AI assistant with memory.',
    icon: MessageCircle,
    href: '/qa-assistant',
    pro: true,
  },
  {
    title: 'Concept Explainer',
    description: 'Simplify complex topics for any level.',
    icon: Lightbulb,
    href: '/concept-explainer',
    pro: false,
  },
  {
    title: 'Inclusive Worksheet',
    description: 'Adapt worksheets for diverse learning needs.',
    icon: Accessibility,
    href: '/inclusive-worksheet',
    pro: false,
  },
  {
    title: 'Bilingual Worksheet',
    description: 'Generate materials in multiple languages.',
    icon: Languages,
    href: '/bilingual-worksheet',
    pro: false,
  },
  {
    title: 'Auto-Grader',
    description: 'Automatically grade assignments with feedback.',
    icon: Calculator,
    href: '/auto-grader',
    pro: true,
  },
  {
    title: 'Voice Script Generator',
    description: 'Convert text into natural-sounding speech.',
    icon: AudioLines,
    href: '/voice-script',
    pro: false,
  },
  {
    title: 'Visual Aid Generator',
    description: 'Create doodles and images for lessons.',
    icon: ImageIcon,
    href: '/visual-aid',
    pro: false,
  },
  {
    title: 'Multilingual Translation',
    description: 'Translate educational content.',
    icon: Globe,
    href: '/translation',
    pro: false,
  },
  {
    title: 'Student Profiles',
    description: 'Manage personalized student profiles.',
    icon: Users,
    href: '/student-profiles',
    pro: true,
  },
  {
    title: 'Email Composer',
    description: 'Draft emails for parents and students.',
    icon: Mail,
    href: '/email-composer',
    pro: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="inline-block font-bold font-headline text-xl">EduSpark</span>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              AI-Powered Tools for Modern Educators
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Welcome to <span className="font-semibold text-primary">EduSpark</span>. Empower your teaching with our suite of intelligent tools designed to save you time and inspire your students.
            </p>
          </div>
        </div>

        <div className="container pb-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <feature.icon className="h-8 w-8 text-primary" />
                      {feature.pro && <Badge variant="destructive">Pro</Badge>}
                    </div>
                    <CardTitle className="pt-4 font-headline">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
