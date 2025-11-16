'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Eye, EyeOff, Check, X } from 'lucide-react';

interface ApiKeyDialogProps {
  onClose?: () => void;
}

const STORAGE_KEY = 'deepseek-api-key';
const MODEL_KEY = 'deepseek-model';

const AVAILABLE_MODELS = [
  { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'Standard chat model' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code-focused model' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', description: 'Latest V3 model' },
];

export function ApiKeyDialog({ onClose }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-v3');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    // Load existing key and model on mount
    if (typeof window !== 'undefined') {
      const existingKey = localStorage.getItem(STORAGE_KEY);
      const existingModel = localStorage.getItem(MODEL_KEY);
      
      if (existingKey) {
        setApiKey(existingKey);
        setHasExistingKey(true);
      }
      
      if (existingModel) {
        setSelectedModel(existingModel);
      }
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      alert('DeepSeek API keys should start with "sk-"');
      return;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, apiKey);
    localStorage.setItem(MODEL_KEY, selectedModel);
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose?.();
    }, 1500);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to remove your API key?')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MODEL_KEY);
      setApiKey('');
      setHasExistingKey(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Enter your DeepSeek API key to use the chatbot. Your key is stored locally in your browser.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">DeepSeek API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://platform.deepseek.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                platform.deepseek.com
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <div className="space-y-2">
              {AVAILABLE_MODELS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModel === model.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Privacy:</strong> Your API key is stored only in your browser's localStorage. 
              It never leaves your device except when making API calls directly to DeepSeek.
            </AlertDescription>
          </Alert>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!apiKey.trim()}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
            
            {hasExistingKey && (
              <Button 
                onClick={handleClear} 
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            {onClose && (
              <Button 
                onClick={onClose} 
                variant="ghost"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

