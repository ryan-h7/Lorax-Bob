// Generate personalized greetings based on time of day and context

import { getJournalEntries } from './journal';
import { getUserFacts, getRelevantFacts } from './user-memory';

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  // Check for recent important facts to personalize greeting
  const recentFacts = getRelevantFacts(5);
  const recentEvents = recentFacts.filter(f => f.type === 'event' && f.importance === 'high');
  const recentMoods = recentFacts.filter(f => f.type === 'mood');
  
  // If there's a recent important event, reference it
  if (recentEvents.length > 0 && Math.random() < 0.4) { // 40% chance
    const event = recentEvents[0];
    return `Hey! How did ${event.content} go?`;
  }
  
  // If there's a recent mood mentioned, check in on it
  if (recentMoods.length > 0 && Math.random() < 0.3) { // 30% chance
    const mood = recentMoods[0];
    return `Hi there! Are you still ${mood.content}?`;
  }
  
  // Late night (12am - 4am)
  if (hour >= 0 && hour < 4) {
    const greetings = [
      "What has you up so late at this hour?",
      "Burning the midnight oil? What's on your mind?",
      "It's pretty late... everything okay?",
      "Can't sleep? I'm here to listen.",
      "What's keeping you awake tonight?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Early morning (4am - 8am)
  if (hour >= 4 && hour < 8) {
    const greetings = [
      "You're up early! How are you feeling this morning?",
      "Good morning! What's on your mind to start the day?",
      "Early bird today? How did you sleep?",
      "Morning! How are you starting your day?",
      "Up with the sun? What's going through your mind?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Morning (8am - 12pm)
  if (hour >= 8 && hour < 12) {
    const greetings = [
      "Good morning! How's your day going so far?",
      "Morning! What's happening in your world today?",
      "Hey there! How are you feeling this morning?",
      "Good to see you! How's your day starting?",
      "Morning! What would you like to talk about?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Afternoon (12pm - 5pm)
  if (hour >= 12 && hour < 17) {
    const greetings = [
      "Good afternoon! How's your day treating you?",
      "Hey! How are things going today?",
      "Afternoon check-in - how are you feeling?",
      "Hi there! What's on your mind this afternoon?",
      "How's your day been so far?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Evening (5pm - 9pm)
  if (hour >= 17 && hour < 21) {
    const greetings = [
      "Good evening! How was your day?",
      "Evening! Want to talk about your day?",
      "Hey! How are you doing this evening?",
      "Hi there! How did things go today?",
      "Evening - ready to unwind and chat?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Night (9pm - 12am)
  const greetings = [
    "Good evening! How are you feeling tonight?",
    "Hey! How was your day today?",
    "Evening! What's on your mind as the day winds down?",
    "Hi there! Want to talk about how today went?",
    "How are you doing tonight?"
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function getRecentJournalContext(): string {
  const entries = getJournalEntries();
  
  if (entries.length === 0) {
    return '';
  }
  
  // Get the last 3 entries for context
  const recentEntries = entries.slice(0, 3);
  
  const contextParts = recentEntries.map((entry, index) => {
    const daysAgo = Math.floor((Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24));
    const timeAgo = daysAgo === 0 ? 'earlier today' : 
                    daysAgo === 1 ? 'yesterday' : 
                    `${daysAgo} days ago`;
    
    let contextText = `${timeAgo}: ${entry.summary.substring(0, 150)}`;
    
    // Include AI interpretation if mood dropped
    if (entry.aiInterpretation) {
      contextText += `\n  → Improvement note: ${entry.aiInterpretation}`;
    }
    
    return contextText;
  });
  
  return '\n\nRecent journal entries:\n' + contextParts.join('\n\n');
}

