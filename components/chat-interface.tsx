'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Send, Loader2, AlertCircle, Heart, Trash2, Settings, BookOpen } from 'lucide-react';
import { ApiKeyDialog } from './api-key-dialog';
import { MoodRating } from './mood-rating';
import { MoodFeedback } from './mood-feedback';
import { saveJournalEntry } from '@/lib/journal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface CrisisInfo {
  detected: boolean;
  severity: 'none' | 'low' | 'moderate' | 'high';
}

const STORAGE_KEY = 'ai-therapist-conversation';
const SESSION_KEY = 'ai-therapist-session-id';
const MOOD_STATE_KEY = 'ai-therapist-mood-state';

interface ChatInterfaceProps {
  onNavigateToJournal?: () => void;
}

export function ChatInterface({ onNavigateToJournal }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    // Try to restore session ID from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return stored;
    }
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, newId);
    }
    return newId;
  });
  const [crisis, setCrisis] = useState<CrisisInfo>({ detected: false, severity: 'none' });
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // Mood tracking states
  const [showStartMoodRating, setShowStartMoodRating] = useState(false);
  const [showEndMoodRating, setShowEndMoodRating] = useState(false);
  const [showMoodFeedback, setShowMoodFeedback] = useState(false);
  const [startMood, setStartMood] = useState<number | null>(null);
  const [endMood, setEndMood] = useState<number | null>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation and mood state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load messages
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed);
        } catch (error) {
          console.error('Failed to parse stored messages:', error);
        }
      }

      // Load mood state
      const moodState = localStorage.getItem(MOOD_STATE_KEY);
      if (moodState) {
        try {
          const parsed = JSON.parse(moodState);
          setStartMood(parsed.startMood || null);
          setEndMood(parsed.endMood || null);
          setConversationStarted(parsed.conversationStarted || false);
        } catch (error) {
          console.error('Failed to parse stored mood state:', error);
        }
      }

      setInitialLoadComplete(true);
    }
  }, []);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Save mood state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && initialLoadComplete) {
      localStorage.setItem(MOOD_STATE_KEY, JSON.stringify({
        startMood,
        endMood,
        conversationStarted
      }));
    }
  }, [startMood, endMood, conversationStarted, initialLoadComplete]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check for API key and show start mood rating ONLY on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && initialLoadComplete) {
      const apiKey = localStorage.getItem('deepseek-api-key');
      setHasApiKey(!!apiKey);
      
      // Show dialog if no API key is set
      if (!apiKey) {
        setShowApiDialog(true);
      } else if (messages.length === 0 && !conversationStarted && !startMood) {
        // Show start mood rating ONLY if truly a new conversation
        setShowStartMoodRating(true);
      }
    }
  }, [initialLoadComplete]); // Only run once after initial load

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleStartMoodRating = (mood: number) => {
    setStartMood(mood);
    setShowStartMoodRating(false);
    setConversationStarted(true);
    
    // Add personalized greeting as first message
    const { getTimeBasedGreeting } = require('@/lib/greeting');
    const greeting = getTimeBasedGreeting();
    
    const greetingMessage: Message = {
      role: 'assistant',
      content: greeting,
      timestamp: Date.now()
    };
    
    setMessages([greetingMessage]);
  };

  const handleEndMoodRating = async (mood: number) => {
    setEndMood(mood);
    setShowEndMoodRating(false);

    // Check if mood dropped
    if (startMood && mood < startMood) {
      // Show feedback dialog
      setShowMoodFeedback(true);
    } else {
      // Mood improved or stayed same, save directly
      if (startMood) {
        await generateAndSaveJournal(mood);
      }
    }
  };

  const handleMoodFeedback = async (feedback: string) => {
    setShowMoodFeedback(false);

    let interpretation = '';
    
    // If user provided feedback, interpret it with AI
    if (feedback && endMood) {
      try {
        const apiKey = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-key') : null;
        const apiUrl = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-url') : 'https://api.deepseek.com/v1';
        const model = typeof window !== 'undefined' ? localStorage.getItem('deepseek-model') : 'deepseek-v3';

        if (apiKey) {
          const response = await fetch('/api/interpret-feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              feedback,
              apiKey,
              apiUrl: apiUrl || 'https://api.deepseek.com/v1',
              model: model || 'deepseek-v3'
            })
          });

          if (response.ok) {
            const data = await response.json();
            interpretation = data.interpretation || '';
          }
        }
      } catch (error) {
        console.error('Failed to interpret feedback:', error);
      }
    }

    // Save journal with feedback
    if (startMood && endMood) {
      await generateAndSaveJournal(endMood, feedback, interpretation);
    }
  };

  const generateAndSaveJournal = async (finalMood: number, userFeedback?: string, aiInterpretation?: string) => {
    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-key') : null;
      const apiUrl = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-url') : 'https://api.deepseek.com/v1';
      const model = typeof window !== 'undefined' ? localStorage.getItem('deepseek-model') : 'deepseek-v3';

      if (!apiKey) return;

      // Request summary from API
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          apiKey,
          apiUrl: apiUrl || 'https://api.deepseek.com/v1',
          model: model || 'deepseek-v3'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Build summary with feedback if mood dropped
        let enhancedSummary = data.summary || 'No summary available';
        if (userFeedback && aiInterpretation) {
          enhancedSummary += `\n\n[Note: User mood dropped. ${aiInterpretation}]`;
        }
        
        // Save journal entry
        saveJournalEntry({
          startMood: startMood!,
          endMood: finalMood,
          moodChange: finalMood - startMood!,
          summary: enhancedSummary,
          keyPoints: data.keyPoints || [],
          developments: data.developments || [],
          conversationLength: messages.length,
          userFeedback: userFeedback || undefined,
          aiInterpretation: aiInterpretation || undefined
        });

        // Clear conversation and start fresh
        setMessages([]);
        setStartMood(null);
        setEndMood(null);
        setConversationStarted(false);
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(MOOD_STATE_KEY);
        }
        
        // Show start mood rating for new conversation
        setTimeout(() => {
          setShowStartMoodRating(true);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };

  const checkForEndOfConversation = (userMessage: string, assistantMessage: string) => {
    const endPhrases = [
      'do you have anything else',
      'anything else to talk about',
      'anything else on your mind',
      'would you like to talk about anything else',
      'is there anything else'
    ];

    const lowerAssistant = assistantMessage.toLowerCase();
    return endPhrases.some(phrase => lowerAssistant.includes(phrase));
  };

  const handleEndConversation = () => {
    if (startMood && !endMood && messages.length > 2) {
      // Trigger end mood rating
      setShowEndMoodRating(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check for API key and URL
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-key') : null;
    const apiUrl = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-url') : 'https://api.deepseek.com/v1';
    const model = typeof window !== 'undefined' ? localStorage.getItem('deepseek-model') : 'deepseek-v3';
    
    if (!apiKey) {
      setShowApiDialog(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          apiKey,
          apiUrl: apiUrl || 'https://api.deepseek.com/v1',
          model: model || 'deepseek-v3'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update crisis info
      if (data.crisisDetected) {
        setCrisis({
          detected: true,
          severity: data.crisisSeverity
        });
      }

      // Check if this might be end of conversation
      if (checkForEndOfConversation(userMessage.content, data.message)) {
        // Wait for user's next response to see if they say "no"
        // This will be handled in the next message send
      }

      // Check if user said "no" to continuing conversation
      const userSaidNo = /^(no|nope|nah|not really|nothing|that's all|i'm good|all good)\.?$/i.test(userMessage.content.trim());
      const previousMessageAskedToContinue = messages.length > 0 && 
        checkForEndOfConversation('', messages[messages.length - 1]?.content || '');

      if (userSaidNo && previousMessageAskedToContinue && startMood && !endMood) {
        // Trigger end mood rating
        setShowEndMoodRating(true);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Error: ${error.message || "I'm having trouble connecting. Please check your API settings and try again."}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Internal function to clear chat without confirmation (used after saving journal)
  const clearChatInternal = async () => {
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      setMessages([]);
      setCrisis({ detected: false, severity: 'none' });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(MOOD_STATE_KEY);
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  // Public function for Clear button - shows confirmation
  const handleClearChat = async () => {
    if (!confirm('Are you sure you want to clear this conversation?')) {
      return;
    }
    await clearChatInternal();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Supportive Listener
              </CardTitle>
              <CardDescription>
                A safe space to share what&apos;s on your mind
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiDialog(true)}
                className="text-muted-foreground"
                title="API Settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                {hasApiKey ? 'Settings' : 'Setup'}
              </Button>
              {initialLoadComplete && messages.length > 2 && startMood && !endMood && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEndConversation}
                  className="text-muted-foreground"
                  title="End conversation and save to journal"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  End & Save
                </Button>
              )}
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-muted-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          {/* Crisis Alert */}
          {crisis.detected && (
            <div className="p-4 border-b">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Support Resources Available</AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p>If you&apos;re in crisis, please reach out to professional support:</p>
                  <div className="space-y-1">
                    <div><strong>US - 988 Suicide & Crisis Lifeline:</strong> Call or text 988</div>
                    <div><strong>US - Crisis Text Line:</strong> Text HOME to 741741</div>
                    <div><strong>International:</strong> Visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline">findahelpline.com</a></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    These services are confidential, free, and available 24/7.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div className="max-w-md space-y-4">
                  <Heart className="w-12 h-12 mx-auto text-rose-300" />
                  <p className="text-lg">Welcome! I&apos;m here to listen.</p>
                  <p className="text-sm">
                    Feel free to share whatever&apos;s on your mind. This is a judgment-free space
                    where you can express your thoughts and feelings.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Note: I&apos;m not a therapist or counselor - just a supportive listener.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.role === 'user' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send • This is not a substitute for professional mental health care
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Key Configuration Dialog */}
      {showApiDialog && (
        <ApiKeyDialog 
          onClose={() => {
            setShowApiDialog(false);
            // Recheck if API key exists after dialog closes
            if (typeof window !== 'undefined') {
              const apiKey = localStorage.getItem('deepseek-api-key');
              setHasApiKey(!!apiKey);
            }
          }} 
        />
      )}

      {/* Start Mood Rating */}
      {showStartMoodRating && (
        <MoodRating
          title="How are you feeling right now?"
          description="Rate your mood from 1 (very difficult) to 5 (great) before we begin"
          onRate={handleStartMoodRating}
        />
      )}

      {/* End Mood Rating */}
      {showEndMoodRating && (
        <MoodRating
          title="How are you feeling now?"
          description="Rate your mood from 1 (very difficult) to 5 (great) after our conversation"
          onRate={handleEndMoodRating}
        />
      )}

      {/* Mood Feedback (when mood dropped) */}
      {showMoodFeedback && startMood && endMood && (
        <MoodFeedback
          startMood={startMood}
          endMood={endMood}
          onSubmit={handleMoodFeedback}
        />
      )}
    </div>
  );
}

