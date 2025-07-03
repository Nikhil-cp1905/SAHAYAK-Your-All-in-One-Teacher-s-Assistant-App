'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { generateVisualAid, VisualAidOutput } from '@/ai/flows/visual-aid-generator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  prompt: z.string().min(10, { message: 'Please describe your image in at least 10 words' }),
});

export default function VisualAidPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [visualAid, setVisualAid] = React.useState<VisualAidOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setVisualAid(null);
    try {
      const result = await generateVisualAid(values);
      if (!result.imageUrl) {
        throw new Error("We couldn't create your picture. Try describing it differently!");
      }
      setVisualAid(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <ImageIcon className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Picture Creator
            </span>
          </div>
        }
        description="Turn your ideas into fun drawings and images for your lessons"
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Describe Your Picture</CardTitle>
            <CardDescription className="text-blue-100">
              Tell us what you'd like to see in your drawing
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What should we draw?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Example: A happy cartoon sun shining over green hills with smiling flowers..."
                          className="min-h-[150px] border-gray-300 focus:border-blue-500"
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
                      Drawing Your Picture...
                    </>
                  ) : (
                    'Create My Picture!'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Column - Results */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Your Picture</CardTitle>
                <CardDescription className="text-blue-100">
                  {visualAid ? 'Ready to use!' : 'Will appear here'}
                </CardDescription>
              </div>
              {visualAid?.imageUrl && (
                <Button asChild variant="ghost" className="bg-white/20 hover:bg-white/30 text-white">
                  <a href={visualAid.imageUrl} download="visual-aid.png">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-gray-600">Creating your picture...</p>
                </div>
              ) : visualAid?.imageUrl ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={visualAid.imageUrl} 
                    alt="Generated Visual Aid" 
                    layout="fill" 
                    objectFit="contain"
                    className="rounded-md"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Sparkles className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Describe what you want on the left and we'll draw it for you!
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