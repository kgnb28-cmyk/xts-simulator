import React, { useState, useEffect, useRef } from 'react';

const DraggableWindow = ({ children, zIndex, onFocus, initialX = 200, initialY = 100 }) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    onFocus(); // Bring to front on click
    
    // Only drag if clicking the Header (looks for class 'drag-handle')
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      offset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

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
      onMouseDown={handleMouseDown}
      style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: zIndex }}
      className="shadow-2xl rounded-sm overflow-hidden"
    >
      {children}
    </div>
  );
};

export default DraggableWindow;