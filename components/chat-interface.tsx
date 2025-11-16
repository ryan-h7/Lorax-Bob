'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Send, Loader2, AlertCircle, Heart, Trash2, Settings, BookOpen, MessageCircle, User, Plus, Image as ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiKeyDialog } from './api-key-dialog';
import { MoodRating } from './mood-rating';
import { MoodFeedback } from './mood-feedback';
import { CustomAvatarDialog } from './custom-avatar-dialog';
import { BackgroundSettingsDialog } from './background-settings-dialog';
import { saveJournalEntry } from '@/lib/journal';
import { saveUserFact, getUserFacts } from '@/lib/user-memory';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Avatar definitions
interface Avatar {
  id: string;
  name: string;
  emoji?: string;
  imageUrl?: string;
  description: string;
  personality: string;
  isCustom?: boolean;
}

const DEFAULT_AVATARS: Avatar[] = [
  {
    id: 'sage',
    name: 'Sage',
    emoji: '🧘',
    description: 'Calm and wise',
    personality: 'Sage is calm, thoughtful, and provides gentle wisdom. They speak with patience and understanding, helping you find clarity.'
  },
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🌙',
    description: 'Warm and nurturing',
    personality: 'Luna is warm, caring, and deeply empathetic. They create a safe space and make you feel heard and valued.'
  },
  {
    id: 'echo',
    name: 'Echo',
    emoji: '✨',
    description: 'Reflective and insightful',
    personality: 'Echo is perceptive and asks thoughtful questions. They help you explore your thoughts and discover your own answers.'
  }
];

interface CrisisInfo {
  detected: boolean;
  severity: 'none' | 'low' | 'moderate' | 'high';
}

const STORAGE_KEY = 'ai-therapist-conversation';
const SESSION_KEY = 'ai-therapist-session-id';
const MOOD_STATE_KEY = 'ai-therapist-mood-state';
const TONE_KEY = 'ai-therapist-tone';
const AVATAR_KEY = 'ai-therapist-avatar';
const CUSTOM_AVATARS_KEY = 'ai-therapist-custom-avatars';
const BACKGROUND_KEY = 'ai-therapist-background';
const BACKGROUND_OPACITY_KEY = 'ai-therapist-background-opacity';
const BACKGROUND_BLUR_KEY = 'ai-therapist-background-blur';
const BACKGROUND_MODE_KEY = 'ai-therapist-background-mode';
const UI_TRANSPARENCY_KEY = 'ai-therapist-ui-transparency';

interface ChatInterfaceProps {
  onNavigateToJournal?: () => void;
  onBackgroundUpdate?: (background: string | null, opacity: number, blur: number, mode: 'custom' | 'time-based') => void;
  uiTransparency?: number;
  onUiTransparencyUpdate?: (transparency: number) => void;
}

