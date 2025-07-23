"use client";
import { useState, useRef } from "react";
// --- FIX: Added the missing 'Zap' icon to the import statement ---
import { Copy, Sparkles, RotateCcw, BookOpen, Upload, Camera, Lightbulb, Loader2, Target, Film, Zap } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
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

// --- Options for Luma ---
const genreOptions = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];
const styleOptionsLuma = ["Photorealistic", "Cinematic", "Anime", "Watercolor", "Minimalist", "Surreal", "3D Render"];
const cameraEffectsOptions = ["Static", "Pan", "Zoom", "Orbit"];

// --- Main Component ---
export default function LumaDreamMachinePromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [genre, setGenre] = useState("Fantasy");
  const [mainPrompt, setMainPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [cameraEffect, setCameraEffect] = useState("Static");
  const [motionFluidity, setMotionFluidity] = useState(5);
  const [characterConsistency, setCharacterConsistency] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsLoading(true);
    setMainPrompt("");

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
      setMainPrompt(combinedDescription.trim());
    } catch (error: any) {
      console.error("Image analysis failed:", error);
      alert(`Image analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
    const payload = { targetModel: 'Luma Dream Machine', inputs: { genre, mainPrompt, style, cameraEffect, motionFluidity, characterConsistency, hasImage: !!imagePreview } };
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
    setGenre("Fantasy");
    setMainPrompt("");
    setStyle("Cinematic");
    setCameraEffect("Static");
    setMotionFluidity(5);
    setCharacterConsistency(7);
    setFinalPrompt("");
    setImagePreview(null);
  };

  const handleVariantSelect = (variant: string) => {
    setMainPrompt(variant);
    setIsDialogOpen(false);
  };

  const formControls = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-blue-400" /> Upload Starting Image (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Upload an image to use as a visual reference, or let our AI generate a description for you.</p>
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
        <CardHeader><CardTitle>Main Prompt</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="main-prompt" className="font-semibold">Describe Your Scene</Label>
                <div className="relative">
                    <Textarea id="main-prompt" placeholder="A majestic castle shrouded in fog..." value={mainPrompt} onChange={(e) => setMainPrompt(e.target.value)} className="min-h-[120px] pr-10" />
                    <button type="button" onClick={handleEnhance} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI">
                        <Target size={20} className="text-red-500" />
                    </button>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Film className="w-5 h-5" /> Cinematic Controls</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Genre" placeholder="Genre" value={genre} onChange={setGenre} options={genreOptions} />
            <SelectField label="Artistic Style" placeholder="Style" value={style} onChange={setStyle} options={styleOptionsLuma} />
            <SelectField label="Camera Effect" placeholder="Effect" value={cameraEffect} onChange={setCameraEffect} options={cameraEffectsOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Advanced Motion Controls</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Motion Fluidity (1-10)</Label><Slider min={1} max={10} step={1} value={[motionFluidity]} onValueChange={([v]) => setMotionFluidity(v)} /></div>
            <div className="space-y-1.5"><Label>Character Consistency (1-10)</Label><Slider min={1} max={10} step={1} value={[characterConsistency]} onValueChange={([v]) => setCharacterConsistency(v)} /></div>
        </CardContent>
      </Card>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label className="font-medium text-lg">Final Luma Prompt</Label>
        <div className="relative">
          <Textarea value={finalPrompt || "Fill out the form to generate your prompt..."} readOnly className="min-h-[250px] pr-10" />
          {finalPrompt && (<Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button>)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium">{isLoading ? 'Generating...' : '✨ Generate Luma Prompt'}</Button>
        <Button onClick={handleStartOver} variant="secondary" className="py-6" title="Start Over"><RotateCcw className="h-5 w-5" /></Button>
      </div>
        <Card>
            <CardHeader><CardTitle>Tips & Tricks</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>Be Descriptive:</strong> Luma loves detail. Instead of "a car," try "a vintage red convertible driving down a coastal highway at sunset."</p>
                <p><strong>Use Natural Language:</strong> Speak to the AI conversationally. The bullseye can help you find more poetic and descriptive ways to phrase your ideas.</p>
                <p><strong>Crank Up Consistency:</strong> For videos featuring a specific person, increase the "Character Consistency" slider to ensure they look the same in every frame.</p>
                <p><strong>Fluidity is Key:</strong> A higher "Motion Fluidity" value creates smoother, more dream-like movements, which is one of Luma's greatest strengths.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> User Guide Walkthrough</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>1. Write or Upload:</strong> Either write a detailed description in the "Main Prompt" box or upload an image and let our AI write one for you.</p>
                <p><strong>2. Refine with Bullseye:</strong> Click the bullseye icon on the Main Prompt to get three creative alternatives for your description.</p>
                <p><strong>3. Set the Scene:</strong> Use the "Cinematic Controls" to define the genre, artistic style, and camera movement for your shot.</p>
                <p><strong>4. Fine-Tune Motion:</strong> Adjust the "Motion Fluidity" and "Character Consistency" sliders to control how realistic and smooth your video will be.</p>
                <p><strong>5. Generate Your Prompt:</strong> Click the "Generate Luma Prompt" button to have our AI assemble all your inputs into a perfect, native prompt for Luma.</p>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <>
      <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Luma Works</AlertTitle><AlertDescription>Luma creates beautiful, fluid videos from detailed text prompts and can use images as a strong visual reference.</AlertDescription></Alert>
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
