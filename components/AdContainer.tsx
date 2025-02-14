import React from 'react';

export default function AdContainer({ slot }: { slot: string }) {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm mb-6">
      <div className="p-1 border-b border-gray-100">
        <p className="text-xs text-gray-500 text-center">Advertisement</p>
      </div>
      <div className="flex justify-center p-2 min-h-[200px] items-center">
        <div className="w-[300px] h-[250px]">
          <div id={`ad-slot-${slot}`} />
        </div>
      </div>
    </div>
  );
} 