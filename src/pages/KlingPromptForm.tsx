"use client";
import { useState, useEffect } from "react";
import { Target, Lightbulb, Camera, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface KlingPromptFormProps { model: string; onPromptGenerated: (prompt: string) => void; }

const InlineIcon = <Target className="inline h-3 w-3 stroke-red-600" />;

const PromptField = ({ label, placeholder, value, onChange, onBullseyeClick, description }: { label: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, onBullseyeClick: () => Promise<void>, description: React.ReactNode; }) => (
    <div className="space-y-1.5"><Label htmlFor={label} className="font-semibold">{label}</Label><div className="relative"><Textarea id={label} placeholder={placeholder} value={value} onChange={onChange} className="min-h-[80px] pr-10" /><button type="button" onClick={onBullseyeClick} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title={`Enhance ${label} with AI`}><Target size={20} className="text-red-500" /></button></div><p className="text-xs text-muted-foreground pt-1">{description}</p></div>
);

const SelectField = ({ label, placeholder, value, onChange, options }: { label: string, placeholder: string, value: string, onChange: (value: string) => void, options: string[] }) => (
    <div className="space-y-1.5"><Label htmlFor={label}>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger id={label}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
);

const styleOptions = ["Photorealistic", "Hyperrealistic", "Cinematic", "Unreal Engine 5"];
const shotOptions = ["Wide Shot", "Full Body Shot", "Medium Shot", "Close-up"];
const angleOptions = ["Eye-level", "Low Angle", "High Angle", "Dutch Angle"];
const motionOptions = ["Static", "Slow Dolly In", "Orbit Left", "Crane Up"];
const aspectRatioOptions = ["16:9", "9:16", "1:1", "2.39:1"];

export default function KlingPromptForm({ onPromptGenerated }: KlingPromptFormProps) {
    const [character, setCharacter] = useState("");
    const [scene, setScene] = useState("");
    const [style, setStyle] = useState("Photorealistic");
    const [shot, setShot] = useState("Medium Shot");
    const [angle, setAngle] = useState("Eye-level");
    const [motion, setMotion] = useState("Static");
    const [realism, setRealism] = useState(90);
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [isLoading, setIsLoading] = useState(false);
    const [variants, setVariants] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeField, setActiveField] = useState<'character' | 'scene' | null>(null);
    const [finalPrompt, setFinalPrompt] = useState("");

    const handleEnhance = async (fieldType: 'character' | 'scene') => {
        const inputText = fieldType === 'character' ? character : scene;
        if (!inputText) return alert("Please enter some text.");
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setVariants(data.variants);
            setActiveField(fieldType);
            setIsDialogOpen(true);
        } catch (error) {
            alert("Failed to get suggestions.");
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
        const payload = { targetModel: 'Kling 2.0+ Studio', inputs: { character, scene, style, shot, angle, motion, realism, aspectRatio } };
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
                <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Kling Works</AlertTitle><AlertDescription>Kling excels at photorealism and complex physics. Be highly descriptive for the best results.</AlertDescription></Alert>
                <PromptField label="Character & Action" placeholder="e.g., A knight in detailed plate armor swinging a sword" value={character} onChange={(e) => setCharacter(e.target.value)} onBullseyeClick={() => handleEnhance('character')} description={<>Click the {InlineIcon} to generate 3 character variants.</>} />
                <PromptField label="Scene & Environment" placeholder="e.g., A battlefield at sunset during a light rain" value={scene} onChange={(e) => setScene(e.target.value)} onBullseyeClick={() => handleEnhance('scene')} description={<>Click the {InlineIcon} to generate 3 scene variants.</>} />
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" />Cinematic Controls</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Artistic Style" placeholder="Style" value={style} onChange={setStyle} options={styleOptions} />
                    <SelectField label="Camera Shot" placeholder="Shot Type" value={shot} onChange={setShot} options={shotOptions} />
                    <SelectField label="Camera Angle" placeholder="Angle" value={angle} onChange={setAngle} options={angleOptions} />
                    <SelectField label="Camera Motion" placeholder="Motion" value={motion} onChange={setMotion} options={motionOptions} />
                </CardContent></Card>
                <div className="space-y-1.5"><Label>Physics Realism ({realism}%)</Label><Slider min={50} max={100} step={5} value={[realism]} onValueChange={([v]) => setRealism(v)} /></div>
                <div className="space-y-1.5"><Label>Aspect Ratio</Label><Select value={aspectRatio} onValueChange={setAspectRatio}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{aspectRatioOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium mt-4">{isLoading ? 'Generating...' : 'Generate Kling Prompt'}</Button>
                {finalPrompt && (<div className="space-y-1.5 pt-4"><Label className="font-medium text-lg">Final Kling Prompt</Label><div className="relative"><Textarea value={finalPrompt} readOnly className="min-h-[100px] pr-10" /><Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button></div></div>)}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Choose a Variant</DialogTitle><DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">{variants.map((variant, index) => (<Button key={index} variant="outline" className="h-auto text-left whitespace-normal justify-start" onClick={() => handleVariantSelect(variant)}>{variant}</Button>))}</div>
                </DialogContent>
            </Dialog>
        </>
    );
};