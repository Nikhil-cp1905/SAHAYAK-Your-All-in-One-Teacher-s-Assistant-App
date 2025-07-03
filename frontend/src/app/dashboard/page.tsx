'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { Activity, BookText, Users, Trophy } from 'lucide-react';

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Worksheets Generated',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Stories Created',
    color: 'hsl(var(--chart-2))',
  },
};

const lineChartData = [
  { date: '2024-01', "Grade 5": 78, "Grade 6": 85 },
  { date: '2024-02', "Grade 5": 82, "Grade 6": 88 },
  { date: '2024-03', "Grade 5": 85, "Grade 6": 90 },
  { date: '2024-04', "Grade 5": 81, "Grade 6": 86 },
  { date: '2024-05', "Grade 5": 88, "Grade 6": 92 },
];

const lineChartConfig = {
  "Grade 5": {
    label: "Grade 5",
    color: "hsl(var(--chart-1))",
  },
  "Grade 6": {
    label: "Grade 6",
    color: "hsl(var(--chart-2))",
  },
};

export default function DashboardPage() {
  return (
    <MainLayout>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Activity className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </div>
        }
        description="Insights into student performance and content generation."
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Total Students</CardTitle>
            </div>
            <CardDescription className="text-blue-100">Number of active students</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-4xl font-bold text-gray-800">124</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <div className="flex items-center gap-3">
              <BookText className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Content Generated</CardTitle>
            </div>
            <CardDescription className="text-blue-100">Total items created this month</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-4xl font-bold text-gray-800">842</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Average Score</CardTitle>
            </div>
            <CardDescription className="text-blue-100">Across all graded assignments</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-4xl font-bold text-gray-800">88%</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-white" />
              <CardTitle className="text-white">Engagement Rate</CardTitle>
            </div>
            <CardDescription className="text-blue-100">Student interaction with materials</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-4xl font-bold text-gray-800">92%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Content Generation Trends</CardTitle>
            <CardDescription className="text-blue-100">Monthly generated content by type</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  stroke="#888"
                />
                <YAxis stroke="#888" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="desktop" 
                  fill="var(--color-desktop)" 
                  radius={[4, 4, 0, 0]} 
                  className="shadow-md"
                />
                <Bar 
                  dataKey="mobile" 
                  fill="var(--color-mobile)" 
                  radius={[4, 4, 0, 0]} 
                  className="shadow-md"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Average Score by Grade</CardTitle>
            <CardDescription className="text-blue-100">Monthly average scores for Grade 5 vs Grade 6</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
              <LineChart data={lineChartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="#888"
                />
                <YAxis domain={[70, 100]} stroke="#888" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line 
                  dataKey="Grade 5" 
                  type="monotone" 
                  stroke="var(--color-Grade 5)" 
                  strokeWidth={2} 
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  dataKey="Grade 6" 
                  type="monotone" 
                  stroke="var(--color-Grade 6)" 
                  strokeWidth={2} 
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}