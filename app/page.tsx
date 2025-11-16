'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat-interface';
import { JournalView } from '@/components/journal-view';
import { StatsView } from '@/components/stats-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen, BarChart3 } from 'lucide-react';

const BACKGROUND_KEY = 'ai-therapist-background';
const BACKGROUND_OPACITY_KEY = 'ai-therapist-background-opacity';
const BACKGROUND_BLUR_KEY = 'ai-therapist-background-blur';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(30);
  const [backgroundBlur, setBackgroundBlur] = useState(5);

  // Load background settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBackground = localStorage.getItem(BACKGROUND_KEY);
      if (savedBackground) {
        setBackgroundImage(savedBackground);
      }
      const savedOpacity = localStorage.getItem(BACKGROUND_OPACITY_KEY);
      if (savedOpacity) {
        setBackgroundOpacity(parseInt(savedOpacity, 10));
      }
      const savedBlur = localStorage.getItem(BACKGROUND_BLUR_KEY);
      if (savedBlur) {
        setBackgroundBlur(parseInt(savedBlur, 10));
      }
    }
  }, []);

  const handleBackgroundUpdate = (background: string | null, opacity: number, blur: number) => {
    setBackgroundImage(background);
    setBackgroundOpacity(opacity);
    setBackgroundBlur(blur);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: backgroundOpacity / 100,
            filter: `blur(${backgroundBlur}px)`
          }}
        />
      )}

      <div className="relative z-10 h-screen flex flex-col p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 mt-0">
            <ChatInterface 
              onNavigateToJournal={() => setActiveTab('journal')}
              onBackgroundUpdate={handleBackgroundUpdate}
            />
          </TabsContent>
          
          <TabsContent value="journal" className="flex-1 mt-0">
            <JournalView />
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 mt-0">
            <StatsView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

