'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Download } from 'lucide-react';
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
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }),
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
        throw new Error("The AI failed to generate an image. Please try a different prompt.");
      }
      setVisualAid(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating visual aid',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="Visual Aid Generator"
        description="Create doodles and images to go with your educational material."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Image Prompt</CardTitle>
            <CardDescription>Describe the visual aid you want to create.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., A simple cartoon of the water cycle with smiling clouds and sun" {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Image
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <div>
                <CardTitle>Generated Image</CardTitle>
                <CardDescription>The AI-generated image will appear here.</CardDescription>
            </div>
            {visualAid?.imageUrl && (
                 <Button asChild variant="outline">
                    <a href={visualAid.imageUrl} download="visual-aid.png">
                        <Download className="mr-2 h-4 w-4"/>
                        Download
                    </a>
                </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center">
                {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
                {!isLoading && visualAid?.imageUrl && (
                    <div className="relative w-full h-full">
                         <Image src={visualAid.imageUrl} alt="Generated Visual Aid" layout="fill" objectFit="contain" />
                    </div>
                )}
                {!isLoading && !visualAid && (
                    <p className="text-muted-foreground">Your image will be shown here.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
