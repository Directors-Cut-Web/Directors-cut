"use client";
import { useState, useRef } from "react";
// --- FIX: Corrected the icon imports based on your screenshot ---
import { Copy, RotateCcw, BookOpen, Lightbulb, Target, Wand2, Image as ImageIcon, Loader2 } from "lucide-react";
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

// --- Options for Midjourney, based on your research ---
const cameraAngleOptions = ["Eye-Level", "Low-Angle Shot", "High-Angle Shot", "Over-the-Shoulder", "Dutch Tilt"];
const cameraMovementOptions = ["Static Camera", "Slow Pan Left", "Zoom In", "Tracking Shot"];
const framingOptions = ["Wide Shot", "Medium Shot", "Close-up", "Full Shot"];
const lightingOptions = ["Natural Light", "Rim Lighting", "Soft Light", "Dramatic High-Contrast", "Neon Streetlights"];
const genreOptions = ["Sci-Fi", "Noir", "Fantasy", "Horror", "Adventure", "Drama"];
const formatOptions = ["35mm Film", "8K Digital", "VHS Analog", "Hyper-real CGI", "Grainy Texture"];
const motionLevelOptions = ["Low Motion", "High Motion"];
const aspectRatioOptions = ["16:9", "9:16", "1:1", "4:3", "3:4", "2:3", "3:2"];

