"use client";
import { useState, useRef } from "react";
import { Target, Lightbulb, Camera, Copy, Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";

interface RunwayPromptFormProps {
  onPromptGenerated: (prompt: string) => void;
}

const SelectField = ({ label, value, set, options }: { label: string, value: string, set: (v: string) => void, options: string[] }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Select value={value} onValueChange={set}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

// Options Definitions
const aspectOptions = ["16:9", "9:16", "1:1", "4:3"];
const styleOptions = ["Cinematic", "Claymation", "Watercolor", "Pixel Art", "Infrared", "Photorealistic"];
const shotStyleOptions = ["None", "Drone Follow Shot", "FPV Drone Shot", "Sweeping Crane Shot", "Handheld Shaky-Cam", "Low Angle Tracking Shot", "Dolly Zoom"];
const motionOptions = {
  Pan: ["None", "Left", "Right"],
  Tilt: ["None", "Up", "Down"],
  Roll: ["None", "Clockwise", "Counter-clockwise"],
  Zoom: ["None", "In", "Out"]
};

export default function RunwayGen4PromptForm({ onPromptGenerated }: RunwayPromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState<number | null>(null);
  const [upscale, setUpscale] = useState(false);
  const [aspect, setAspect] = useState("16:9");
  const [style, setStyle] = useState("Cinematic");
  const [shotStyle, setShotStyle] = useState("None");
  const [motionAmount, setMotionAmount] = useState(5);
  const [pan, setPan] = useState("None");
  const [tilt, setTilt] = useState("None");
  const [roll, setRoll] = useState("None");
  const [zoom, setZoom] = useState("None");
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!prompt) return alert("Please enter some text before enhancing.");
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setVariants(data.variants);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      alert("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantSelect = (variant: string) => {
    setPrompt(variant);
    setIsDialogOpen(false);
  };

  const handleGenerateClick = async () => {
    if (!imagePreview) {
      alert("Please upload a starting image before generating a prompt.");
      return;
    }
    setIsLoading(true);
    setFinalPrompt("");
    const payload = { targetModel: 'Runway Gen4+ Studio', inputs: { prompt, seed, upscale, aspect, style, shotStyle, motionAmount, pan, tilt, roll, zoom, imagePreview } };
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Column: Controls */}
      <div className="w-full md:w-1/2 space-y-6">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>How Runway Works</AlertTitle>
          <AlertDescription>Describe your scene, then use the powerful sliders and dropdowns to control the camera and style precisely. Upload an image to animate.</AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" /> Upload Starting Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Runway brings your still images to life. Upload a high-quality image to begin.</p>
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted mb-3">
              {imagePreview && <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
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
        <div className="space-y-1.5">
          <Label className="font-semibold">Main Prompt</Label>
          <div className="relative">
            <Textarea
              placeholder="e.g., A futuristic city skyline at dusk, raining"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] pr-10"
            />
            <button
              type="button"
              onClick={handleEnhance}
              className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50"
              title="Enhance with AI"
            >
              <Target size={20} className="text-red-500" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Click the <Target className="inline h-3 w-3 stroke-red-600" /> to generate 3 prompt variants.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Style Preset" value={style} set={setStyle} options={styleOptions} />
          <SelectField label="Cinematic Shot Style" value={shotStyle} set={setShotStyle} options={shotStyleOptions} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" /> Mechanical Camera Motion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Amount of Motion (0-10)</Label>
              <Slider
                min={0}
                max={10}
                step={1}
                value={[motionAmount]}
                onValueChange={([v]) => setMotionAmount(v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Pan" value={pan} set={setPan} options={motionOptions.Pan} />
              <SelectField label="Tilt" value={tilt} set={setTilt} options={motionOptions.Tilt} />
              <SelectField label="Roll" value={roll} set={setRoll} options={motionOptions.Roll} />
              <SelectField label="Zoom" value={zoom} set={setZoom} options={motionOptions.Zoom} />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Aspect Ratio" value={aspect} set={setAspect} options={aspectOptions} />
          <div className="space-y-1.5">
            <Label htmlFor="runway-seed">Seed</Label>
            <Input
              id="runway-seed"
              type="number"
              placeholder="Random"
              value={seed ?? ""}
              onChange={(e) => setSeed(e.target.value ? Number.parseInt(e.target.value) : null)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="runway-upscale"
            checked={upscale}
            onCheckedChange={(c) => setUpscale(Boolean(c))}
          />
          <Label htmlFor="runway-upscale">Upscale to 4K</Label>
        </div>
      </div>

      {/* Right Column: Output and Controls */}
      <div className="w-full md:w-1/2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generated Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={finalPrompt}
                readOnly
                placeholder="Your generated prompt will appear here..."
                className="min-h-[200px] w-full"
              />
              <Button
                onClick={handleGenerateClick}
                disabled={isLoading || !imagePreview}
                className="w-full py-6 text-base font-medium"
              >
                {isLoading ? 'Generating...' : '✨ Generate Runway Prompt'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tips & Tricks</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3 text-muted-foreground">
            <p><strong>Start Simple, Then Refine:</strong> Begin with a basic prompt (e.g., "A man walks through a forest") and enhance with details like "golden hour lighting, slow tracking shot" for precise control.</p>
            <p><strong>Leverage Reference Images:</strong> Upload 1-3 high-quality images (e.g., a character portrait) to anchor scenes or characters, ensuring consistency across generations.</p>
            <p><strong>Focus on Motion Details:</strong> Specify clear movements (e.g., "dolly zoom on a running horse") to guide realistic camera or subject motion effectively.</p>
            <p><strong>Use Positive Descriptions:</strong> Emphasize what to include (e.g., "clear blue sky") over exclusions (e.g., "no clouds") to align with Gen-4’s processing strengths.</p>
            <p><strong>Incorporate Cinematic Terms:</strong> Add film language like "anamorphic lens" or "volumetric lighting" to achieve a polished, professional aesthetic.</p>
            <p><strong>Match Aspect Ratios:</strong> Select an aspect ratio (e.g., 16:9 for widescreen, 9:16 for vertical) suited to your target platform to avoid cropping issues.</p>
            <p><strong>Test with Short Durations:</strong> Generate 5-second clips first, then refine prompts for longer outputs, optimizing resource use.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Guide Walkthrough</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3 text-muted-foreground">
            <p><strong>Getting Started:</strong> Log into the RunwayGen4 web app, navigate to the "Generate Video" section from the left menu, and click "New Session" to start.</p>
            <p><strong>Uploading Reference Images:</strong> Click the "Upload Starting Image" area on the left panel, select 1-3 high-quality images (e.g., a scene or character), and wait for them to load as visual anchors.</p>
            <p><strong>Crafting Your Prompt:</strong> In the "Main Prompt" textarea on the left, enter a detailed description (e.g., "Slow pan: A knight in armor stands on a misty battlefield, soft diffused light"), using the bullseye button for AI-enhanced variants if needed.</p>
            <p><strong>Adjusting Controls:</strong> Use the dropdowns and sliders on the left (e.g., "Style Preset" to "Cinematic", "Aspect Ratio" to 16:9, "Motion Amount" to 5) to customize the video’s style and movement.</p>
            <p><strong>Setting Camera Motion:</strong> Fine-tune the "Mechanical Camera Motion" section with options like "Pan" to "Left" or "Zoom" to "In" to control the camera’s behavior.</p>
            <p><strong>Generating the Video:</strong> Click the "Generate Runway Prompt" button on the right panel to process your input. Monitor the loading indicator and review the generated prompt in the readonly textarea once complete.</p>
            <p><strong>Reviewing and Adjusting:</strong> Check the output in the right panel’s textarea. Modify the prompt (e.g., add "handheld shaky cam") or use "Start Over" to reset, then regenerate as needed.</p>
            <p><strong>Saving Your Work:</strong> Copy the final prompt using the copy icon next to the textarea, then download the video (available post-generation) for further editing or sharing.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-5xl w-full">
          <DialogHeader>
            <DialogTitle>Choose a Variant</DialogTitle>
            <DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {variants.map((variant, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto text-left whitespace-normal justify-start"
                onClick={() => handleVariantSelect(variant)}
              >
                {variant}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}