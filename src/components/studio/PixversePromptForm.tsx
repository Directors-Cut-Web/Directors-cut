"use client";
import { useState, useEffect } from "react";
import { Target, Lightbulb, User, Film, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PixversePromptFormProps { model: string; onPromptGenerated: (prompt: string) => void; }

const InlineIcon = <Target className="inline h-3 w-3 stroke-red-600" />;

const SelectField = ({ label, value, set, options }: { label: string, value: string, set: (v: string) => void, options: string[] }) => (
    <div className="space-y-1.5"><Label>{label}</Label><Select value={value} onValueChange={set}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
);

const styleOptions = ["Realistic", "Anime", "3D Animation", "Cinematic"];
const shotOptions = ["Wide Shot", "Medium Shot", "Close-up", "Portrait Shot"];
const lightingOptions = ["Vibrant", "Dramatic", "Studio Lighting", "Natural Light"];

export default function PixversePromptForm({ onPromptGenerated }: PixversePromptFormProps) {
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [characterRef, setCharacterRef] = useState("");
    const [shot, setShot] = useState("Medium Shot");
    const [style, setStyle] = useState("Realistic");
    const [lighting, setLighting] = useState("Cinematic");
    const [seed, setSeed] = useState<number | null>(null);
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
        const payload = { targetModel: 'Pixverse Studio', inputs: { prompt, negativePrompt, shot, style, lighting, seed, characterRef } };
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
                <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>How Pixverse Works</AlertTitle><AlertDescription>Pixverse is excellent for consistent characters and anime styles. Use the Character Reference field for best results.</AlertDescription></Alert>
                <div className="space-y-1.5">
                    <Label htmlFor="pix-prompt" className="font-semibold">Main Prompt</Label>
                    <div className="relative">
                        <Textarea id="pix-prompt" placeholder="e.g., A girl with pink hair smiling, sitting in a cafe" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[100px] pr-10" />
                        <button type="button" onClick={handleEnhance} className="absolute top-2.5 right-2.5 p-1 rounded-full bg-background/50" title={`Enhance with AI`}><Target size={20} className="text-red-500" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">Click the {InlineIcon} to generate 3 prompt variants.</p>
                </div>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Character Consistency</CardTitle></CardHeader><CardContent><Label htmlFor="pix-cref">Character Reference (URL or Description)</Label><Input id="pix-cref" placeholder="e.g., https://.../character.png or 'same girl'" value={characterRef} onChange={e => setCharacterRef(e.target.value)} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Film className="w-5 h-5" /> Style & Cinematography</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField label="Artistic Style" value={style} set={setStyle} options={styleOptions} />
                    <SelectField label="Shot Type" value={shot} set={setShot} options={shotOptions} />
                    <SelectField label="Lighting" value={lighting} set={setLighting} options={lightingOptions} />
                </CardContent></Card>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Negative Prompt</Label><Input placeholder="e.g., ugly, deformed hands" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor="pix-seed">Seed</Label><Input id="pix-seed" type="number" placeholder="Random" value={seed ?? ""} onChange={(e) => setSeed(e.target.value ? Number.parseInt(e.target.value) : null)} /></div>
                </div>
                <Button onClick={handleGenerateClick} disabled={isLoading} className="w-full py-6 text-base font-medium mt-4">{isLoading ? 'Generating...' : 'Generate Pixverse Prompt'}</Button>
                {finalPrompt && (<div className="space-y-1.5 pt-4"><Label className="font-medium text-lg">Final Pixverse Prompt</Label><div className="relative"><Textarea value={finalPrompt} readOnly className="min-h-[100px] pr-10" /><Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(finalPrompt)}><Copy className="h-4 w-4" /></Button></div></div>)}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Choose a Variant</DialogTitle><DialogDescription>Select one of the AI-generated variants below to replace your text.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">{variants.map((variant, index) => (<Button key={index} variant="outline" className="h-auto text-left whitespace-normal justify-start" onClick={() => handleVariantSelect(variant)}>{variant}</Button>))}</div>
                </DialogContent>
            </Dialog>
        </>
    );
}