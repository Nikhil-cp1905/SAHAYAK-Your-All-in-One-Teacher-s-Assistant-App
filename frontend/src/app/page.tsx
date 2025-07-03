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
    color: 'bg-blue-100',
  },
  {
    title: 'Worksheet Generator',
    description: 'Create fun worksheets with different question types!',
    icon: FileText,
    href: '/worksheet-generator',
    pro: false,
    color: 'bg-green-100',
  },
  {
    title: 'Story Generator',
    description: 'Make magical stories with pictures and sounds!',
    icon: BookOpen,
    href: '/story-generator',
    pro: true,
    color: 'bg-purple-100',
  },
  {
    title: 'Lesson Plan Helper',
    description: 'Easy planning for great lessons!',
    icon: ClipboardList,
    href: '/lesson-plan',
    pro: false,
    color: 'bg-yellow-100',
  },
  {
    title: 'Science Experiments',
    description: 'Safe and fun science activities!',
    icon: FlaskConical,
    href: '/experiment-instructions',
    pro: false,
    color: 'bg-red-100',
  },
  {
    title: 'Q&A Buddy',
    description: 'Chat with our friendly AI helper!',
    icon: MessageCircle,
    href: '/qa-assistant',
    pro: true,
    color: 'bg-pink-100',
  },
  {
    title: 'Concept Explainer',
    description: 'Learn hard things the easy way!',
    icon: Lightbulb,
    href: '/concept-explainer',
    pro: false,
    color: 'bg-indigo-100',
  },
  {
    title: 'Special Help Worksheets',
    description: 'Worksheets for all learning styles!',
    icon: Accessibility,
    href: '/inclusive-worksheet',
    pro: false,
    color: 'bg-teal-100',
  },
  {
    title: 'Multilingual Worksheets',
    description: 'Learn in your favorite language!',
    icon: Languages,
    href: '/bilingual-worksheet',
    pro: false,
    color: 'bg-orange-100',
  },
  {
    title: 'Auto-Grader',
    description: 'Quick grading with helpful notes!',
    icon: Calculator,
    href: '/auto-grader',
    pro: true,
    color: 'bg-cyan-100',
  },
  {
    title: 'Voice Maker',
    description: 'Turn words into spoken stories!',
    icon: AudioLines,
    href: '/voice-script',
    pro: false,
    color: 'bg-lime-100',
  },
  {
    title: 'Picture Creator',
    description: 'Make drawings for your lessons!',
    icon: ImageIcon,
    href: '/visual-aid',
    pro: false,
    color: 'bg-amber-100',
  },
  {
    title: 'Language Translator',
    description: 'Learn in many languages!',
    icon: Globe,
    href: '/translation',
    pro: false,
    color: 'bg-emerald-100',
  },
  {
    title: 'Student Profiles',
    description: 'Keep track of all your students!',
    icon: Users,
    href: '/student-profiles',
    pro: true,
    color: 'bg-fuchsia-100',
  },
  {
    title: 'Email Helper',
    description: 'Write nice emails to parents!',
    icon: Mail,
    href: '/email-composer',
    pro: true,
    color: 'bg-rose-100',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-20 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block font-bold font-headline text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SAHAYAK
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              <span className="block mb-2">Super Tools for</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Super Teachers!
              </span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              Make teaching fun and easy with our colorful tools that help you save time and make learning exciting!
            </p>
          </div>
        </div>

        <div className="container pb-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <Card className={`h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-2 border-2 ${feature.color} border-transparent group-hover:border-white`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${feature.color.replace('bg-', 'bg-')} group-hover:bg-white`}>
                        <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-purple-600" />
                      </div>
                      {feature.pro && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="pt-4 font-headline text-2xl text-gray-800">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      {feature.description}
                    </CardDescription>
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