'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Volume2, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateInclusiveWorksheet, InclusiveWorksheetOutput } from '@/ai/flows/inclusive-worksheet-generator';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  gradeLevel: z.string().min(1, { message: 'Grade Level is required.' }),
  learningObjectives: z.string().min(10, { message: 'Please provide learning objectives.' }),
  fontSize: z.enum(['small', 'medium', 'large']),
  colorContrast: z.enum(['normal', 'high']),
  simplifiedLanguage: z.boolean(),
});

export default function InclusiveWorksheetPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [worksheet, setWorksheet] = React.useState<InclusiveWorksheetOutput | null>(null);
  const [previewSettings, setPreviewSettings] = React.useState<Partial<z.infer<typeof formSchema>>>({});
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '4th Grade',
      learningObjectives: '',
      fontSize: 'medium',
      colorContrast: 'normal',
      simplifiedLanguage: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setWorksheet(null);
    setAudioUrl(null);
    setPreviewSettings(values);
    try {
      const result = await generateInclusiveWorksheet(values);
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
    const splitText = doc.splitTextToSize(worksheet.worksheetContent, 180);
    doc.text(splitText, 10, 10);
    doc.save('inclusive-worksheet.pdf');
  };

  const handlePlayAudio = async () => {
    if (!worksheet) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const result = await generateVoiceScript(worksheet.worksheetContent);
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

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[previewSettings.fontSize || 'medium'];

  const colorContrastClass = {
    normal: 'text-foreground bg-background',
    high: 'text-black bg-white',
  }[previewSettings.colorContrast || 'normal'];

  return (
    <MainLayout>
      <PageHeader
        title="Inclusive Worksheet Generator"
        description="Adapt worksheets to meet diverse learning needs."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Worksheet Details</CardTitle>
            <CardDescription>Fill in the details to generate an inclusive worksheet.</CardDescription>
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
                        <Input placeholder="e.g., The Water Cycle" {...field} />
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
                        <Textarea placeholder="Describe what students should learn." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="colorContrast"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Contrast</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="simplifiedLanguage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Simplified Language</FormLabel>
                        <FormDescription>Use simpler words and sentence structures.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
                <CardDescription>The AI-generated inclusive worksheet will appear here.</CardDescription>
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
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <div className={cn('p-4', fontSizeClass, colorContrastClass)}>
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                {worksheet && (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {worksheet.worksheetContent}
                  </div>
                )}
                {!isLoading && !worksheet && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Your worksheet will be shown here.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
       {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </MainLayout>
  );
}
