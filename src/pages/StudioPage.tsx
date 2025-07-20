"use client";
import { useState } from 'react';
// --- FINAL FIX: Co-locating files and using direct './' paths ---
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import Veo3PromptForm from './Veo3PromptForm.tsx';
import RunwayGen4Form from './RunwayGen4Form.tsx';
// Import other forms here as you activate them, e.g.:
// import KlingPromptForm from './KlingPromptForm.tsx';

// Define the structure for each AI model's card
const studioModels = [
  { id: 'veo', name: 'Veo 3', description: 'Narrative-driven, cinematic video generation.', component: Veo3PromptForm, image: '/lovable-uploads/veo-card-image.jpg' },
  { id: 'runway', name: 'Runway Gen 4', description: 'Animate still images with controlled motion.', component: RunwayGen4Form, image: '/lovable-uploads/runway-card-image.jpg' },
  // Add other models here as you build them
  { id: 'kling', name: 'Kling 2.0', description: 'Coming Soon', component: null, image: '/lovable-uploads/kling-card-image.jpg' },
  { id: 'luma', name: 'Luma Dream Machine', description: 'Coming Soon', component: null, image: '/lovable-uploads/luma-card-image.jpg' },
  { id: 'pixverse', name: 'Pixverse', description: 'Coming Soon', component: null, image: '/lovable-uploads/pixverse-card-image.jpg' },
  { id: 'midjourney', name: 'Midjourney Video', description: 'Coming Soon', component: null, image: '/lovable-uploads/midjourney-card-image.jpg' },
];

export default function StudioPage() {
  const [selectedModel, setSelectedModel] = useState<typeof studioModels[0] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCardClick = (model: typeof studioModels[0]) => {
    if (model.component) {
      setSelectedModel(model);
      setIsSheetOpen(true);
    } else {
      alert(model.name + " is coming soon!");
    }
  };

  const handlePromptGenerated = (prompt: string) => {
    console.log("Final prompt from sheet:", prompt);
    setIsSheetOpen(false);
  };

  const ActiveFormComponent = selectedModel?.component;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Director's Cut Studio</h1>
        <p className="text-lg text-muted-foreground mt-2">Select an AI model to begin crafting your perfect video prompt.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {studioModels.map((model) => (
          <Card 
            key={model.id} 
            onClick={() => handleCardClick(model)}
            className="cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-300 overflow-hidden group"
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={model.image} 
                alt={`${model.name} AI Model`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/222/FFF?text=Image+Not+Found'; }}
              />
            </div>
            <CardHeader>
              <CardTitle>{model.name}</CardTitle>
              <CardDescription>{model.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">{selectedModel?.name} Prompt Studio</SheetTitle>
            <SheetDescription>
              Fill out the fields below to generate a highly-optimized prompt for {selectedModel?.name}.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            {ActiveFormComponent && <ActiveFormComponent onPromptGenerated={handlePromptGenerated} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
