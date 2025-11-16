'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Image as ImageIcon, Clock } from 'lucide-react';

interface BackgroundSettingsDialogProps {
  currentBackground: string | null;
  currentOpacity: number;
  currentBlur: number;
  currentMode: 'custom' | 'time-based';
  currentUiTransparency: number;
  onSave: (background: string | null, opacity: number, blur: number, mode: 'custom' | 'time-based', uiTransparency: number) => void;
  onCancel: () => void;
}

export function BackgroundSettingsDialog({ 
  currentBackground, 
  currentOpacity, 
  currentBlur,
  currentMode,
  currentUiTransparency,
  onSave, 
  onCancel 
}: BackgroundSettingsDialogProps) {
  const [mode, setMode] = useState<'custom' | 'time-based'>(currentMode);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(currentBackground);
  const [opacity, setOpacity] = useState(currentOpacity);
  const [blur, setBlur] = useState(currentBlur);
  const [uiTransparency, setUiTransparency] = useState(currentUiTransparency);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (max 2MB for background)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    setBackgroundUrl(null);
  };

  const handleSave = () => {
    onSave(backgroundUrl, opacity, blur, mode, uiTransparency);
  };

  // Get time-based gradient for preview
  const getTimeBasedGradient = () => {
    const hour = new Date().getHours();
    
    // Late night (12am-4am): Deep night sky
    if (hour >= 0 && hour < 4) {
      return 'linear-gradient(to bottom, #0f172a 0%, #1e1b4b 50%, #312e81 100%)';
    }
    // Early morning (4am-6am): Pre-dawn
    else if (hour >= 4 && hour < 6) {
      return 'linear-gradient(to bottom, #1e1b4b 0%, #4c1d95 40%, #7e22ce 70%, #fb923c 100%)';
    }
    // Sunrise (6am-8am): Warm sunrise
    else if (hour >= 6 && hour < 8) {
      return 'linear-gradient(to bottom, #fb923c 0%, #fbbf24 30%, #fde047 60%, #bae6fd 100%)';
    }
    // Morning (8am-11am): Bright morning
    else if (hour >= 8 && hour < 11) {
      return 'linear-gradient(to bottom, #60a5fa 0%, #93c5fd 50%, #dbeafe 100%)';
    }
    // Noon (11am-2pm): Midday sun
    else if (hour >= 11 && hour < 14) {
      return 'linear-gradient(to bottom, #3b82f6 0%, #60a5fa 40%, #fef08a 100%)';
    }
    // Afternoon (2pm-5pm): Afternoon sun
    else if (hour >= 14 && hour < 17) {
      return 'linear-gradient(to bottom, #60a5fa 0%, #93c5fd 50%, #fef3c7 100%)';
    }
    // Sunset (5pm-7pm): Golden hour
    else if (hour >= 17 && hour < 19) {
      return 'linear-gradient(to bottom, #f97316 0%, #fb923c 30%, #fbbf24 60%, #7c3aed 100%)';
    }
    // Dusk (7pm-9pm): Twilight
    else if (hour >= 19 && hour < 21) {
      return 'linear-gradient(to bottom, #4c1d95 0%, #6b21a8 40%, #1e40af 80%, #1e293b 100%)';
    }
    // Night (9pm-12am): Evening sky
    else {
      return 'linear-gradient(to bottom, #1e293b 0%, #312e81 50%, #1e1b4b 100%)';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Background Settings</CardTitle>
          <CardDescription>
            Customize your chat background
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mode Selector */}
          <div className="space-y-2">
            <Label>Background Mode</Label>
            <Select value={mode} onValueChange={(value: 'custom' | 'time-based') => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Custom Image
                  </div>
                </SelectItem>
                <SelectItem value="time-based">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Auto (Time of Day)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Background Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div 
              className="relative w-full h-40 rounded-lg border-2 border-dashed overflow-hidden"
              style={{
                backgroundColor: '#f0f0f0'
              }}
            >
              {mode === 'time-based' ? (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: getTimeBasedGradient(),
                      opacity: opacity / 100,
                      filter: `blur(${blur}px)`
                    }}
                  />
                  <div className="absolute inset-0 bg-white/20" />
                </>
              ) : backgroundUrl ? (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${backgroundUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: opacity / 100,
                      filter: `blur(${blur}px)`
                    }}
                  />
                  <div className="absolute inset-0 bg-white/30" />
                </>
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                  <p className="text-sm font-medium">Chat Interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload (only for custom mode) */}
          {mode === 'custom' && (
            <div className="space-y-2">
              <Label>Background Image</Label>
              {backgroundUrl ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 border rounded flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">Custom background</span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveBackground}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload Background Image</span>
                <span className="text-xs text-muted-foreground mt-1">PNG, JPEG, or WebP (max 2MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
            </div>
          )}

          {/* Opacity Slider */}
          {(mode === 'time-based' || backgroundUrl) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opacity</Label>
                <span className="text-sm text-muted-foreground">{opacity}%</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Blur Slider */}
          {(mode === 'time-based' || backgroundUrl) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Blur</Label>
                <span className="text-sm text-muted-foreground">{blur}px</span>
              </div>
              <Slider
                value={[blur]}
                onValueChange={(value) => setBlur(value[0])}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* UI Transparency Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>UI Transparency</Label>
              <span className="text-sm text-muted-foreground">{uiTransparency}%</span>
            </div>
            <Slider
              value={[uiTransparency]}
              onValueChange={(value) => setUiTransparency(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controls the transparency of all UI elements (cards, messages, etc.)
            </p>
          </div>

          {/* Info */}
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              {mode === 'time-based' 
                ? '🌅 Background changes automatically throughout the day: night sky, sunrise, sunny day, sunset, and evening'
                : '💡 Tip: Lower opacity and higher blur help maintain chat readability'
              }
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              Save Background
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

