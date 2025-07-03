'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Download, Volume2, FileDown } from 'lucide-react';
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
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  gradeLevel: z.string().min(1, { message: 'Please select a grade level.' }),
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
        title: 'Error generating story',
        description: error instanceof Error ? error.message : String(error),
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
      <PageHeader title="Story Generator" description="Create engaging stories with multimedia assets for your students." />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
            <CardDescription>Fill in the details to generate a new story.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A brave knight and a friendly dragon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(8)].map((_, i) => (
                            <SelectItem key={i + 1} value={`${i + 1}th Grade`}>
                              {i + 1}th Grade
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Story Length</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Story
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generated Story</CardTitle>
            <CardDescription>The AI-generated story and assets will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-[200px] w-full rounded-md" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                    </div>
                ) : story ? (
                    <>
                        {story.imageUrl && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                <Image src={story.imageUrl} alt="Generated story illustration" layout="fill" objectFit="cover" />
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                           {story.audioUrl && <Button onClick={playAudio} variant="outline" size="icon"><Volume2 className="h-4 w-4"/></Button>}
                           <Button onClick={handleDownloadPdf} variant="outline"><FileDown className="mr-2 h-4 w-4"/>Download PDF</Button>
                           <Button onClick={handleDownloadZip} variant="outline"><Download className="mr-2 h-4 w-4"/>Download ZIP</Button>
                           {story.audioUrl && <audio ref={audioRef} src={story.audioUrl} preload="auto" />}
                        </div>
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            <p className="whitespace-pre-wrap">{story.text}</p>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-muted-foreground">Your story will appear here.</p>
                    </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
