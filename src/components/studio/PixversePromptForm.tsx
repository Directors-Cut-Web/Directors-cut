"use client";
import { useState, useRef } from "react";
import { Copy, Sparkles, RotateCcw, BookOpen, Camera, Lightbulb, Loader2, Target, Film } from "lucide-react";
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

// --- Options for Pixverse ---
const styleOptionsPixverse = ["Realistic", "Anime", "3D Animation", "Comic", "Cyberpunk"];
const cameraMovementOptions = [
    "Static", "Zoom In", "Zoom Out", "Pan Left", "Pan Right", "Tilt Up", "Tilt Down", 
    "Crane Up", "Quickly Zoom In", "Quickly Zoom Out", "Smooth Zoom In", 
    "Camera Rotation", "Robo Arm", "Super Dolly Out", "Whip Pan", "Hitchcock", 
    "Left Follow", "Right Follow", "Fixed Background"
];
const aspectRatioOptions = ["16:9", "9:16", "1:1", "4:3", "3:4"];


// --- Main Component ---
export default function PixversePromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [mainPrompt, setMainPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Anime");
  const [cameraMovement, setCameraMovement] = useState("Static");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEnhance = async () => {
    if (!mainPrompt) return alert("Please enter a prompt before enhancing.");
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: mainPrompt }) });
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

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setFinalPrompt("");
    const payload = { targetModel: 'Pixverse', inputs: { mainPrompt, negativePrompt, style, cameraMovement, aspectRatio } };
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
    setMainPrompt("");
    setNegativePrompt("");
    setStyle("Anime");
    setCameraMovement("Static");
    setAspectRatio("16:9");
    setFinalPrompt("");
  };

  const handleVariantSelect = (variant: string) => {
    setMainPrompt(variant);
    setIsDialogOpen(false);
  };

  const formControls = (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Main Prompt</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-1.5">
                <Label htmlFor="main-prompt" className="font-semibold">Describe Your Video Scene</Label>
                <div className="relative">
                    <Textarea id="main-prompt" placeholder="A girl with long, flowing hair stands on a cliff overlooking a stormy sea..." value={mainPrompt} onChange={(e) => setMainPrompt(e.target.value)} className="min-h-[120px] pr-10" />
                    <button type="button" onClick={handleEnhance} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI">
                        <Target size={20} className="text-red-500" />
                    </button>
                </div>
                 <p className="text-xs text-muted-foreground pt-1">Use the formula: Subject + Description + Action + Environment.</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Film className="w-5 h-5" /> Style & Scene Controls</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Artistic Style" placeholder="Style" value={style} onChange={setStyle} options={styleOptionsPixverse} />
            <SelectField label="Aspect Ratio" placeholder="Ratio" value={aspectRatio} onChange={setAspectRatio} options={aspectRatioOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Camera Movement</CardTitle></CardHeader>
        <CardContent>
            <SelectField label="Camera Movement" placeholder="Movement" value={cameraMovement} onChange={setCameraMovement} options={cameraMovementOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Negative Prompt</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-1.5">
                <Label htmlFor="negative-prompt">Exclude elements from your video</Label>
                <Input id="negative-prompt" placeholder="e.g., blurry, text, watermark, low quality" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
            </div>
        </CardContent>
      </Card>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label className="font-medium text-lg">Final Pixverse Prompt</Label>
        <div className="relative">
          <Textarea value={finalPrompt || "Fill out the form to generate your prompt..."} readOnly className="min-h-[250px] pr-10" />
          {finalPrompt && (<Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button>)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium">{isLoading ? 'Generating...' : '✨ Generate Pixverse Prompt'}</Button>
        <Button onClick={handleStartOver} variant="secondary" className="py-6" title="Start Over"><RotateCcw className="h-5 w-5" /></Button>
      </div>
        <Card>
            <CardHeader><CardTitle>Tips & Tricks</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>Embrace Animation:</strong> Pixverse excels at Anime and 3D styles. Select these for vibrant, high-quality results.</p>
                <p><strong>Be Specific and Simple:</strong> Use clear, natural language. "A white cruise ship sails slowly across the sea" works better than overly poetic descriptions.</p>
                <p><strong>Use the Negative Prompt:</strong> Exclude things you don't want to see. Adding "text, watermark, blurry" can significantly clean up your final video.</p>
                <p><strong>Dynamic Camera:</strong> Don't just stick to "Static." A "Crane Up" or "Hitchcock" zoom can add a professional, cinematic feel to your shot.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> User Guide Walkthrough</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>1. Craft Your Scene:</strong> In the "Main Prompt" box, describe the video you want to create. Use the bullseye for creative ideas.</p>
                <p><strong>2. Choose Your Style:</strong> Select your desired "Artistic Style" and "Aspect Ratio." "Anime" is a great starting point for stylized content.</p>
                <p><strong>3. Direct the Camera:</strong> Pick a "Camera Movement" to add dynamism to your video. "Left Follow" is great for tracking a character.</p>
                <p><strong>4. Refine with Negatives:</strong> In the "Negative Prompt" box, list anything you want to avoid in the final video.</p>
                <p><strong>5. Generate Your Prompt:</strong> Click the "Generate Pixverse Prompt" button. Our AI will combine your inputs into a prompt perfectly formatted for Pixverse.</p>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <>
      <Alert><Lightbulb className="w-5 h-5" /><AlertTitle>How Pixverse Works</AlertTitle><AlertDescription>Pixverse specializes in high-quality anime and 3D animation, with extensive camera controls to create dynamic scenes.</AlertDescription></Alert>
      <div className="mt-6">
        <StudioLayout
          controls={formControls}
          preview={rightPanel}
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Choose a Variant</DialogTitle>
                <DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription>
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
