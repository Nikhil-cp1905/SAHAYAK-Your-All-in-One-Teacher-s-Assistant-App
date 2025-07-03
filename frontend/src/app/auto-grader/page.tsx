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
import { autoGrade, AutoGradeOutput } from '@/ai/flows/auto-grader';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  assignmentText: z.string().min(10, { message: 'Please enter the student\'s assignment text.' }),
  answerKey: z.string().min(10, { message: 'Please provide the answer key.' }),
  maxScore: z.coerce.number().min(1, { message: 'Max score must be at least 1.' }),
});

export default function AutoGraderPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [grade, setGrade] = React.useState<AutoGradeOutput | null>(null);
  const { toast } = useToast();
  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignmentText: '',
      answerKey: '',
      maxScore: 100,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGrade(null);
    setAudioUrl(null);
    try {
      const result = await autoGrade(values);
      setGrade(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error grading assignment',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = () => {
    if (!grade) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Grade: ${grade.grade}/${form.getValues('maxScore')}`, 10, 10);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(`Feedback:\n${grade.feedback}`, 180);
    doc.text(splitText, 10, 20);
    doc.save('grading-result.pdf');
  };

  const handlePlayAudio = async () => {
    if (!grade) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const result = await generateVoiceScript(grade.feedback);
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
        title="Auto-Grader"
        description="Automatically grade assignments and provide feedback to students."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="assignmentText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student's Assignment</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Paste the student's full assignment text here." {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="answerKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer Key</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Provide the complete answer key for the assignment." {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="maxScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Score</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grade Assignment
              </Button>
            </form>
          </Form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grading Result</CardTitle>
            <CardDescription>The grade and feedback will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {grade && (
              <div className="space-y-6">
                <div className="text-center">
                    <p className="text-muted-foreground">Score</p>
                    <p className="text-6xl font-bold text-primary">{grade.grade}<span className='text-3xl text-muted-foreground'>/{form.getValues('maxScore')}</span></p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Feedback</h3>
                     <div className="flex items-center gap-2">
                        <Button onClick={handlePlayAudio} disabled={isAudioLoading} variant="outline" size="icon">
                            {isAudioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                             <span className="sr-only">Play audio feedback</span>
                        </Button>
                        <Button onClick={handleDownloadPdf} variant="outline" size="icon">
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">Download as PDF</span>
                        </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-md prose prose-sm dark:prose-invert max-w-none">
                    <p>{grade.feedback}</p>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !grade && (
              <div className="flex items-center justify-center h-64 border border-dashed rounded-md">
                <p className="text-muted-foreground">Results will be shown here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </MainLayout>
  );
}
