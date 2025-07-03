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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { explainConcept, ExplainConceptOutput } from '@/ai/flows/concept-explainer';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  learningLevel: z.string().min(1, { message: 'Please select a learning level.' }),
});

export default function ConceptExplainerPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [explanation, setExplanation] = React.useState<ExplainConceptOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      learningLevel: 'middle_school',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExplanation(null);
    setAudioUrl(null);
    try {
      const result = await explainConcept(values);
      setExplanation(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating explanation',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = () => {
    if (!explanation) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(explanation.explanation, 180);
    doc.text(splitText, 10, 10);
    doc.save('concept-explanation.pdf');
  };

  const handlePlayAudio = async () => {
    if (!explanation) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const result = await generateVoiceScript(explanation.explanation);
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
        title="Concept Explainer"
        description="Get clear, concise explanations of complex topics, tailored to different learning levels."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Concept Details</CardTitle>
            <CardDescription>What concept do you need explained?</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complex Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Photosynthesis, Black Holes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="learningLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a learning level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="elementary">Elementary School</SelectItem>
                          <SelectItem value="middle_school">Middle School</SelectItem>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Explain Concept
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start justify-between">
            <div className='flex-1'>
              <CardTitle>Generated Explanation</CardTitle>
              <CardDescription>The AI-generated explanation will appear here.</CardDescription>
            </div>
             {explanation && <div className="flex items-center gap-2">
                <Button onClick={handlePlayAudio} disabled={isAudioLoading || isLoading} variant="outline" size="icon">
                    {isAudioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isLoading} variant="outline" size="icon">
                    <FileDown className="h-4 w-4" />
                </Button>
            </div>}
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {explanation && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {explanation.explanation}
                </div>
              )}
              {!isLoading && !explanation && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Your explanation will be shown here.</p>
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
