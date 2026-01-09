
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Sparkles, RefreshCcw, Wand2, Loader2, Download } from 'lucide-react';

export default function ImageLabPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      } else {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop video tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setGeneratedImage(null); // Clear previous generation
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setGeneratedImage(null);
  };
  
  const handleGenerate = async () => {
    if (!capturedImage || !prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please capture an image and enter a prompt.',
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // const result = await imageLabFlow({ photoDataUri: capturedImage, prompt: prompt.trim() });
      // if (result.imageUrl) {
      //   setGeneratedImage(result.imageUrl);
      // } else {
      //   throw new Error('The AI did not return an image. Please try a different prompt.');
      // }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: (error as Error).message || 'An unexpected error occurred.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `kilatrade-ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="container mx-auto space-y-6 animate-in fade-in-0 duration-500">
      <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>AI Image Lab</CardTitle>
          <CardDescription>
            Capture an image from your webcam and use AI to transform it based on your prompt.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-500" style={{animationDelay: '200ms'}}>
          <CardHeader>
            <CardTitle>1. Camera Feed</CardTitle>
          </CardHeader>
          <CardContent>
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <Camera className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings to use this feature.
                </AlertDescription>
              </Alert>
            )}
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>
             <div className="mt-4 flex gap-4">
                <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">
                    <Camera className="mr-2" /> Capture
                </Button>
                 <Button onClick={handleRetake} disabled={!capturedImage} variant="outline">
                    <RefreshCcw className="mr-2"/> Retake
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-500" style={{animationDelay: '300ms'}}>
          <CardHeader>
            <CardTitle>2. AI Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Captured Image</h3>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    {capturedImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover rounded-md" />
                    ) : (
                        <p className="text-sm text-muted-foreground">Waiting for capture...</p>
                    )}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Generated Image</h3>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        {isGenerating && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                        {!isGenerating && generatedImage && (
                             // eslint-disable-next-line @next/next/no-img-element
                            <img src={generatedImage} alt="Generated by AI" className="w-full h-full object-cover rounded-md" />
                        )}
                        {!isGenerating && !generatedImage && (
                            <p className="text-sm text-muted-foreground text-center">Your generated image will appear here.</p>
                        )}
                    </div>
                </div>
             </div>
            <div>
              <label htmlFor="prompt" className="text-sm font-medium text-muted-foreground">Prompt</label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make this person a superhero, change the background to a futuristic city..."
                className="mt-1"
                rows={3}
              />
            </div>
             <div className="flex gap-4">
                <Button onClick={handleGenerate} disabled={isGenerating || !capturedImage} className="w-full">
                    <Wand2 className="mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Image'}
                </Button>
                {generatedImage && (
                    <Button onClick={handleDownload} variant="outline">
                        <Download className="mr-2"/> Download
                    </Button>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
