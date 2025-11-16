'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/chat-interface';
import { JournalView } from '@/components/journal-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="h-screen flex flex-col p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Journal
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 mt-0">
            <ChatInterface onNavigateToJournal={() => setActiveTab('journal')} />
          </TabsContent>
          
          <TabsContent value="journal" className="flex-1 mt-0">
            <JournalView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

