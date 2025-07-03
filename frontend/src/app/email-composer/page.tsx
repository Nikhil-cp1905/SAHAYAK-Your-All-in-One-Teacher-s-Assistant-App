'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { composeEmail, EmailComposerOutput } from '@/ai/flows/email-composer';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  topic: z.string().min(5, { message: 'Topic must be at least 5 characters.' }),
  audience: z.string().min(1, { message: 'Please select an audience.' }),
  tone: z.string().min(1, { message: 'Please select a tone.' }),
});

export default function EmailComposerPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState<EmailComposerOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      audience: 'parents',
      tone: 'friendly',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setEmail(null);
    try {
      const result = await composeEmail(values);
      setEmail(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error composing email',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = (textToCopy: string, type: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: `${type} Copied!`,
      description: `The email ${type.toLowerCase()} has been copied to your clipboard.`,
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Email Composer"
        description="Draft professional emails for parents, students, or colleagues in seconds."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Details</CardTitle>
            <CardDescription>Provide the details for the email you want to generate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic / Purpose</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Upcoming field trip to the science museum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="audience"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                            <SelectItem value="parents">Parents</SelectItem>
                            <SelectItem value="students">Students</SelectItem>
                            <SelectItem value="colleagues">Colleagues</SelectItem>
                            </SelectContent>
                        </Select>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="encouraging">Encouraging</SelectItem>
                            </SelectContent>
                        </Select>
                        </FormItem>
                    )}
                    />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Compose Email
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generated Email Draft</CardTitle>
            <CardDescription>Review the generated email and copy it to your email client.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            {isLoading && <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>}
            {email && (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="subject">Subject</Label>
                        <div className="flex items-center gap-2">
                            <Input id="subject" value={email.subject} readOnly />
                            <Button variant="outline" size="icon" onClick={() => handleCopy(email.subject, 'Subject')}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="body">Body</Label>
                         <div className="flex items-start gap-2">
                            <Textarea id="body" value={email.body} readOnly rows={10} />
                            <Button variant="outline" size="icon" onClick={() => handleCopy(email.body, 'Body')}><Copy className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
            )}
             {!isLoading && !email && (
                <div className="flex items-center justify-center h-full rounded-md border border-dashed">
                  <p className="text-muted-foreground">Your email draft will appear here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
