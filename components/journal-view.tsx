'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Trash2,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { 
  JournalEntry, 
  getJournalEntries, 
  deleteJournalEntry, 
  getMoodColor, 
  getMoodLabel,
  getJournalStats 
} from '@/lib/journal';
import { formatDistanceToNow } from 'date-fns';

interface JournalViewProps {
  uiTransparency?: number;
}

export function JournalView({ uiTransparency = 50 }: JournalViewProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    setEntries(getJournalEntries());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      deleteJournalEntry(id);
      loadEntries();
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    }
  };

  const getMoodChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const stats = getJournalStats();

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Journal List */}
      <Card className="flex-1 flex flex-col backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                My Journal
              </CardTitle>
              <CardDescription>
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Stats
            </Button>
          </div>
        </CardHeader>

        {/* Statistics Panel */}
        {showStats && entries.length > 0 && (
          <div className="p-4 border-b bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Avg Start Mood</p>
                <p className="text-2xl font-bold" style={{ color: getMoodColor(Math.round(stats.averageStartMood)) }}>
                  {stats.averageStartMood}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg End Mood</p>
                <p className="text-2xl font-bold" style={{ color: getMoodColor(Math.round(stats.averageEndMood)) }}>
                  {stats.averageEndMood}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Average Improvement</p>
                <p className="text-lg font-bold text-green-600">
                  {stats.averageImprovement > 0 ? '+' : ''}{stats.averageImprovement}
                </p>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
              <div>
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No journal entries yet</p>
                <p className="text-sm mt-2">Your conversations will be saved here</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedEntry?.id === entry.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        {/* Start Mood */}
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: getMoodColor(entry.startMood) }}
                          >
                            {entry.startMood}
                          </div>
                        </div>

                        {/* Arrow and Change */}
                        <div className="flex items-center gap-1">
                          {getMoodChangeIcon(entry.moodChange)}
                          {entry.moodChange !== 0 && (
                            <span className="text-xs font-medium">
                              {entry.moodChange > 0 ? '+' : ''}{entry.moodChange}
                            </span>
                          )}
                        </div>

                        {/* End Mood */}
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: getMoodColor(entry.endMood) }}
                          >
                            {entry.endMood}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm line-clamp-2">{entry.summary}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Entry Details */}
      {selectedEntry && (
        <Card className="flex-1 flex flex-col backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>
              {new Date(selectedEntry.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CardDescription>
          </CardHeader>

          <ScrollArea className="flex-1">
            <CardContent className="pt-6 space-y-6">
              {/* Mood Progression */}
              <div>
                <h3 className="font-semibold mb-3">Mood Change</h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2"
                      style={{ backgroundColor: getMoodColor(selectedEntry.startMood) }}
                    >
                      {selectedEntry.startMood}
                    </div>
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="text-xs font-medium">{getMoodLabel(selectedEntry.startMood)}</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    {getMoodChangeIcon(selectedEntry.moodChange)}
                    <span className="ml-2 text-lg font-bold">
                      {selectedEntry.moodChange > 0 ? '+' : ''}{selectedEntry.moodChange}
                    </span>
                  </div>

                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2"
                      style={{ backgroundColor: getMoodColor(selectedEntry.endMood) }}
                    >
                      {selectedEntry.endMood}
                    </div>
                    <p className="text-xs text-muted-foreground">End</p>
                    <p className="text-xs font-medium">{getMoodLabel(selectedEntry.endMood)}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedEntry.summary}
                </p>
              </div>

              {/* Key Points */}
              {selectedEntry.keyPoints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Points</h3>
                  <ul className="space-y-1">
                    {selectedEntry.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Developments */}
              {selectedEntry.developments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Developments</h3>
                  <ul className="space-y-1">
                    {selectedEntry.developments.map((dev, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{dev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* User Feedback (when mood dropped) */}
              {selectedEntry.userFeedback && (
                <Alert className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <AlertTitle className="text-sm font-semibold">Improvement Feedback</AlertTitle>
                  <AlertDescription className="text-xs space-y-2">
                    <p><strong>User feedback:</strong> "{selectedEntry.userFeedback}"</p>
                    {selectedEntry.aiInterpretation && (
                      <p className="text-orange-700 dark:text-orange-400">
                        <strong>AI interpretation:</strong> {selectedEntry.aiInterpretation}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Conversation Info */}
              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Conversation length:</strong> {selectedEntry.conversationLength} messages
                </AlertDescription>
              </Alert>
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

