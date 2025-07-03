'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Volume2, FileDown, Sparkles } from 'lucide-react';
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
  assignmentText: z.string().min(10, { message: 'Please enter the student\'s work (at least 10 characters)' }),
  answerKey: z.string().min(10, { message: 'Please provide the correct answers (at least 10 characters)' }),
  maxScore: z.coerce.number().min(1, { message: 'Maximum score must be at least 1' }),
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
        title: 'Oops! Grading Error',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
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
        title: 'Audio Error',
        description: error instanceof Error ? error.message : 'Could not generate audio feedback',
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
         title={
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <Sparkles className="h-6 w-6" />
      </div>
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Auto-Grader
      </span>
    </div>
  }
        description="Quickly grade assignments and give helpful feedback to students."
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
              <CardTitle className="text-white">Grade an Assignment</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="assignmentText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Student's Work</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste what the student wrote here..."
                            className="min-h-[200px] border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="answerKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Correct Answers</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What should the correct answers be?"
                            className="min-h-[200px] border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Maximum Score</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Grading...
                      </>
                    ) : (
                      'Grade Assignment'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <Card className="border-0 shadow-lg h-fit">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Grading Results</CardTitle>
            <CardDescription className="text-blue-100">Feedback will appear here</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-gray-600">Checking the work...</p>
              </div>
            ) : grade ? (
              <div className="space-y-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600">Final Score</p>
                  <p className="text-6xl font-bold text-blue-600">
                    {grade.grade}
                    <span className="text-3xl text-gray-500">/{form.getValues('maxScore')}</span>
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-800">Feedback</h3>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handlePlayAudio} 
                        disabled={isAudioLoading}
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        {isAudioLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        onClick={handleDownloadPdf}
                        variant="outline"
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{grade.feedback}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Submit an assignment to see the graded results and helpful feedback
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </MainLayout>
  );
}