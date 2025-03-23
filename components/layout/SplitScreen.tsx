'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SplitScreenProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialLeftWidth?: number; // Percentage (0-100)
  minLeftWidth?: number; // Percentage (0-100)
  maxLeftWidth?: number; // Percentage (0-100)
}

export default function SplitScreen({
  left,
  right,
  initialLeftWidth = 50,
  minLeftWidth = 30,
  maxLeftWidth = 70,
}: SplitScreenProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previousWidth, setPreviousWidth] = useState(initialLeftWidth);

  // Handle resize drag
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const container = document.getElementById('split-screen-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Apply constraints
        if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
          setLeftWidth(newLeftWidth);
        }
      }
    }
  };

  // Toggle collapse/expand
  const toggleCollapse = () => {
    if (isCollapsed) {
      // Expand
      setLeftWidth(previousWidth);
    } else {
      // Collapse
      setPreviousWidth(leftWidth);
      setLeftWidth(0);
    }
    setIsCollapsed(!isCollapsed);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      id="split-screen-container"
      className="flex w-full h-full overflow-hidden relative"
    >
      {/* Left panel */}
      <div
        className="h-full overflow-auto transition-all duration-300 ease-in-out"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>
      
      {/* Resizer */}
      <div 
        className="w-1 h-full bg-gray-200 hover:bg-blue-500 hover:w-1 cursor-col-resize flex items-center justify-center z-10"
        onMouseDown={handleMouseDown}
      >
        <div 
          className="absolute p-1 bg-white rounded-full border border-gray-300 cursor-pointer hover:border-blue-500"
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </div>
      </div>
      
      {/* Right panel */}
      <div 
        className="h-full overflow-auto transition-all duration-300 ease-in-out"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
}