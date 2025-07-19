import React from 'react';

interface StudioLayoutProps {
  controls: React.ReactNode;
  preview: React.ReactNode;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({ controls, preview }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left Column: All user inputs */}
      <div className="lg:col-span-3 space-y-6">
        {controls}
      </div>

      {/* Right Column: Prompt preview and tips */}
      <div className="lg:col-span-2 space-y-6">
        {preview}
      </div>
    </div>
  );
};