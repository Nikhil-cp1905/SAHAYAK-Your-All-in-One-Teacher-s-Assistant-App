'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Volume2, FileDown, Sparkles, Accessibility } from 'lucide-react';
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
  topic: z.string().min(3, { message: 'Please enter at least 3 characters' }),
  gradeLevel: z.string().min(1, { message: 'Please select a grade level' }),
  learningObjectives: z.string().min(10, { message: 'Please describe learning goals' }),
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
        title: 'Oops! Something went wrong',
        description: 'We couldn\'t create your worksheet. Please try again.',
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
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Accessibility className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              All-Learners Worksheet Maker
            </span>
          </div>
        }
        description="Create worksheets that work for every student's learning needs"
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Create Your Worksheet</CardTitle>
            <CardDescription className="text-blue-100">
              Customize for different learning styles and needs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What's the topic?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Example: Fractions, The Solar System..."
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
                
                <FormField
                  control={form.control}
                  name="learningObjectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What should students learn?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the key learning goals..."
                          className="min-h-[100px] border-gray-300 focus:border-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Text Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small" className="hover:bg-blue-50">Small</SelectItem>
                            <SelectItem value="medium" className="hover:bg-blue-50">Medium</SelectItem>
                            <SelectItem value="large" className="hover:bg-blue-50">Large</SelectItem>
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
                        <FormLabel className="text-gray-700 font-medium">Colors</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Select contrast" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal" className="hover:bg-blue-50">Standard</SelectItem>
                            <SelectItem value="high" className="hover:bg-blue-50">High Contrast</SelectItem>
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-gray-700 font-medium">Simpler Language</FormLabel>
                        <FormDescription className="text-gray-500">
                          Use easier words and shorter sentences
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-purple-600"
                        />
                      </FormControl>
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
                      Creating Worksheet...
                    </>
                  ) : (
                    'Make My Worksheet!'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Column - Results */}
        <Card className="border-0 shadow-lg h-full">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Your Worksheet</CardTitle>
                <CardDescription className="text-blue-100">
                  {worksheet ? 'Ready to use!' : 'Will appear here'}
                </CardDescription>
              </div>
              {worksheet && (
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
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-[600px] w-full">
              <div className={cn('p-6', fontSizeClass, colorContrastClass)}>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-gray-600">Making your worksheet...</p>
                    <p className="text-gray-500 text-sm">This might take a moment</p>
                  </div>
                ) : worksheet ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {worksheet.worksheetContent}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Fill in the details on the left to create your worksheet!
                    </p>
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