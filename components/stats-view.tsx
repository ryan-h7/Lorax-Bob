'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getJournalEntries, getMoodColor } from '@/lib/journal';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface StatsViewProps {
  uiTransparency?: number;
}

export function StatsView({ uiTransparency = 50 }: StatsViewProps) {
  const [entries, setEntries] = useState(getJournalEntries());

  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  // Last 7 entries
  const last7Entries = entries.slice(0, 7).reverse().map((entry, index) => ({
    name: `Entry ${index + 1}`,
    startMood: entry.startMood,
    endMood: entry.endMood,
    change: entry.moodChange,
    date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Get entries by time range - using continuous timestamps
  const getEntriesByTimeRange = (days: number) => {
    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    
    const filtered = entries.filter(e => e.timestamp >= cutoff);
    
    // Sort by timestamp to ensure continuous plotting
    return filtered.sort((a, b) => a.timestamp - b.timestamp).map(entry => ({
      timestamp: entry.timestamp, // Use timestamp as primary x-axis value
      startMood: entry.startMood,
      endMood: entry.endMood,
      date: new Date(entry.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        ...(days > 31 ? { year: '2-digit' } : {})
      }),
      time: new Date(entry.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    }));
  };

  const [timeRange, setTimeRange] = useState<7 | 30 | 180 | 365>(7);
  const timeRangeData = getEntriesByTimeRange(timeRange);

  // Calculate statistics
  const avgStartMood = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.startMood, 0) / entries.length).toFixed(1)
    : '0';
    
  const avgEndMood = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.endMood, 0) / entries.length).toFixed(1)
    : '0';
    
  const avgImprovement = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.moodChange, 0) / entries.length).toFixed(1)
    : '0';

  const improvementCount = entries.filter(e => e.moodChange > 0).length;
  const improvementRate = entries.length > 0 
    ? ((improvementCount / entries.length) * 100).toFixed(0) 
    : '0';

  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              No Data Yet
            </CardTitle>
            <CardDescription>
              Start having conversations to see your mood statistics and trends
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
          <CardHeader className="pb-2">
            <CardDescription>Total Entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
          <CardHeader className="pb-2">
            <CardDescription>Avg Start Mood</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: getMoodColor(Math.round(Number(avgStartMood))) }}>
              {avgStartMood}
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
          <CardHeader className="pb-2">
            <CardDescription>Avg End Mood</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: getMoodColor(Math.round(Number(avgEndMood))) }}>
              {avgEndMood}
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
          <CardHeader className="pb-2">
            <CardDescription>Improvement Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{improvementRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="entries">Last 7 Entries</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        {/* Last 7 Entries Chart */}
        <TabsContent value="entries">
          <Card className="backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
            <CardHeader>
              <CardTitle>Mood Progression - Last 7 Entries</CardTitle>
              <CardDescription>Track how your mood changed across your recent conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last7Entries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="startMood" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Start Mood"
                    dot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="endMood" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="End Mood"
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline Chart */}
        <TabsContent value="timeline">
          <Card className="backdrop-blur-sm border-2" style={{ backgroundColor: `hsl(var(--background) / ${uiTransparency}%)` }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mood Timeline</CardTitle>
                  <CardDescription>View your mood trends over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeRange(7)}
                    className={`px-3 py-1 text-sm rounded ${timeRange === 7 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setTimeRange(30)}
                    className={`px-3 py-1 text-sm rounded ${timeRange === 30 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    1 Month
                  </button>
                  <button
                    onClick={() => setTimeRange(180)}
                    className={`px-3 py-1 text-sm rounded ${timeRange === 180 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setTimeRange(365)}
                    className={`px-3 py-1 text-sm rounded ${timeRange === 365 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    1 Year
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timeRangeData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No entries in this time range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeRangeData}>
                    <defs>
                      <linearGradient id="colorStart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEnd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      scale="time"
                      tickFormatter={(timestamp) => {
                        const date = new Date(timestamp);
                        if (timeRange === 7) {
                          // Show day and time for 7 days
                          return date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric'
                          });
                        } else if (timeRange === 30) {
                          // Show month and day for 1 month
                          return date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          });
                        } else {
                          // Show month and year for longer periods
                          return date.toLocaleDateString('en-US', { 
                            month: 'short',
                            ...(timeRange >= 180 ? { year: '2-digit' } : {})
                          });
                        }
                      }}
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5]} />
                    <Tooltip 
                      labelFormatter={(timestamp) => {
                        const date = new Date(timestamp);
                        return `${date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} at ${date.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}`;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="startMood" 
                      stroke="#3b82f6" 
                      fillOpacity={1}
                      fill="url(#colorStart)"
                      name="Start Mood"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="endMood" 
                      stroke="#22c55e" 
                      fillOpacity={1}
                      fill="url(#colorEnd)"
                      name="End Mood"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

