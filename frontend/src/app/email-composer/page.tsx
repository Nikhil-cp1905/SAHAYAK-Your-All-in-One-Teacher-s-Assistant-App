'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Copy, Mail, Send } from 'lucide-react';
import jsPDF from 'jspdf';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

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

  const handleDownloadPdf = () => {
    if (!email) return;
    const doc = new jsPDF();
    const text = `Subject: ${email.subject}\n\nBody:\n${email.body}`;
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save('email-draft.pdf');
  };

  return (
    <MainLayout>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Email Composer
            </span>
          </div>
        }
        description="Draft professional emails for parents, students, or colleagues in seconds."
      />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
            <CardTitle className="text-white">Email Details</CardTitle>
            <CardDescription className="text-blue-100">
              Provide the details for the email you want to generate
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
                      <FormLabel className="text-gray-700 font-medium">Topic / Purpose</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Upcoming field trip to the science museum"
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
                    name="audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="parents">Parents</SelectItem>
                            <SelectItem value="students">Students</SelectItem>
                            <SelectItem value="colleagues">Colleagues</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Tone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="encouraging">Encouraging</SelectItem>
                          </SelectContent>
                        </Select>
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
                      Composing Email...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Compose Email
                    </>
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
                <CardTitle className="text-white">Generated Email</CardTitle>
                <CardDescription className="text-blue-100">
                  {email ? 'Ready to send!' : 'Will appear here'}
                </CardDescription>
              </div>
              {email && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleCopy(email.subject, 'Subject')}
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Copy className="h-4 w-4" />
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
                  <p className="text-gray-600">Crafting your email...</p>
                  <p className="text-gray-500 text-sm">This won't take long</p>
                </div>
              ) : email ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-blue-700 mb-2">Subject</h3>
                    <p className="text-gray-700">{email.subject}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-bold text-green-700 mb-2">Email Body</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{email.body}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleCopy(email.subject, 'Subject')}
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Subject
                    </Button>
                    <Button 
                      onClick={() => handleCopy(email.body, 'Body')}
                      variant="outline"
                      className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Body
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Mail className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Fill in the details on the left to generate your professional email
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}