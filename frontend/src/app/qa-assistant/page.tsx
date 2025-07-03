'use client';

import * as React from 'react';
import { Send, User, Bot, Loader2, Sparkles, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { conversationalAssistant } from '@/ai/flows/conversational-assistant';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function QAA_AssistantPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages;
      const result = await conversationalAssistant({ history, prompt: input });
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error getting response',
        description: 'The assistant could not respond. Please try again.',
      });
       // remove the user message if the assistant fails
       setMessages(messages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (messages.length === 0) return;
    const doc = new jsPDF();
    const chatText = messages
      .map((msg) => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
    
    doc.setFontSize(18);
    doc.text("Chat History", 10, 15);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(chatText, 180);
    doc.text(splitText, 10, 25);
    doc.save('chat-history.pdf');
  };

  return (
    <MainLayout>
      <PageHeader
        title="Q&A Assistant"
        description="Ask questions and get immediate, informative answers from your AI teaching assistant."
      />
      <Card className="flex flex-col h-[70vh]">
        <CardHeader className="flex-row items-center justify-between">
            <div></div>
             {messages.length > 0 && (
                <Button onClick={handleDownloadPdf} variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Chat
                </Button>
            )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Sparkles className="w-12 h-12 mb-4"/>
                    <p className="text-lg font-medium">Welcome to the Q&A Assistant!</p>
                    <p>Ask me anything about your lessons, homework, or any concept you're curious about.</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' ? 'justify-end' : ''
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg p-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                     <Avatar className="h-8 w-8">
                        <AvatarFallback><User/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </MainLayout>
  );
}
