'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getMoodColor, getMoodLabel } from '@/lib/journal';

interface MoodRatingProps {
  title: string;
  description: string;
  onRate: (mood: number) => void;
  showSkip?: boolean;
  onCancel?: () => void;
}

export function MoodRating({ title, description, onRate, showSkip, onCancel }: MoodRatingProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const moods = [1, 2, 3, 4, 5];

  const handleSubmit = () => {
    if (selectedMood) {
      onRate(selectedMood);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mood Scale */}
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex-1 aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-2xl font-bold ${
                    selectedMood === mood
                      ? 'scale-110 shadow-lg'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: selectedMood === mood 
                      ? getMoodColor(mood) 
                      : 'transparent',
                    borderColor: getMoodColor(mood),
                    color: selectedMood === mood ? 'white' : getMoodColor(mood),
                  }}
                >
                  {mood}
                </button>
              ))}
            </div>

            {/* Mood Labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Difficult</span>
              <span>Great</span>
            </div>

            {/* Selected Mood Description - Always reserve space */}
            <div className="text-center p-3 rounded-lg bg-muted min-h-[52px] flex items-center justify-center">
              {selectedMood ? (
                <p className="text-sm font-medium" style={{ color: getMoodColor(selectedMood) }}>
                  {getMoodLabel(selectedMood)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a mood rating above
                </p>
              )}
            </div>
          </div>

          {/* Buttons - Always visible */}
          <div className="flex gap-2">
            {onCancel && (
              <Button 
                onClick={onCancel} 
                variant="outline"
              >
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedMood}
              className="flex-1"
            >
              Continue
            </Button>
            {showSkip && (
              <Button 
                onClick={() => onRate(3)} 
                variant="ghost"
              >
                Skip
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

