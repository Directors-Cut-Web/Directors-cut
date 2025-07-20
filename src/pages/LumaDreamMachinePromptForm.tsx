"use client";
import { useState, useEffect } from "react";
import { Target, Lightbulb, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";

interface LumaPromptFormProps {
  model: string;
  onPromptGenerated: (prompt: string) => void;
}

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
  <div className="space-y-1.5"><Label htmlFor={label}>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger id={label}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
);

const lightingOptions = ["Cinematic Lighting", "Natural Daylight", "Film Noir", "Golden Hour", "Blue Hour", "High-Key Lighting", "Low-Key Lighting", "Neon Lit", "Dramatic Rim Lighting"];
const cameraShotOptions = ["Medium Shot", "Close-up", "Extreme Close-up", "Wide Shot", "Establishing Shot", "Full Shot", "Cowboy Shot", "Point of View (POV)"];
const cameraMotionOptions = ["Static Camera", "Slow Pan Left", "Slow Pan Right", "Tilt Up", "Tilt Down", "Dolly Zoom In", "Handheld Shaky Cam", "Sweeping Aerial Shot"];
const artisticStyleOptions = ["Photorealistic", "Cinematic 35mm film", "Anime Aesthetic", "Watercolor Style", "Claymation", "Surrealism", "Impressionistic", "Cyberpunk"];

export default function LumaDreamMachinePromptForm({ onPromptGenerated }: LumaPromptFormProps) {
  const [character, setCharacter] = useState("");
  const [scene, setScene] = useState("");
  const [lighting, setLighting] = useState("");
  const [cameraShot, setCameraShot] = useState("");
  const [cameraMotion, setCameraMotion] = useState("");
  const [style, setStyle] = useState("");
  const [guidance, setGuidance] = useState(8);
  const [variants, setVariants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<'character' | 'scene' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");

  const handleEnhance = async (fieldType: 'character' | 'scene') => {
    const inputText = fieldType === 'character' ? character : scene;
    if (!inputText) return alert("Please enter some text before enhancing.");
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setVariants(data.variants);
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
    const payload = { targetModel: 'Luma', inputs: { character, scene, lighting, cameraShot, cameraMotion, style, guidance } };
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

  return (
    <>
      <div className="space-y-6">
        <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Luma Works</AlertTitle><AlertDescription>Fill out the fields below and our AI Prompt Engineer will weave them into a perfect, descriptive prompt for Luma.</AlertDescription></Alert>
        <PromptField label="Character Description" placeholder="Who or what is the focus? e.g. 'A curious fox...'" value={character} onChange={(e) => setCharacter(e.target.value)} onBullseyeClick={() => handleEnhance('character')} description={<>Click the {InlineIcon} to generate 3 character variants.</>} />
        <PromptField label="Scene Description" placeholder="Describe the environment... e.g. 'A snowy mountain peak...'" value={scene} onChange={(e) => setScene(e.target.value)} onBullseyeClick={() => handleEnhance('scene')} description={<>Click the {InlineIcon} to generate 3 scene variants.</>} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Lighting Style" placeholder="Select a lighting style" value={lighting} onChange={setLighting} options={lightingOptions} />
          <SelectField label="Artistic Style" placeholder="Select an artistic style" value={style} onChange={setStyle} options={artisticStyleOptions} />
          <SelectField label="Camera Shot" placeholder="Select a shot type" value={cameraShot} onChange={setCameraShot} options={cameraShotOptions} />
          <SelectField label="Camera Motion" placeholder="Select a camera motion" value={cameraMotion} onChange={setCameraMotion} options={cameraMotionOptions} />
        </div>
        <div className="space-y-1.5"><Label className="font-medium">Guidance Scale ({guidance})</Label><p className="text-xs text-muted-foreground">Lower values increase creativity, higher values strictly follow the prompt.</p><Slider min={1} max={20} step={0.5} value={[guidance]} onValueChange={([v]) => setGuidance(v)} className="mt-2" /></div>
        <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium mt-4">{isLoading ? 'Generating...' : '✨ Enhance and Generate Prompt'}</Button>
        {finalPrompt && (<div className="space-y-1.5 pt-4"><Label className="font-medium text-lg">Final Luma Prompt</Label><div className="relative"><Textarea value={finalPrompt} readOnly className="min-h-[100px] pr-10" /><Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button></div></div>)}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Choose a Variant</DialogTitle><DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription></DialogHeader><div className="grid gap-4 py-4">{variants.map((variant, index) => (<Button key={index} variant="outline" className="h-auto text-left whitespace-normal justify-start" onClick={() => handleVariantSelect(variant)}>{variant}</Button>))}</div></DialogContent>
      </Dialog>
    </>
  );
}