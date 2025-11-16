'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat-interface';
import { JournalView } from '@/components/journal-view';
import { StatsView } from '@/components/stats-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen, BarChart3 } from 'lucide-react';
import { getTimeBasedGradient } from '@/lib/time-background';

const BACKGROUND_KEY = 'ai-therapist-background';
const BACKGROUND_OPACITY_KEY = 'ai-therapist-background-opacity';
const BACKGROUND_BLUR_KEY = 'ai-therapist-background-blur';
const BACKGROUND_MODE_KEY = 'ai-therapist-background-mode';
const UI_TRANSPARENCY_KEY = 'ai-therapist-ui-transparency';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(30);
  const [backgroundBlur, setBackgroundBlur] = useState(5);
  const [backgroundMode, setBackgroundMode] = useState<'custom' | 'time-based'>('custom');
  const [timeGradient, setTimeGradient] = useState<string>(getTimeBasedGradient());
  const [uiTransparency, setUiTransparency] = useState(50);

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
      const savedMode = localStorage.getItem(BACKGROUND_MODE_KEY);
      if (savedMode === 'time-based' || savedMode === 'custom') {
        setBackgroundMode(savedMode);
      }
      const savedUiTransparency = localStorage.getItem(UI_TRANSPARENCY_KEY);
      if (savedUiTransparency) {
        setUiTransparency(parseInt(savedUiTransparency, 10));
      }
    }
  }, []);

  // Update time-based gradient every minute
  useEffect(() => {
    if (backgroundMode === 'time-based') {
      const interval = setInterval(() => {
        setTimeGradient(getTimeBasedGradient());
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [backgroundMode]);

  const handleBackgroundUpdate = (background: string | null, opacity: number, blur: number, mode: 'custom' | 'time-based') => {
    setBackgroundImage(background);
    setBackgroundOpacity(opacity);
    setBackgroundBlur(blur);
    setBackgroundMode(mode);
    if (mode === 'time-based') {
      setTimeGradient(getTimeBasedGradient());
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Background - Custom Image or Time-based Gradient */}
      {backgroundMode === 'time-based' ? (
        <div 
          className="fixed inset-0 z-0 pointer-events-none transition-all duration-1000"
          style={{
            background: timeGradient,
            opacity: backgroundOpacity / 100,
            filter: `blur(${backgroundBlur}px)`
          }}
        />
      ) : backgroundImage && (
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
              uiTransparency={uiTransparency}
              onUiTransparencyUpdate={setUiTransparency}
            />
          </TabsContent>
          
          <TabsContent value="journal" className="flex-1 mt-0">
            <JournalView uiTransparency={uiTransparency} />
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 mt-0">
            <StatsView uiTransparency={uiTransparency} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

