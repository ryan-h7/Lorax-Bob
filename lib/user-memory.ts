// User memory management for persistent facts and context

export interface UserFact {
  id: string;
  type: 'person' | 'place' | 'thing' | 'event' | 'mood' | 'action' | 'date';
  content: string;
  context?: string; // Additional context about the fact
  timestamp: number;
  lastReferenced?: number; // When it was last mentioned/used
  importance: 'low' | 'medium' | 'high';
}

const USER_MEMORY_KEY = 'ai-therapist-user-memory';

/**
 * Save a new user fact
 */
export function saveUserFact(fact: Omit<UserFact, 'id' | 'timestamp'>): UserFact {
  const facts = getUserFacts();
  
  // Check for duplicates (similar content)
  const isDuplicate = facts.some(f => 
    f.type === fact.type && 
    f.content.toLowerCase() === fact.content.toLowerCase()
  );
  
  if (isDuplicate) {
    // Update lastReferenced instead of creating duplicate
    const existingFact = facts.find(f => 
      f.type === fact.type && 
      f.content.toLowerCase() === fact.content.toLowerCase()
    );
    if (existingFact) {
      existingFact.lastReferenced = Date.now();
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_MEMORY_KEY, JSON.stringify(facts));
      }
      return existingFact;
    }
  }
  
  const newFact: UserFact = {
    ...fact,
    id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    lastReferenced: Date.now()
  };
  
  facts.unshift(newFact);
  
  // Keep only the most recent 50 facts
  if (facts.length > 50) {
    facts.splice(50);
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_MEMORY_KEY, JSON.stringify(facts));
  }
  
  return newFact;
}

/**
 * Get all user facts
 */
export function getUserFacts(): UserFact[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(USER_MEMORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load user facts:', error);
    return [];
  }
}

/**
 * Get recent and important facts for context
 */
export function getRelevantFacts(limit: number = 10): UserFact[] {
  const facts = getUserFacts();
  
  // Sort by importance and recency
  return facts
    .sort((a, b) => {
      // High importance facts come first
      const importanceWeight = { high: 3, medium: 2, low: 1 };
      const aWeight = importanceWeight[a.importance];
      const bWeight = importanceWeight[b.importance];
      
      if (aWeight !== bWeight) return bWeight - aWeight;
      
      // Then by most recent
      return b.timestamp - a.timestamp;
    })
    .slice(0, limit);
}

/**
 * Get facts by type
 */
export function getFactsByType(type: UserFact['type']): UserFact[] {
  return getUserFacts().filter(f => f.type === type);
}

/**
 * Update fact's lastReferenced timestamp
 */
export function markFactReferenced(factId: string): void {
  const facts = getUserFacts();
  const fact = facts.find(f => f.id === factId);
  
  if (fact) {
    fact.lastReferenced = Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_MEMORY_KEY, JSON.stringify(facts));
    }
  }
}

/**
 * Delete a specific fact
 */
export function deleteUserFact(factId: string): void {
  const facts = getUserFacts().filter(f => f.id !== factId);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_MEMORY_KEY, JSON.stringify(facts));
  }
}

/**
 * Clear all user facts
 */
export function clearUserMemory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_MEMORY_KEY);
  }
}

/**
 * Format facts as a context string for AI
 */
export function formatFactsForContext(): string {
  const facts = getRelevantFacts(15);
  
  if (facts.length === 0) return '';
  
  const factsByType = {
    person: facts.filter(f => f.type === 'person'),
    place: facts.filter(f => f.type === 'place'),
    thing: facts.filter(f => f.type === 'thing'),
    event: facts.filter(f => f.type === 'event'),
    mood: facts.filter(f => f.type === 'mood'),
    action: facts.filter(f => f.type === 'action'),
    date: facts.filter(f => f.type === 'date')
  };
  
  let context = '\n\nRemembered information about the user:';
  
  if (factsByType.person.length > 0) {
    context += '\nPeople: ' + factsByType.person.map(f => f.content).join(', ');
  }
  if (factsByType.place.length > 0) {
    context += '\nPlaces: ' + factsByType.place.map(f => f.content).join(', ');
  }
  if (factsByType.event.length > 0) {
    context += '\nEvents: ' + factsByType.event.map(f => f.content + (f.context ? ` (${f.context})` : '')).join('; ');
  }
  if (factsByType.mood.length > 0) {
    context += '\nRecent moods: ' + factsByType.mood.map(f => f.content).join(', ');
  }
  if (factsByType.action.length > 0) {
    context += '\nActions/Goals: ' + factsByType.action.map(f => f.content).join('; ');
  }
  if (factsByType.thing.length > 0) {
    context += '\nImportant things: ' + factsByType.thing.map(f => f.content).join(', ');
  }
  if (factsByType.date.length > 0) {
    context += '\nImportant dates: ' + factsByType.date.map(f => f.content + (f.context ? ` (${f.context})` : '')).join('; ');
  }
  
  context += '\n\nNaturally reference these facts in conversation when relevant. Ask follow-up questions about past events, moods, or goals.';
  
  return context;
}

