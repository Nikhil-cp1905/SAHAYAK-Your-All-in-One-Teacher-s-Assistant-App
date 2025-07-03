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
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateLessonPlan, LessonPlanOutput } from '@/ai/flows/lesson-plan-generator';
import { generateVoiceScript } from '@/ai/flows/voice-script-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  subject: z.string().min(3, { message: 'Please enter at least 3 characters' }),
  gradeLevel: z.string().min(1, { message: 'Please select a grade level' }),
  learningObjectives: z.string().min(10, { message: 'Please describe what students should learn' }),
  optionalSteps: z.string().optional(),
  supportingMaterial: z.string().optional(),
});

export default function LessonPlanPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [lessonPlan, setLessonPlan] = React.useState<LessonPlanOutput | null>(null);
  const { toast } = useToast();

  const [isAudioLoading, setIsAudioLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      gradeLevel: '',
      learningObjectives: '',
      optionalSteps: '',
      supportingMaterial: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLessonPlan(null);
    setAudioUrl(null);
    try {
      const result = await generateLessonPlan(values);
      setLessonPlan(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: 'We couldn\'t create your lesson plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getLessonPlanAsText = () => {
    if (!lessonPlan) return '';
    return `Title: ${lessonPlan.title}\n\nIntroduction: ${lessonPlan.introduction}\n\nActivities: ${lessonPlan.activities}\n\nAssessment: ${lessonPlan.assessment}\n\nConclusion: ${lessonPlan.conclusion}`;
  };

  const handleDownloadPdf = () => {
    if (!lessonPlan) return;
    const doc = new jsPDF();
    const text = getLessonPlanAsText();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save('lesson-plan.pdf');
  };

  const handlePlayAudio = async () => {
    if (!lessonPlan) return;
    setIsAudioLoading(true);
    setAudioUrl(null);
    try {
      const text = getLessonPlanAsText();
      const result = await generateVoiceScript(text);
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
              Lesson Plan Helper
            </span>
          </div>
        }
        description="Create engaging lesson plans in minutes with all the key components"
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Plan Your Lesson</CardTitle>
            <CardDescription className="text-blue-100">
              Fill in the details to create your perfect lesson
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What subject?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Example: Math, Science, History..."
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
                          placeholder="Example: 3rd Grade, High School..."
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
                          placeholder="Describe what students should know or be able to do..."
                          className="min-h-[100px] border-gray-300 focus:border-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="optionalSteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Any special activities? (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Example: Group work, field trip, video..."
                          className="min-h-[80px] border-gray-300 focus:border-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="supportingMaterial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Materials needed? (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Example: Textbook page 45, markers, worksheets..."
                          className="min-h-[80px] border-gray-300 focus:border-blue-500"
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
                      Creating Your Lesson Plan...
                    </>
                  ) : (
                    'Create My Lesson Plan!'
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
                <CardTitle className="text-white">Your Lesson Plan</CardTitle>
                <CardDescription className="text-blue-100">
                  {lessonPlan ? 'Ready to use!' : 'Will appear here'}
                </CardDescription>
              </div>
              {lessonPlan && (
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
            <ScrollArea className="h-[600px] w-full p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-gray-600">Building your lesson plan...</p>
                  <p className="text-gray-500 text-sm">This might take a moment</p>
                </div>
              ) : lessonPlan ? (
                <div className="prose prose-sm max-w-none">
                  <h2 className="text-2xl font-bold text-blue-600 mb-4">{lessonPlan.title}</h2>
                  
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-blue-700 mb-2">Introduction</h3>
                    <p className="text-gray-700">{lessonPlan.introduction}</p>
                  </div>
                  
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-bold text-green-700 mb-2">Activities</h3>
                    <p className="text-gray-700">{lessonPlan.activities}</p>
                  </div>
                  
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <h3 className="font-bold text-yellow-700 mb-2">Assessment</h3>
                    <p className="text-gray-700">{lessonPlan.assessment}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h3 className="font-bold text-purple-700 mb-2">Conclusion</h3>
                    <p className="text-gray-700">{lessonPlan.conclusion}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Fill in the details on the left to create your lesson plan!
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