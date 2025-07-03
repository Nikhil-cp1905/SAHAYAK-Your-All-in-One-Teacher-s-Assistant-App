'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Volume2, FileDown, Sparkles, Lightbulb } from 'lucide-react';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { explainConcept, ExplainConceptOutput } from '@/ai/flows/concept-explainer';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Please enter at least 3 characters' }),
  learningLevel: z.string().min(1, { message: 'Please select a learning level' }),
});

export default function ConceptExplainerPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [explanation, setExplanation] = React.useState<ExplainConceptOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      learningLevel: 'middle_school',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExplanation(null);
    setAudioUrl(null);
    try {
      const result = await explainConcept(values);
      setExplanation(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: 'I couldn\'t explain that concept. Please try again!',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadPdf = () => {
    if (!explanation) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(explanation.explanation, 180);
    doc.text(splitText, 10, 10);
    doc.save('concept-explanation.pdf');
  };

  const handlePlayAudio = async () => {
    if (!explanation) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const result = await generateVoiceScript(explanation.explanation);
      setAudioUrl(result.media);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Couldn\'t create the audio explanation. Please try again.',
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
              <Lightbulb className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Concept Helper
            </span>
          </div>
        }
        description="Make hard topics easy to understand with simple explanations"
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">What Needs Explaining?</CardTitle>
            <CardDescription className="text-blue-100">
              Tell us what you want to understand better
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
                      <FormLabel className="text-gray-700 font-medium">What concept?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Example: Photosynthesis, Fractions, The Water Cycle..."
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
                  name="learningLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Explain it for:</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="elementary" className="hover:bg-blue-50">Young Students</SelectItem>
                          <SelectItem value="middle_school" className="hover:bg-blue-50">Middle School</SelectItem>
                          <SelectItem value="high_school" className="hover:bg-blue-50">High School</SelectItem>
                          <SelectItem value="college" className="hover:bg-blue-50">College/Adult</SelectItem>
                        </SelectContent>
                      </Select>
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
                      Creating Explanation...
                    </>
                  ) : (
                    'Explain It To Me!'
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
                <CardTitle className="text-white">Your Explanation</CardTitle>
                <CardDescription className="text-blue-100">
                  {explanation ? 'Ready to learn!' : 'Will appear here'}
                </CardDescription>
              </div>
              {explanation && (
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
            <ScrollArea className="h-[400px] w-full p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-gray-600">Creating your explanation...</p>
                  <p className="text-gray-500 text-sm">This might take a moment</p>
                </div>
              ) : explanation ? (
                <div className="prose prose-sm max-w-none">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                    <h3 className="font-bold text-blue-700 mb-2">
                      {form.watch('topic') || 'Your Concept'}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{explanation.explanation}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Enter a concept on the left to get a simple explanation!
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