'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';

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
        title="Analytics Dashboard"
        description="Insights into student performance and content generation."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
            <CardDescription>Number of active students.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">124</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content Generated</CardTitle>
            <CardDescription>Total items created this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">842</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
            <CardDescription>Across all graded assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">88%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
            <CardDescription>Student interaction with materials.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">92%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Generation Trends</CardTitle>
            <CardDescription>Monthly generated content by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Average Score by Grade</CardTitle>
                <CardDescription>Monthly average scores for Grade 5 vs Grade 6.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                <LineChart data={lineChartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis domain={[70, 100]} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line dataKey="Grade 5" type="monotone" stroke="var(--color-Grade 5)" strokeWidth={2} dot={true} />
                    <Line dataKey="Grade 6" type="monotone" stroke="var(--color-Grade 6)" strokeWidth={2} dot={true} />
                </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
