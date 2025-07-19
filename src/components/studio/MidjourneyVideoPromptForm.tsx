"use client";
import { useState, useEffect } from "react";
import { Target, Lightbulb, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface MidjourneyPromptFormProps { model: string; onPromptGenerated: (prompt: string) => void; }

const InlineIcon = <Target className="inline h-3 w-3 stroke-red-600" />;

const PromptField = ({ label, placeholder, value, onChange, onBullseyeClick, description }: { label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; onBullseyeClick: () => Promise<void>; description: React.ReactNode; }) => (
    <div className="space-y-1.5"><Label htmlFor={label} className="font-semibold">{label}</Label><div className="relative"><Textarea id={label} placeholder={placeholder} value={value} onChange={onChange} className="min-h-[80px] pr-10" /><button type="button" onClick={onBullseyeClick} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title={`Enhance ${label} with AI`}><Target size={20} className="text-red-500" /></button></div><p className="text-xs text-muted-foreground pt-1">{description}</p></div>
);

const SelectField = ({ label, placeholder, value, onChange, options }: { label: string; placeholder: string; value: string; onChange: (value: string) => void; options: string[]; }) => (
  <div className="space-y-1.5"><Label htmlFor={label}>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger id={label}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
);

const versionOptions = ["6", "5.2", "5.1", "niji 6"];
const aspectRatioOptions = ["16:9", "1:1", "9:16", "4:3", "3:2", "7:4"];
const qualityOptions = ["0.25", "0.5", "1"];
const shotOptions = ["Medium Shot", "Close-up", "Wide Shot", "Establishing Shot", "Full Body Shot"];
const angleOptions = ["Eye-level", "Low Angle Shot", "High Angle Shot", "Bird's-Eye View", "Dutch Angle"];
const lightingOptions = ["Cinematic Lighting", "Volumetric Lighting", "Rim Lighting", "Golden Hour", "Studio Lighting"];

export default function MidjourneyVideoPromptForm({ onPromptGenerated }: MidjourneyPromptFormProps) {
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [shot, setShot] = useState("");
    const [angle, setAngle] = useState("");
    const [lighting, setLighting] = useState("");
    const [version, setVersion] = useState("6");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [chaos, setChaos] = useState(0);
    const [quality, setQuality] = useState("1");
    const [stylize, setStylize] = useState(100);
    const [seed, setSeed] = useState<number | null>(null);
    const [video, setVideo] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [variants, setVariants] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [finalPrompt, setFinalPrompt] = useState("");

    const handleEnhance = async () => {
        if (!prompt) return alert("Please enter some text.");
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText: prompt }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setVariants(data.variants);
            setIsDialogOpen(true);
        } catch (error) {
            alert("Failed to get suggestions.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVariantSelect = (variant: string) => {
        setPrompt(variant);
        setIsDialogOpen(false);
    };

    const handleGenerateClick = async () => {
        setIsLoading(true);
        setFinalPrompt("");
        const payload = { targetModel: 'Midjourney Video Studio', inputs: { prompt, negativePrompt, shot, angle, lighting, version, aspectRatio, chaos, quality, stylize, seed, video } };
        try {
            const response = await fetch('/api/generate-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setFinalPrompt(data.finalPrompt);
            onPromptGenerated(data.finalPrompt);
        } catch (error) {
            alert("Failed to generate final prompt.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Midjourney Works</AlertTitle><AlertDescription>Midjourney uses text and parameters. Choose your options below and we'll build the perfect prompt.</AlertDescription></Alert>
                <PromptField label="Prompt Text" placeholder="e.g., A futuristic detective in a trench coat on a rainy, neon-lit street" value={prompt} onChange={(e) => setPrompt(e.target.value)} onBullseyeClick={handleEnhance} description={<>Click the {InlineIcon} to generate prompt variants.</>} />
                <div className="space-y-1.5"><Label htmlFor="mj-negative">Negative Prompt</Label><Input id="mj-negative" placeholder="e.g., text, people, watermark" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField label="Camera Shot" placeholder="Shot Type" value={shot} onChange={setShot} options={shotOptions} />
                    <SelectField label="Camera Angle" placeholder="Angle" value={angle} onChange={setAngle} options={angleOptions} />
                    <SelectField label="Lighting Style" placeholder="Lighting" value={lighting} onChange={setLighting} options={lightingOptions} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField label="Version" placeholder="Version" value={version} onChange={setVersion} options={versionOptions} />
                    <SelectField label="Aspect Ratio" placeholder="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} options={aspectRatioOptions} />
                    <SelectField label="Quality" placeholder="Quality" value={quality} onChange={setQuality} options={qualityOptions} />
                </div>
                <div className="space-y-1.5"><Label>Stylize (0-1000)</Label><Slider min={0} max={1000} step={10} value={[stylize]} onValueChange={([v]) => setStylize(v)} /></div>
                <div className="space-y-1.5"><Label>Chaos (0-100)</Label><Slider min={0} max={100} step={1} value={[chaos]} onValueChange={([v]) => setChaos(v)} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label htmlFor="mj-seed">Seed</Label><Input id="mj-seed" type="number" placeholder="Random" value={seed ?? ""} onChange={(e) => setSeed(e.target.value ? Number.parseInt(e.target.value) : null)} /></div>
                    <div className="flex items-end pb-1"><div className="flex items-center space-x-2"><Checkbox id="mj-video" checked={video} onCheckedChange={(checked) => setVideo(Boolean(checked))} /><Label htmlFor="mj-video">Video</Label></div></div>
                </div>
                <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium mt-4">{isLoading ? 'Generating...' : '✨ Generate Midjourney Prompt'}</Button>
                {finalPrompt && (<div className="space-y-1.5 pt-4"><Label className="font-medium text-lg">Final Midjourney Prompt</Label><div className="relative"><Textarea value={finalPrompt} readOnly className="min-h-[100px] pr-10" /><Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button></div></div>)}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Choose a Variant</DialogTitle><DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">{variants.map((variant, index) => (<Button key={index} variant="outline" className="h-auto text-left whitespace-normal justify-start" onClick={() => handleVariantSelect(variant)}>{variant}</Button>))}</div>
                </DialogContent>
            </Dialog>
        </>
    );
}