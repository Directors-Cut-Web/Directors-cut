"use client";
import { useEffect, useState } from "react";
import { Target, Lightbulb, Camera, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface RunwayPromptFormProps { onPromptGenerated: (prompt: string) => void; }

const aspectOptions = ["16:9", "9:16", "1:1", "4:3"];
const styleOptions = ["Cinematic", "Claymation", "Watercolor", "Pixel Art", "Infrared", "Photorealistic"];
const shotStyleOptions = ["None", "Drone Follow Shot", "FPV Drone Shot", "Sweeping Crane Shot", "Handheld Shaky-Cam", "Low Angle Tracking Shot", "Dolly Zoom"];
const motionOptions = { Pan: ["None", "Left", "Right"], Tilt: ["None", "Up", "Down"], Roll: ["None", "Clockwise", "Counter-clockwise"], Zoom: ["None", "In", "Out"] };

const SelectField = ({ label, value, set, options }: { label: string, value: string, set: (v: string) => void, options: string[] }) => (
    <div className="space-y-1.5"><Label>{label}</Label><Select value={value} onValueChange={set}><SelectTrigger><SelectValue placeholder={`Select ${label}`} /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
);

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

    const handleEnhance = async () => {
        if (!prompt) return alert("Please enter some text before enhancing.");
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText: prompt }) });
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
        setIsLoading(true);
        setFinalPrompt("");
        const payload = { targetModel: 'Runway Gen4+ Studio', inputs: { prompt, seed, upscale, aspect, style, shotStyle, motionAmount, pan, tilt, roll, zoom } };
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
                <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Runway Works</AlertTitle><AlertDescription>Describe your scene, then use the powerful sliders and dropdowns to control the camera and style precisely.</AlertDescription></Alert>
                <div className="space-y-1.5">
                    <Label className="font-semibold">Main Prompt</Label>
                    <div className="relative">
                        <Textarea placeholder="e.g., A futuristic city skyline at dusk, raining" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[100px] pr-10" />
                        <button type="button" onClick={handleEnhance} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title={`Enhance with AI`}><Target size={20} className="text-red-500" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">Click the <Target className="inline h-3 w-3 stroke-red-600" /> to generate 3 prompt variants.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Style Preset" value={style} set={setStyle} options={styleOptions} />
                    <SelectField label="Cinematic Shot Style" value={shotStyle} set={setShotStyle} options={shotStyleOptions} />
                </div>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Mechanical Camera Motion</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="space-y-1.5"><Label>Amount of Motion (0-10)</Label><Slider min={0} max={10} step={1} value={[motionAmount]} onValueChange={([v]) => setMotionAmount(v)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Pan" value={pan} set={setPan} options={motionOptions.Pan} />
                        <SelectField label="Tilt" value={tilt} set={setTilt} options={motionOptions.Tilt} />
                        <SelectField label="Roll" value={roll} set={setRoll} options={motionOptions.Roll} />
                        <SelectField label="Zoom" value={zoom} set={setZoom} options={motionOptions.Zoom} />
                    </div>
                </CardContent></Card>
                <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Aspect Ratio" value={aspect} set={setAspect} options={aspectOptions} />
                    <div className="space-y-1.5"><Label htmlFor="runway-seed">Seed</Label><Input id="runway-seed" type="number" placeholder="Random" value={seed ?? ""} onChange={(e) => setSeed(e.target.value ? Number.parseInt(e.target.value) : null)} /></div>
                </div>
                <div className="flex items-center space-x-2"><Checkbox id="runway-upscale" checked={upscale} onCheckedChange={(c) => setUpscale(Boolean(c))} /><Label htmlFor="runway-upscale">Upscale to 4K</Label></div>
                <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium mt-4">{isLoading ? 'Generating...' : '✨ Generate Runway Prompt'}</Button>
                {finalPrompt && (<div className="space-y-1.5 pt-4"><Label className="font-medium text-lg">Final Runway Prompt</Label><div className="relative"><Textarea value={finalPrompt} readOnly className="min-h-[100px] pr-10" /><Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button></div></div>)}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Choose a Variant</DialogTitle><DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">{variants.map((variant, index) => (<Button key={index} variant="outline" className="h-auto text-left whitespace-normal justify-start" onClick={() => handleVariantSelect(variant)}>{variant}</Button>))}</div>
                </DialogContent>
            </Dialog>
        </>
    );
}