'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, AudioLines, FileDown, Volume2 } from 'lucide-react';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateVoiceScript, GenerateVoiceScriptOutput } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

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
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Volume2 className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Voice Script Generator
            </span>
          </div>
        }
        description="Convert text into natural-sounding speech for accessibility and diverse learning."
      />
      <div className="grid gap-8 md:grid-cols-2">
        {/* Input Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Text to Convert</CardTitle>
            <CardDescription className="text-blue-100">
              Enter the text you want to turn into speech
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Script Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your script here..."
                          className="min-h-[300px] border-gray-300 focus:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <AudioLines className="mr-2 h-5 w-5" />
                        Generate Audio
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={!form.getValues('text')}
                    variant="outline"
                    className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <FileDown className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card className="border-0 shadow-lg h-full">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Generated Audio</CardTitle>
            <CardDescription className="text-blue-100">
              {audio ? 'Ready to play!' : 'Will appear here'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-full">
            <div className="flex items-center justify-center h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-gray-600">Converting text to speech...</p>
                  <p className="text-gray-500 text-sm">This might take a moment</p>
                </div>
              ) : audio ? (
                <div className="w-full p-6 space-y-6">
                  <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg border border-blue-100">
                    <AudioLines className="h-12 w-12 text-blue-600 mb-4" />
                    <audio
                      controls
                      src={audio.media}
                      className="w-full max-w-md"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-bold text-green-700 mb-2">Original Text</h3>
                    <ScrollArea className="h-[120px] w-full">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">
                        {form.getValues('text')}
                      </p>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Volume2 className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Your generated audio will appear here after conversion
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}