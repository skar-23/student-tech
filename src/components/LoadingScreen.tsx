import React from 'react';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <h2 className="text-xl font-semibold">Loading Tech Student Hub...</h2>
      </div>
    </div>
  );
}