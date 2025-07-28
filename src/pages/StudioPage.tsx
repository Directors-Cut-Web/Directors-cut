"use client";
import React, { useState, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Loader2, AlertTriangle } from 'lucide-react';

// Error Boundary to catch component loading errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Caught an error in a component:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="text-sm text-muted-foreground">The component could not be loaded. Please check the console for errors.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dynamically import the form components
const Veo3PromptForm = React.lazy(() => import('../components/studio/Veo3PromptForm.tsx'));
const RunwayGen4PromptForm = React.lazy(() => import('../components/studio/RunwayGen4PromptForm.tsx'));
const KlingPromptForm = React.lazy(() => import('../components/studio/KlingPromptForm.tsx'));
const LumaDreamMachinePromptForm = React.lazy(() => import('../components/studio/LumaDreamMachinePromptForm.tsx'));
const PixversePromptForm = React.lazy(() => import('../components/studio/PixversePromptForm.tsx'));
const MidjourneyVideoPromptForm = React.lazy(() => import('../components/studio/MidjourneyVideoPromptForm.tsx'));


// Define the structure for each AI model's card
const studioModels = [
  { id: 'veo', name: 'Veo 3', description: 'Narrative-driven, cinematic video generation.', component: Veo3PromptForm, image: '/lovable-uploads/veo3.png', video: '/lovable-uploads/Veo3.mp4' },
  { id: 'runway', name: 'Runway Gen 4', description: 'Animate still images with controlled motion.', component: RunwayGen4PromptForm, image: '/lovable-uploads/runway.png', video: '/lovable-uploads/Runway.mp4' },
  { id: 'kling', name: 'Kling 2.0', description: 'High-fidelity video with advanced physics.', component: KlingPromptForm, image: '/lovable-uploads/kling.png', video: '/lovable-uploads/kling.mp4' },
  { id: 'luma', name: 'Luma Dream Machine', description: 'Fluid motion and character consistency.', component: LumaDreamMachinePromptForm, image: '/lovable-uploads/luma.png', video: '/lovable-uploads/luma.mp4' },
  { id: 'pixverse', name: 'Pixverse', description: 'Specializes in anime and 3D animation styles.', component: PixversePromptForm, image: '/lovable-uploads/pixverse.png', video: '/lovable-uploads/pixverse.mp4' },
  { id: 'midjourney', name: 'Midjourney Video', description: 'Animate images with powerful artistic controls.', component: MidjourneyVideoPromptForm, image: '/lovable-uploads/midjourney.png' },
];

const FormLoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function StudioPage() {
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCardClick = (model: any) => {
    if (model.component) {
      setSelectedModel(model);
      setIsSheetOpen(true);
    } else {
      alert(model.name + " is coming soon!");
    }
  };

  const handlePromptGenerated = (prompt: string) => {
    console.log("Final prompt from sheet:", prompt);
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
            className="cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-300 overflow-hidden group relative"
          >
            <div className="h-48 overflow-hidden">
              {model.video ? (
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  key={model.video}
                >
                  <source src={model.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={model.image} 
                  alt={`${model.name} AI Model`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/222/FFF?text=Image+Not+Found'; }}
                />
              )}
            </div>
            {/* --- FINAL FIX: Reduced padding (p-3) and softened gradient to make the title box thinner --- */}
            <CardHeader className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <CardTitle className="text-white">{model.name}</CardTitle>
              <CardDescription className="text-gray-300 text-sm">{model.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-[1400px] !important overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">{selectedModel?.name} Prompt Studio</SheetTitle>
            <SheetDescription>
              Fill out the fields below to generate a highly-optimized prompt for {selectedModel?.name}.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <ErrorBoundary>
              <Suspense fallback={<FormLoadingSpinner />}>
                {ActiveFormComponent && <ActiveFormComponent onPromptGenerated={handlePromptGenerated} />}
              </Suspense>
            </ErrorBoundary>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}