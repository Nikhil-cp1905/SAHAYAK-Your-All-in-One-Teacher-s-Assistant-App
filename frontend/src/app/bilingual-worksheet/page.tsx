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
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { bilingualWorksheetGenerator, BilingualWorksheetGeneratorOutput } from '@/ai/flows/bilingual-worksheet-generator';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Please enter at least 3 characters' }),
  primaryLanguage: z.string().min(2, { message: 'Please enter primary language' }),
  secondaryLanguage: z.string().min(2, { message: 'Please enter secondary language' }),
  gradeLevel: z.string().min(1, { message: 'Please enter grade level' }),
  worksheetType: z.string().min(3, { message: 'Please enter worksheet type' }),
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
        title: 'Oops! Something went wrong',
        description: 'We couldn\'t create your worksheets. Please try again!',
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
        title: 'Audio Error',
        description: 'Couldn\'t create the audio version. Please try again.',
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
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Languages className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dual-Language Worksheet Maker
            </span>
          </div>
        }
        description="Create learning materials in two languages for bilingual students"
      />
      
      <div className="grid gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Create Your Worksheets</CardTitle>
            <CardDescription className="text-blue-100">
              Fill in the details to make worksheets in two languages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">What's the topic?</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: Animals, Numbers, Seasons..."
                            className="border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="worksheetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">What type of worksheet?</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: Vocabulary, Math, Reading..."
                            className="border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">First Language</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: English"
                            className="border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Second Language</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: Spanish"
                            className="border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">For which grade?</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: 3rd Grade, Middle School..."
                            className="border-gray-300 focus:border-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Worksheets...
                    </>
                  ) : (
                    'Make My Worksheets!'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">{form.watch('primaryLanguage') || 'First Language'}</CardTitle>
                  <CardDescription className="text-blue-100">
                    {worksheets ? 'Ready to use!' : 'Will appear here'}
                  </CardDescription>
                </div>
                {worksheets && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handlePlayAudio(worksheets.primaryLanguageWorksheet, 'primary')} 
                      disabled={isAudioLoading.primary}
                      variant="ghost"
                      size="icon"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      {isAudioLoading.primary ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleDownloadPdf(worksheets.primaryLanguageWorksheet, form.getValues('primaryLanguage'))}
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
            <CardContent className="p-0 h-full">
              <ScrollArea className="h-[400px] w-full p-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-gray-600">Creating your worksheets...</p>
                  </div>
                ) : worksheets ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {worksheets.primaryLanguageWorksheet}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Your first language worksheet will appear here!
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">{form.watch('secondaryLanguage') || 'Second Language'}</CardTitle>
                  <CardDescription className="text-blue-100">
                    {worksheets ? 'Ready to use!' : 'Will appear here'}
                  </CardDescription>
                </div>
                {worksheets && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handlePlayAudio(worksheets.secondaryLanguageWorksheet, 'secondary')} 
                      disabled={isAudioLoading.secondary}
                      variant="ghost"
                      size="icon"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      {isAudioLoading.secondary ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleDownloadPdf(worksheets.secondaryLanguageWorksheet, form.getValues('secondaryLanguage'))}
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
            <CardContent className="p-0 h-full">
              <ScrollArea className="h-[400px] w-full p-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-gray-600">Creating your worksheets...</p>
                  </div>
                ) : worksheets ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {worksheets.secondaryLanguageWorksheet}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Your second language worksheet will appear here!
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </MainLayout>
  );
}