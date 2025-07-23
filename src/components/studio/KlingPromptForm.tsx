"use client";
import { useState, useRef } from "react";
import { Copy, Sparkles, RotateCcw, BookOpen, Upload, Camera, Lightbulb, Loader2, Target, Zap } from "lucide-react";
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

// --- Options for Kling ---
const genreOptions = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];
const styleOptionsKling = ["Hyper-Realistic", "Cinematic", "Anime", "Documentary", "3D Animation", "Vibrant Color", "Gritty Realism", "Surreal"];
const motionSpeedOptions = ["Real-time", "Slow Motion (120fps)", "Super Slow-mo (240fps)", "Time-lapse"];
const physicsOptions = ["Realistic Physics", "Zero Gravity", "Exaggerated Physics (Anime-style)"];
const realismOptions = ["Photorealistic", "Slightly Stylized", "Hyper-Detailed"];

// --- Main Component ---
export default function KlingPromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [genre, setGenre] = useState("Action");
  const [character, setCharacter] = useState("");
  const [scene, setScene] = useState("");
  const [style, setStyle] = useState("Hyper-Realistic");
  const [motionSpeed, setMotionSpeed] = useState("Real-time");
  const [physics, setPhysics] = useState("Realistic Physics");
  const [realism, setRealism] = useState("Photorealistic");
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<'character' | 'scene' | null>(null);

  const handleEnhance = async (fieldType: 'character' | 'scene') => {
    const inputText = fieldType === 'character' ? character : scene;
    if (!inputText) return alert("Please enter some text before enhancing.");
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: inputText }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "An unknown error occurred");
      setVariants(data.suggestions);
      setActiveField(fieldType);
      setIsDialogOpen(true);
    } catch (error) {
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
      setCharacter(descriptions.characterAndAction || "");
      setScene(descriptions.sceneAndEnvironment || "");
    } catch (error) {
      console.error("Image analysis failed:", error);
      alert(`Image analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setFinalPrompt("");
    const payload = { targetModel: 'Kling', inputs: { genre, character, scene, style, motionSpeed, physics, realism } };
    try {
      const response = await fetch('/api/generate-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setFinalPrompt(data.finalPrompt);
      onPromptGenerated(data.finalPrompt);
    } catch (error) {
      alert("Failed to generate the final prompt.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartOver = () => {
    setGenre("Action");
    setCharacter("");
    setScene("");
    setStyle("Hyper-Realistic");
    setMotionSpeed("Real-time");
    setPhysics("Realistic Physics");
    setRealism("Photorealistic");
    setFinalPrompt("");
    setImagePreview(null);
  };

  const handleVariantSelect = (variant: string) => {
    if (activeField === 'character') setCharacter(variant);
    else if (activeField === 'scene') setScene(variant);
    setIsDialogOpen(false);
  };

  const formControls = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-blue-400" /> AI Scene Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Upload a starting frame and let AI describe the scene and character for you.</p>
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
            {imagePreview ? 'Upload a Different Frame' : 'Upload Starting Frame'}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Core Narrative</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="character-action" className="font-semibold">Character & Complex Action</Label>
                <div className="relative">
                    <Textarea id="character-action" placeholder="e.g., A futuristic soldier sprints across a crumbling bridge, dodging laser fire." value={character} onChange={(e) => setCharacter(e.target.value)} className="min-h-[80px] pr-10" />
                    <button type="button" onClick={() => handleEnhance('character')} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI">
                        <Target size={20} className="text-red-500" />
                    </button>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="scene-env" className="font-semibold">Scene & Environment</Label>
                <div className="relative">
                    <Textarea id="scene-env" placeholder="e.g., A war-torn cityscape at dusk, smoke billowing from damaged skyscrapers." value={scene} onChange={(e) => setScene(e.target.value)} className="min-h-[80px] pr-10" />
                    <button type="button" onClick={() => handleEnhance('scene')} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI">
                        <Target size={20} className="text-red-500" />
                    </button>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Physics & Motion Controls</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Physics Simulation" placeholder="Physics" value={physics} onChange={setPhysics} options={physicsOptions} />
            <SelectField label="Motion Speed" placeholder="Speed" value={motionSpeed} onChange={setMotionSpeed} options={motionSpeedOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Visual Style</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Genre" placeholder="Genre" value={genre} onChange={setGenre} options={genreOptions} />
            <SelectField label="Artistic Style" placeholder="Style" value={style} onChange={setStyle} options={styleOptionsKling} />
            <SelectField label="Character Realism" placeholder="Realism" value={realism} onChange={setRealism} options={realismOptions} />
        </CardContent>
      </Card>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label className="font-medium text-lg">Final Kling Prompt</Label>
        <div className="relative">
          <Textarea value={finalPrompt || "Fill out the form to generate your prompt..."} readOnly className="min-h-[250px] pr-10" />
          {finalPrompt && (<Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button>)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium">{isLoading ? 'Generating...' : '✨ Generate Kling Prompt'}</Button>
        <Button onClick={handleStartOver} variant="secondary" className="py-6" title="Start Over"><RotateCcw className="h-5 w-5" /></Button>
      </div>
        <Card>
            <CardHeader><CardTitle>Tips & Tricks</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>Describe Physical Actions:</strong> Kling excels at physics. Be specific about actions like "jumping over a car," "a glass shattering," or "a flag waving realistically in the wind."</p>
                <p><strong>Leverage Slow Motion:</strong> Use the "Slow Motion" settings to create dramatic, high-impact moments. It's perfect for action sequences or emotional close-ups.</p>
                <p><strong>Push for Realism:</strong> Combine "Hyper-Realistic" style with "Photorealistic" realism for stunningly lifelike results, especially for human characters.</p>
                <p><strong>Use the Bullseye for Action:</strong> The bullseye can help you brainstorm more dynamic and complex actions for your characters, which plays to Kling's strengths.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> User Guide Walkthrough</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>1. Start with an Image (Optional):</strong> Upload a reference image to let our AI generate a base description for your scene and character.</p>
                <p><strong>2. Detail the Narrative:</strong> Fill in the "Character & Complex Action" and "Scene & Environment" fields. Be as descriptive as possible.</p>
                <p><strong>3. Control the Physics:</strong> Use the "Physics & Motion Controls" to define how objects and characters interact. "Exaggerated Physics" is great for anime or comedy.</p>
                <p><strong>4. Define the Look:</strong> Use the "Visual Style" controls to set the genre, artistic style, and level of realism for your final video.</p>
                <p><strong>5. Generate Your Prompt:</strong> Click the "Generate Kling Prompt" button to have our AI assemble all your inputs into a perfect, native prompt for Kling.</p>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <>
      <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Kling Works</AlertTitle><AlertDescription>Kling creates high-fidelity, long-duration videos with a sophisticated understanding of real-world physics and complex motion.</AlertDescription></Alert>
      <div className="mt-6 container mx-auto p-2 max-w-7xl flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3 space-y-6">
          {formControls}
        </div>
        <div className="w-full md:w-1/3 space-y-6">
          {rightPanel}
        </div>
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
}