import React from 'react';

interface StudioLayoutProps {
  controls: React.ReactNode;
  preview: React.ReactNode;
  tips: React.ReactNode;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({ controls, preview, tips }) => {
  return (
    // Updated to a 5-column grid for a more balanced layout on large screens
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left Column: All user inputs (takes up 3 of 5 columns) */}
      <div className="lg:col-span-3 space-y-6">
        {controls}
      </div>

      {/* Right Column: Prompt preview and tips (takes up 2 of 5 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {preview}
        {tips}
      </div>
    </div>
  );
};