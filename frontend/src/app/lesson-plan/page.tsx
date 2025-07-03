'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Volume2, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateLessonPlan, LessonPlanOutput } from '@/ai/flows/lesson-plan-generator';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters.' }),
  gradeLevel: z.string().min(1, { message: 'Grade Level is required.' }),
  learningObjectives: z.string().min(10, { message: 'Please provide learning objectives.' }),
  optionalSteps: z.string().optional(),
  supportingMaterial: z.string().optional(),
});

export default function LessonPlanPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [lessonPlan, setLessonPlan] = React.useState<LessonPlanOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      gradeLevel: '',
      learningObjectives: '',
      optionalSteps: '',
      supportingMaterial: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLessonPlan(null);
    setAudioUrl(null);
    try {
      const result = await generateLessonPlan(values);
      setLessonPlan(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating lesson plan',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getLessonPlanAsText = () => {
    if (!lessonPlan) return '';
    return `Title: ${lessonPlan.title}\n\nIntroduction: ${lessonPlan.introduction}\n\nActivities: ${lessonPlan.activities}\n\nAssessment: ${lessonPlan.assessment}\n\nConclusion: ${lessonPlan.conclusion}`;
  };

  const handleDownloadPdf = () => {
    if (!lessonPlan) return;
    const doc = new jsPDF();
    const text = getLessonPlanAsText();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save('lesson-plan.pdf');
  };

  const handlePlayAudio = async () => {
    if (!lessonPlan) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const text = getLessonPlanAsText();
      const result = await generateVoiceScript(text);
      setAudioUrl(result.media);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error generating audio',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsAudioLoading(false);
    }
  };

  React.useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  return (
    <MainLayout>
      <PageHeader
        title="Lesson Plan Generator"
        description="Draft comprehensive lesson plans based on subject, grade level, and learning objectives."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
            <CardDescription>Fill in the details to generate a new lesson plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Biology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 9th Grade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="learningObjectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Objectives</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe what students should be able to do after the lesson." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionalSteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optional Steps</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Group discussion, short video" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="supportingMaterial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supporting Material</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Textbook chapter 5, online articles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Lesson Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start justify-between">
            <div className='flex-1'>
                <CardTitle>Generated Lesson Plan</CardTitle>
                <CardDescription>The AI-generated lesson plan will appear here.</CardDescription>
            </div>
            {lessonPlan && <div className="flex items-center gap-2">
                <Button onClick={handlePlayAudio} disabled={isAudioLoading || isLoading} variant="outline" size="icon">
                    {isAudioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isLoading} variant="outline" size="icon">
                    <FileDown className="h-4 w-4" />
                </Button>
            </div>}
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
              {lessonPlan && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h2 className='font-headline'>{lessonPlan.title}</h2>
                  <h3>Introduction</h3>
                  <p>{lessonPlan.introduction}</p>
                  <h3>Activities</h3>
                  <p>{lessonPlan.activities}</p>
                  <h3>Assessment</h3>
                  <p>{lessonPlan.assessment}</p>
                  <h3>Conclusion</h3>
                  <p>{lessonPlan.conclusion}</p>
                </div>
              )}
              {!isLoading && !lessonPlan && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Your lesson plan will be shown here.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
       {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </MainLayout>
  );
}