// --- Main Component ---
export default function MidjourneyVideoPromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [scenePrompt, setScenePrompt] = useState("");
  const [characterPrompt, setCharacterPrompt] = useState("");
  const [cameraSettingsPrompt, setCameraSettingsPrompt] = useState("");
  const [lightingPrompt, setLightingPrompt] = useState("");
  const [genrePrompt, setGenrePrompt] = useState("");
  const [formatPrompt, setFormatPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [motionLevel, setMotionLevel] = useState("Low Motion");
  const [stylize, setStylize] = useState(250);
  const [chaos, setChaos] = useState(0);
  const [styleRaw, setStyleRaw] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [crefUrl, setCrefUrl] = useState("");
  const [srefUrl, setSrefUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<'scene' | 'character' | null>(null);


  const handleEnhance = async (fieldType: 'scene' | 'character') => {
    const inputText = fieldType === 'character' ? characterPrompt : scenePrompt;
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
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
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
      inputs: { scenePrompt, characterPrompt, cameraSettingsPrompt, lightingPrompt, genrePrompt, formatPrompt, negativePrompt, motionLevel, stylize, chaos, styleRaw, aspectRatio, crefUrl, srefUrl } 
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
    setScenePrompt("");
    setCharacterPrompt("");
    setCameraSettingsPrompt("");
    setLightingPrompt("");
    setGenrePrompt("");
    setFormatPrompt("");
    setNegativePrompt("");
    setMotionLevel("Low Motion");
    setStylize(250);
    setChaos(0);
    setStyleRaw(true);
    setAspectRatio("16:9");
    setCrefUrl("");
    setSrefUrl("");
    setFinalPrompt("");
    setImagePreview(null);
  };

  const handleVariantSelect = (variant: string) => {
    if (activeField === 'character') {
        setCharacterPrompt(variant);
    } else if (activeField === 'scene') {
        setScenePrompt(variant);
    }
    setIsDialogOpen(false);
  };

  const formControls = (
    <div className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-blue-400" /> Starting Image</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Midjourney Video requires a starting image. Upload a frame to begin.</p>
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted mb-3">
                    {imagePreview && <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />}
                    {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
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
        <CardHeader><CardTitle>1. Scene & Environment</CardTitle></CardHeader>
        <CardContent>
            <div className="relative">
                <Textarea placeholder="A cyberpunk cityscape with towering neon-lit skyscrapers, wet streets reflecting lights..." value={scenePrompt} onChange={(e) => setScenePrompt(e.target.value)} className="min-h-[100px] pr-10" />
                <button type="button" onClick={() => handleEnhance('scene')} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI"><Target size={20} className="text-red-500" /></button>
            </div>
            <p className="text-xs text-muted-foreground pt-1">Describe the setting, background, and environmental details.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>2. Character & Action</CardTitle></CardHeader>
        <CardContent className="space-y-2">
            <div className="relative">
                <Textarea placeholder="A female cyberpunk hacker with short blue hair, sprinting through an alley..." value={characterPrompt} onChange={(e) => setCharacterPrompt(e.target.value)} className="min-h-[100px] pr-10" />
                <button type="button" onClick={() => handleEnhance('character')} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title="Enhance with AI"><Target size={20} className="text-red-500" /></button>
            </div>
            <p className="text-xs text-muted-foreground pt-1">Describe the main character(s) and their actions.</p>
            <Label htmlFor="cref-url">Character Reference Image URL (--cref)</Label>
            <Input id="cref-url" placeholder="https://..." value={crefUrl} onChange={(e) => setCrefUrl(e.target.value)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>3. Camera Settings</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Camera Angle" placeholder="Angle" value={cameraSettingsPrompt.split(',')[0] || ""} onChange={(val) => setCameraSettingsPrompt(`${val}, ${cameraSettingsPrompt.split(',')[1] || ''}, ${cameraSettingsPrompt.split(',')[2] || ''}`)} options={cameraAngleOptions} />
            <SelectField label="Camera Movement" placeholder="Movement" value={cameraSettingsPrompt.split(',')[1]?.trim() || ""} onChange={(val) => setCameraSettingsPrompt(`${cameraSettingsPrompt.split(',')[0] || ''}, ${val}, ${cameraSettingsPrompt.split(',')[2] || ''}`)} options={cameraMovementOptions} />
            <SelectField label="Framing" placeholder="Framing" value={cameraSettingsPrompt.split(',')[2]?.trim() || ""} onChange={(val) => setCameraSettingsPrompt(`${cameraSettingsPrompt.split(',')[0] || ''}, ${cameraSettingsPrompt.split(',')[1] || ''}, ${val}`)} options={framingOptions} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>4. Lighting</CardTitle></CardHeader>
        <CardContent>
            <SelectField label="Lighting Style" placeholder="Lighting" value={lightingPrompt} onChange={setLightingPrompt} options={lightingOptions} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>5. Genre & Mood</CardTitle></CardHeader>
        <CardContent>
            <SelectField label="Genre" placeholder="Genre" value={genrePrompt} onChange={setGenrePrompt} options={genreOptions} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>6. Format & Technical Style</CardTitle></CardHeader>
        <CardContent>
            <SelectField label="Format" placeholder="Format" value={formatPrompt} onChange={setFormatPrompt} options={formatOptions} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> 7. Style & Parameters</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Motion Level" placeholder="Motion" value={motionLevel} onChange={setMotionLevel} options={motionLevelOptions} />
                <SelectField label="Aspect Ratio" placeholder="Ratio" value={aspectRatio} onChange={setAspectRatio} options={aspectRatioOptions} />
            </div>
            <div className="space-y-1.5"><Label>Stylize (0-1000)</Label><Slider min={0} max={1000} step={1} value={[stylize]} onValueChange={([v]) => setStylize(v)} /></div>
            <div className="space-y-1.5"><Label>Chaos (0-100)</Label><Slider min={0} max={100} step={1} value={[chaos]} onValueChange={([v]) => setChaos(v)} /></div>
            <div className="flex items-center space-x-2"><Switch id="style-raw" checked={styleRaw} onCheckedChange={setStyleRaw} /><Label htmlFor="style-raw">Use Style Raw (--raw)</Label></div>
            <div className="space-y-1.5">
                <Label htmlFor="sref-url">Style Reference Image URL (--sref)</Label>
                <Input id="sref-url" placeholder="https://..." value={srefUrl} onChange={(e) => setSrefUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="negative-prompt">Negative Prompt (--no)</Label>
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
                <p><strong>Use References:</strong> Providing a Character Reference (`--cref`) and Style Reference (`--sref`) URL gives Midjourney powerful guidance for consistency.</p>
                <p><strong>Start Simple:</strong> Begin with just the Scene and Character prompts. Once you get a good result, add more controls like Camera and Lighting to refine it.</p>
                <p><strong>Balance Stylize:</strong> A lower `--s` value (like 50-150) respects your prompt more literally. A higher value (500+) gives Midjourney more creative freedom.</p>
                <p><strong>Embrace Chaos:</strong> A small amount of `--chaos` (10-20) can introduce interesting and unexpected variations to your video.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> User Guide Walkthrough</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>1. Upload Your Image:</strong> Midjourney Video requires a starting image. Upload one and let our AI generate a base motion description for you.</p>
                <p><strong>2. Describe the Motion:</strong> Refine the AI-generated text in the "Motion Prompt" box. Use the bullseye for creative ideas.</p>
                <p><strong>3. Set Artistic Controls:</strong> Adjust the "Stylize" and "Chaos" sliders to control how creative or varied the final video will be. Use "Style Raw" for more literal interpretations.</p>
                <p><strong>4. Define Technicals:</strong> Choose your "Motion Level" and "Aspect Ratio," and add any "Negative Prompts" to exclude unwanted elements.</p>
                <p><strong>5. Generate Your Prompt:</strong> Click the "Generate Midjourney Prompt" button. Our AI will assemble all your inputs into a single, perfectly formatted prompt string ready for Midjourney.</p>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <>
      <Alert><Lightbulb className="w-5 h-5" /><AlertTitle>How Midjourney Video Works</AlertTitle><AlertDescription>Midjourney creates video by combining a detailed text prompt with powerful parameters. This form helps you build that prompt step-by-step.</AlertDescription></Alert>
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
