"use client";
import { useState, useRef } from "react";
import { Copy, Sparkles, RotateCcw, BookOpen, Upload, Camera, Lightbulb, Loader2 } from "lucide-react";
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

// --- Options ---
const genreOptions = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];
const styleOptionsRunway = ["Cinematic", "Photorealistic", "Stop Motion", "Claymation", "Sketch", "Vibrant Color", "Monochromatic", "Surreal"];
const cameraMotionOptions = ["Pan Left", "Pan Right", "Tilt Up", "Tilt Down", "Dolly In", "Dolly Out", "Static"];


// --- Main Component ---
export default function RunwayGen4PromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [genre, setGenre] = useState("Fantasy");
  const [motionDescription, setMotionDescription] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [cameraMotion, setCameraMotion] = useState("Static");
  const [motionStrength, setMotionStrength] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const presets = {
    'Living Photograph': {
      genre: 'Drama',
      motionDescription: 'Subtle motion in the clouds, steam rising from a coffee cup, a gentle breeze rustling the leaves on a tree.',
      style: 'Photorealistic',
      cameraMotion: 'Static',
      motionStrength: 2,
    },
    'Animated Album Cover': {
      genre: 'Sci-Fi',
      motionDescription: 'The character\'s hair flows gently, neon lights in the background pulse with a slow rhythm, stars twinkle in the sky.',
      style: 'Surreal',
      cameraMotion: 'Dolly In',
      motionStrength: 4,
    },
    'Surreal Dream': {
      genre: 'Fantasy',
      motionDescription: 'The landscape slowly morphs and shifts, colors blend into each other, objects float weightlessly.',
      style: 'Surreal',
      cameraMotion: 'Pan Left',
      motionStrength: 7,
    }
  };

  const handlePresetSelect = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    setGenre(preset.genre || "");
    setMotionDescription(preset.motionDescription || "");
    setStyle(preset.style || "");
    setCameraMotion(preset.cameraMotion || "Static");
    setMotionStrength(preset.motionStrength || 5);
  };
  
  // --- MODIFICATION: Updated image upload to include AI analysis ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsLoading(true); // Start loading spinner
    setMotionDescription(""); // Clear previous description

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
            if (!response.ok) {
              reject(new Error(data.error || 'Failed to analyze image.'));
            } else {
              resolve(data);
            }
          } catch (e) {
            reject(e);
          }
        };

        reader.onerror = (error) => {
          reject(error);
        };
      });

      // Combine the AI descriptions and set them in the motion text area
      const combinedDescription = `${descriptions.characterAndAction} ${descriptions.sceneAndEnvironment}`;
      setMotionDescription(combinedDescription.trim());

    } catch (error) {
      console.error("Image analysis failed:", error);
      alert(`Image analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };


  const handleGenerateClick = async () => {
    if (!imagePreview) {
      alert("Please upload a starting image before generating a prompt.");
      return;
    }
    setIsLoading(true);
    setFinalPrompt("");
    const payload = { targetModel: 'Runway Gen 4', inputs: { genre, motionDescription, style, cameraMotion, motionStrength } };
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
    setGenre("Fantasy");
    setMotionDescription("");
    setStyle("Cinematic");
    setCameraMotion("Static");
    setMotionStrength(5);
    setFinalPrompt("");
    setImagePreview(null);
  };


  const formControls = (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-blue-400" /> Upload Starting Image</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Runway brings your still images to life. Upload a high-quality image to begin.</p>
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted mb-3">
                  {imagePreview && <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />}
                  {/* --- MODIFICATION: Added loading indicator for AI analysis --- */}
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
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-400" /> Quick Start Style Presets</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handlePresetSelect('Living Photograph')}>Living Photograph</Button>
                <Button variant="outline" onClick={() => handlePresetSelect('Animated Album Cover')}>Animated Cover</Button>
                <Button variant="outline" onClick={() => handlePresetSelect('Surreal Dream')}>Surreal Dream</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Motion & Style</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="motion-description" className="font-semibold">Describe the Motion (AI-Generated)</Label>
                    <Textarea id="motion-description" placeholder="Upload an image to generate a description, or write your own..." value={motionDescription} onChange={(e) => setMotionDescription(e.target.value)} className="min-h-[80px]" />
                </div>
                <SelectField label="Genre" placeholder="Select a genre..." value={genre} onChange={setGenre} options={genreOptions} />
                <SelectField label="Artistic Style" placeholder="Style" value={style} onChange={setStyle} options={styleOptionsRunway} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Camera Controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <SelectField label="Camera Motion" placeholder="Motion" value={cameraMotion} onChange={setCameraMotion} options={cameraMotionOptions} />
                <div className="space-y-1.5"><Label>Motion Strength (1-10)</Label><Slider min={1} max={10} step={1} value={[motionStrength]} onValueChange={([v]) => setMotionStrength(v)} /></div>
            </CardContent>
        </Card>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
        <div className="space-y-1.5">
            <Label className="font-medium text-lg">Final Runway Prompt</Label>
            <div className="relative">
                <Textarea value={finalPrompt || "Upload an image and click generate..."} readOnly className="min-h-[250px] pr-10" />
                {finalPrompt && (<Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button>)}
            </div>
        </div>

        <div className="flex items-center gap-2">
            <Button onClick={handleGenerateClick} disabled={isLoading || !imagePreview} className="w-full py-6 text-base font-medium">{isLoading ? 'Generating...' : '✨ Generate Runway Prompt'}</Button>
            <Button onClick={handleStartOver} variant="secondary" className="py-6" title="Start Over">
                <RotateCcw className="h-5 w-5" />
            </Button>
        </div>
        
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Field Guide</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>Starting Image:</strong> This is the most important element. Runway will animate what's in your picture.</p>
                <p><strong>Describe the Motion:</strong> Be specific about what should move. "Wind blowing through her hair" is better than just "movement".</p>
                <p><strong>Camera Motion:</strong> This controls how the "camera" moves. 'Dolly In' creates a dramatic zoom effect.</p>
                <p><strong>Motion Strength:</strong> A low number (1-3) is for subtle motion. A high number (8-10) is for very dramatic movement.</p>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <>
      <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Runway Works</AlertTitle><AlertDescription>Runway excels at Image-to-Video. Provide a starting image and describe the motion you want to see.</AlertDescription></Alert>
      <div className="mt-6">
        <StudioLayout
          controls={formControls}
          preview={rightPanel}
        />
      </div>
    </>
  );
};
