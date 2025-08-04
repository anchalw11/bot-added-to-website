import React, { useState, useEffect } from 'react';

const FuturisticCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const animateTrail = () => {
      setTrailPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.5,
        y: prev.y + (position.y - prev.y) * 0.5,
      }));
      requestAnimationFrame(animateTrail);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    document.body.style.cursor = 'none';
    
    const animationFrame = requestAnimationFrame(animateTrail);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
      cancelAnimationFrame(animationFrame);
    };
  }, [position]);

  return (
    <>
      <div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          left: `${trailPosition.x}px`,
          top: `${trailPosition.y}px`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: `2px solid ${isHovering ? '#A855F7' : '#6366F1'}`,
          transform: 'translate(-50%, -50%)',
          transition: 'border-color 0.2s ease-in-out',
          opacity: 0.5,
        }}
      />
      <div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#A855F7',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
};

export default FuturisticCursor;
