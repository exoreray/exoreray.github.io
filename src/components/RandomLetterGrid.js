import React, { useState, useEffect, useMemo } from 'react';
import RandomLetter from './RandomLetter'; // The component we created earlier

// try to link variable change in css file but failed
// const element = document.querySelector("random-letter");
// const computedStyles = getComputedStyle(element);
// const width = computedStyles.width;
// const height = computedStyles.height;

function RandomLetterGrid() {
  const [dimensions, setDimensions] = useState({
    rows: 0,
    cols: 0
  });

  // Recalculate dimensions on window resize, but throttle the updates
  useEffect(() => {
    function updateDimensions() {
      const rows = Math.floor(window.innerHeight / 20);
      const cols = Math.floor(window.innerWidth / 20);

      // Limit the number of letters to prevent performance issues
      const maxLetters = 1000;
      const totalLetters = rows * cols;

      if (totalLetters > maxLetters) {
        const ratio = Math.sqrt(maxLetters / totalLetters);
        setDimensions({
          rows: Math.floor(rows * ratio),
          cols: Math.floor(cols * ratio)
        });
      } else {
        setDimensions({ rows, cols });
      }
    }

    // Throttle resize updates
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 100);
    };

    window.addEventListener('resize', handleResize);
    updateDimensions();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use useMemo to prevent unnecessary re-renders of the grid
  const grid = useMemo(() => {
    const result = [];
    for (let i = 0; i < dimensions.rows; i++) {
      const row = [];
      for (let j = 0; j < dimensions.cols; j++) {
        row.push(<RandomLetter key={`${i}-${j}`} />);
      }
      result.push(<div key={i} style={{ display: 'flex' }}>{row}</div>);
    }
    return result;
  }, [dimensions]);

  return (
    <div className="random-letter-grid">
      {grid}
    </div>
  );
}

export default RandomLetterGrid;
