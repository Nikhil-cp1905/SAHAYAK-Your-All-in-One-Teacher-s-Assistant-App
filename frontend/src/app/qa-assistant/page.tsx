'use client';

import * as React from 'react';
import { Send, User, Bot, Loader2, Sparkles, FileDown, MessageCircle } from 'lucide-react';
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
        title: 'Oops! Something went wrong',
        description: 'I couldn\'t answer that. Please try again!',
      });
      setMessages(messages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (messages.length === 0) return;
    const doc = new jsPDF();
    const chatText = messages
      .map((msg) => `${msg.role === 'user' ? 'You' : 'Teaching Assistant'}: ${msg.content}`)
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
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Teaching Buddy
            </span>
          </div>
        }
        description="Ask me anything about your lessons and I'll help you understand!"
      />
      <Card className="flex flex-col h-[70vh] border-0 shadow-lg">
        <CardHeader className="flex-row items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
          <div className="text-white font-medium">Chat with your Teaching Buddy</div>
          {messages.length > 0 && (
            <Button 
              onClick={handleDownloadPdf} 
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white"
              size="sm"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Save Chat
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="p-4 rounded-full bg-blue-100 mb-4">
                    <Sparkles className="w-8 h-8 text-blue-600"/>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Hi there! 👋</h3>
                  <p className="text-gray-600 max-w-md">
                    I'm your Teaching Buddy! Ask me anything about your lessons, homework, 
                    or things you're curious to learn.
                  </p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : ''
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-10 w-10 bg-blue-100 border-2 border-blue-200">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-5 w-5"/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-xl p-4 text-sm',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-100 border border-gray-200 text-gray-800'
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-10 w-10 bg-purple-100 border-2 border-purple-200">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        <User className="h-5 w-5"/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 bg-blue-100 border-2 border-blue-200">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-5 w-5"/>
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-xl p-4 flex items-center border border-gray-200">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-600">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              disabled={isLoading}
              className="flex-1 border-gray-300 focus:border-blue-500"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </MainLayout>
  );
}