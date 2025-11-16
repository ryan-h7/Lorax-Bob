'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface BackgroundSettingsDialogProps {
  currentBackground: string | null;
  currentOpacity: number;
  currentBlur: number;
  onSave: (background: string | null, opacity: number, blur: number) => void;
  onCancel: () => void;
}

export function BackgroundSettingsDialog({ 
  currentBackground, 
  currentOpacity, 
  currentBlur, 
  onSave, 
  onCancel 
}: BackgroundSettingsDialogProps) {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(currentBackground);
  const [opacity, setOpacity] = useState(currentOpacity);
  const [blur, setBlur] = useState(currentBlur);

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
    onSave(backgroundUrl, opacity, blur);
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
          {/* Background Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div 
              className="relative w-full h-40 rounded-lg border-2 border-dashed overflow-hidden"
              style={{
                backgroundColor: '#f0f0f0'
              }}
            >
              {backgroundUrl && (
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
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                  <p className="text-sm font-medium">Chat Interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
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

          {/* Opacity Slider */}
          {backgroundUrl && (
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
          {backgroundUrl && (
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

          {/* Info */}
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Lower opacity and higher blur help maintain chat readability
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

