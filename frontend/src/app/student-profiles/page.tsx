'use client';

import * as React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, GraduationCap } from 'lucide-react';

const students = [
  {
    name: 'Alice Johnson',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman portrait',
    grade: '5th Grade',
    progress: 85,
    lastActivity: 'Completed "Solar System" worksheet',
  },
  {
    name: 'Bob Williams',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'man portrait',
    grade: '5th Grade',
    progress: 72,
    lastActivity: 'Generated a story about dragons',
  },
  {
    name: 'Charlie Brown',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'boy portrait',
    grade: '6th Grade',
    progress: 91,
    lastActivity: 'Used the Concept Explainer for "Photosynthesis"',
  },
  {
    name: 'Diana Miller',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'girl portrait',
    grade: '6th Grade',
    progress: 68,
    lastActivity: 'Completed "Bilingual Animals" worksheet',
  },
  {
    name: 'Ethan Davis',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'man portrait',
    grade: '5th Grade',
    progress: 95,
    lastActivity: 'Finished auto-graded quiz on fractions',
  },
];

export default function StudentProfilesPage() {
  return (
    <MainLayout>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Profiles
            </span>
          </div>
        }
        description="Manage personalized student profiles, tracking progress and learning preferences."
      />
      
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">All Students</CardTitle>
              <CardDescription className="text-blue-100">
                A list of all students in your class with their progress
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              <GraduationCap className="h-4 w-4 mr-2" />
              {students.length} Students
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-gray-700 font-medium pl-6">Student</TableHead>
                <TableHead className="text-gray-700 font-medium">Grade</TableHead>
                <TableHead className="text-gray-700 font-medium">Progress</TableHead>
                <TableHead className="text-gray-700 font-medium pr-6">Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.name} className="border-t border-gray-100 hover:bg-gray-50">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.dataAiHint} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-800">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50">
                      {student.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={student.progress} 
                        className="w-32 h-2 bg-gray-100"
                        indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                      <span className={`text-sm font-medium ${
                        student.progress > 89 ? 'text-green-600' : 
                        student.progress > 69 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {student.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="text-sm text-gray-600">{student.lastActivity}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}