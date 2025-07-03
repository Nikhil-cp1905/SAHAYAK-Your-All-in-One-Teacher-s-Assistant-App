'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Volume2, FileDown, Sparkles, Languages } from 'lucide-react';
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
  text: z.string().min(2, { message: 'Please enter some text to translate' }),
  targetLanguage: z.string().min(2, { message: 'Please choose a language' }),
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
      targetLanguage: 'Spanish',
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
        title: 'Oops! Translation Failed',
        description: 'We couldn\'t translate that. Please try again!',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = () => {
    if (!translation) return;
    const doc = new jsPDF();
    const sourceText = `Original Text:\n${form.getValues('text')}`;
    const translatedText = `\n\nTranslated to ${form.getValues('targetLanguage')}:\n${translation.translatedText}`;
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
        title: 'Audio Error',
        description: 'Couldn\'t create the audio version. Please try again.',
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
              <Languages className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Language Translator
            </span>
          </div>
        }
        description="Translate words and phrases into many different languages"
      />
      
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
          <CardTitle className="text-white">Translate Your Text</CardTitle>
          <CardDescription className="text-blue-100">
            Write something and choose a language to translate to
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What do you want to translate?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Example: Hello, how are you today?"
                          className="min-h-[150px] border-gray-300 focus:border-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="targetLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Translate to:</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: French, Japanese, Spanish..."
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
                        Translating...
                      </>
                    ) : (
                      'Translate Now!'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Your Translation</CardTitle>
                <CardDescription className="text-blue-100">
                  {translation ? 'Ready to use!' : 'Will appear here'}
                </CardDescription>
              </div>
              {translation && (
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePlayAudio} 
                    disabled={isAudioLoading}
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isAudioLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    onClick={handleDownloadPdf}
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : translation ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-700 mb-2">Original Text</h4>
                  <p className="text-gray-700">{form.getValues('text')}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-700 mb-2">
                    Translated to {form.getValues('targetLanguage')}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{translation.translatedText}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Enter text and choose a language to see the translation here!
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