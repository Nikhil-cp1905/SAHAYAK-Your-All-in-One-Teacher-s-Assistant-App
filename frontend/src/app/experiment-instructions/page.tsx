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
import { generateExperimentInstructions, GenerateExperimentInstructionsOutput } from '@/ai/flows/experiment-instructions-generator';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  gradeLevel: z.string().min(1, { message: 'Grade Level is required.' }),
  learningObjectives: z.string().min(10, { message: 'Please provide learning objectives.' }),
});

export default function ExperimentInstructionsPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [instructions, setInstructions] = React.useState<GenerateExperimentInstructionsOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '',
      learningObjectives: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setInstructions(null);
    setAudioUrl(null);
    try {
      const result = await generateExperimentInstructions(values);
      setInstructions(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating instructions',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const getInstructionsAsText = () => {
    if (!instructions) return '';
    return `Title: ${instructions.title}\n\nMaterials: ${instructions.materials}\n\nInstructions: ${instructions.instructions}\n\nSafety Precautions: ${instructions.safetyPrecautions}`;
  }

  const handleDownloadPdf = () => {
    if (!instructions) return;
    const doc = new jsPDF();
    const text = getInstructionsAsText();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save('experiment-instructions.pdf');
  };

  const handlePlayAudio = async () => {
    if (!instructions) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const text = getInstructionsAsText();
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
        title="Experiment Instructions Generator"
        description="Generate simple and safe scientific experiment instructions for students."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Experiment Details</CardTitle>
            <CardDescription>Fill in the details to generate instructions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Volcano Eruption" {...field} />
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
                        <Input placeholder="e.g., 4th Grade" {...field} />
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
                        <Textarea placeholder="Describe what students should learn from the experiment." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Instructions
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start justify-between">
            <div className="flex-1">
              <CardTitle>Generated Instructions</CardTitle>
              <CardDescription>The AI-generated instructions will appear here.</CardDescription>
            </div>
             {instructions && <div className="flex items-center gap-2">
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
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
              {instructions && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h2 className='font-headline'>{instructions.title}</h2>
                  <h3>Materials</h3>
                  <p>{instructions.materials}</p>
                  <h3>Instructions</h3>
                  <p>{instructions.instructions}</p>
                  <Alert variant="destructive" className="mt-4">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Safety Precautions</AlertTitle>
                    <AlertDescription>
                      {instructions.safetyPrecautions}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              {!isLoading && !instructions && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Your instructions will be shown here.</p>
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
