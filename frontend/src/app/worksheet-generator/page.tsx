'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Volume2, FileDown, Sparkles } from 'lucide-react';
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
  topic: z.string().min(3, { message: 'Please enter a topic (at least 3 letters)' }),
  gradeLevel: z.string().min(1, { message: 'Please choose a grade level' }),
  questionTypes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Please pick at least one question type',
  }),
  numberQuestions: z.coerce.number().min(1).max(20),
});

const questionTypeOptions = [
  { id: 'multiple_choice', label: 'Multiple Choice', color: 'text-blue-600' },
  { id: 'short_answer', label: 'Short Answer', color: 'text-green-600' },
  { id: 'fill_in_the_blanks', label: 'Fill in the Blanks', color: 'text-purple-600' },
  { id: 'true_false', label: 'True/False', color: 'text-orange-600' },
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
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Worksheet Maker
            </span>
          </div>
        }
        description="Create fun worksheets in seconds with different types of questions!"
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Create Your Worksheet</CardTitle>
            <CardDescription className="text-blue-100">
              Fill in the details to make a fun learning activity
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
                          placeholder="Example: Dinosaurs, Space, Fractions..."
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem 
                              key={i + 1} 
                              value={`${i + 1}th Grade`}
                              className="hover:bg-blue-50"
                            >
                              Grade {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="numberQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">How many questions?</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="20"
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
                  name="questionTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What types of questions?</FormLabel>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {questionTypeOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="questionTypes"
                            render={({ field }) => {
                              return (
                                <FormItem 
                                  key={item.id} 
                                  className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 ${field.value?.includes(item.id) ? 'bg-blue-50 border-blue-300' : ''}`}
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(field.value?.filter((value) => value !== item.id));
                                      }}
                                      className={`border-gray-400 ${item.color}`}
                                    />
                                  </FormControl>
                                  <FormLabel className={`font-normal ${item.color}`}>
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
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
            <ScrollArea className="h-[500px] w-full p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-gray-600">Creating your worksheet...</p>
                  <p className="text-gray-500 text-sm">This might take a moment</p>
                </div>
              ) : worksheet ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">
                    {form.watch('topic') || 'Worksheet'} - Grade {form.watch('gradeLevel').split(' ')[0]}
                  </h3>
                  {worksheet.worksheet}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Fill in the details on the left to create your worksheet!
                  </p>
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