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
import { multilingualTranslation, MultilingualTranslationOutput } from '@/ai/flows/multilingual-translation';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  text: z.string().min(2, { message: 'Please enter text to translate.' }),
  targetLanguage: z.string().min(2, { message: 'Please specify a target language.' }),
});

export default function TranslationPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [translation, setTranslation] = React.useState<MultilingualTranslationOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      targetLanguage: 'French',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTranslation(null);
    setAudioUrl(null);
    try {
      const result = await multilingualTranslation(values);
      setTranslation(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error performing translation',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = () => {
    if (!translation) return;
    const doc = new jsPDF();
    const sourceText = `Source Text:\n${form.getValues('text')}`;
    const translatedText = `\n\nTranslated Text (${form.getValues('targetLanguage')}):\n${translation.translatedText}`;
    const fullText = sourceText + translatedText;
    const splitText = doc.splitTextToSize(fullText, 180);
    doc.text(splitText, 10, 10);
    doc.save('translation.pdf');
  };

  const handlePlayAudio = async () => {
    if (!translation) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const result = await generateVoiceScript(translation.translatedText);
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
        title="Multilingual Translation"
        description="Translate educational content into multiple languages with ease."
      />
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text to Translate</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter text here..." {...field} rows={8} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-6">
                    <FormField
                    control={form.control}
                    name="targetLanguage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Target Language</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., French, Mandarin" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Translate
                    </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-headline">Translated Text</h3>
             {translation && (
                <div className="flex items-center gap-2">
                    <Button onClick={handlePlayAudio} disabled={isAudioLoading || isLoading} variant="outline" size="icon">
                        {isAudioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button onClick={handleDownloadPdf} disabled={isLoading} variant="outline" size="icon">
                        <FileDown className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
        <Card className="min-h-[200px]">
            <CardContent className="p-6">
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {translation && (
                    <p className="whitespace-pre-wrap">{translation.translatedText}</p>
                )}
                {!isLoading && !translation && (
                    <div className="flex items-center justify-center h-full pt-16">
                        <p className="text-muted-foreground">Your translation will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
       {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </MainLayout>
  );
}
