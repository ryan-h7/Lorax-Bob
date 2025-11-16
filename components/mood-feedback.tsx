'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface MoodFeedbackProps {
  startMood: number;
  endMood: number;
  onSubmit: (feedback: string) => void;
}

export function MoodFeedback({ startMood, endMood, onSubmit }: MoodFeedbackProps) {
  const [feedback, setFeedback] = useState('');
  const moodDrop = startMood - endMood;

  const handleSubmit = () => {
    onSubmit(feedback.trim());
  };

  const handleSkip = () => {
    onSubmit(''); // Empty feedback means user skipped
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Help Us Improve
          </CardTitle>
          <CardDescription>
            We noticed your mood dropped by {moodDrop} point{moodDrop > 1 ? 's' : ''} during our conversation. 
            Your feedback helps us provide better support in the future.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What could we do better? How can we improve for next time?
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="For example: 'The conversation felt too directive' or 'I needed more validation and less advice' or 'The responses were too long'..."
              className="min-h-[120px] resize-none"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!feedback.trim()}
            >
              Submit Feedback
            </Button>
            <Button 
              onClick={handleSkip} 
              variant="ghost"
            >
              Skip
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Your feedback will be remembered and used to personalize future conversations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

