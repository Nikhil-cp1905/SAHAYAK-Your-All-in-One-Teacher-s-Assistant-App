'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Download, Volume2, FileDown, Sparkles } from 'lucide-react';
import Image from 'next/image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateStory, GenerateStoryOutput } from '@/ai/flows/story-generator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Please enter at least 3 characters' }),
  gradeLevel: z.string().min(1, { message: 'Please select a grade level' }),
  length: z.enum(['short', 'medium', 'long']),
});

export default function StoryGeneratorPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [story, setStory] = React.useState<GenerateStoryOutput | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      gradeLevel: '3rd Grade',
      length: 'short',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStory(null);
    try {
      const result = await generateStory(values);
      setStory(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Story Creation Failed',
        description: 'We couldn\'t create your story. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleDownloadZip = async () => {
    if (!story) return;
    const zip = new JSZip();
    zip.file("story.txt", story.text);

    if(story.imageUrl) {
        try {
            const imageResponse = await fetch(story.imageUrl);
            const imageBlob = await imageResponse.blob();
            zip.file("image.png", imageBlob);
        } catch (error) {
            console.error("Failed to fetch image for zip", error);
        }
    }

    if(story.audioUrl) {
        try {
            const audioResponse = await fetch(story.audioUrl);
            const audioBlob = await audioResponse.blob();
            zip.file("audio.wav", audioBlob);
        } catch (error) {
            console.error("Failed to fetch audio for zip", error);
        }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "story-export.zip");
    });
  };

  const handleDownloadPdf = () => {
    if (!story) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(story.text, 180);
    doc.text(splitText, 10, 10);
    doc.save('story.pdf');
  };
  
  const playAudio = () => {
    audioRef.current?.play();
  }

  return (
    <MainLayout>
      <PageHeader 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Story Creator
            </span>
          </div>
        }
        description="Make magical stories with pictures and sounds for your students!"
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Create Your Story</CardTitle>
            <CardDescription className="text-blue-100">
              Tell us what your story should be about
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
                      <FormLabel className="text-gray-700 font-medium">What's your story about?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Example: A space adventure, jungle animals, a magical castle..."
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
                          {[...Array(8)].map((_, i) => (
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
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">How long should it be?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short" className="hover:bg-blue-50">Short (1-2 paragraphs)</SelectItem>
                          <SelectItem value="medium" className="hover:bg-blue-50">Medium (3-4 paragraphs)</SelectItem>
                          <SelectItem value="long" className="hover:bg-blue-50">Long (5+ paragraphs)</SelectItem>
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
                      Creating Your Story...
                    </>
                  ) : (
                    'Make My Story!'
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
                <CardTitle className="text-white">Your Story</CardTitle>
                <CardDescription className="text-blue-100">
                  {story ? 'Ready to share!' : 'Will appear here'}
                </CardDescription>
              </div>
              {story && (
                <div className="flex gap-2">
                  {story.audioUrl && (
                    <Button 
                      onClick={playAudio}
                      variant="ghost"
                      size="icon"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 h-full">
            <div className="space-y-4 h-full">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-gray-600">Creating your magical story...</p>
                  <p className="text-gray-500 text-sm">This might take a moment</p>
                </div>
              ) : story ? (
                <>
                  {story.imageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                      <Image 
                        src={story.imageUrl} 
                        alt="Generated story illustration" 
                        layout="fill" 
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDownloadPdf}
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Save as PDF
                      </Button>
                      <Button 
                        onClick={handleDownloadZip}
                        variant="outline"
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download All
                      </Button>
                    </div>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-gray-50">
                      <h3 className="text-xl font-bold text-blue-600 mb-2">
                        {form.watch('topic') || 'Your Story'}
                      </h3>
                      <p className="whitespace-pre-wrap text-gray-700">{story.text}</p>
                    </ScrollArea>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Fill in the details on the left to create your magical story!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {story?.audioUrl && <audio ref={audioRef} src={story.audioUrl} preload="auto" className="hidden" />}
    </MainLayout>
  );
}