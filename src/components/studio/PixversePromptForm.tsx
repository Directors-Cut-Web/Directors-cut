"use client";
import { useState, useRef } from "react";
import { Copy, Sparkles, RotateCcw, BookOpen, Camera, Lightbulb, Loader2, Target, Film, Zap, Wind } from "lucide-react";
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

// --- Options for Pixverse, based on your research ---
const styleOptionsPixverse = ["Realistic", "Anime", "3D Animation", "Cyberpunk", "Comic"];
const cameraMovementOptions = [
    "Static", "Pan", "Tilt", "Zoom", "Dolly", "Wide Shot", "Aerial Shot", "Tracking Shot", 
    "Crane Up", "Quickly Zoom In", "Smooth Zoom In", "Camera Rotation", "Robo Arm", 
    "Whip Pan", "Hitchcock"
];
const lightingOptions = ["Natural Lighting", "Warm Lighting", "Dramatic Lighting", "Soft Lighting", "Sunset Glow"];
const motionModeOptions = ["Normal Mode", "Performance Mode (Fast)"];
const physicsOptions = ["Realistic Physics", "Exaggerated Physics"];
const aspectRatioOptions = ["16:9", "9:16", "1:1", "4:3", "3:4"];

// --- Main Component ---
export default function PixversePromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [characterPrompt, setCharacterPrompt] = useState("");
  const [scenePrompt, setScenePrompt] = useState("");
  const [detailsPrompt, setDetailsPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Anime");
  const [cameraMovement, setCameraMovement] = useState("Static");
  const [lighting, setLighting] = useState("Natural Lighting");
  const [motionStrength, setMotionStrength] = useState(5);
  const [motionMode, setMotionMode] = useState("Normal Mode");
  const [physics, setPhysics] = useState("Realistic Physics");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<'character' | 'scene' | 'details' | null>(null);

  const handleEnhance = async (fieldType: 'character' | 'scene' | 'details') => {
    let inputText = "";
    if (fieldType === 'character') inputText = characterPrompt;
    else if (fieldType === 'scene') inputText = scenePrompt;
    else inputText = detailsPrompt;

    if (!inputText) return alert("Please enter some text before enhancing.");
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: inputText }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "An unknown error occurred");
      setVariants(data.suggestions);
      setActiveField(fieldType);
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
    const payload = { 
      targetModel: 'Pixverse', 
      inputs: { characterPrompt, scenePrompt, detailsPrompt, negativePrompt, style, cameraMovement, lighting, motionStrength, motionMode, physics, aspectRatio } 
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
    setCharacterPrompt("");
    setScenePrompt("");
    setDetailsPrompt("");
    setNegativePrompt("");
    setStyle("Anime");
    setCameraMovement("Static");
    setLighting("Natural Lighting");
    setMotionStrength(5);
    setMotionMode("Normal Mode");
    setPhysics("Realistic Physics");
    setAspectRatio("16:9");
    setFinalPrompt("");
  };

  const handleVariantSelect = (variant: string) => {
    if (activeField === 'character') setCharacterPrompt(variant);
    else if (activeField === 'scene') setScenePrompt(variant);
    else if (activeField === 'details') setDetailsPrompt(variant);
    setIsDialogOpen(false);
  };

  const formControls = (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Core Prompt Elements</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="character-prompt" className="font-semibold">Character & Action</Label>
                <div className="relative">
                    <Textarea id="character-prompt" placeholder="a futuristic soldier dodging laser fire" value={characterPrompt} onChange={(e) => setCharacterPrompt(e.target.value)} className="min-h-[80px] pr-10" />
                    <button type="button" onClick={() => handleEnhance('character')} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI"><Target size={20} className="text-red-500" /></button>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="scene-prompt" className="font-semibold">Scene & Environment</Label>
                <div className="relative">
                    <Textarea id="scene-prompt" placeholder="a war-torn cityscape at dusk with smoke billowing" value={scenePrompt} onChange={(e) => setScenePrompt(e.target.value)} className="min-h-[80px] pr-10" />
                    <button type="button" onClick={() => handleEnhance('scene')} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI"><Target size={20} className="text-red-500" /></button>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="details-prompt" className="font-semibold">Fine Details & Props</Label>
                <div className="relative">
                    <Textarea id="details-prompt" placeholder="bright lanterns hang overhead, soft rain falling" value={detailsPrompt} onChange={(e) => setDetailsPrompt(e.target.value)} className="min-h-[80px] pr-10" />
                    <button type="button" onClick={() => handleEnhance('details')} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI"><Target size={20} className="text-red-500" /></button>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Film className="w-5 h-5" /> Style & Technical Controls</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Artistic Style" placeholder="Style" value={style} onChange={setStyle} options={styleOptionsPixverse} />
            <SelectField label="Lighting" placeholder="Lighting" value={lighting} onChange={setLighting} options={lightingOptions} />
            <SelectField label="Aspect Ratio" placeholder="Ratio" value={aspectRatio} onChange={setAspectRatio} options={aspectRatioOptions} />
            <SelectField label="Physics Simulation" placeholder="Physics" value={physics} onChange={setPhysics} options={physicsOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Camera & Motion</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <SelectField label="Camera Movement" placeholder="Movement" value={cameraMovement} onChange={setCameraMovement} options={cameraMovementOptions} />
            <SelectField label="Motion Mode" placeholder="Mode" value={motionMode} onChange={setMotionMode} options={motionModeOptions} />
            <div className="space-y-1.5"><Label>Motion Strength (1-10)</Label><Slider min={1} max={10} step={1} value={[motionStrength]} onValueChange={([v]) => setMotionStrength(v)} /></div>
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
                <p><strong>1. Craft Your Narrative:</strong> Use the three core prompt boxes to describe your character, scene, and fine details. Use the bullseye for creative ideas.</p>
                <p><strong>2. Define the Look:</strong> Use the "Style & Technical Controls" to set the artistic style, lighting, and physics of your world.</p>
                <p><strong>3. Direct the Camera:</strong> Pick a "Camera Movement" and "Motion Mode" to add dynamism to your video. Adjust the strength for subtle or dramatic effects.</p>
                <p><strong>4. Refine with Negatives:</strong> In the "Negative Prompt" box, list anything you want to avoid in the final video.</p>
                <p><strong>5. Generate Your Prompt:</strong> Click the "Generate Pixverse Prompt" button. Our AI will combine all your inputs into a prompt perfectly formatted for Pixverse.</p>
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