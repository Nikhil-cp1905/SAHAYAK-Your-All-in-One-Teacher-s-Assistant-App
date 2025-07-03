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
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { bilingualWorksheetGenerator, BilingualWorksheetGeneratorOutput } from '@/ai/flows/bilingual-worksheet-generator';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  primaryLanguage: z.string().min(2, { message: 'Primary language is required.' }),
  secondaryLanguage: z.string().min(2, { message: 'Secondary language is required.' }),
  gradeLevel: z.string().min(1, { message: 'Grade level is required.' }),
  worksheetType: z.string().min(3, { message: 'Worksheet type is required.' }),
});

export default function BilingualWorksheetPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [worksheets, setWorksheets] = React.useState<BilingualWorksheetGeneratorOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState({ primary: false, secondary: false });
  const [audioUrl, setAudioUrl] = React.useState<{ primary: string | null; secondary: string | null }>({ primary: null, secondary: null });
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      primaryLanguage: 'English',
      secondaryLanguage: 'Spanish',
      gradeLevel: '6th Grade',
      worksheetType: 'Vocabulary',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setWorksheets(null);
    setAudioUrl({ primary: null, secondary: null });
    try {
      const result = await bilingualWorksheetGenerator(values);
      setWorksheets(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating worksheets',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = (content: string, language: string) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${language}-worksheet.pdf`);
  };

  const handlePlayAudio = async (content: string, langType: 'primary' | 'secondary') => {
    setIsAudioLoading(prev => ({ ...prev, [langType]: true }));
    setAudioUrl(prev => ({ ...prev, [langType]: null }));
    try {
      const result = await generateVoiceScript(content);
      setAudioUrl(prev => ({ ...prev, [langType]: result.media }));
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error generating audio',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsAudioLoading(prev => ({ ...prev, [langType]: false }));
    }
  };

  React.useEffect(() => {
    if (audioUrl.primary && audioRef.current) {
        audioRef.current.src = audioUrl.primary;
        audioRef.current.play();
    }
  }, [audioUrl.primary]);

   React.useEffect(() => {
    if (audioUrl.secondary && audioRef.current) {
        audioRef.current.src = audioUrl.secondary;
        audioRef.current.play();
    }
  }, [audioUrl.secondary]);


  return (
    <MainLayout>
      <PageHeader
        title="Bilingual Worksheet Generator"
        description="Generate worksheets in two languages to support bilingual education."
      />
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Worksheet Details</CardTitle>
            <CardDescription>Fill in the details to generate bilingual worksheets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Animals" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="primaryLanguage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Primary Language</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., English" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="secondaryLanguage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Secondary Language</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Spanish" {...field} />
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
                            <Input placeholder="e.g., 6th Grade" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="worksheetType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Worksheet Type</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Vocabulary, Math" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Worksheets
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex-1">
                        <CardTitle>Primary Language Worksheet</CardTitle>
                        <CardDescription>{form.getValues('primaryLanguage')}</CardDescription>
                    </div>
                     {worksheets && <div className="flex items-center gap-2">
                        <Button onClick={() => handlePlayAudio(worksheets.primaryLanguageWorksheet, 'primary')} disabled={isAudioLoading.primary || isLoading} variant="outline" size="icon">
                            {isAudioLoading.primary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Button onClick={() => handleDownloadPdf(worksheets.primaryLanguageWorksheet, form.getValues('primaryLanguage'))} disabled={isLoading} variant="outline" size="icon">
                            <FileDown className="h-4 w-4" />
                        </Button>
                    </div>}
                </CardHeader>
                <CardContent className="flex-grow">
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {isLoading && <Skeleton className="h-full w-full" />}
                    {worksheets && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{worksheets.primaryLanguageWorksheet}</div>}
                    {!isLoading && !worksheets && <p className="text-muted-foreground text-center pt-16">Worksheet will appear here.</p>}
                    </ScrollArea>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex-1">
                        <CardTitle>Secondary Language Worksheet</CardTitle>
                        <CardDescription>{form.getValues('secondaryLanguage')}</CardDescription>
                    </div>
                     {worksheets && <div className="flex items-center gap-2">
                        <Button onClick={() => handlePlayAudio(worksheets.secondaryLanguageWorksheet, 'secondary')} disabled={isAudioLoading.secondary || isLoading} variant="outline" size="icon">
                            {isAudioLoading.secondary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Button onClick={() => handleDownloadPdf(worksheets.secondaryLanguageWorksheet, form.getValues('secondaryLanguage'))} disabled={isLoading} variant="outline" size="icon">
                            <FileDown className="h-4 w-4" />
                        </Button>
                    </div>}
                </CardHeader>
                <CardContent className="flex-grow">
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {isLoading && <Skeleton className="h-full w-full" />}
                    {worksheets && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{worksheets.secondaryLanguageWorksheet}</div>}
                    {!isLoading && !worksheets && <p className="text-muted-foreground text-center pt-16">Worksheet will appear here.</p>}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
       <audio ref={audioRef} className="hidden" />
    </MainLayout>
  );
}
