"use client";
import { useState, useRef } from "react";
import { Copy, Sparkles, RotateCcw, BookOpen, Upload, Camera, Lightbulb, Loader2, Target, Wand2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { StudioLayout } from '../StudioLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

const SelectField = ({ label, placeholder, value, onChange, options }: { label: string, placeholder: string, value: string, onChange: (value: string) => void, options: string[] }) => (
    <div className="space-y-1.5">
      <Label htmlFor={label}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

// --- Options for Midjourney ---
const motionLevelOptions = ["Low Motion (Subtle)", "High Motion (Dynamic)"];
const aspectRatioOptions = ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2"];

// --- Main Component ---
export default function MidjourneyVideoPromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [motionPrompt, setMotionPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [motionLevel, setMotionLevel] = useState("Low Motion (Subtle)");
  const [stylize, setStylize] = useState(100);
  const [chaos, setChaos] = useState(0);
  const [styleRaw, setStyleRaw] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEnhance = async () => {
    if (!motionPrompt) return alert("Please enter a motion prompt before enhancing.");
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: motionPrompt }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "An unknown error occurred");
      setVariants(data.suggestions);
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error("Failed to fetch variants:", error);
      alert("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setIsLoading(true);
    setMotionPrompt("");
    try {
      const descriptions = await new Promise<{ characterAndAction: string; sceneAndEnvironment: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          try {
            const base64Image = (reader.result as string).split(',')[1];
            const mimeType = file.type;
            const response = await fetch('/api/analyze-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Image, mimeType }),
            });
            const data = await response.json();
            if (!response.ok) { reject(new Error(data.error || 'Failed to analyze image.')); } 
            else { resolve(data); }
          } catch (e) { reject(e); }
        };
        reader.onerror = (error) => { reject(error); };
      });
      const combinedDescription = `${descriptions.characterAndAction} ${descriptions.sceneAndEnvironment}`;
      setMotionPrompt(combinedDescription.trim());
    } catch (error: any) {
      console.error("Image analysis failed:", error);
      alert(`Image analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!imagePreview) {
      alert("Please upload a starting image. Midjourney Video requires an image.");
      return;
    }
    setIsLoading(true);
    setFinalPrompt("");
    const payload = { 
      targetModel: 'Midjourney Video', 
      inputs: { motionPrompt, negativePrompt, motionLevel, stylize, chaos, styleRaw, aspectRatio } 
    };
    try {
      const response = await fetch('/api/generate-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setFinalPrompt(data.finalPrompt);
      onPromptGenerated(data.finalPrompt);
    } catch (error: any) {
      alert("Failed to generate the final prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setMotionPrompt("");
    setNegativePrompt("");
    setMotionLevel("Low Motion (Subtle)");
    setStylize(100);
    setChaos(0);
    setStyleRaw(false);
    setAspectRatio("16:9");
    setFinalPrompt("");
    setImagePreview(null);
  };

  const handleVariantSelect = (variant: string) => {
    setMotionPrompt(variant);
    setIsDialogOpen(false);
  };

  const formControls = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-blue-400" /> Upload Starting Image</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Midjourney Video starts with an image. Upload a frame and let our AI generate a motion description for you.</p>
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted mb-3">
            {imagePreview && <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <span className="ml-2 text-white">Analyzing Image...</span>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
            {imagePreview ? 'Upload a Different Image' : 'Upload Image'}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Describe the Motion & Action</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-1.5">
                <Label htmlFor="motion-prompt" className="font-semibold">Motion Prompt (AI-Generated)</Label>
                <div className="relative">
                    <Textarea id="motion-prompt" placeholder="Upload an image to generate a description, or write your own..." value={motionPrompt} onChange={(e) => setMotionPrompt(e.target.value)} className="min-h-[120px] pr-10" />
                    <button type="button" onClick={handleEnhance} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI"><Target size={20} className="text-red-500" /></button>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> Artistic Controls</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-1.5"><Label>Stylize (0-1000)</Label><Slider min={0} max={1000} step={1} value={[stylize]} onValueChange={([v]) => setStylize(v)} /></div>
            <div className="space-y-1.5"><Label>Chaos (0-100)</Label><Slider min={0} max={100} step={1} value={[chaos]} onValueChange={([v]) => setChaos(v)} /></div>
            <div className="flex items-center space-x-2"><Switch id="style-raw" checked={styleRaw} onCheckedChange={setStyleRaw} /><Label htmlFor="style-raw">Use Style Raw</Label></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Technical Controls</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Motion Level" placeholder="Motion" value={motionLevel} onChange={setMotionLevel} options={motionLevelOptions} />
            <SelectField label="Aspect Ratio" placeholder="Ratio" value={aspectRatio} onChange={setAspectRatio} options={aspectRatioOptions} />
            <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="negative-prompt">Negative Prompt</Label>
                <Input id="negative-prompt" placeholder="e.g., text, blurry, watermark" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
            </div>
        </CardContent>
      </Card>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label className="font-medium text-lg">Final Midjourney Prompt</Label>
        <div className="relative">
          <Textarea value={finalPrompt || "Fill out the form to generate your prompt..."} readOnly className="min-h-[250px] pr-10" />
          {finalPrompt && (<Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button>)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleGenerateClick} disabled={isLoading || !imagePreview} className="w-full py-6 text-base font-medium">{isLoading ? 'Generating...' : '✨ Generate Midjourney Prompt'}</Button>
        <Button onClick={handleStartOver} variant="secondary" className="py-6" title="Start Over"><RotateCcw className="h-5 w-5" /></Button>
      </div>
        <Card>
            <CardHeader><CardTitle>Tips & Tricks</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>Focus on Motion:</strong> Your prompt should describe what happens *next*. The image sets the scene; the text sets the action.</p>
                <p><strong>Use Style Raw for Precision:</strong> If you want the AI to follow your motion prompt very closely without adding its own artistic flair, enable the "Use Style Raw" toggle.</p>
                <p><strong>Balance Motion Levels:</strong> "Low Motion" is great for subtle, realistic movements. "High Motion" is for big camera pans and action but can sometimes create strange results.</p>
                <p><strong>Control Variety with Chaos:</strong> A low "Chaos" value (0-10) will produce reliable, similar results. A high value (50+) will create wildly different and unexpected animations.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> User Guide Walkthrough</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>1. Upload Your Image:</strong> Midjourney Video requires a starting image. Upload one and let our AI generate a base motion description for you.</p>
                <p><strong>2. Describe the Motion:</strong> Refine the AI-generated text in the "Motion Prompt" box. Use the bullseye for creative ideas.</p>
                <p><strong>3. Set Artistic Controls:</strong> Adjust the "Stylize" and "Chaos" sliders to control how creative or varied the final video will be. Use "Style Raw" for more literal interpretations.</p>
                <p><strong>4. Define Technicals:</strong> Choose your "Motion Level" and "Aspect Ratio," and add any "Negative Prompts" to exclude unwanted elements.</p>
                <p><strong>5. Generate Your Prompt:</strong> Click the "Generate Midjourney Prompt" button. Our AI will assemble all your inputs into a perfect, native prompt for Midjourney.</p>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <>
      <Alert><Lightbulb className="w-5 h-5" /><AlertTitle>How Midjourney Video Works</AlertTitle><AlertDescription>Midjourney creates video by animating a starting image. Your prompt should focus on describing the motion and action.</AlertDescription></Alert>
      <div className="mt-6">
        <StudioLayout
          controls={formControls}
          preview={rightPanel}
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Choose a Motion Variant</DialogTitle>
                <DialogDescription>Select one of the AI-generated variants below to replace your motion description.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {variants.map((variant, index) => (
                    <Button key={index} variant="outline" className="h-auto text-left whitespace-normal justify-start" onClick={() => handleVariantSelect(variant)}>
                        {variant}
                    </Button>
                ))}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};