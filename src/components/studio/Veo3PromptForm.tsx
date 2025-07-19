"use client";
import { useState } from "react";
import { Target, Lightbulb, Mic, Film, Copy, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StudioLayout } from './StudioLayout';

// --- Helper Components ---

const InlineIcon = <Target className="inline h-3 w-3 stroke-red-600" />;

const PromptField = ({ label, placeholder, value, onChange, onBullseyeClick, description }: { label: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, onBullseyeClick: () => Promise<void>, description: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={label} className="font-semibold">{label}</Label>
    <div className="relative">
      <Textarea id={label} placeholder={placeholder} value={value} onChange={onChange} className="min-h-[80px] pr-10" />
      <button type="button" onClick={onBullseyeClick} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title={`Enhance ${label} with AI`}>
        <Target size={20} className="text-red-500" />
      </button>
    </div>
    <p className="text-xs text-muted-foreground pt-1">{description}</p>
  </div>
);

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
const styleOptions = ["Cinematic", "Photorealistic", "Anime", "Documentary", "3D Animation", "Vibrant Color", "Monochromatic", "Surreal"];
const shotOptions = ["Establishing Shot", "Wide Shot", "Full Shot", "Medium Shot", "Medium Close-up", "Close-up", "Extreme Close-up"];
const motionOptions = ["Static Camera", "Slow Pan Left", "Whip Pan", "Dolly Zoom (Vertigo Shot)", "Tracking Shot", "Crane Shot Up", "Handheld Shaky Cam"];
const lightingOptions = ["Cinematic Lighting", "Soft, Diffused Light", "Hard, Direct Light", "Low-Key Lighting (Chiaroscuro)", "Golden Hour", "Neon Lit"];
const aspectRatioOptions = ["16:9", "9:16", "1:1", "4:3", "2.39:1"];

// --- Main Component ---
export default function Veo3PromptForm({ onPromptGenerated }: { onPromptGenerated: (prompt: string) => void; }) {
  const [genre, setGenre] = useState("Sci-Fi");
  const [character, setCharacter] = useState("");
  const [scene, setScene] = useState("");
  const [negative, setNegative] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [shot, setShot] = useState("");
  const [motion, setMotion] = useState("");
  const [lighting, setLighting] = useState("");
  const [aspect, setAspect] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [audioDesc, setAudioDesc] = useState("");
  const [dialogue, setDialogue] = useState("");
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<'character' | 'scene' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");

  // --- MODIFICATION: Added preset definitions ---
  const presets = {
    'Street Interview': {
      genre: 'Comedy',
      character: 'An eccentric alien with shimmering skin, holding a retro microphone, asking passersby about their favorite human food.',
      scene: 'A busy, sun-drenched city sidewalk with a diverse crowd of people walking by, some stopping to look at the camera.',
      shot: 'Medium Close-up',
      motion: 'Handheld Shaky Cam',
      lighting: 'Hard, Direct Light',
      dialogue: "Alien: (In a curious, high-pitched voice) 'Excuse me, human, what is your opinion on this delicacy you call... pizza?'",
      audioDesc: 'City ambiance, chatter, occasional car horn, a faint, strange humming sound from the alien\'s microphone.',
    },
    'Cinematic Vlog': {
      genre: 'Drama',
      character: 'A solo traveler, journaling in a notebook while sipping coffee, a look of thoughtful reflection on their face.',
      scene: 'A cozy, rain-streaked cafe window overlooking a misty mountain range at dawn.',
      style: 'Cinematic',
      shot: 'Medium Shot',
      motion: 'Slow Pan Left',
      lighting: 'Soft, Diffused Light',
      audioDesc: 'Lofi hip-hop music, gentle rain sounds, the soft scratch of a pen on paper.',
      dialogue: '',
    },
    'Unboxing Demo': {
      genre: 'Sci-Fi',
      character: 'A pair of clean, gloved hands carefully opening a mysterious, glowing box on a pedestal.',
      scene: 'A clean, minimalist tabletop with a soft, out-of-focus background. The room is dark except for the light from the box.',
      style: 'Photorealistic',
      shot: 'Close-up',
      motion: 'Static Camera',
      lighting: 'Low-Key Lighting (Chiaroscuro)',
      audioDesc: 'Satisfying sounds of tearing paper, a soft click as the box opens, a gentle, ethereal hum from the object inside.',
      dialogue: '',
    }
  };

  // --- MODIFICATION: Added handler for preset buttons ---
  const handlePresetSelect = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    setGenre(preset.genre || "");
    setCharacter(preset.character || "");
    setScene(preset.scene || "");
    setStyle(preset.style || "");
    setShot(preset.shot || "");
    setMotion(preset.motion || "");
    setLighting(preset.lighting || "");
    setAudioDesc(preset.audioDesc || "");
    setDialogue(preset.dialogue || "");
  };

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

  const handleVariantSelect = (variant: string) => {
    if (activeField === 'character') setCharacter(variant);
    else if (activeField === 'scene') setScene(variant);
    setIsDialogOpen(false);
  };

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setFinalPrompt("");
    const payload = { targetModel: 'Veo 3+ Studio', inputs: { genre, character, scene, negative, style, shot, motion, lighting, aspect, duration, audioDesc, dialogue } };
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

  const formControls = (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>What type of movie are you creating?</CardTitle>
            </CardHeader>
            <CardContent>
                <SelectField label="Genre" placeholder="Select a genre..." value={genre} onChange={setGenre} options={genreOptions} />
            </CardContent>
        </Card>

        {/* --- MODIFICATION: Added Preset Card --- */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-400" /> Quick Start Style Presets</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handlePresetSelect('Street Interview')}>Street Interview</Button>
                <Button variant="outline" onClick={() => handlePresetSelect('Cinematic Vlog')}>Cinematic Vlog</Button>
                <Button variant="outline" onClick={() => handlePresetSelect('Unboxing Demo')}>Unboxing Demo</Button>
            </CardContent>
        </Card>

        <Card><CardHeader><CardTitle>Visual Foundation</CardTitle></CardHeader><CardContent className="space-y-4">
            <PromptField label="Character & Action" placeholder="e.g., A brave explorer discovering a hidden waterfall" value={character} onChange={(e) => setCharacter(e.target.value)} onBullseyeClick={() => handleEnhance('character')} description={<>Click the {InlineIcon} to generate 3 character variants.</>} />
            <PromptField label="Scene & Environment" placeholder="e.g., A lush, vibrant jungle with bioluminescent plants" value={scene} onChange={(e) => setScene(e.target.value)} onBullseyeClick={() => handleEnhance('scene')} description={<>Click the {InlineIcon} to generate 3 scene variants.</>} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Film className="w-5 h-5" />Cinematic & Style Controls</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Artistic Style" placeholder="Style" value={style} onChange={setStyle} options={styleOptions} />
            <SelectField label="Lighting Style" placeholder="Lighting" value={lighting} onChange={setLighting} options={lightingOptions} />
            <SelectField label="Camera Shot" placeholder="Shot Type" value={shot} onChange={setShot} options={shotOptions} />
            <SelectField label="Camera Motion" placeholder="Motion" value={motion} onChange={setMotion} options={motionOptions} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Mic className="w-5 h-5" /> Audio & Dialogue</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Audio Description</Label><Input placeholder="e.g., sound of rushing water, birds chirping" value={audioDesc} onChange={e => setAudioDesc(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Dialogue</Label><Textarea placeholder="Character A: 'We finally made it.'" value={dialogue} onChange={e => setDialogue(e.target.value)} className="min-h-[60px]" /></div>
        </CardContent></Card>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Negative Prompt</Label><Input placeholder="e.g., blurry, cartoon, text" value={negative} onChange={e => setNegative(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Aspect Ratio</Label><Select value={aspect} onValueChange={setAspect}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{aspectRatioOptions.map(a => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent></Select></div>
        </div>
        <div className="space-y-1.5"><Label>Duration ({duration}s)</Label><Slider min={2} max={15} step={1} value={[duration]} onValueChange={([v]) => setDuration(v)} /></div>
    </div>
  );

  const rightPanel = (
    <div className="space-y-6">
        <div className="space-y-1.5">
            <Label className="font-medium text-lg">Final Veo Prompt</Label>
            <div className="relative">
                <Textarea value={finalPrompt || "Click the generate button to create your prompt..."} readOnly className="min-h-[250px] pr-10" />
                {finalPrompt && (<Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button>)}
            </div>
        </div>
        <Card>
            <CardHeader><CardTitle>Tips & Tricks</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
                <p><strong>1. Show, Don't Tell:</strong> Instead of "he was sad", describe "a single tear rolled down his weathered cheek".</p>
                <p><strong>2. Control Time:</strong> Use keywords like `time-lapse of a flower blooming` or `ultra slow-motion of a water droplet splashing`.</p>
                <p><strong>3. Specify Film Language:</strong> Add terms like `lens flare`, `bokeh`, `grainy 16mm film texture` to your prompt for a specific look.</p>
                <p><strong>4. Layer Audio:</strong> Create immersive soundscapes. Try `Audio: crackling fireplace, distant thunder, a ticking grandfather clock`. </p>
                <p><strong>5. Define the Palette:</strong> Guide the colors directly. e.g., `...a moody color palette of deep blues and purples with a single, vibrant splash of crimson.`</p>
                <p><strong>6. Use Metaphors:</strong> Veo understands abstract concepts. Try `...a city skyline that looks like a circuit board`.</p>
            </CardContent>
        </Card>
        <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium">{isLoading ? 'Generating...' : '✨ Generate Veo Prompt'}</Button>
    </div>
  );

  return (
    <>
      <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Veo Works</AlertTitle><AlertDescription>Veo understands complex narratives. Be descriptive and leverage its unique audio and dialogue generation capabilities.</AlertDescription></Alert>
      <div className="mt-6">
        <StudioLayout
          controls={formControls}
          preview={rightPanel}
          tips={<></>} // Tips are now part of the rightPanel, so this is empty
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Choose a Variant</DialogTitle><DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription></DialogHeader><div className="grid gap-4 py-4">{variants.map((variant, index) => (<Button key={index} variant="outline" className="h-auto text-left whitespace-normal justify-start" onClick={() => handleVariantSelect(variant)}>{variant}</Button>))}</div></DialogContent>
      </Dialog>
    </>
  );
};