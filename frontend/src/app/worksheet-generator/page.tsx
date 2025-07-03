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
import { Checkbox } from '@/components/ui/checkbox';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateWorksheet, WorksheetGeneratorOutput } from '@/ai/flows/worksheet-generator';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  gradeLevel: z.string().min(1, { message: 'Please select a grade level.' }),
  questionTypes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one question type.',
  }),
  numberQuestions: z.coerce.number().min(1).max(20),
});

const questionTypeOptions = [
  { id: 'multiple_choice', label: 'Multiple Choice' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'fill_in_the_blanks', label: 'Fill in the Blanks' },
  { id: 'true_false', label: 'True/False' },
];

export default function WorksheetGeneratorPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [worksheet, setWorksheet] = React.useState<WorksheetGeneratorOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '5th Grade',
      questionTypes: ['multiple_choice', 'short_answer'],
      numberQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setWorksheet(null);
    setAudioUrl(null);
    try {
      const result = await generateWorksheet(values);
      setWorksheet(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating worksheet',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = () => {
    if (!worksheet) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(worksheet.worksheet, 180);
    doc.text(splitText, 10, 10);
    doc.save('worksheet.pdf');
  };

  const handlePlayAudio = async () => {
    if (!worksheet) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const result = await generateVoiceScript(worksheet.worksheet);
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
        title="Worksheet Generator"
        description="Generate worksheets on a given topic with varied question types."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Worksheet Details</CardTitle>
            <CardDescription>Fill in the details to generate a new worksheet.</CardDescription>
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
                        <Input placeholder="e.g., The Solar System" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={`${i + 1}th Grade`}>
                              {i + 1}th Grade
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="questionTypes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Question Types</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {questionTypeOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="questionTypes"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(field.value?.filter((value) => value !== item.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Worksheet
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start justify-between">
            <div className='flex-1'>
              <CardTitle>Generated Worksheet</CardTitle>
              <CardDescription>The AI-generated worksheet will appear here.</CardDescription>
            </div>
            {worksheet && <div className="flex items-center gap-2">
                <Button onClick={handlePlayAudio} disabled={isAudioLoading || isLoading} variant="outline" size="icon">
                    {isAudioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isLoading} variant="outline" size="icon">
                    <FileDown className="h-4 w-4" />
                </Button>
            </div>}
          </CardHeader>
          <CardContent className="flex-grow">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {worksheet && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {worksheet.worksheet}
                </div>
              )}
              {!isLoading && !worksheet && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Your worksheet will be shown here.</p>
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
