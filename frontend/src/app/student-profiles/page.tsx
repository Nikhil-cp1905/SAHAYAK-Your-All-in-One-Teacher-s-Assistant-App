'use client';

import * as React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
        title="Student Profiles"
        description="Manage personalized student profiles, tracking progress and learning preferences."
      />
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>A list of all students in your class.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Overall Progress</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.name}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.dataAiHint} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.grade}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="w-32" />
                      <span>{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.lastActivity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