export function ChatInterface({ onNavigateToJournal, onBackgroundUpdate, uiTransparency: propUiTransparency, onUiTransparencyUpdate }: ChatInterfaceProps) {
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
  const [isSaving, setIsSaving] = useState(false);
  
  // Tone preference
  const [tone, setTone] = useState<string>('empathetic');
  
  // Avatar selection
  const [selectedAvatar, setSelectedAvatar] = useState<string>('luna');
  const [customAvatars, setCustomAvatars] = useState<Avatar[]>([]);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  
  // Background settings
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(30);
  const [backgroundBlur, setBackgroundBlur] = useState(5);
  const [backgroundMode, setBackgroundMode] = useState<'custom' | 'time-based'>('custom');
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  
  // UI transparency (use prop if provided, otherwise use local state)
  const [localUiTransparency, setLocalUiTransparency] = useState(50);
  const uiTransparency = propUiTransparency !== undefined ? propUiTransparency : localUiTransparency;
  
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
          console.log('Loading mood state from localStorage:', parsed);
          
          if (parsed.startMood !== undefined && parsed.startMood !== null) {
            setStartMood(parsed.startMood);
          }
          if (parsed.endMood !== undefined && parsed.endMood !== null) {
            setEndMood(parsed.endMood);
          }
          if (parsed.conversationStarted !== undefined) {
            setConversationStarted(parsed.conversationStarted);
          }
        } catch (error) {
          console.error('Failed to parse stored mood state:', error);
        }
      }

      // Load tone preference
      const savedTone = localStorage.getItem(TONE_KEY);
      if (savedTone) {
        setTone(savedTone);
      }

      // Load avatar preference
      const savedAvatar = localStorage.getItem(AVATAR_KEY);
      if (savedAvatar) {
        setSelectedAvatar(savedAvatar);
      }

      // Load custom avatars
      const savedCustomAvatars = localStorage.getItem(CUSTOM_AVATARS_KEY);
      if (savedCustomAvatars) {
        try {
          const parsed = JSON.parse(savedCustomAvatars);
          setCustomAvatars(parsed);
        } catch (error) {
          console.error('Failed to parse custom avatars:', error);
        }
      }

      // Load background settings
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
      
      // Load UI transparency
      const savedUiTransparency = localStorage.getItem(UI_TRANSPARENCY_KEY);
      if (savedUiTransparency) {
        setLocalUiTransparency(parseInt(savedUiTransparency, 10));
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
      const moodStateToSave = {
        startMood,
        endMood,
        conversationStarted
      };
      console.log('Saving mood state to localStorage:', moodStateToSave);
      localStorage.setItem(MOOD_STATE_KEY, JSON.stringify(moodStateToSave));
    }
  }, [startMood, endMood, conversationStarted, initialLoadComplete]);

  // Save tone preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && initialLoadComplete) {
      localStorage.setItem(TONE_KEY, tone);
    }
  }, [tone, initialLoadComplete]);

  // Save avatar preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && initialLoadComplete) {
      localStorage.setItem(AVATAR_KEY, selectedAvatar);
    }
  }, [selectedAvatar, initialLoadComplete]);

  // Save custom avatars to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && initialLoadComplete) {
      localStorage.setItem(CUSTOM_AVATARS_KEY, JSON.stringify(customAvatars));
    }
  }, [customAvatars, initialLoadComplete]);

  // Get all avatars (default + custom)
  const allAvatars = [...DEFAULT_AVATARS, ...customAvatars];

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
      } else if (messages.length > 0 && !startMood && !conversationStarted) {
        // Orphaned conversation detected: messages exist but no mood state
        console.log('Orphaned conversation detected - clearing messages');
        // Clear the orphaned conversation
        setMessages([]);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
        // Show start mood rating for a fresh start
        setShowStartMoodRating(true);
      }
    }
  }, [initialLoadComplete, messages.length, startMood, conversationStarted]); // Check when state updates

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debug: Log button visibility conditions
  useEffect(() => {
    console.log('Button visibility check:', {
      initialLoadComplete,
      messagesLength: messages.length,
      startMood,
      endMood,
      shouldShow: initialLoadComplete && messages.length > 2 && startMood && !endMood
    });
  }, [initialLoadComplete, messages.length, startMood, endMood]);

  const handleStartMoodRating = async (mood: number) => {
    setStartMood(mood);
    setShowStartMoodRating(false);
    setConversationStarted(true);
    setIsLoading(true);
    
    try {
      // Get API credentials
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-key') : null;
      const apiUrl = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-url') : 'https://api.deepseek.com/v1';
      const model = typeof window !== 'undefined' ? localStorage.getItem('deepseek-model') : 'deepseek-v3';
      
      if (!apiKey) {
        // Fallback to local greeting if no API key
        const { getTimeBasedGreeting } = require('@/lib/greeting');
        const greeting = getTimeBasedGreeting();
        
        const greetingMessage: Message = {
          role: 'assistant',
          content: greeting,
          timestamp: Date.now()
        };
        
        setMessages([greetingMessage]);
        setIsLoading(false);
        return;
      }

      // Get user facts and journal entries from localStorage (client-side)
      const userFacts = getUserFacts();
      const { getJournalEntries } = require('@/lib/journal');
      const journalEntries = getJournalEntries();
      
      console.log('📤 [CLIENT] Sending user facts to server:', userFacts.length, 'facts');
      console.log('📤 [CLIENT] Sending journal entries to server:', journalEntries.length, 'entries');

      const currentAvatar = allAvatars.find((a: Avatar) => a.id === selectedAvatar);

      // Generate AI greeting with full context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '[GREETING_REQUEST]', // Special marker for greeting
          sessionId,
          apiKey,
          apiUrl: apiUrl || 'https://api.deepseek.com/v1',
          model: model || 'deepseek-v3',
          tone,
          isGreeting: true, // Flag to indicate this is a greeting request
          userFacts, // Send user facts from localStorage
          journalEntries, // Send journal entries from localStorage
          avatar: currentAvatar ? {
            name: currentAvatar.name,
            personality: currentAvatar.personality
          } : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const greetingMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: Date.now()
        };
        
        setMessages([greetingMessage]);
      } else {
        // Fallback to local greeting on error
        const { getTimeBasedGreeting } = require('@/lib/greeting');
        const greeting = getTimeBasedGreeting();
        
        const greetingMessage: Message = {
          role: 'assistant',
          content: greeting,
          timestamp: Date.now()
        };
        
        setMessages([greetingMessage]);
      }
    } catch (error) {
      console.error('Failed to generate AI greeting:', error);
      
      // Fallback to local greeting
      const { getTimeBasedGreeting } = require('@/lib/greeting');
      const greeting = getTimeBasedGreeting();
      
      const greetingMessage: Message = {
        role: 'assistant',
        content: greeting,
        timestamp: Date.now()
      };
      
      setMessages([greetingMessage]);
    } finally {
      setIsLoading(false);
    }
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
        setIsSaving(true);
        await generateAndSaveJournal(mood);
        setIsSaving(false);
      }
    }
  };

  const handleMoodFeedback = async (feedback: string) => {
    setShowMoodFeedback(false);
    setIsSaving(true);

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
    
    setIsSaving(false);
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
      // Get user facts and journal entries from localStorage (client-side)
      const userFacts = getUserFacts();
      const { getJournalEntries } = require('@/lib/journal');
      const journalEntries = getJournalEntries();
      
      const currentAvatar = allAvatars.find((a: Avatar) => a.id === selectedAvatar);
      
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
          model: model || 'deepseek-v3',
          tone,
          userFacts, // Send user facts with every message
          journalEntries, // Send journal entries with every message
          avatar: currentAvatar ? {
            name: currentAvatar.name,
            personality: currentAvatar.personality
          } : undefined
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

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        
        console.log('Message added, total messages:', newMessages.length);
        
        // Extract facts every 5 messages (after ~2-3 exchanges)
        // Using modulo 5 to account for the initial greeting message
        if (newMessages.length >= 5 && (newMessages.length - 1) % 5 === 0) {
          console.log('✅ Condition met! Triggering fact extraction at', newMessages.length, 'messages');
          // Use setTimeout to ensure state is updated
          setTimeout(() => extractFacts(newMessages), 100);
        } else {
          console.log('Condition not met:', {
            length: newMessages.length,
            checkValue: (newMessages.length - 1) % 5,
            willTriggerAt: Math.ceil(newMessages.length / 5) * 5 + 1
          });
        }
        
        return newMessages;
      });

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

  // Extract facts from recent conversation
  const extractFacts = async (messagesList: Message[]) => {
    console.log('extractFacts called with', messagesList.length, 'messages');
    
    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-key') : null;
      const apiUrl = typeof window !== 'undefined' ? localStorage.getItem('deepseek-api-url') : 'https://api.deepseek.com/v1';
      const model = typeof window !== 'undefined' ? localStorage.getItem('deepseek-model') : 'deepseek-v3';

      if (!apiKey) {
        console.log('No API key, skipping fact extraction');
        return;
      }

      console.log('Sending request to extract facts...');
      
      const response = await fetch('/api/extract-facts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesList.map(m => ({ role: m.role, content: m.content })),
          apiKey,
          apiUrl: apiUrl || 'https://api.deepseek.com/v1',
          model: model || 'deepseek-v3'
        })
      });

      console.log('Extract facts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Extracted facts data:', data);
        
        // Save extracted facts
        if (data.facts && Array.isArray(data.facts)) {
          console.log(`Found ${data.facts.length} facts to save`);
          
          data.facts.forEach((fact: any) => {
            const savedFact = saveUserFact({
              type: fact.type,
              content: fact.content,
              context: fact.context,
              importance: fact.importance || 'medium'
            });
            console.log('Saved fact:', savedFact);
          });
          
          if (data.facts.length > 0) {
            console.log(`✅ Extracted and saved ${data.facts.length} facts`);
            console.log('Current user facts:', getUserFacts());
          } else {
            console.log('No new facts extracted from this conversation');
          }
        }
      } else {
        console.error('Extract facts API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to extract facts:', error);
      // Fail silently - fact extraction is not critical
    }
  };

  const handleCreateCustomAvatar = (avatar: Avatar) => {
    setCustomAvatars(prev => [...prev, avatar]);
    setSelectedAvatar(avatar.id);
    setShowAvatarDialog(false);
  };

  const handleSaveBackground = (background: string | null, opacity: number, blur: number, mode: 'custom' | 'time-based', newUiTransparency: number) => {
    setBackgroundImage(background);
    setBackgroundOpacity(opacity);
    setBackgroundBlur(blur);
    setBackgroundMode(mode);
    setLocalUiTransparency(newUiTransparency);
    setShowBackgroundDialog(false);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(BACKGROUND_MODE_KEY, mode);
      localStorage.setItem(BACKGROUND_OPACITY_KEY, opacity.toString());
      localStorage.setItem(BACKGROUND_BLUR_KEY, blur.toString());
      localStorage.setItem(UI_TRANSPARENCY_KEY, newUiTransparency.toString());
      
      if (mode === 'custom') {
        if (background) {
          localStorage.setItem(BACKGROUND_KEY, background);
        } else {
          localStorage.removeItem(BACKGROUND_KEY);
        }
      } else {
        // For time-based mode, we don't need to store an image
        localStorage.removeItem(BACKGROUND_KEY);
      }
    }
    
    // Update parent component (page.tsx) with new background settings
    if (onBackgroundUpdate) {
      onBackgroundUpdate(background, opacity, blur, mode);
    }
    
    // Update parent component with new UI transparency
    if (onUiTransparencyUpdate) {
      onUiTransparencyUpdate(newUiTransparency);
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
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Card className="flex flex-col flex-1 overflow-hidden backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-end">
            <div className="flex gap-2">
              {/* Avatar Selector */}
              <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Avatar" />
                </SelectTrigger>
                <SelectContent>
                  {allAvatars.map(avatar => (
                    <SelectItem key={avatar.id} value={avatar.id}>
                      <div className="flex items-center gap-2 min-w-0">
                        {avatar.imageUrl ? (
                          <img 
                            src={avatar.imageUrl} 
                            alt={avatar.name} 
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <span className="text-lg flex-shrink-0">{avatar.emoji}</span>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium truncate">{avatar.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{avatar.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="border-t mt-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAvatarDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom
                    </Button>
                  </div>
                </SelectContent>
              </Select>

              {/* Tone Selector */}
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-[140px] h-9">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="blunt">Blunt</SelectItem>
                  <SelectItem value="therapist-like">Therapist-like</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBackgroundDialog(true)}
                className="text-muted-foreground"
                title="Background Settings"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Background
              </Button>

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
                {messages.map((msg, idx) => {
                  const currentAvatar = allAvatars.find(a => a.id === selectedAvatar);
                  
                  return (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && currentAvatar && (
                        <div className="flex flex-col items-center mr-2 mt-1">
                          {currentAvatar.imageUrl ? (
                            <img 
                              src={currentAvatar.imageUrl} 
                              alt={currentAvatar.name} 
                              className="w-12 h-12 rounded-full object-cover mb-1"
                            />
                          ) : (
                            <div className="text-3xl mb-1">{currentAvatar.emoji}</div>
                          )}
                          <span className="text-xs text-muted-foreground">{currentAvatar.name}</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 border-2 ${
                          msg.role === 'user'
                            ? 'text-primary-foreground border-primary'
                            : 'border-border'
                        }`}
                        style={{
                          backgroundColor: msg.role === 'user' 
                            ? `hsl(var(--primary) / ${uiTransparency}%)` 
                            : `hsl(var(--muted) / ${uiTransparency}%)`
                        }}
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
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div 
                      className="rounded-lg px-4 py-2 border-2 border-border"
                      style={{ backgroundColor: `hsl(var(--muted) / ${uiTransparency}%)` }}
                    >
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
          onCancel={() => setShowEndMoodRating(false)}
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

      {/* Custom Avatar Dialog */}
      {showAvatarDialog && (
        <CustomAvatarDialog
          onSave={handleCreateCustomAvatar}
          onCancel={() => setShowAvatarDialog(false)}
        />
      )}

      {/* Background Settings Dialog */}
      {showBackgroundDialog && (
        <BackgroundSettingsDialog
          currentBackground={backgroundImage}
          currentOpacity={backgroundOpacity}
          currentBlur={backgroundBlur}
          currentMode={backgroundMode}
          currentUiTransparency={uiTransparency}
          onSave={handleSaveBackground}
          onCancel={() => setShowBackgroundDialog(false)}
        />
      )}

      {/* Saving/Loading Screen */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Saving Your Conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Generating journal summary and preparing a fresh start...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

