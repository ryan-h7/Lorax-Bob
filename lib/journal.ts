// Journal entry management for mood tracking and conversation summaries

export interface JournalEntry {
  id: string;
  timestamp: number;
  date: string;
  startMood: number; // 1-5 scale
  endMood: number; // 1-5 scale
  moodChange: number; // difference
  summary: string;
  keyPoints: string[];
  developments: string[];
  conversationLength: number; // number of messages
  userFeedback?: string; // User's explanation when mood dropped
  aiInterpretation?: string; // AI's interpretation of the feedback
}

const JOURNAL_STORAGE_KEY = 'ai-therapist-journal';

/**
 * Get mood color based on rating (1-5)
 * Returns gradient from red (1) to green (5)
 */
export function getMoodColor(mood: number): string {
  const colors = [
    '#ef4444', // red-500 (1)
    '#f97316', // orange-500 (2)
    '#eab308', // yellow-500 (3)
    '#84cc16', // lime-500 (4)
    '#22c55e', // green-500 (5)
  ];
  return colors[Math.max(0, Math.min(4, mood - 1))];
}

/**
 * Get mood label based on rating
 */
export function getMoodLabel(mood: number): string {
  const labels = [
    'Very Difficult',
    'Challenging',
    'Okay',
    'Good',
    'Great'
  ];
  return labels[Math.max(0, Math.min(4, mood - 1))];
}

/**
 * Save a journal entry
 */
export function saveJournalEntry(entry: Omit<JournalEntry, 'id' | 'timestamp' | 'date'>): JournalEntry {
  const now = Date.now();
  const fullEntry: JournalEntry = {
    ...entry,
    id: `journal-${now}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: now,
    date: new Date(now).toISOString(),
  };

  const entries = getJournalEntries();
  entries.unshift(fullEntry); // Add to beginning
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  }

  return fullEntry;
}

/**
 * Get all journal entries
 */
export function getJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load journal entries:', error);
  }
  
  return [];
}

/**
 * Delete a journal entry
 */
export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter(entry => entry.id !== id);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  }
}

/**
 * Get journal entry by ID
 */
export function getJournalEntry(id: string): JournalEntry | null {
  const entries = getJournalEntries();
  return entries.find(entry => entry.id === id) || null;
}

/**
 * Clear all journal entries
 */
export function clearJournalEntries(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(JOURNAL_STORAGE_KEY);
  }
}

/**
 * Get journal statistics
 */
export function getJournalStats(): {
  totalEntries: number;
  averageStartMood: number;
  averageEndMood: number;
  averageImprovement: number;
  improvementPercentage: number;
} {
  const entries = getJournalEntries();
  
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averageStartMood: 0,
      averageEndMood: 0,
      averageImprovement: 0,
      improvementPercentage: 0,
    };
  }

  const totalStart = entries.reduce((sum, e) => sum + e.startMood, 0);
  const totalEnd = entries.reduce((sum, e) => sum + e.endMood, 0);
  const totalImprovement = entries.reduce((sum, e) => sum + e.moodChange, 0);

  const avgStart = totalStart / entries.length;
  const avgEnd = totalEnd / entries.length;
  const avgImprovement = totalImprovement / entries.length;

  return {
    totalEntries: entries.length,
    averageStartMood: Math.round(avgStart * 10) / 10,
    averageEndMood: Math.round(avgEnd * 10) / 10,
    averageImprovement: Math.round(avgImprovement * 10) / 10,
    improvementPercentage: Math.round((avgImprovement / 5) * 100),
  };
}

