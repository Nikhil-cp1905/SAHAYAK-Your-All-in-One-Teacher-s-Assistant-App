'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, AudioLines, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateVoiceScript, GenerateVoiceScriptOutput } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  text: z.string().min(10, { message: 'Please enter at least 10 characters of text to convert.' }),
});

export default function VoiceScriptPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [audio, setAudio] = React.useState<GenerateVoiceScriptOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAudio(null);
    try {
      const result = await generateVoiceScript(values.text);
      setAudio(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating voice script',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = () => {
    const text = form.getValues('text');
    if (!text) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save('voice-script.pdf');
  };

  return (
    <MainLayout>
      <PageHeader
        title="Voice Script Generator"
        description="Convert text into natural-sounding speech for accessibility and diverse learning."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Text to Convert</CardTitle>
            <CardDescription>Enter the text you want to turn into speech.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Script Text</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Paste your script here..." {...field} rows={15} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Audio
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={!form.getValues('text')}
                        variant="outline"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Text as PDF
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
            <CardDescription>The generated audio will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-center h-64 border border-dashed rounded-md">
                {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
                {audio && (
                    <div className='text-center'>
                        <AudioLines className="h-12 w-12 mx-auto text-primary mb-4" />
                        <audio controls src={audio.media} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
                {!isLoading && !audio && (
                    <p className="text-muted-foreground">Your audio player will be shown here.</p>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
